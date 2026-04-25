"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import { PrinterSettings } from '../../../../components/settings/PrinterSettings';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-screen w-full bg-pos-dark text-pos-text-primary overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between p-6 bg-pos-darker border-b border-pos-card shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pos-info rounded-xl flex items-center justify-center shadow-lg">
            <Settings size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Paramètres</h1>
            <p className="text-sm font-bold text-pos-info uppercase tracking-widest">Configuration Système</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 flex justify-center">
         <div className="w-full max-w-5xl space-y-8">
            <PrinterSettings />
         </div>
      </main>
    </div>
  );
}
