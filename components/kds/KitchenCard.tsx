"use client";

import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/usePosStore';
import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, ChefHat, Play, Flame, Undo } from 'lucide-react';
import type { Order, OrderItemStatus, OrderStatus } from '../../types/pos';

interface KitchenCardProps {
  order: Order;
}

export const KitchenCard = ({ order }: KitchenCardProps) => {
  const tables = usePosStore(state => state.tables);
  const updateItemPrepStatus = usePosStore(state => state.updateItemPrepStatus);
  const updateOrderStatus = usePosStore(state => state.updateOrderStatus);
  const toggleOrderUrgent = usePosStore(state => state.toggleOrderUrgent);

  const table = tables.find(t => t.id === order.tableId);

  const [elapsedMins, setElapsedMins] = useState(0);

  useEffect(() => {
    if (!order.sentAt || order.status === 'ready' || order.status === 'history') return;

    const calculateElapsed = () => {
      const diffMs = Date.now() - order.sentAt!;
      setElapsedMins(Math.floor(diffMs / 60000));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [order.sentAt, order.status]);

  // Helper to determine order border color based on status and urgency
  const getBorderColor = () => {
    if (order.isUrgent) return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    if (order.status === 'ready') return 'border-pos-emerald';
    if (order.status === 'preparing') return 'border-pos-warning';
    return 'border-pos-info'; // 'sent-to-kitchen' or default
  };

  const getHeaderBg = () => {
    if (order.isUrgent) return 'bg-red-500 text-white';
    if (order.status === 'ready') return 'bg-pos-emerald text-white';
    if (order.status === 'preparing') return 'bg-pos-warning text-white';
    return 'bg-pos-info text-white';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col w-80 shrink-0 bg-pos-darker rounded-xl border-2 overflow-hidden ${getBorderColor()}`}
    >
      {/* Header */}
      <div className={`p-4 flex items-center justify-between transition-colors ${getHeaderBg()}`}>
        <div>
          <h2 className="text-2xl font-black">{table ? `Table ${table.label}` : 'Comptoir'}</h2>
          <p className="text-xs font-bold opacity-80 uppercase tracking-wider">#{order.id.slice(0, 5)}</p>
        </div>
        <div className="flex flex-col items-end">
           <div className={`flex items-center gap-1 font-mono text-xl font-bold px-2 py-1 rounded-md transition-colors ${elapsedMins >= 15 ? 'bg-red-600 text-white animate-pulse' : 'bg-black/20 text-white'}`}>
             <Clock size={18} />
             <span>{elapsedMins}m</span>
           </div>
        </div>
      </div>

      {/* Body: Items List */}
      <div className="flex-1 overflow-y-auto p-2 bg-pos-card">
        {order.items.map(item => {
          const isItemReady = item.status === 'ready';
          const isItemPreparing = item.status === 'preparing';

          return (
            <motion.div
              key={item.id}
              layout
              onClick={() => {
                const nextStatus: OrderItemStatus = isItemReady ? 'pending' : (isItemPreparing ? 'ready' : 'preparing');
                updateItemPrepStatus(order.id, item.id, nextStatus);
              }}
              className={`p-3 mb-2 rounded-lg border shadow-sm cursor-pointer transition-colors relative overflow-hidden ${
                isItemReady ? 'bg-pos-emerald/10 border-pos-emerald opacity-60' :
                isItemPreparing ? 'bg-pos-warning/10 border-pos-warning' :
                'bg-pos-darker border-pos-dark'
              }`}
            >
               {isItemReady && <div className="absolute inset-0 bg-pos-emerald/5 pointer-events-none" />}

               <div className="flex items-start gap-3 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                    isItemReady ? 'bg-pos-emerald text-white' :
                    isItemPreparing ? 'bg-pos-warning text-white' :
                    'bg-pos-dark text-pos-text-primary'
                  }`}>
                    {isItemReady ? <Check size={16} /> : item.quantity}
                  </div>
                  <div className={`flex-1 ${isItemReady ? 'line-through text-pos-text-muted' : ''}`}>
                    <h3 className="text-xl font-bold text-pos-text-primary leading-tight">{item.product.name}</h3>

                    {/* Modifiers */}
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && !isItemReady && (
                      <div className="mt-1 flex flex-col gap-1">
                         {item.selectedModifiers.map(mod => {
                           const isRemoval = mod.name.toLowerCase().includes('sans') || mod.name.toLowerCase().includes('no ');
                           return (
                             <span key={mod.id} className={`text-sm font-black uppercase tracking-wider ${isRemoval ? 'text-red-500' : 'text-pos-info'}`}>
                                {isRemoval ? `🚫 ${mod.name}` : `➕ ${mod.name}`}
                             </span>
                           );
                         })}
                      </div>
                    )}
                  </div>
               </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer: Actions */}
      <div className="p-2 bg-pos-darker border-t border-pos-card flex flex-col gap-2">
        <div className="flex gap-2">
          {order.status === 'sent-to-kitchen' && (
             <button
               onClick={() => updateOrderStatus(order.id, 'preparing')}
               className="flex-1 py-3 bg-pos-warning hover:bg-orange-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
             >
                <Play size={20} />
                Démarrer tout
             </button>
          )}
          {order.status === 'preparing' && (
             <button
               onClick={() => updateOrderStatus(order.id, 'ready')}
               className="flex-1 py-3 bg-pos-emerald hover:bg-pos-emerald-hover text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
             >
                <Check size={20} />
                Tout prêt
             </button>
          )}
          {order.status === 'ready' && (
             <button
               onClick={() => updateOrderStatus(order.id, 'history')}
               className="flex-1 py-3 bg-pos-card hover:bg-pos-dark text-pos-text-primary rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border border-pos-card"
             >
                <Check size={20} />
                Terminer / Archiver
             </button>
          )}
          {order.status === 'history' && (
             <button
               onClick={() => updateOrderStatus(order.id, 'ready')}
               className="flex-1 py-3 bg-pos-card hover:bg-pos-dark text-pos-text-primary rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border border-pos-card"
             >
                <Undo size={20} />
                Restaurer
             </button>
          )}
        </div>

        {order.status !== 'history' && (
           <button
             onClick={() => toggleOrderUrgent(order.id)}
             className={`w-full py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${order.isUrgent ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-pos-card text-pos-text-secondary hover:text-white'}`}
           >
              <Flame size={16} />
              {order.isUrgent ? 'Désactiver Urgence' : 'Marquer comme Urgent'}
           </button>
        )}
      </div>

    </motion.div>
  );
};
