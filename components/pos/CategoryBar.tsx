"use client";

import type { Category } from '../../types/pos';

interface CategoryBarProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryBar = ({ categories, activeCategoryId, onSelectCategory }: CategoryBarProps) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide w-full">
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-colors min-w-[80px] ${
              isActive
                ? "bg-pos-emerald text-white shadow-md"
                : "bg-pos-card text-pos-text-secondary hover:bg-pos-darker hover:text-pos-text-primary"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
};
