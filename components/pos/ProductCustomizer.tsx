"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { Product, ModifierOption, CourseType } from '../../types/pos';

interface ProductCustomizerProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedModifiers: ModifierOption[], course: CourseType) => void;
}

export const ProductCustomizer = ({ product, onClose, onAddToCart }: ProductCustomizerProps) => {
  const [quantity, setQuantity] = useState(1);
  const [course, setCourse] = useState<CourseType>('main');
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption[]>>({});

  useEffect(() => {
    // Auto-select first option for required groups
    const initialMods: Record<string, ModifierOption[]> = {};
    product.modifierGroups?.forEach(group => {
      if (group.minSelections > 0 && group.options.length > 0) {
        const firstOption = group.options[0];
        if (firstOption) {
            initialMods[group.id] = [firstOption];
        } else {
            initialMods[group.id] = [];
        }
      } else {
        initialMods[group.id] = [];
      }
    });
    setSelectedModifiers(initialMods);
  }, [product]);

  const handleModifierToggle = (groupId: string, option: ModifierOption, isRadio: boolean) => {
    setSelectedModifiers(prev => {
      const groupSelections = prev[groupId] || [];
      const isSelected = groupSelections.some(opt => opt.id === option.id);

      if (isRadio) {
        return { ...prev, [groupId]: [option] };
      }

      const group = product.modifierGroups?.find(g => g.id === groupId);
      if (!group) return prev;

      if (isSelected) {
        return {
          ...prev,
          [groupId]: groupSelections.filter(opt => opt.id !== option.id)
        };
      } else {
        if (groupSelections.length < group.maxSelections) {
          return {
            ...prev,
            [groupId]: [...groupSelections, option]
          };
        }
        return prev; // Max reached
      }
    });
  };

  const isFormValid = () => {
    if (!product.modifierGroups) return true;
    return product.modifierGroups.every(group => {
      const count = (selectedModifiers[group.id] || []).length;
      return count >= group.minSelections && count <= group.maxSelections;
    });
  };

  const calculateTotal = () => {
    let total = product.price;
    Object.values(selectedModifiers).flat().forEach(mod => {
      total += mod.price;
    });
    return total * quantity;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;
    const allSelectedOptions = Object.values(selectedModifiers).flat();
    onAddToCart(product, quantity, allSelectedOptions, course);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-pos-darker rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-pos-card"
        >
          {/* Header */}
          <div className="p-6 border-b border-pos-card flex justify-between items-center bg-pos-dark">
            <div>
              <h2 className="text-2xl font-bold text-pos-text-primary">{product.name}</h2>
              <p className="text-pos-emerald font-bold text-lg mt-1">{product.price.toFixed(2)} €</p>
            </div>
            <button onClick={onClose} className="p-2 text-pos-text-muted hover:text-white rounded-full hover:bg-pos-card transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Body: Course & Modifiers */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Course Selection */}
            <div>
              <h3 className="text-lg font-bold text-pos-text-primary mb-4 uppercase tracking-wider text-sm">Suite / Envoi</h3>
              <div className="flex gap-3">
                {[
                  { id: 'drinks', label: 'Boissons' },
                  { id: 'starter', label: 'Entrées' },
                  { id: 'main', label: 'Plats' },
                  { id: 'dessert', label: 'Desserts' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCourse(c.id as CourseType)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      course === c.id ? 'bg-pos-emerald text-white shadow-md' : 'bg-pos-card text-pos-text-secondary hover:bg-pos-darker hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modifiers */}
            {product.modifierGroups?.map(group => {
              const isRadio = group.maxSelections === 1 && group.minSelections === 1;
              const selectedCount = (selectedModifiers[group.id] || []).length;
              const isValid = selectedCount >= group.minSelections && selectedCount <= group.maxSelections;

              return (
                <div key={group.id}>
                  <div className="flex items-end justify-between mb-4">
                    <h3 className="text-lg font-bold text-pos-text-primary uppercase tracking-wider text-sm">{group.name}</h3>
                    <span className={`text-xs font-bold ${isValid ? 'text-pos-emerald' : 'text-pos-warning'}`}>
                      {isRadio ? '1 choix requis' : `Choix: ${selectedCount}/${group.maxSelections}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {group.options.map(option => {
                      const isSelected = (selectedModifiers[group.id] || []).some(o => o.id === option.id);

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleModifierToggle(group.id, option, isRadio)}
                          className={`p-4 rounded-xl flex items-center justify-between transition-all border-2 ${
                            isSelected
                              ? 'bg-pos-emerald/10 border-pos-emerald'
                              : 'bg-pos-card border-transparent hover:border-pos-darker'
                          }`}
                        >
                          <span className={`font-medium ${isSelected ? 'text-pos-emerald' : 'text-pos-text-primary'}`}>
                            {option.name}
                          </span>
                          <div className="flex items-center gap-3">
                            {option.price > 0 && (
                              <span className="text-sm font-bold text-pos-text-secondary">+{option.price.toFixed(2)} €</span>
                            )}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'bg-pos-emerald border-pos-emerald text-white' : 'border-pos-text-muted'
                            }`}>
                              {isSelected && <Check size={14} strokeWidth={4} />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer: Quantity & Add */}
          <div className="p-6 bg-pos-dark border-t border-pos-card flex items-center gap-6">
            <div className="flex items-center gap-4 bg-pos-card p-2 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center bg-pos-darker rounded-lg hover:text-pos-emerald text-xl font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-2xl font-bold text-pos-text-primary">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center bg-pos-darker rounded-lg hover:text-pos-emerald text-xl font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className="flex-1 py-4 bg-pos-emerald hover:bg-pos-emerald-hover disabled:bg-pos-darker disabled:text-pos-text-muted text-white text-xl font-bold rounded-xl transition-colors shadow-md disabled:shadow-none flex items-center justify-center gap-2"
            >
              Ajouter - {calculateTotal().toFixed(2)} €
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
