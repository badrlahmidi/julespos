"use client";

import { motion } from 'framer-motion';
import type { Product } from '../../types/pos';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  accentColor?: string;
}

export const ProductCard = ({ product, onClick, accentColor = "bg-pos-card" }: ProductCardProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(product)}
      className={`relative flex flex-col justify-between p-4 rounded-pos min-h-[120px] shadow-sm overflow-hidden text-left border border-pos-darker hover:border-pos-emerald transition-colors ${accentColor}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-pos-emerald opacity-80" />
      <span className="text-pos-text-primary font-medium text-lg leading-tight line-clamp-2">
        {product.name}
      </span>
      <span className="text-pos-emerald font-bold mt-2">
        {product.price.toFixed(2)} €
      </span>
    </motion.button>
  );
};
