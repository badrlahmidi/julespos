"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, X } from 'lucide-react';

interface PinPadProps {
  onPinComplete: (pin: string) => void;
  onCancel?: () => void;
  error?: string | null;
  maxLength?: number;
}

export const PinPad = ({ onPinComplete, onCancel, error, maxLength = 4 }: PinPadProps) => {
  const [pin, setPin] = useState('');

  // Handle auto-submit
  useEffect(() => {
    if (pin.length === maxLength) {
      onPinComplete(pin);
      // Optional: don't clear immediately to allow a brief visual feedback,
      // but typically the parent will handle unmounting or showing error.
    }
  }, [pin, maxLength, onPinComplete]);

  // Clear pin if new error comes in
  useEffect(() => {
    if (error) setPin('');
  }, [error]);

  const handleKeyPress = (digit: string) => {
    if (pin.length < maxLength) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [null, '0', 'del']
  ];

  return (
    <div className="flex flex-col items-center max-w-sm w-full mx-auto">
      {/* Header/Close */}
      {onCancel && (
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={onCancel}
            className="p-3 bg-pos-card rounded-full text-pos-text-secondary hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Pin Display */}
      <div className="flex justify-center gap-4 mb-8">
        {Array.from({ length: maxLength }).map((_, i) => {
          const isFilled = i < pin.length;
          return (
            <motion.div
              key={i}
              animate={isFilled ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`w-5 h-5 rounded-full ${
                isFilled ? 'bg-pos-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-pos-darker border-2 border-pos-card'
              }`}
            />
          );
        })}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-500 mb-6 font-medium text-center h-6"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {digits.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {row.map((btn, colIdx) => {
              if (btn === null) {
                return <div key={`empty-${rowIdx}-${colIdx}`} />;
              }

              if (btn === 'del') {
                return (
                  <motion.button
                    key="del"
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="aspect-square flex items-center justify-center rounded-full bg-pos-darker hover:bg-pos-card text-pos-text-secondary transition-colors"
                  >
                    <Delete size={28} />
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={btn}
                  whileTap={{ scale: 0.9, backgroundColor: '#374151' }} // gray-700
                  onClick={() => handleKeyPress(btn)}
                  className="aspect-square flex items-center justify-center rounded-full bg-pos-card hover:bg-pos-card/80 text-pos-text-primary text-3xl font-medium shadow-sm transition-colors"
                >
                  {btn}
                </motion.button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
