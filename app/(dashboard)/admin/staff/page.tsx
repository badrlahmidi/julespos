"use client";

import React, { useState } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useAuditStore } from '../../../../store/useAuditStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Edit2, Trash2, KeyRound, ShieldCheck, X } from 'lucide-react';
import type { User, Role } from '../../../../types/auth';

export default function StaffPage() {
  const users = useAuthStore(state => state.users);
  const deleteUser = useAuthStore(state => state.deleteUser);
  const addUser = useAuthStore(state => state.addUser);
  const updateUser = useAuthStore(state => state.updateUser);
  const logs = useAuditStore(state => state.logs);

  const [activeTab, setActiveTab] = useState<'staff' | 'audit'>('staff');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'SERVER' as Role,
    pin: ''
  });

  const openModal = (user?: User) => {
    if (user) {
      setEditingUserId(user.id);
      setFormData({ name: user.name, role: user.role, pin: '' }); // Don't show hashed pin
    } else {
      setEditingUserId(null);
      setFormData({ name: '', role: 'SERVER', pin: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    // Simple hash for prototype (btoa logic from store)
    let pinHash = undefined;
    if (formData.pin) {
      pinHash = btoa(formData.pin).substring(0, 10);
    }

    if (editingUserId) {
      updateUser(editingUserId, {
        name: formData.name,
        role: formData.role,
        ...(pinHash ? { pinHash } : {})
      });
    } else {
      if (!pinHash) return; // PIN is required for new users
      addUser({
        name: formData.name,
        role: formData.role,
        pinHash
      });
    }
    closeModal();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-pos-dark text-pos-text-primary overflow-hidden relative">
      {/* Top Navigation */}
      <header className="flex items-center justify-between p-6 bg-pos-darker border-b border-pos-card shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pos-emerald rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Administration</h1>
            <p className="text-sm font-bold text-pos-emerald uppercase tracking-widest">Sécurité & Équipe</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-pos-card p-1 rounded-xl">
           <button
             onClick={() => setActiveTab('staff')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'staff' ? 'bg-pos-emerald text-white shadow-md' : 'text-pos-text-secondary hover:text-white'}`}
           >
              <Users size={20} />
              Employés
           </button>
           <button
             onClick={() => setActiveTab('audit')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'audit' ? 'bg-pos-emerald text-white shadow-md' : 'text-pos-text-secondary hover:text-white'}`}
           >
              <KeyRound size={20} />
              Journal d'Audit
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 flex justify-center">
         <div className="w-full max-w-5xl">

            {activeTab === 'staff' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold">Gestion des Employés</h2>
                  <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-pos-emerald hover:bg-pos-emerald-hover text-white rounded-xl font-bold shadow-md transition-colors"
                  >
                     <UserPlus size={20} />
                     Ajouter un employé
                  </button>
                </div>

                <div className="bg-pos-darker rounded-2xl border border-pos-card overflow-hidden shadow-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-pos-card border-b border-pos-darker text-pos-text-secondary uppercase text-sm tracking-wider">
                        <th className="p-4 font-bold">Nom</th>
                        <th className="p-4 font-bold">Rôle</th>
                        <th className="p-4 font-bold">Code PIN</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-pos-card hover:bg-pos-card/50 transition-colors">
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4">
                             <span className="px-3 py-1 rounded-full bg-pos-dark text-xs font-bold uppercase border border-pos-card">
                                {user.role}
                             </span>
                          </td>
                          <td className="p-4 text-pos-text-muted font-mono tracking-widest">••••</td>
                          <td className="p-4 flex justify-end gap-2">
                             <button
                               onClick={() => openModal(user)}
                               className="p-2 text-pos-text-secondary hover:text-pos-emerald rounded-lg hover:bg-pos-dark transition-colors"
                             >
                                <Edit2 size={18} />
                             </button>
                             <button
                               onClick={() => {
                                 if(window.confirm(`Supprimer ${user.name} ?`)) deleteUser(user.id);
                               }}
                               className="p-2 text-pos-text-secondary hover:text-pos-danger rounded-lg hover:bg-pos-dark transition-colors"
                             >
                                <Trash2 size={18} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold">Journal d'Audit (Logs)</h2>
                </div>

                <div className="bg-pos-darker rounded-2xl border border-pos-card overflow-hidden shadow-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-pos-card border-b border-pos-darker text-pos-text-secondary uppercase text-sm tracking-wider">
                        <th className="p-4 font-bold">Date & Heure</th>
                        <th className="p-4 font-bold">Utilisateur</th>
                        <th className="p-4 font-bold">Action</th>
                        <th className="p-4 font-bold">Détails</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-pos-text-muted">Aucun log enregistré pour le moment.</td>
                        </tr>
                      ) : (
                        logs.map(log => (
                          <tr key={log.id} className="border-b border-pos-card hover:bg-pos-card/50 transition-colors">
                            <td className="p-4 text-sm whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('fr-FR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              })}
                            </td>
                            <td className="p-4 font-medium">{log.userName}</td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase border ${
                                  log.action.includes('VOID') ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  log.action.includes('PAID') ? 'bg-pos-emerald/10 text-pos-emerald border-pos-emerald/20' :
                                  'bg-pos-dark text-pos-text-primary border-pos-card'
                               }`}>
                                  {log.action.replace(/_/g, ' ')}
                               </span>
                            </td>
                            <td className="p-4 text-pos-text-secondary text-sm">{log.details}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

         </div>
      </main>

      {/* Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-pos-darker rounded-2xl shadow-2xl p-6 border border-pos-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingUserId ? "Modifier l'employé" : "Nouvel employé"}
                </h3>
                <button onClick={closeModal} className="text-pos-text-muted hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pos-text-secondary mb-1">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-pos-dark border border-pos-card rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pos-emerald transition-shadow"
                    placeholder="ex: Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pos-text-secondary mb-1">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as Role})}
                    className="w-full bg-pos-dark border border-pos-card rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pos-emerald transition-shadow appearance-none"
                  >
                    <option value="SERVER">Serveur</option>
                    <option value="KITCHEN">Cuisine</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-pos-text-secondary mb-1">
                    Code PIN {editingUserId && "(laisser vide pour ne pas modifier)"}
                  </label>
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                    required={!editingUserId}
                    value={formData.pin}
                    onChange={e => setFormData({...formData, pin: e.target.value})}
                    className="w-full bg-pos-dark border border-pos-card rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pos-emerald transition-shadow font-mono tracking-widest text-lg"
                    placeholder="••••"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 px-4 bg-pos-card hover:bg-pos-dark border border-pos-darker text-white font-bold rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-pos-emerald hover:bg-pos-emerald-hover text-white font-bold rounded-xl shadow-md transition-colors"
                  >
                    {editingUserId ? "Enregistrer" : "Créer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
