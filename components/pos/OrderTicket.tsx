"use client";

import { usePosStore } from '../../store/usePosStore';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderTicketProps {
  tableName?: string;
}

export const OrderTicket = ({ tableName = "Client de passage" }: OrderTicketProps) => {
  const currentOrder = usePosStore((state) => state.currentOrder);
  const addItem = usePosStore((state) => state.addItemToOrder);
  const removeItem = usePosStore((state) => state.removeItemFromOrder);
  const updateQuantity = usePosStore((state) => state.updateItemQuantity);

  const hasItems = currentOrder && currentOrder.items.length > 0;

  return (
    <div className="flex flex-col h-full bg-pos-darker border-l border-pos-card w-[380px] shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-pos-card">
        <h2 className="text-xl font-bold text-pos-text-primary">{tableName}</h2>
        {currentOrder && (
          <p className="text-sm text-pos-text-muted mt-1">Ticket #{currentOrder.id}</p>
        )}
      </div>

      {/* Body: Scrollable list or Empty State */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasItems ? (
          <div className="h-full flex flex-col items-center justify-center text-pos-text-muted opacity-60">
            <ShoppingBag size={48} className="mb-4" />
            <p className="text-center px-6">En attente d'une commande savoureuse...</p>
          </div>
        ) : (
          <AnimatePresence>
            {currentOrder.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-pos-card rounded-pos shadow-sm"
              >
                <div className="flex-1">
                  <p className="text-pos-text-primary font-medium">{item.product.name}</p>
                  <p className="text-pos-emerald text-sm">{item.product.price.toFixed(2)} €</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-pos-darker rounded-full px-2 py-1">
                    <button
                      onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                      className="text-pos-text-muted hover:text-pos-danger p-1"
                    >
                      {item.quantity > 1 ? <Minus size={16} /> : <Trash2 size={16} />}
                    </button>
                    <span className="w-4 text-center text-pos-text-primary font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-pos-text-muted hover:text-pos-emerald p-1"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer: Totals & Pay Button */}
      <div className="p-6 bg-pos-card rounded-tl-2xl rounded-tr-2xl shadow-lg mt-auto">
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-pos-text-secondary">
            <span>Sous-total HT</span>
            <span>{currentOrder?.totalHT.toFixed(2) || "0.00"} €</span>
          </div>
          <div className="flex justify-between text-pos-text-secondary">
            <span>TVA</span>
            <span>{currentOrder?.totalTax.toFixed(2) || "0.00"} €</span>
          </div>
          <div className="flex justify-between text-pos-text-primary text-xl font-bold pt-2 border-t border-pos-darker">
            <span>Total TTC</span>
            <span>{currentOrder?.total.toFixed(2) || "0.00"} €</span>
          </div>
        </div>

        <button
          disabled={!hasItems}
          className="w-full bg-pos-emerald hover:bg-pos-emerald-hover disabled:bg-pos-darker disabled:text-pos-text-muted text-white text-lg font-bold py-4 rounded-pos transition-colors flex items-center justify-center gap-2 shadow-md disabled:shadow-none"
        >
          <ShoppingBag size={24} />
          Payer {currentOrder?.total.toFixed(2) || "0.00"} €
        </button>
      </div>
    </div>
  );
};
