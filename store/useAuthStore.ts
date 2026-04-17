import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types/auth';

// Simple hashing for prototype purposes. In production, use bcrypt or similar on the backend.
const hashPin = (pin: string) => btoa(pin).substring(0, 10);

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin', role: 'ADMIN', pinHash: hashPin('1234') },
  { id: '2', name: 'Manager 1', role: 'MANAGER', pinHash: hashPin('1111') },
  { id: '3', name: 'Serveur 1', role: 'SERVER', pinHash: hashPin('2222') },
  { id: '4', name: 'Chef', role: 'KITCHEN', pinHash: hashPin('3333') },
];

interface AuthState {
  users: User[];
  currentUser: User | null;

  // Actions
  login: (pin: string) => boolean;
  logout: () => void;
  verifyPin: (pin: string, requiredRoles?: Role[]) => User | null;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: MOCK_USERS,
      currentUser: null,

      login: (pin: string) => {
        const hashed = hashPin(pin);
        const user = get().users.find(u => u.pinHash === hashed);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null });
      },

      verifyPin: (pin: string, requiredRoles?: Role[]) => {
        const hashed = hashPin(pin);
        const user = get().users.find(u => u.pinHash === hashed);

        if (!user) return null;

        if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
          return null; // Valid PIN, but insufficient privileges
        }

        return user;
      },

      addUser: (user) => {
        set((state) => ({
          users: [...state.users, { ...user, id: Math.random().toString(36).substr(2, 9) }]
        }));
      },

      updateUser: (id, updatedUser) => {
        set((state) => ({
          users: state.users.map(u => u.id === id ? { ...u, ...updatedUser } : u)
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter(u => u.id !== id)
        }));
      }
    }),
    {
      name: 'auth-storage',
      // We don't necessarily want to persist currentUser if we want them to log in every session,
      // but for this prototype with "fast user switching", we'll persist it.
    }
  )
);
