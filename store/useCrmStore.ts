import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer } from '../types/crm';

interface CrmState {
  customers: Customer[];

  // Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'points'>) => Customer;
  findCustomerByPhone: (phone: string) => Customer | undefined;
  addPoints: (customerId: string, points: number) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useCrmStore = create<CrmState>()(
  persist(
    (set, get) => ({
      customers: [
        { id: 'cust-1', name: 'John Doe', phone: '0612345678', points: 150, createdAt: Date.now() },
        { id: 'cust-2', name: 'Jane Smith', phone: '0698765432', points: 45, createdAt: Date.now() },
      ],

      addCustomer: (data) => {
        const newCustomer: Customer = {
          ...data,
          id: `cust-${generateId()}`,
          points: 0,
          createdAt: Date.now()
        };
        set((state) => ({ customers: [...state.customers, newCustomer] }));
        return newCustomer;
      },

      findCustomerByPhone: (phone: string) => {
        return get().customers.find(c => c.phone === phone);
      },

      addPoints: (customerId: string, points: number) => {
        set((state) => ({
          customers: state.customers.map(c =>
            c.id === customerId ? { ...c, points: c.points + points } : c
          )
        }));
      }
    }),
    {
      name: 'crm-storage'
    }
  )
);
