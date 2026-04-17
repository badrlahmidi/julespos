"use client";

import { useState, useEffect } from 'react';
import { Search, LayoutGrid, Clock, Settings, Zap } from 'lucide-react';
import { usePosStore } from '../../../store/usePosStore';
import { CategoryBar } from '../../../components/pos/CategoryBar';
import { ProductCard } from '../../../components/pos/ProductCard';
import { OrderTicket } from '../../../components/pos/OrderTicket';
import { FloorPlan } from '../../../components/pos/FloorPlan';
import type { Product, Category } from '../../../types/pos';

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Tous' },
  { id: '2', name: 'Entrées' },
  { id: '3', name: 'Plats' },
  { id: '4', name: 'Boissons' },
  { id: '5', name: 'Desserts' },
];

const mockProducts: Product[] = [
  { id: '1', name: 'Burger Classique', price: 12.5, taxRate: 10, category: '3' },
  { id: '2', name: 'Pizza Margherita', price: 11.0, taxRate: 10, category: '3' },
  { id: '3', name: 'Salade César', price: 9.5, taxRate: 10, category: '2' },
  { id: '4', name: 'Coca-Cola', price: 3.5, taxRate: 20, category: '4' },
  { id: '5', name: 'Café Expresso', price: 2.0, taxRate: 20, category: '4' },
  { id: '6', name: 'Tiramisu', price: 6.5, taxRate: 10, category: '5' },
  { id: '7', name: 'Frites Maison', price: 4.5, taxRate: 10, category: '2' },
  { id: '8', name: 'Cheesecake', price: 7.0, taxRate: 10, category: '5' },
];

export default function PosPage() {
  const [viewMode, setViewMode] = useState<'floor' | 'order'>('floor');
  const [activeCategory, setActiveCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  const openTable = usePosStore((state) => state.openTable);
  const currentOrder = usePosStore((state) => state.currentOrder);
  const addItem = usePosStore((state) => state.addItemToOrder);
  const tables = usePosStore((state) => state.tables);

  const handleTableClick = (tableId: string) => {
    openTable(tableId);
    setViewMode('order');
  };

  // Filter products based on search and category
  const filteredProducts = mockProducts.filter((p) => {
    const matchesCategory = activeCategory === '1' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen w-full bg-pos-dark text-pos-text-primary overflow-hidden">

      {/* Sidebar Navigation (Left) */}
      <aside className="w-[80px] bg-pos-darker border-r border-pos-card flex flex-col items-center py-6 shrink-0 z-20">
        <div className="w-10 h-10 bg-pos-emerald rounded-pos flex items-center justify-center mb-8 shadow-md">
          <span className="font-bold text-white text-xl">R</span>
        </div>

        <nav className="flex flex-col gap-6 flex-1">
          <NavItem
            icon={<LayoutGrid size={24} />}
            isActive={viewMode === 'floor'}
            onClick={() => setViewMode('floor')}
          />
          <NavItem
            icon={<Zap size={24} />}
            isActive={viewMode === 'order'}
            onClick={() => setViewMode('order')}
          />
          <NavItem icon={<Clock size={24} />} isActive={false} />
          <NavItem icon={<Settings size={24} />} isActive={false} className="mt-auto" />
        </nav>
      </aside>

      {viewMode === 'floor' ? (
        <FloorPlan onTableClick={handleTableClick} />
      ) : (
        <>
          {/* Main Menu Area (Center) */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Top Header: Search & Categories */}
            <header className="p-6 bg-pos-dark z-10 shrink-0 border-b border-pos-card/50 shadow-sm">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pos-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-pos-card border-none rounded-full py-4 pl-12 pr-6 text-pos-text-primary focus:outline-none focus:ring-2 focus:ring-pos-emerald transition-all shadow-sm"
                />
              </div>

              <CategoryBar
                categories={mockCategories}
                activeCategoryId={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </header>

            {/* Product Grid (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={(p) => addItem(p)}
                  />
                ))}
              </div>
            </div>
          </main>

          {/* Order Ticket Panel (Right) */}
          <OrderTicket
            tableName={currentOrder?.tableId ? `Table ${tables.find(t => t.id === currentOrder.tableId)?.label || currentOrder.tableId}` : "Vente au comptoir"}
          />
        </>
      )}

    </div>
  );
}

// Helper component for sidebar items
function NavItem({ icon, isActive, onClick, className = "" }: { icon: React.ReactNode, isActive: boolean, onClick?: () => void, className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl transition-all ${
        isActive
          ? "bg-pos-emerald/20 text-pos-emerald"
          : "text-pos-text-muted hover:text-pos-text-primary hover:bg-pos-card"
      } ${className}`}
    >
      {icon}
    </button>
  );
}
