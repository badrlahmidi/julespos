import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ZReport } from '../types/reports';

interface ReportState {
  zReports: ZReport[];
  lastOpenedAt: number;

  // Actions
  saveZReport: (report: Omit<ZReport, 'id' | 'date'>) => void;
  resetShift: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      zReports: [],
      lastOpenedAt: Date.now(), // default to now for fresh install

      saveZReport: (data) => {
        const newReport: ZReport = {
          ...data,
          id: `z-${generateId()}`,
          date: Date.now()
        };
        set((state) => ({
          zReports: [newReport, ...state.zReports]
        }));
      },

      resetShift: () => {
        set({ lastOpenedAt: Date.now() });
      }
    }),
    {
      name: 'report-storage'
    }
  )
);
