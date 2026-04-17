import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditLog, AuditAction } from '../types/auth';

interface AuditState {
  logs: AuditLog[];

  // Actions
  logAction: (action: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      logs: [],

      logAction: (actionData) => {
        const newLog: AuditLog = {
          ...actionData,
          id: Math.random().toString(36).substring(2, 10),
          timestamp: Date.now()
        };

        set((state) => ({
          logs: [newLog, ...state.logs] // Prepend new logs so they appear first
        }));
      },

      clearLogs: () => {
        set({ logs: [] });
      }
    }),
    {
      name: 'audit-storage',
    }
  )
);
