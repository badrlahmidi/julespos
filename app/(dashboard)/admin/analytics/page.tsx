"use client";

import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

const mockHourlyData = [
  { time: '11:00', revenue: 120 },
  { time: '12:00', revenue: 800 },
  { time: '13:00', revenue: 1450 },
  { time: '14:00', revenue: 950 },
  { time: '15:00', revenue: 300 },
  { time: '18:00', revenue: 450 },
  { time: '19:00', revenue: 1200 },
  { time: '20:00', revenue: 2300 },
  { time: '21:00', revenue: 2100 },
  { time: '22:00', revenue: 1100 },
  { time: '23:00', revenue: 400 },
];

const mockProductData = [
  { name: 'Burger Classique', sales: 145 },
  { name: 'Pizza Margherita', sales: 120 },
  { name: 'Salade César', sales: 95 },
  { name: 'Coca-Cola', sales: 210 },
  { name: 'Tiramisu', sales: 85 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-screen w-full bg-pos-dark text-pos-text-primary overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between p-6 bg-pos-darker border-b border-pos-card shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Analytics</h1>
            <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Performances</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
         <div className="w-full max-w-6xl mx-auto space-y-6">

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-pos-darker p-6 rounded-2xl border border-pos-card shadow-sm">
                  <h3 className="text-pos-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Chiffre d'Affaires</h3>
                  <p className="text-4xl font-black text-white">11 170.00 €</p>
                  <p className="text-pos-emerald text-sm font-bold mt-2">↑ +14.5% vs hier</p>
               </div>
               <div className="bg-pos-darker p-6 rounded-2xl border border-pos-card shadow-sm">
                  <h3 className="text-pos-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Commandes</h3>
                  <p className="text-4xl font-black text-white">342</p>
                  <p className="text-pos-emerald text-sm font-bold mt-2">↑ +5.2% vs hier</p>
               </div>
               <div className="bg-pos-darker p-6 rounded-2xl border border-pos-card shadow-sm">
                  <h3 className="text-pos-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Panier Moyen</h3>
                  <p className="text-4xl font-black text-white">32.66 €</p>
                  <p className="text-pos-warning text-sm font-bold mt-2">↓ -1.2% vs hier</p>
               </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Revenue Chart */}
               <div className="bg-pos-darker p-6 rounded-2xl border border-pos-card shadow-sm col-span-1 lg:col-span-2">
                  <h3 className="text-xl font-bold text-white mb-6">Revenu par Heure</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockHourlyData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                        <XAxis dataKey="time" stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} />
                        <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} tickFormatter={(val) => `${val}€`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }}
                          itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Top Products */}
               <div className="bg-pos-darker p-6 rounded-2xl border border-pos-card shadow-sm col-span-1 lg:col-span-2">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <PieChartIcon className="text-blue-500" />
                    Produits les plus vendus
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockProductData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#9CA3AF" />
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={120} tick={{fill: '#F3F4F6'}} />
                        <Tooltip
                           contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }}
                           cursor={{fill: '#121212'}}
                        />
                        <Bar dataKey="sales" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>

         </div>
      </main>
    </div>
  );
}
