"use client";

import React, { useState } from 'react';
import { useCrmStore } from '../../../../store/useCrmStore';
import { Users, Search, Plus, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CrmPage() {
  const { customers, addCustomer } = useCrmStore();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.phone) {
      addCustomer(newCustomer);
      setNewCustomer({ name: '', phone: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-pos-dark text-pos-text-primary overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between p-6 bg-pos-darker border-b border-pos-card shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">CRM & Fidélité</h1>
            <p className="text-sm font-bold text-purple-400 uppercase tracking-widest">Base Clients</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 flex justify-center">
         <div className="w-full max-w-5xl space-y-6">

            <div className="flex justify-between items-center bg-pos-darker p-4 rounded-2xl border border-pos-card">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pos-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-pos-card border-none rounded-xl py-3 pl-12 pr-4 text-pos-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition-colors"
              >
                <Plus size={20} />
                Nouveau Client
              </button>
            </div>

            {isAdding && (
              <motion.form
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAdd}
                className="bg-pos-card p-6 rounded-2xl border border-pos-darker flex items-end gap-4"
              >
                <div className="flex-1">
                  <label className="block text-sm text-pos-text-secondary mb-1">Nom complet</label>
                  <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full bg-pos-darker border border-pos-card rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-pos-text-secondary mb-1">Téléphone</label>
                  <input required type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full bg-pos-darker border border-pos-card rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500" />
                </div>
                <button type="submit" className="py-3 px-8 bg-pos-emerald text-white rounded-xl font-bold hover:bg-pos-emerald-hover transition-colors">
                  Sauvegarder
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="py-3 px-6 bg-pos-darker text-pos-text-secondary hover:text-white rounded-xl font-bold transition-colors">
                  Annuler
                </button>
              </motion.form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="bg-pos-darker p-6 rounded-2xl border border-pos-card flex flex-col items-center text-center shadow-md">
                  <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{customer.name}</h3>
                  <p className="text-pos-text-secondary font-mono mb-6">{customer.phone}</p>

                  <div className="w-full bg-pos-card p-4 rounded-xl flex justify-between items-center border border-pos-dark">
                    <span className="text-sm font-bold text-pos-text-muted uppercase tracking-wider">Points Fidelité</span>
                    <span className="flex items-center gap-1 text-xl font-black text-yellow-500">
                      {customer.points} <Star size={20} className="fill-yellow-500" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

         </div>
      </main>
    </div>
  );
}
