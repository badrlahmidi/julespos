"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, Smartphone, QrCode, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import { usePosStore } from '../../store/usePosStore';
import type { OrderItem } from '../../types/pos';

export type SplitMode = 'full' | 'equal' | 'item';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal = ({ isOpen, onClose }: PaymentModalProps) => {
  const currentOrder = usePosStore((state) => state.currentOrder);

  const [splitMode, setSplitMode] = useState<SplitMode>('full');
  const [equalParts, setEqualParts] = useState(2);
  const [selectedItemsForSplit, setSelectedItemsForSplit] = useState<Record<string, number>>({});
  const [amountPaid, setAmountPaid] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);

  const clearCurrentOrder = usePosStore((state) => state.clearCurrentOrder);
  const setTableStatus = usePosStore((state) => state.setTableStatus);

  // Precision math utilities
  const round2 = (num: number) => Math.round(num * 100) / 100;

  const resetSplitState = () => {
    setSelectedItemsForSplit({});
    setAmountPaid(0);
  };

  useEffect(() => {
    resetSplitState();
  }, [splitMode]);

  if (!isOpen || !currentOrder) return null;

  // Calculate amount currently due based on split mode
  let amountDue = currentOrder.total;
  if (splitMode === 'equal') {
    amountDue = round2(currentOrder.total / equalParts);
  } else if (splitMode === 'item') {
    amountDue = round2(currentOrder.items.reduce((acc, item) => {
      const qtySelected = selectedItemsForSplit[item.id] || 0;
      if (qtySelected > 0) {
        let itemPrice = item.product.price;
        if (item.selectedModifiers) {
          itemPrice += item.selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
        }
        // add tax
        const itemTotal = itemPrice * (1 + item.product.taxRate / 100);
        return acc + (itemTotal * qtySelected);
      }
      return acc;
    }, 0));
  }

  const remainingBalance = round2(amountDue - amountPaid);

  const toggleItemSelection = (item: OrderItem) => {
    setSelectedItemsForSplit(prev => {
      const currentSelected = prev[item.id] || 0;
      const next = { ...prev };

      // Simple toggle for now: select all or none of this item's quantity
      if (currentSelected === item.quantity) {
        delete next[item.id];
      } else {
        next[item.id] = item.quantity;
      }
      return next;
    });
  };

  const finalizePayment = () => {
    setIsSuccess(true);

    // In a real app, we would process the backend payment and split logic here
    // For this prototype, if it's full payment, we clear the table
    if (splitMode === 'full' && currentOrder.tableId) {
      setTableStatus(currentOrder.tableId, 'available');
      clearCurrentOrder();
    }
  };

  const handlePaymentClick = (amount: number) => {
    const newPaid = round2(amountPaid + amount);
    setAmountPaid(newPaid);

    if (round2(amountDue - newPaid) <= 0) {
      finalizePayment();
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setReceiptSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-pos-darker rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-pos-card"
          >
            {isSuccess ? (
              <div className="w-full p-12 flex flex-col items-center justify-center text-center bg-pos-dark">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="mb-6 text-pos-emerald"
                >
                  <CheckCircle size={80} />
                </motion.div>
                <h2 className="text-3xl font-bold text-pos-text-primary mb-2">Paiement validé</h2>
                <p className="text-pos-text-secondary mb-12">Le solde a été mis à jour avec succès.</p>

                <div className="flex gap-4 w-full max-w-md">
                  <button
                    onClick={() => setReceiptSent(true)}
                    disabled={receiptSent}
                    className="flex-1 py-4 bg-pos-card hover:bg-pos-darker border border-pos-darker rounded-xl flex items-center justify-center gap-2 text-pos-text-primary transition-colors disabled:opacity-50"
                  >
                    {receiptSent ? <CheckCircle size={20} className="text-pos-emerald" /> : <Mail size={20} />}
                    Email
                  </button>
                  <button
                    onClick={() => setReceiptSent(true)}
                    disabled={receiptSent}
                    className="flex-1 py-4 bg-pos-card hover:bg-pos-darker border border-pos-darker rounded-xl flex items-center justify-center gap-2 text-pos-text-primary transition-colors disabled:opacity-50"
                  >
                    {receiptSent ? <CheckCircle size={20} className="text-pos-emerald" /> : <MessageSquare size={20} />}
                    SMS
                  </button>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-8 px-12 py-4 bg-pos-emerald hover:bg-pos-emerald-hover text-white font-bold rounded-full transition-colors"
                >
                  Terminer
                </button>
              </div>
            ) : (
            <>
            {/* Left Panel: Split Mode & Summary */}
            <div className="w-full md:w-1/2 p-6 flex flex-col border-r border-pos-card overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-pos-text-primary">Paiement</h2>
                <button onClick={handleClose} className="p-2 text-pos-text-muted hover:text-white rounded-full hover:bg-pos-card transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Split Mode Selector */}
              <div className="flex p-1 bg-pos-card rounded-xl mb-8">
                <button
                  onClick={() => setSplitMode('full')}
                  className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                    splitMode === 'full' ? 'bg-pos-emerald text-white shadow-md' : 'text-pos-text-secondary hover:text-white'
                  }`}
                >
                  Totalité
                </button>
                <button
                  onClick={() => setSplitMode('equal')}
                  className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                    splitMode === 'equal' ? 'bg-pos-emerald text-white shadow-md' : 'text-pos-text-secondary hover:text-white'
                  }`}
                >
                  Parts Égales
                </button>
                <button
                  onClick={() => setSplitMode('item')}
                  className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                    splitMode === 'item' ? 'bg-pos-emerald text-white shadow-md' : 'text-pos-text-secondary hover:text-white'
                  }`}
                >
                  Par Article
                </button>
              </div>

              {/* Contextual UI based on Split Mode */}
              <div className="flex-1 flex flex-col gap-4">
                {splitMode === 'equal' && (
                  <div className="bg-pos-card p-4 rounded-xl flex items-center justify-between">
                    <span className="text-pos-text-primary">Nombre de parts</span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setEqualParts(Math.max(2, equalParts - 1))}
                        className="w-10 h-10 rounded-full bg-pos-darker flex items-center justify-center text-pos-text-primary hover:text-pos-emerald"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold w-4 text-center">{equalParts}</span>
                      <button
                        onClick={() => setEqualParts(equalParts + 1)}
                        className="w-10 h-10 rounded-full bg-pos-darker flex items-center justify-center text-pos-text-primary hover:text-pos-emerald"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {splitMode === 'item' && (
                  <div className="flex-1 overflow-y-auto bg-pos-card p-2 rounded-xl">
                    <p className="text-xs text-pos-text-muted px-2 pt-2 pb-4">Sélectionnez les articles à payer :</p>
                    {currentOrder.items.map(item => {
                      const isSelected = (selectedItemsForSplit[item.id] || 0) === item.quantity;
                      let itemPrice = item.product.price;
                      if (item.selectedModifiers) {
                        itemPrice += item.selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
                      }
                      const itemTotalWithTax = itemPrice * (1 + item.product.taxRate / 100) * item.quantity;

                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleItemSelection(item)}
                          className={`w-full text-left p-3 flex justify-between items-center rounded-lg mb-2 transition-colors ${
                            isSelected ? 'bg-pos-emerald/20 border border-pos-emerald' : 'hover:bg-pos-darker border border-transparent'
                          }`}
                        >
                          <div>
                            <span className="font-medium text-pos-text-primary">{item.quantity}x {item.product.name}</span>
                          </div>
                          <span className={`font-bold ${isSelected ? 'text-pos-emerald' : 'text-pos-text-secondary'}`}>
                            {itemTotalWithTax.toFixed(2)} €
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                 <div className="p-4 bg-pos-card rounded-xl mt-auto">
                    <p className="text-pos-text-secondary mb-2">Sous-total à payer</p>
                    <p className="text-4xl font-bold text-pos-text-primary">{amountDue.toFixed(2)} €</p>

                    {amountPaid > 0 && (
                      <div className="mt-4 pt-4 border-t border-pos-darker space-y-2">
                        <div className="flex justify-between text-pos-info">
                          <span>Déjà payé</span>
                          <span>- {amountPaid.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-pos-text-primary">
                          <span>Reste à payer</span>
                          <span className={remainingBalance > 0 ? "text-pos-warning" : "text-pos-emerald"}>
                            {remainingBalance > 0 ? remainingBalance.toFixed(2) : "0.00"} €
                          </span>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Right Panel: Payment Methods */}
            <div className="w-full md:w-1/2 bg-pos-dark p-6 flex flex-col">
              <h3 className="text-lg font-bold text-pos-text-primary mb-6">Moyen de paiement</h3>

              <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                <PaymentMethodButton
                  icon={<CreditCard size={32} />}
                  label="Carte Bancaire"
                  onClick={() => handlePaymentClick(remainingBalance)}
                  disabled={remainingBalance <= 0 || (splitMode === 'item' && amountDue === 0)}
                />
                <PaymentMethodButton
                  icon={<Banknote size={32} />}
                  label="Espèces"
                  onClick={() => handlePaymentClick(remainingBalance)}
                  disabled={remainingBalance <= 0 || (splitMode === 'item' && amountDue === 0)}
                />
                <PaymentMethodButton
                  icon={<Smartphone size={32} />}
                  label="Apple / Google Pay"
                  onClick={() => handlePaymentClick(remainingBalance)}
                  disabled={remainingBalance <= 0 || (splitMode === 'item' && amountDue === 0)}
                />
                <PaymentMethodButton
                  icon={<QrCode size={32} />}
                  label="QR Code"
                  onClick={() => handlePaymentClick(remainingBalance)}
                  disabled={remainingBalance <= 0 || (splitMode === 'item' && amountDue === 0)}
                />
              </div>

              {/* Quick Cash Amounts Placeholder */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[10, 20, 50].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handlePaymentClick(amount)}
                    disabled={remainingBalance <= 0}
                    className="py-3 bg-pos-card rounded-xl text-pos-text-primary font-bold hover:bg-pos-darker hover:text-pos-emerald disabled:opacity-50 transition-colors"
                  >
                    + {amount} €
                  </button>
                ))}
              </div>
            </div>
            </>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Helper component
function PaymentMethodButton({ icon, label, onClick, disabled }: { icon: React.ReactNode, label: string, onClick: () => void, disabled?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all min-h-[140px]
        ${disabled
          ? 'bg-pos-card/50 border-pos-card/50 text-pos-text-muted cursor-not-allowed opacity-50'
          : 'bg-pos-card border-transparent text-pos-text-primary hover:border-pos-emerald hover:text-pos-emerald shadow-sm'
        }
      `}
    >
      <div className="mb-4 opacity-80">{icon}</div>
      <span className="font-medium text-center">{label}</span>
    </motion.button>
  );
}
