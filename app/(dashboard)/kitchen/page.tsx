"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePosStore } from '../../../store/usePosStore';
import { KitchenCard } from '../../../components/kds/KitchenCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, ListTodo, History, Bell, Layers } from 'lucide-react';
import type { Order } from '../../../types/pos';

type ViewMode = 'standard' | 'consolidation' | 'history';

// A short base64 encoded 'ding' sound for notifications
const DING_SOUND = "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

export default function KitchenPage() {
  const activeOrders = usePosStore(state => state.activeOrders);
  const connectSocket = usePosStore(state => state.connectSocket);
  const disconnectSocket = usePosStore(state => state.disconnectSocket);

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket]);

  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const previousOrderCountRef = useRef(0);

  // Filter for active KDS orders
  const kdsOrders = useMemo(() => {
    return activeOrders.filter(
      o => o.status === 'sent-to-kitchen' || o.status === 'preparing' || o.status === 'ready'
    ).sort((a, b) => {
      // Sort by urgency first, then by sent time (FIFO)
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return (a.sentAt || 0) - (b.sentAt || 0);
    });
  }, [activeOrders]);

  const historyOrders = useMemo(() => {
    return activeOrders.filter(o => o.status === 'history')
      .sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));
  }, [activeOrders]);

  const consolidatedItems = useMemo(() => {
    const itemsMap = new Map<string, { name: string, quantity: number, countReady: number }>();

    kdsOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.product.id;
        const current = itemsMap.get(key) || { name: item.product.name, quantity: 0, countReady: 0 };
        current.quantity += item.quantity;
        if (item.status === 'ready') current.countReady += item.quantity;
        itemsMap.set(key, current);
      });
    });

    return Array.from(itemsMap.values()).sort((a, b) => b.quantity - a.quantity);
  }, [kdsOrders]);

  // Audio feedback for new orders
  useEffect(() => {
    if (kdsOrders.length > previousOrderCountRef.current) {
      // New order arrived!
      try {
        const audio = new Audio(DING_SOUND);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play prevented by browser policy", e));
      } catch (e) {
        // Ignore audio errors
      }
    }
    previousOrderCountRef.current = kdsOrders.length;
  }, [kdsOrders.length]);

  return (
    <div className="flex flex-col h-screen w-full bg-pos-dark text-pos-text-primary overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between p-6 bg-pos-darker border-b border-pos-card shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pos-warning rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">KDS</h1>
            <p className="text-sm font-bold text-pos-warning uppercase tracking-widest">Cuisine</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-pos-card p-1 rounded-xl">
           <button
             onClick={() => setViewMode('standard')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${viewMode === 'standard' ? 'bg-pos-emerald text-white shadow-md' : 'text-pos-text-secondary hover:text-white'}`}
           >
              <ListTodo size={20} />
              Commandes
           </button>
           <button
             onClick={() => setViewMode('consolidation')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${viewMode === 'consolidation' ? 'bg-pos-emerald text-white shadow-md' : 'text-pos-text-secondary hover:text-white'}`}
           >
              <Layers size={20} />
              Regroupement
           </button>
           <button
             onClick={() => setViewMode('history')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${viewMode === 'history' ? 'bg-pos-emerald text-white shadow-md' : 'text-pos-text-secondary hover:text-white'}`}
           >
              <History size={20} />
              Historique
           </button>
        </div>
      </header>

      {/* Main KDS Area */}
      <main className="flex-1 overflow-x-auto overflow-y-auto p-6">
         {viewMode === 'standard' && (
           <div className="flex gap-6 h-full items-start">
              <AnimatePresence>
                {kdsOrders.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center h-full opacity-50">
                    <ChefHat size={64} className="mb-4 text-pos-text-muted" />
                    <p className="text-2xl font-bold text-pos-text-muted">Aucune commande en cours</p>
                  </div>
                ) : (
                  kdsOrders.map(order => (
                    <KitchenCard key={order.id} order={order} />
                  ))
                )}
              </AnimatePresence>
           </div>
         )}

         {viewMode === 'history' && (
           <div className="flex gap-6 h-full items-start">
              <AnimatePresence>
                {historyOrders.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center h-full opacity-50">
                    <History size={64} className="mb-4 text-pos-text-muted" />
                    <p className="text-2xl font-bold text-pos-text-muted">Aucun historique récent</p>
                  </div>
                ) : (
                  historyOrders.map(order => (
                    <KitchenCard key={order.id} order={order} />
                  ))
                )}
              </AnimatePresence>
           </div>
         )}

         {viewMode === 'consolidation' && (
            <div className="max-w-4xl mx-auto bg-pos-darker rounded-2xl border border-pos-card overflow-hidden">
               <div className="p-6 bg-pos-card border-b border-pos-darker">
                  <h2 className="text-2xl font-bold text-pos-text-primary flex items-center gap-2">
                    <Layers className="text-pos-emerald" />
                    Total à préparer
                  </h2>
               </div>
               <div className="p-6 grid gap-4">
                  {consolidatedItems.length === 0 ? (
                    <p className="text-pos-text-muted text-center py-8">Rien à préparer pour le moment.</p>
                  ) : (
                    consolidatedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-pos-card rounded-xl border border-pos-darker">
                         <h3 className="text-xl font-bold text-pos-text-primary">{item.name}</h3>
                         <div className="flex items-center gap-4">
                            <span className="text-pos-text-secondary font-medium">
                               {item.countReady} prêt(s)
                            </span>
                            <div className="w-12 h-12 bg-pos-warning text-white rounded-xl flex items-center justify-center text-2xl font-black">
                               {item.quantity - item.countReady}
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
         )}
      </main>
    </div>
  );
}
