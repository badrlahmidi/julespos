"use client";

import React, { useState } from 'react';
import { useReportStore } from '../../../../store/useReportStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import { Calculator, Download, Printer, Lock } from 'lucide-react';
import type { ZReport } from '../../../../types/reports';

export default function ZReportPage() {
  const { zReports, lastOpenedAt, saveZReport, resetShift } = useReportStore();
  const currentUser = useAuthStore(state => state.currentUser);

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // MOCK DATA for the current shift. In a real app, this aggregates data from the POS store since `lastOpenedAt`.
  const currentShiftData = {
    totalSales: 1540.50,
    totalTax: 154.05,
    totalCash: 340.50,
    totalCard: 1200.00,
    totalOther: 0,
    ordersCount: 42
  };

  const handleCloseRegister = () => {
    if (!currentUser) {
      alert("Erreur: Non authentifié.");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir clôturer la caisse ? Cette action est irréversible et génère le Z-Report.")) {
      saveZReport({
        openedAt: lastOpenedAt,
        closedAt: Date.now(),
        totalSales: currentShiftData.totalSales,
        totalTax: currentShiftData.totalTax,
        totalCash: currentShiftData.totalCash,
        totalCard: currentShiftData.totalCard,
        totalOther: currentShiftData.totalOther,
        ordersCount: currentShiftData.ordersCount,
        closedBy: currentUser.name
      });
      resetShift();
      alert("Caisse clôturée avec succès.");
      setActiveTab('history');
    }
  };

  const generateCSV = (report: ZReport) => {
    const headers = "ID,Date,Ouverture,Fermeture,TotalTTC,TVA,Especes,Carte,Autres,NbCommandes,FermeturePar\n";
    const row = `${report.id},${new Date(report.date).toLocaleDateString()},${new Date(report.openedAt).toLocaleTimeString()},${new Date(report.closedAt).toLocaleTimeString()},${report.totalSales},${report.totalTax},${report.totalCash},${report.totalCard},${report.totalOther},${report.ordersCount},${report.closedBy}\n`;

    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Z-Report_${report.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-pos-dark text-pos-text-primary overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between p-6 bg-pos-darker border-b border-pos-card shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Calculator size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Comptabilité</h1>
            <p className="text-sm font-bold text-red-400 uppercase tracking-widest">Clôture de Caisse (Z-Report)</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-pos-card p-1 rounded-xl">
           <button
             onClick={() => setActiveTab('current')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'current' ? 'bg-red-500 text-white shadow-md' : 'text-pos-text-secondary hover:text-white'}`}
           >
              X-Report (En cours)
           </button>
           <button
             onClick={() => setActiveTab('history')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'history' ? 'bg-red-500 text-white shadow-md' : 'text-pos-text-secondary hover:text-white'}`}
           >
              Z-Reports (Archives)
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 flex justify-center">
         <div className="w-full max-w-4xl space-y-6">

            {activeTab === 'current' && (
              <div className="bg-pos-darker rounded-2xl border border-pos-card shadow-lg p-8">
                 <div className="flex justify-between items-center mb-8 pb-6 border-b border-pos-card">
                    <div>
                       <h2 className="text-2xl font-bold text-white mb-2">Session Actuelle</h2>
                       <p className="text-pos-text-secondary">Ouverte le {new Date(lastOpenedAt).toLocaleString('fr-FR')}</p>
                    </div>
                    <button
                      onClick={handleCloseRegister}
                      className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition-colors"
                    >
                      <Lock size={20} />
                      Clôturer la Caisse (Z)
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                       <h3 className="text-sm font-bold text-pos-text-secondary uppercase tracking-wider">Récapitulatif Financier</h3>
                       <div className="flex justify-between items-center p-4 bg-pos-card rounded-xl border border-pos-dark">
                          <span className="font-medium">Total Ventes TTC</span>
                          <span className="text-xl font-bold text-white">{currentShiftData.totalSales.toFixed(2)} €</span>
                       </div>
                       <div className="flex justify-between items-center p-4 bg-pos-card rounded-xl border border-pos-dark">
                          <span className="font-medium">Dont TVA</span>
                          <span className="text-xl font-bold text-pos-warning">{currentShiftData.totalTax.toFixed(2)} €</span>
                       </div>
                       <div className="flex justify-between items-center p-4 bg-pos-card rounded-xl border border-pos-dark">
                          <span className="font-medium">Nombre de commandes</span>
                          <span className="text-xl font-bold text-pos-info">{currentShiftData.ordersCount}</span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-sm font-bold text-pos-text-secondary uppercase tracking-wider">Modes de Paiement</h3>
                       <div className="flex justify-between items-center p-4 bg-pos-card rounded-xl border border-pos-dark">
                          <span className="font-medium">Espèces</span>
                          <span className="text-xl font-bold text-pos-emerald">{currentShiftData.totalCash.toFixed(2)} €</span>
                       </div>
                       <div className="flex justify-between items-center p-4 bg-pos-card rounded-xl border border-pos-dark">
                          <span className="font-medium">Carte Bancaire</span>
                          <span className="text-xl font-bold text-pos-emerald">{currentShiftData.totalCard.toFixed(2)} €</span>
                       </div>
                       <div className="flex justify-between items-center p-4 bg-pos-card rounded-xl border border-pos-dark">
                          <span className="font-medium">Autres (Vouchers, etc.)</span>
                          <span className="text-xl font-bold text-pos-emerald">{currentShiftData.totalOther.toFixed(2)} €</span>
                       </div>
                    </div>
                 </div>

              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-6">Archives Z-Reports</h2>
                {zReports.length === 0 ? (
                  <div className="p-8 text-center text-pos-text-muted bg-pos-darker rounded-2xl border border-pos-card">
                    Aucun Z-Report archivé.
                  </div>
                ) : (
                  zReports.map(report => (
                    <div key={report.id} className="bg-pos-darker p-6 rounded-2xl border border-pos-card flex items-center justify-between shadow-sm">
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-xl font-bold text-white">Z-Report #{report.id.slice(0, 8)}</h3>
                             <span className="text-xs font-bold px-2 py-1 bg-pos-card text-pos-text-secondary rounded-md">
                               Par {report.closedBy}
                             </span>
                          </div>
                          <p className="text-sm text-pos-text-secondary">
                             Date: {new Date(report.date).toLocaleDateString('fr-FR')} |
                             Période: {new Date(report.openedAt).toLocaleTimeString('fr-FR')} - {new Date(report.closedAt).toLocaleTimeString('fr-FR')}
                          </p>
                          <div className="flex gap-6 mt-3 text-sm font-medium">
                             <span className="text-pos-emerald">TTC: {report.totalSales.toFixed(2)} €</span>
                             <span className="text-pos-info">Espèces: {report.totalCash.toFixed(2)} €</span>
                             <span className="text-pos-warning">TVA: {report.totalTax.toFixed(2)} €</span>
                          </div>
                       </div>
                       <div className="flex flex-col gap-2">
                          <button
                            onClick={() => generateCSV(report)}
                            className="p-3 bg-pos-card hover:bg-pos-dark text-pos-text-primary rounded-xl transition-colors flex items-center justify-center"
                            title="Exporter en CSV"
                          >
                            <Download size={20} />
                          </button>
                          <button
                            className="p-3 bg-pos-card hover:bg-pos-dark text-pos-text-primary rounded-xl transition-colors flex items-center justify-center"
                            title="Imprimer"
                          >
                            <Printer size={20} />
                          </button>
                       </div>
                    </div>
                  ))
                )}
              </div>
            )}

         </div>
      </main>
    </div>
  );
}
