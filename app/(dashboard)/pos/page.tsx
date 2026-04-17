"use client";

import { useState, useEffect } from 'react';
import { Search, LayoutGrid, Clock, Settings, Zap } from 'lucide-react';
import { usePosStore } from '../../../store/usePosStore';
import { CategoryBar } from '../../../components/pos/CategoryBar';
import { ProductCard } from '../../../components/pos/ProductCard';
import { OrderTicket } from '../../../components/pos/OrderTicket';
import { FloorPlan } from '../../../components/pos/FloorPlan';
import { PaymentModal } from '../../../components/pos/PaymentModal';
import { PinPad } from '../../../components/auth/PinPad';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAuditStore } from '../../../store/useAuditStore';
import type { Product, Category } from '../../../types/pos';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  const openTable = usePosStore((state) => state.openTable);
  const currentOrder = usePosStore((state) => state.currentOrder);
  const addItem = usePosStore((state) => state.addItemToOrder);
  const tables = usePosStore((state) => state.tables);

  const currentUser = useAuthStore((state) => state.currentUser);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const logAction = useAuditStore((state) => state.logAction);

  // Require login on mount if no user
  useEffect(() => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
    }
  }, [currentUser]);

  const handleLogin = (pin: string) => {
    const success = login(pin);
    if (success) {
      setIsLoginModalOpen(false);
      setLoginError(null);
      const user = useAuthStore.getState().currentUser;
      if (user) {
        logAction({
          userId: user.id,
          userName: user.name,
          action: 'LOGIN',
          details: 'Connexion au POS'
        });
      }
    } else {
      setLoginError("Code PIN incorrect");
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logAction({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'LOGOUT',
        details: 'Déconnexion du POS'
      });
    }
    logout();
    setIsLoginModalOpen(true);
  };

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
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-pos-emerald rounded-pos flex items-center justify-center shadow-md">
            <span className="font-bold text-white text-xl">R</span>
          </div>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-pos-card border border-pos-darker flex items-center justify-center text-xs font-bold text-pos-text-secondary hover:text-white hover:bg-pos-dark transition-colors"
              title={`Connecté en tant que ${currentUser.name}. Cliquer pour déconnecter.`}
            >
              {currentUser.name.substring(0, 2).toUpperCase()}
            </button>
          )}
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
            onPayClick={() => setIsPaymentModalOpen(true)}
          />
        </>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-pos-dark rounded-2xl shadow-2xl p-8 border border-pos-card flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-pos-emerald rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="font-black text-white text-3xl">R</span>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Ritaj POS</h2>
              <p className="text-pos-text-muted text-center text-sm mb-8">
                Veuillez saisir votre code PIN pour accéder à la caisse.
              </p>

              <PinPad
                onPinComplete={handleLogin}
                error={loginError}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
