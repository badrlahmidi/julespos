"use client";

import React, { useState } from 'react';
import { usePrinterStore } from '../../store/usePrinterStore';
import { requestWebUSBDevice, generateOpenDrawerPayload, generateReceiptPayload, printViaWebUSB } from '../../lib/printerService';
import { Printer as PrinterIcon, Usb, Bluetooth, Wifi, Plus, Check, Trash2 } from 'lucide-react';
import type { PrinterType } from '../../types/printer';

export const PrinterSettings = () => {
  const { printers, activePrinterId, addPrinter, removePrinter, setActivePrinter } = usePrinterStore();
  const [isScanning, setIsScanning] = useState(false);

  const handleAddUSBPrinter = async () => {
    setIsScanning(true);
    try {
      const printer = await requestWebUSBDevice();
      if (printer) {
        addPrinter(printer);
      }
    } catch (e) {
      alert("Erreur: WebUSB n'est pas supporté ou l'accès a été refusé.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestDrawer = async (printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    if (!printer || printer.type !== 'usb') {
      alert("Seuls les tests USB sont supportés dans ce prototype.");
      return;
    }

    try {
      const payload = generateOpenDrawerPayload();
      await printViaWebUSB(printer, payload);
    } catch (e) {
      console.error(e);
      alert("Échec de l'ouverture du tiroir.");
    }
  };

  const handleTestPrint = async (printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    if (!printer || printer.type !== 'usb') {
      alert("Seuls les tests USB sont supportés dans ce prototype.");
      return;
    }

    try {
      const payload = generateReceiptPayload({
        restaurantName: "RITAJ POS TEST",
        address: "123 Rue de la Tech, Paris",
        siret: "123 456 789 00012",
        orderId: "TEST-001",
        date: new Date(),
        items: [
          { name: "Burger Test", quantity: 1, price: 10, total: 10 },
          { name: "Frites Test", quantity: 1, price: 4, total: 4 }
        ],
        subtotal: 14,
        tax: 1.4,
        total: 15.4,
        paymentMethod: "TEST"
      });
      await printViaWebUSB(printer, payload);
    } catch (e) {
      console.error(e);
      alert("Échec de l'impression test.");
    }
  };

  const getIconForType = (type: PrinterType) => {
    switch(type) {
      case 'usb': return <Usb size={20} />;
      case 'bluetooth': return <Bluetooth size={20} />;
      case 'network': return <Wifi size={20} />;
    }
  };

  return (
    <div className="bg-pos-darker rounded-2xl border border-pos-card overflow-hidden shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-pos-card pb-4">
        <div className="w-10 h-10 bg-pos-card rounded-lg flex items-center justify-center text-pos-text-primary">
          <PrinterIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Imprimantes & Tiroir-Caisse</h2>
          <p className="text-sm text-pos-text-secondary">Gérez vos périphériques physiques (ESC/POS)</p>
        </div>
      </div>

      {/* Printer List */}
      <div className="space-y-4 mb-8">
        {printers.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-pos-card rounded-xl text-pos-text-muted">
            <PrinterIcon size={48} className="mx-auto mb-3 opacity-50" />
            <p>Aucune imprimante configurée.</p>
          </div>
        ) : (
          printers.map(printer => {
            const isActive = printer.id === activePrinterId;
            return (
              <div
                key={printer.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                  isActive ? 'bg-pos-emerald/10 border-pos-emerald' : 'bg-pos-card border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-pos-emerald text-white' : 'bg-pos-darker text-pos-text-secondary'}`}>
                      {getIconForType(printer.type)}
                   </div>
                   <div>
                     <h3 className="font-bold text-white flex items-center gap-2">
                       {printer.name}
                       {isActive && <span className="px-2 py-0.5 bg-pos-emerald text-white text-[10px] uppercase tracking-wider rounded-full">Active</span>}
                     </h3>
                     <p className="text-xs text-pos-text-muted font-mono">{printer.id}</p>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   {!isActive && (
                     <button
                       onClick={() => setActivePrinter(printer.id)}
                       className="px-4 py-2 bg-pos-darker hover:bg-pos-dark text-pos-text-primary rounded-lg text-sm font-bold transition-colors"
                     >
                       Définir par défaut
                     </button>
                   )}
                   <button
                     onClick={() => handleTestPrint(printer.id)}
                     className="px-4 py-2 bg-pos-info/20 hover:bg-pos-info/30 text-pos-info rounded-lg text-sm font-bold transition-colors"
                   >
                     Test Impression
                   </button>
                   <button
                     onClick={() => handleTestDrawer(printer.id)}
                     className="px-4 py-2 bg-pos-warning/20 hover:bg-pos-warning/30 text-pos-warning rounded-lg text-sm font-bold transition-colors"
                   >
                     Test Tiroir
                   </button>
                   <button
                     onClick={() => removePrinter(printer.id)}
                     className="p-2 text-pos-text-muted hover:text-pos-danger bg-pos-darker hover:bg-pos-dark rounded-lg transition-colors"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Printer Actions */}
      <div className="flex gap-4 pt-6 border-t border-pos-card">
         <button
           onClick={handleAddUSBPrinter}
           disabled={isScanning}
           className="flex-1 py-4 bg-pos-card hover:bg-pos-dark border border-pos-card rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
         >
           <Usb size={20} />
           Ajouter une imprimante USB (WebUSB)
         </button>
         <button
           disabled
           className="flex-1 py-4 bg-pos-card border border-pos-card rounded-xl font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
         >
           <Wifi size={20} />
           Ajouter une imprimante Réseau (Bientôt)
         </button>
      </div>

    </div>
  );
};
