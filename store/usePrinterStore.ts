import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Printer } from '../types/printer';

interface PrinterState {
  printers: Printer[];
  activePrinterId: string | null;

  // Actions
  addPrinter: (printer: Printer) => void;
  removePrinter: (id: string) => void;
  setActivePrinter: (id: string) => void;
}

export const usePrinterStore = create<PrinterState>()(
  persist(
    (set) => ({
      printers: [],
      activePrinterId: null,

      addPrinter: (printer) => {
        set((state) => {
          // Prevent duplicates based on name/vid/pid/address
          const exists = state.printers.some(p => p.name === printer.name || p.id === printer.id);
          if (exists) return state;

          const newPrinters = [...state.printers, printer];
          return {
            printers: newPrinters,
            activePrinterId: state.activePrinterId || printer.id // Auto-select if it's the first
          };
        });
      },

      removePrinter: (id) => {
        set((state) => ({
          printers: state.printers.filter(p => p.id !== id),
          activePrinterId: state.activePrinterId === id ? null : state.activePrinterId
        }));
      },

      setActivePrinter: (id) => {
        set({ activePrinterId: id });
      }
    }),
    {
      name: 'printer-storage',
    }
  )
);
