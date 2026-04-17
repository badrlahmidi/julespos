import { create } from 'zustand';
import type { Order, OrderItem, Product, Modifier, Table } from '../types/pos';

interface PosState {
  currentOrder: Order | null;
  tables: Table[];

  // Actions
  openTable: (tableId: string) => void;
  addItemToOrder: (product: Product, quantity?: number, selectedModifiers?: Modifier[]) => void;
  updateItemQuantity: (orderItemId: string, quantity: number) => void;
  removeItemFromOrder: (orderItemId: string) => void;
  calculateTotals: () => void;
  clearCurrentOrder: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const usePosStore = create<PosState>((set, get) => ({
  currentOrder: null,
  tables: [],

  openTable: (tableId: string) => {
    set((state) => ({
      currentOrder: {
        id: generateId(),
        tableId,
        items: [],
        total: 0,
        totalHT: 0,
        totalTax: 0,
        status: 'open',
      },
    }));
  },

  addItemToOrder: (product: Product, quantity = 1, selectedModifiers = []) => {
    set((state) => {
      if (!state.currentOrder) return state;

      const existingItemIndex = state.currentOrder.items.findIndex(
        item => item.product.id === product.id &&
                JSON.stringify(item.selectedModifiers) === JSON.stringify(selectedModifiers)
      );

      let updatedItems: OrderItem[];
      if (existingItemIndex >= 0) {
        updatedItems = [...state.currentOrder.items];
        // Ensure quantity exists
        if (updatedItems[existingItemIndex]) {
            updatedItems[existingItemIndex].quantity += quantity;
        }
      } else {
        const newItem: OrderItem = {
          id: generateId(),
          product,
          quantity,
          selectedModifiers,
        };
        updatedItems = [...state.currentOrder.items, newItem];
      }

      return {
        currentOrder: {
          ...state.currentOrder,
          items: updatedItems,
        },
      };
    });

    get().calculateTotals();
  },

  updateItemQuantity: (orderItemId: string, quantity: number) => {
    set((state) => {
      if (!state.currentOrder) return state;

      const updatedItems = state.currentOrder.items.map(item =>
        item.id === orderItemId ? { ...item, quantity: Math.max(1, quantity) } : item
      );

      return {
        currentOrder: {
          ...state.currentOrder,
          items: updatedItems,
        },
      };
    });

    get().calculateTotals();
  },

  removeItemFromOrder: (orderItemId: string) => {
    set((state) => {
      if (!state.currentOrder) return state;

      const updatedItems = state.currentOrder.items.filter(item => item.id !== orderItemId);

      return {
        currentOrder: {
          ...state.currentOrder,
          items: updatedItems,
        },
      };
    });

    get().calculateTotals();
  },

  calculateTotals: () => {
    set((state) => {
      if (!state.currentOrder) return state;

      let totalHT = 0;
      let totalTax = 0;
      let total = 0;

      state.currentOrder.items.forEach((item) => {
        let itemPriceHT = item.product.price;
        if (item.selectedModifiers) {
          item.selectedModifiers.forEach(modifier => {
            itemPriceHT += modifier.price;
          });
        }

        const itemTotalHT = itemPriceHT * item.quantity;
        const itemTax = itemTotalHT * (item.product.taxRate / 100);

        totalHT += itemTotalHT;
        totalTax += itemTax;
        total += itemTotalHT + itemTax;
      });

      return {
        currentOrder: {
          ...state.currentOrder,
          totalHT,
          totalTax,
          total,
        },
      };
    });
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  }
}));
