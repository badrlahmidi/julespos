import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderItem, Product, Modifier, Table, TableStatus, OrderStatus, OrderItemStatus } from '../types/pos';

interface PosState {
  currentOrder: Order | null;
  tables: Table[];
  activeOrders: Order[]; // For KDS

  // Actions
  openTable: (tableId: string) => void;
  setTableStatus: (tableId: string, status: TableStatus) => void;
  transferOrder: (fromTableId: string, toTableId: string) => void;
  addItemToOrder: (product: Product, quantity?: number, selectedModifiers?: Modifier[]) => void;
  updateItemQuantity: (orderItemId: string, quantity: number) => void;
  removeItemFromOrder: (orderItemId: string) => void;
  calculateTotals: () => void;
  clearCurrentOrder: () => void;

  // KDS Actions
  sendToKitchen: (orderId: string) => void;
  updateItemPrepStatus: (orderId: string, itemId: string, status: OrderItemStatus) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleOrderUrgent: (orderId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const MOCK_TABLES: Table[] = [
  { id: '1', label: '1', capacity: 2, status: 'available' },
  { id: '2', label: '2', capacity: 2, status: 'occupied', lastActionTime: Date.now() - 1000 * 60 * 5 },
  { id: '3', label: '3', capacity: 4, status: 'ordered', lastActionTime: Date.now() - 1000 * 60 * 15, orderId: 'mock-order-1' },
  { id: '4', label: '4', capacity: 4, status: 'available' },
  { id: '5', label: '5', capacity: 6, status: 'billing', lastActionTime: Date.now() - 1000 * 60 * 45, orderId: 'mock-order-2' },
  { id: '6', label: '6', capacity: 2, status: 'available' },
  { id: '10', label: '10', capacity: 8, status: 'available' },
  { id: '11', label: '11', capacity: 4, status: 'available' },
];

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      currentOrder: null,
      tables: MOCK_TABLES,
      activeOrders: [],

      openTable: (tableId: string) => {
    set((state) => {
      // Find existing table
      const table = state.tables.find(t => t.id === tableId);

      const newOrderId = table?.orderId || generateId();

      // Update table status if it was available
      const updatedTables = state.tables.map(t =>
        t.id === tableId && t.status === 'available'
          ? { ...t, status: 'occupied' as TableStatus, orderId: newOrderId, lastActionTime: Date.now() }
          : t
      );

      return {
        tables: updatedTables,
        currentOrder: {
          id: newOrderId,
          tableId,
          items: state.currentOrder?.id === newOrderId ? state.currentOrder.items : [], // In a real app, we'd fetch the existing order
          total: 0,
          totalHT: 0,
          totalTax: 0,
          status: 'open',
        },
      };
    });
    get().calculateTotals();
  },

  setTableStatus: (tableId: string, status: TableStatus) => {
    set((state) => ({
      tables: state.tables.map(t =>
        t.id === tableId
          ? { ...t, status, lastActionTime: Date.now() }
          : t
      )
    }));
  },

  transferOrder: (fromTableId: string, toTableId: string) => {
    set((state) => {
      const fromTable = state.tables.find(t => t.id === fromTableId);
      const toTable = state.tables.find(t => t.id === toTableId);

      if (!fromTable || !fromTable.orderId || !toTable || toTable.status !== 'available') {
        return state; // Invalid transfer
      }

      const orderIdToTransfer = fromTable.orderId;

      const updatedTables = state.tables.map(t => {
        if (t.id === fromTableId) {
          const { orderId, lastActionTime, ...rest } = t;
          return { ...rest, status: 'available' as TableStatus };
        }
        if (t.id === toTableId) {
          return { ...t, status: fromTable.status, orderId: orderIdToTransfer, lastActionTime: Date.now() };
        }
        return t;
      });

      // Update current order if it's the one being transferred
      const updatedOrder = state.currentOrder && state.currentOrder.id === orderIdToTransfer
        ? { ...state.currentOrder, tableId: toTableId }
        : state.currentOrder;

      return {
        tables: updatedTables,
        currentOrder: updatedOrder,
      };
    });
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

          // Precision rounding to avoid JS floating point errors
          const round2 = (num: number) => Math.round(num * 100) / 100;

          return {
            currentOrder: {
              ...state.currentOrder,
              totalHT: round2(totalHT),
              totalTax: round2(totalTax),
              total: round2(total),
            },
          };
        });
      },

      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },

      // KDS Actions
      sendToKitchen: (orderId: string) => {
        set((state) => {
          if (!state.currentOrder || state.currentOrder.id !== orderId) return state;

          const updatedOrder: Order = {
            ...state.currentOrder,
            status: 'sent-to-kitchen',
            sentAt: Date.now(),
            items: state.currentOrder.items.map(item => ({ ...item, status: 'pending' }))
          };

          const existingOrderIndex = state.activeOrders.findIndex(o => o.id === orderId);
          let newActiveOrders = [...state.activeOrders];

          if (existingOrderIndex >= 0) {
            newActiveOrders[existingOrderIndex] = updatedOrder;
          } else {
            newActiveOrders.push(updatedOrder);
          }

          return {
            currentOrder: updatedOrder,
            activeOrders: newActiveOrders,
            tables: state.currentOrder.tableId
              ? state.tables.map(t => t.id === state.currentOrder!.tableId ? { ...t, status: 'ordered', lastActionTime: Date.now() } : t)
              : state.tables
          };
        });
      },

      updateItemPrepStatus: (orderId: string, itemId: string, status: OrderItemStatus) => {
        set((state) => {
          const updatedActiveOrders = state.activeOrders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.map(item =>
                item.id === itemId ? { ...item, status } : item
              );

              // Auto-update order status based on items
              const allReady = updatedItems.every(i => i.status === 'ready');
              const anyPreparing = updatedItems.some(i => i.status === 'preparing' || i.status === 'ready');

              let newOrderStatus = order.status;
              if (allReady) newOrderStatus = 'ready';
              else if (anyPreparing) newOrderStatus = 'preparing';

              return { ...order, items: updatedItems, status: newOrderStatus };
            }
            return order;
          });

          return { activeOrders: updatedActiveOrders };
        });
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        set((state) => ({
          activeOrders: state.activeOrders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        }));
      },

      toggleOrderUrgent: (orderId: string) => {
        set((state) => ({
          activeOrders: state.activeOrders.map(order =>
            order.id === orderId ? { ...order, isUrgent: !order.isUrgent } : order
          )
        }));
      }

    }),
    {
      name: 'pos-storage',
    }
  )
);
