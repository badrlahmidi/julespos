"use client";

import { usePosStore } from '../../store/usePosStore';
import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ChefHat, XCircle, UserPlus, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RequirePermission } from '../auth/RequirePermission';
import { useCrmStore } from '../../store/useCrmStore';
import type { Customer } from '../../types/crm';

interface OrderTicketProps {
  tableName?: string;
  onPayClick?: () => void;
}

export const OrderTicket = ({ tableName = "Client de passage", onPayClick }: OrderTicketProps) => {
  const currentOrder = usePosStore((state) => state.currentOrder);
  const addItem = usePosStore((state) => state.addItemToOrder);
  const removeItem = usePosStore((state) => state.removeItemFromOrder);
  const updateQuantity = usePosStore((state) => state.updateItemQuantity);
  const sendToKitchen = usePosStore((state) => state.sendToKitchen);

  const hasItems = currentOrder && currentOrder.items.length > 0;
  const isSent = currentOrder?.status === 'sent-to-kitchen' || currentOrder?.status === 'preparing' || currentOrder?.status === 'ready';

  // Group items by course
  const groupedItems = {
    drinks: currentOrder?.items.filter(i => i.course === 'drinks') || [],
    starter: currentOrder?.items.filter(i => i.course === 'starter') || [],
    main: currentOrder?.items.filter(i => i.course === 'main') || [],
    dessert: currentOrder?.items.filter(i => i.course === 'dessert') || [],
    uncategorized: currentOrder?.items.filter(i => !i.course) || [],
  };

  const courseLabels = {
    drinks: 'Boissons',
    starter: 'Entrées',
    main: 'Plats',
    dessert: 'Desserts',
    uncategorized: 'Autres'
  };

  const clearCurrentOrder = usePosStore((state) => state.clearCurrentOrder);
  const setTableStatus = usePosStore((state) => state.setTableStatus);
  const findCustomerByPhone = useCrmStore((state) => state.findCustomerByPhone);

  const [customerPhone, setCustomerPhone] = useState('');
  const [attachedCustomer, setAttachedCustomer] = useState<Customer | null>(null);

  const handleCustomerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = findCustomerByPhone(customerPhone);
    if (customer) {
      setAttachedCustomer(customer);
    } else {
      alert("Client non trouvé");
    }
  };

  const handleVoidOrder = () => {
    if (currentOrder?.tableId) {
       setTableStatus(currentOrder.tableId, 'available');
    }
    clearCurrentOrder();
  };

  return (
    <div className="flex flex-col h-full bg-pos-darker border-l border-pos-card w-[380px] shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-pos-card flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-pos-text-primary">{tableName}</h2>
            {currentOrder && (
              <p className="text-sm text-pos-text-muted mt-1">Ticket #{currentOrder.id}</p>
            )}
          </div>

          {hasItems && (
            <RequirePermission
               permission="CAN_VOID_ORDER"
               onAuthorizedAction={handleVoidOrder}
               actionDetails={`Annulation du ticket #${currentOrder?.id}`}
               orderId={currentOrder?.id}
            >
               <button className="p-2 text-pos-danger hover:bg-pos-danger/10 rounded-full transition-colors" title="Annuler la commande">
                  <XCircle size={24} />
               </button>
            </RequirePermission>
          )}
        </div>

        {/* Customer Attachment */}
        {attachedCustomer ? (
          <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl">
            <div>
              <p className="font-bold text-purple-400 text-sm">{attachedCustomer.name}</p>
              <p className="text-xs text-pos-text-muted flex items-center gap-1 mt-1">
                {attachedCustomer.points} pts <Star size={12} className="fill-yellow-500 text-yellow-500" />
              </p>
            </div>
            <button onClick={() => setAttachedCustomer(null)} className="text-pos-text-muted hover:text-red-400 transition-colors">
              <XCircle size={18} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomerSearch} className="flex relative">
            <input
              type="tel"
              placeholder="N° Téléphone Client"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-pos-card border-none rounded-xl py-2 px-3 text-sm text-pos-text-primary focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300">
              <UserPlus size={18} />
            </button>
          </form>
        )}
      </div>

      {/* Body: Scrollable list or Empty State */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasItems ? (
          <div className="h-full flex flex-col items-center justify-center text-pos-text-muted opacity-60">
            <ShoppingBag size={48} className="mb-4" />
            <p className="text-center px-6">En attente d'une commande savoureuse...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(Object.entries(groupedItems) as [keyof typeof groupedItems, typeof currentOrder.items][]).map(([course, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={course} className="space-y-3">
                  <h3 className="text-sm font-bold text-pos-text-secondary uppercase tracking-wider border-b border-pos-card pb-1">
                    {courseLabels[course]}
                  </h3>
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-pos-card rounded-pos shadow-sm"
                      >
                        <div className="flex-1">
                          <p className="text-pos-text-primary font-medium">{item.product.name}</p>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <div className="text-xs text-pos-text-muted mt-1">
                              {item.selectedModifiers.map(mod => mod.name).join(', ')}
                            </div>
                          )}
                          <p className="text-pos-emerald text-sm mt-1">
                            {(item.product.price + (item.selectedModifiers?.reduce((sum, m) => sum + m.price, 0) || 0)).toFixed(2)} €
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-pos-darker rounded-full px-2 py-1">
                            {item.quantity > 1 ? (
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="text-pos-text-muted hover:text-pos-danger p-1"
                              >
                                <Minus size={16} />
                              </button>
                            ) : (
                              <RequirePermission
                                permission="CAN_VOID_ITEM"
                                onAuthorizedAction={() => removeItem(item.id)}
                                actionDetails={`Suppression de l'article ${item.product.name}`}
                                orderId={currentOrder?.id}
                              >
                                <button className="text-pos-text-muted hover:text-pos-danger p-1">
                                  <Trash2 size={16} />
                                </button>
                              </RequirePermission>
                            )}
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Actions & Totals */}
      <div className="p-6 bg-pos-card rounded-tl-2xl rounded-tr-2xl shadow-lg mt-auto">
        {hasItems && !isSent && (
          <button
            onClick={() => {
              if (currentOrder) sendToKitchen(currentOrder.id);
            }}
            className="w-full bg-pos-warning hover:bg-orange-600 text-white font-bold py-3 rounded-pos transition-colors flex items-center justify-center gap-2 mb-4 shadow-sm"
          >
            <ChefHat size={20} />
            Envoyer en cuisine
          </button>
        )}

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
          onClick={() => {
             // In a real app, we might pass attachedCustomer.id to the payment modal
             if (onPayClick) onPayClick();
          }}
          className="w-full bg-pos-emerald hover:bg-pos-emerald-hover disabled:bg-pos-darker disabled:text-pos-text-muted text-white text-lg font-bold py-4 rounded-pos transition-colors flex items-center justify-center gap-2 shadow-md disabled:shadow-none"
        >
          <ShoppingBag size={24} />
          Payer {currentOrder?.total.toFixed(2) || "0.00"} €
        </button>
      </div>
    </div>
  );
};
