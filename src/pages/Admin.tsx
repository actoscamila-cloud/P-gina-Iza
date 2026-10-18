import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Objection, User as UserType } from '../types';
import api from '../services/api';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { sanitizeForFirestore } from '../utils/firestoreUtils';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  MessageSquare, 
  Brain, 
  Users, 
  UserPlus, 
  Key, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sparkles, 
  RotateCcw, 
  Calendar, 
  Building, 
  Check, 
  X,
  BarChart3,
  UploadCloud,
  Flame
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from '../components/ConfirmModal';
import AdminInsights from '../components/AdminInsights';
import BulkImportModal from '../components/BulkImportModal';
import { format, addDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DEFAULT_AI_PROMPT } from '../data/mockData';

const Admin: React.FC = () => {
  const { 
    objections, setObjections, 
    users, setUsers,
    aiPrompt, setAiPrompt,
    syncAdminData,
    refreshData
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'insights' | 'users' | 'objections' | 'ai'>('insights');
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [objectionSearch, setObjectionSearch] = useState('');

  // Prompt local state
  const [promptText, setPromptText] = useState(aiPrompt || DEFAULT_AI_PROMPT);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  // Modal states
  const [isEditingObjection, setIsEditingObjection] = useState(false);
  const [editingObjection, setEditingObjection] = useState<Partial<Objection> | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserType> | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [objectionToDelete, setObjectionToDelete] = useState<Objection | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Sync local prompt if aiPrompt changes from context
  React.useEffect(() => {
    if (aiPrompt) {
      setPromptText(aiPrompt);
    }
  }, [aiPrompt]);

  // Save AI Prompt
  const handleSavePrompt = async () => {
    setIsSavingPrompt(true);
    try {
      setAiPrompt(promptText);
      await syncAdminData({ aiPrompt: promptText });
      toast.success('Diretrizes e Treinamento da IZA salvos com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar treinamento da IA.');
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleResetPrompt = () => {
    setPromptText(DEFAULT_AI_PROMPT);
    toast.info('Instruções restauradas para o padrão Vertus. Clique em Salvar para aplicar.');
  };

  // Save Objection
  const saveObjection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObjection?.trigger || !editingObjection?.response) {
      toast.error('Gatilho e Resposta Geral são obrigatórios');
      return;
    }

    if (editingObjection.id) {
      const newObjections = objections.map(o => o.id === editingObjection.id ? { ...o, ...editingObjection } as Objection : o);
      setObjections(newObjections);
      syncAdminData({ objections: newObjections });
      toast.success('Objeção atualizada com sucesso!');
    } else {
      const newObj: Objection = {
        id: Math.random().toString(36).substring(2, 9),
        trigger: editingObjection.trigger,
        reason: editingObjection.reason || '',
        expertView: editingObjection.expertView || '',
        rapportResponse: editingObjection.rapportResponse || editingObjection.response,
        consultativeResponse: editingObjection.consultativeResponse || editingObjection.response,
        authorityResponse: editingObjection.authorityResponse || editingObjection.response,
        response: editingObjection.response
      };
      const newObjections = [...objections, newObj];
      setObjections(newObjections);
      syncAdminData({ objections: newObjections });
      toast.success('Nova objeção cadastrada!');
    }
    setIsEditingObjection(false);
  };

  const deleteObjection = (id: string) => {
    const newObjections = objections.filter(o => o.id !== id);
    setObjections(newObjections);
    syncAdminData({ objections: newObjections });
    setObjectionToDelete(null);
    toast.success('Objeção removida com sucesso');
  };

  // Save User
  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.name || !editingUser?.email) {
      toast.error('Nome e E-mail são obrigatórios');
      return;
    }

    const normalizedEmail = editingUser.email.toLowerCase().trim();

    // Check for duplicate email across other users
    const emailConflict = users.find(u => u.email.toLowerCase().trim() === normalizedEmail && u.id !== editingUser.id);
    if (emailConflict) {
      toast.error(`Já existe um usuário cadastrado com o e-mail "${normalizedEmail}" (${emailConflict.name}).`);
      return;
    }

    let updatedUsers: UserType[];

    if (editingUser.id) {
      const oldUser = users.find(u => u.id === editingUser.id);
      let expiresAt = editingUser.expiresAt;
      
      const isCurrentlyExpired = oldUser?.expiresAt && isAfter(new Date(), new Date(oldUser.expiresAt));

      if (editingUser.accessDuration === 'LIFETIME') {
        expiresAt = undefined;
      } else if (editingUser.accessDuration && (editingUser.accessDuration !== oldUser?.accessDuration || isCurrentlyExpired)) {
        expiresAt = addDays(new Date(), parseInt(editingUser.accessDuration)).toISOString();
      }

      const updatedUser = { 
        ...oldUser, 
        ...editingUser, 
        name: editingUser.name?.trim() || oldUser?.name || '',
        email: normalizedEmail,
        password: editingUser.password || oldUser?.password || '123456',
        expiresAt 
      } as UserType;

      updatedUsers = users.map(u => u.id === editingUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      toast.success('Dados do usuário atualizados!');

      // Direct Firestore write for immediate durability
      try {
        const userRef = doc(db, 'users', updatedUser.id);
        await setDoc(userRef, sanitizeForFirestore(updatedUser), { merge: true });
      } catch (fsErr) {
        console.warn('Direct Firestore save failed, relying on syncAdminData:', fsErr);
      }
    } else {
      const now = new Date();
      let expiresAt: string | undefined = undefined;
      
      if (editingUser.accessDuration && editingUser.accessDuration !== 'LIFETIME') {
        expiresAt = addDays(now, parseInt(editingUser.accessDuration)).toISOString();
      }

      const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newUser: UserType = {
        id: newUserId,
        name: editingUser.name.trim(),
        email: normalizedEmail,
        password: editingUser.password || '123456',
        role: editingUser.role || 'CONSULTOR',
        points: 0,
        progress: 0,
        clinicId: editingUser.clinicId || 'Clínica Parceira',
        createdAt: now.toISOString(),
        accessDuration: editingUser.accessDuration || 'LIFETIME',
        expiresAt,
        completedModuleIds: [],
        weeklyPoints: [
          { name: 'Seg', pts: 0 },
          { name: 'Ter', pts: 0 },
          { name: 'Qua', pts: 0 },
          { name: 'Qui', pts: 0 },
          { name: 'Sex', pts: 0 },
          { name: 'Sáb', pts: 0 },
          { name: 'Dom', pts: 0 },
        ]
      };
      updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      toast.success('Novo usuário liberado com sucesso!');

      // Direct Firestore write for immediate durability
      try {
        const userRef = doc(db, 'users', newUser.id);
        await setDoc(userRef, sanitizeForFirestore(newUser), { merge: true });
      } catch (fsErr) {
        console.warn('Direct Firestore save failed, relying on syncAdminData:', fsErr);
      }
    }
    
    syncAdminData({ users: updatedUsers });
    setIsEditingUser(false);
  };

  const quickRenewUser = async (userId: string, duration: string = '30') => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    let expiresAt: string | undefined = undefined;
    if (duration !== 'LIFETIME') {
      expiresAt = addDays(new Date(), parseInt(duration)).toISOString();
    }

    const updated = users.map(u => u.id === userId ? {
      ...u,
      accessDuration: duration as any,
      expiresAt
    } : u);

    setUsers(updated);
    const renewedUser = updated.find(u => u.id === userId);
    if (renewedUser) {
      try {
        await setDoc(doc(db, 'users', userId), sanitizeForFirestore(renewedUser), { merge: true });
      } catch (e) {
        console.warn('Could not update Firestore directly:', e);
      }
    }
    syncAdminData({ users: updated });
    toast.success(`Acesso de ${targetUser.name} renovado com sucesso!`);
  };

  const deleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    const totalAdmins = users.filter(u => u.role === 'VERTUS_ADMIN').length;
    
    // Protect only if trying to delete the single remaining admin
    if (user?.role === 'VERTUS_ADMIN' && totalAdmins <= 1) {
      toast.error('O sistema precisa manter pelo menos um Administrador Principal.');
      return;
    }

    const newUsers = users.filter(u => u.id !== id);
    setUsers(newUsers);
    setUserToDelete(null);
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (fsErr) {
      console.warn('Direct Firestore delete failed:', fsErr);
    }
    try {
      await api.delete('/users/' + id);
    } catch (apiErr) {
      console.warn('Server delete failed:', apiErr);
    }
    toast.success('Acesso do usuário revogado e removido');
  };

  // Filtered lists
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.clinicId?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredObjections = objections.filter(o => 
    o.trigger.toLowerCase().includes(objectionSearch.toLowerCase()) ||
    o.response.toLowerCase().includes(objectionSearch.toLowerCase()) ||
    o.reason?.toLowerCase().includes(objectionSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">Painel de Controle Roones</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30 uppercase tracking-wider">
              Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-vertus-white/50 mt-1">
            Gerenciamento de acessos, biblioteca de objeções e treinamento da IZA.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-vertus-gray overflow-x-auto scrollbar-none gap-2">
        {[
          { id: 'insights', label: 'Termômetro & Insights', icon: BarChart3 },
          { id: 'users', label: 'Gestão de Usuários', icon: Users, count: users.length },
          { id: 'objections', label: 'Banco de Objeções', icon: MessageSquare, count: objections.length },
          { id: 'ai', label: 'Treinamento da IZA', icon: Brain },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex items-center gap-2 px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer",
                isActive 
                  ? "text-vertus-gold" 
                  : "text-vertus-white/40 hover:text-vertus-white"
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={clsx(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  isActive ? "bg-vertus-gold/20 text-vertus-gold" : "bg-vertus-gray text-vertus-white/40"
                )}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="adminTabIndicator" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-vertus-gold" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Insights & Thermometer */}
      {activeTab === 'insights' && (
        <AdminInsights />
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vertus-white/30" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou clínica..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-vertus-card border border-vertus-gray focus:border-vertus-gold/50 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => {
                setEditingUser({ role: 'CONSULTOR', clinicId: '', accessDuration: 'LIFETIME' });
                setIsEditingUser(true);
              }}
              className="gold-gradient text-vertus-bg px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0 shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Liberar Novo Usuário
            </button>
          </div>

          <div className="bg-vertus-card border border-vertus-gray rounded-2xl overflow-hidden">
            {/* Mobile Cards List */}
            <div className="md:hidden divide-y divide-vertus-gray/60">
              {filteredUsers.map((u) => {
                const isExpired = u.expiresAt && isAfter(new Date(), new Date(u.expiresAt));
                return (
                  <div key={u.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-vertus-gray border border-vertus-gold/20 flex items-center justify-center font-bold text-vertus-gold text-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-vertus-white text-xs sm:text-sm truncate">{u.name}</p>
                          <p className="text-[11px] text-vertus-white/40 truncate">{u.email}</p>
                        </div>
                      </div>
                      <span className={clsx(
                        "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0",
                        u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN' || u.role === 'SUPER_ADMIN'
                          ? "bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      )}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-vertus-bg/70 rounded-xl px-3 py-2 border border-vertus-gray/40">
                      <div className="truncate mr-2">
                        <span className="text-[9px] text-vertus-white/40 uppercase block">Clínica</span>
                        <span className="text-vertus-white/80 font-medium text-xs">{u.clinicId || 'Roones Padrão'}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-vertus-white/40 uppercase block">Status</span>
                        <span className={clsx(
                          "font-semibold text-xs",
                          isExpired ? "text-red-400" : "text-emerald-400"
                        )}>
                          {isExpired ? 'Expirado' : u.accessDuration === 'LIFETIME' ? 'Vitalício' : `${u.accessDuration || '30'} dias`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-0.5">
                      {isExpired && (
                        <button 
                          onClick={() => quickRenewUser(u.id, '30')}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Renovar Acesso (+30 Dias)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>+30d</span>
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setEditingUser(u);
                          setIsEditingUser(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-vertus-gray/60 hover:bg-vertus-gold/20 text-vertus-white/80 hover:text-vertus-gold text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-vertus-gold" />
                        <span>Editar</span>
                      </button>
                      {(() => {
                        const isAdminUser = u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN' || (u.email && (u.email.toLowerCase().includes('admin@roones') || u.email.toLowerCase().includes('admin@vertus')));
                        const isSoleAdmin = isAdminUser && users.filter(usr => usr.role === 'ROONES_ADMIN' || usr.role === 'VERTUS_ADMIN' || (usr.email && (usr.email.toLowerCase().includes('admin@roones') || usr.email.toLowerCase().includes('admin@vertus')))).length <= 1;
                        if (isSoleAdmin) {
                          return (
                            <span 
                              className="p-1.5 text-vertus-gold/60 flex items-center" 
                              title="Administrador Principal Protegido"
                            >
                              <Shield className="w-3.5 h-3.5 text-vertus-gold" />
                            </span>
                          );
                        }
                        return (
                          <button 
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center transition-colors cursor-pointer"
                            title="Excluir Acesso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="py-10 text-center text-vertus-white/30 text-xs">
                  Nenhum usuário encontrado.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-vertus-gray/30 border-b border-vertus-gray text-vertus-white/40 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 sm:px-6 py-3.5">Usuário</th>
                    <th className="px-4 sm:px-6 py-3.5">Função</th>
                    <th className="px-4 sm:px-6 py-3.5">Clínica/Empresa</th>
                    <th className="px-4 sm:px-6 py-3.5">Status / Acesso</th>
                    <th className="px-4 sm:px-6 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vertus-gray">
                  {filteredUsers.map((u) => {
                    const isExpired = u.expiresAt && isAfter(new Date(), new Date(u.expiresAt));
                    const isAdminUser = u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN' || (u.email && (u.email.toLowerCase().includes('admin@roones') || u.email.toLowerCase().includes('admin@vertus')));
                    const isSoleAdmin = isAdminUser && users.filter(usr => usr.role === 'ROONES_ADMIN' || usr.role === 'VERTUS_ADMIN' || (usr.email && (usr.email.toLowerCase().includes('admin@roones') || usr.email.toLowerCase().includes('admin@vertus')))).length <= 1;

                    return (
                      <tr key={u.id} className="hover:bg-vertus-white/5 transition-colors">
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-vertus-gray border border-vertus-gold/20 flex items-center justify-center font-bold text-vertus-gold text-xs shrink-0">
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-vertus-white text-xs sm:text-sm">{u.name}</p>
                                {isSoleAdmin && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-vertus-gold/15 text-vertus-gold font-bold border border-vertus-gold/30">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-vertus-white/40">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className={clsx(
                            "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1",
                            u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN' || u.role === 'SUPER_ADMIN'
                              ? "bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          )}>
                            {isSoleAdmin && <Shield className="w-2.5 h-2.5 text-vertus-gold shrink-0" />}
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-vertus-white/70 text-xs">
                          {u.clinicId || '—'}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Expirado
                            </span>
                          ) : (
                            <div className="text-xs">
                              <span className="text-emerald-400 font-medium">Ativo</span>
                              <p className="text-[10px] text-vertus-white/40">
                                {u.expiresAt ? `Até ${format(new Date(u.expiresAt), 'dd/MM/yyyy', { locale: ptBR })}` : 'Vitalício'}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isExpired && (
                              <button 
                                onClick={() => quickRenewUser(u.id, '30')}
                                title="Renovar Acesso (+30 Dias)"
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>+30d</span>
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setEditingUser(u);
                                setIsEditingUser(true);
                              }}
                              title="Editar Usuário"
                              className="p-2 text-vertus-white/50 hover:text-vertus-gold hover:bg-vertus-gray rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {isSoleAdmin ? (
                              <span 
                                className="p-2 text-vertus-gold/50 cursor-help flex items-center justify-center"
                                title="Administrador Principal (Único e protegido contra exclusão)"
                              >
                                <Shield className="w-4 h-4 text-vertus-gold" />
                              </span>
                            ) : (
                              <button 
                                onClick={() => setUserToDelete(u)}
                                title="Excluir Acesso"
                                className="p-2 text-vertus-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-vertus-white/30 text-xs">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Objections */}
      {activeTab === 'objections' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vertus-white/30" />
              <input
                type="text"
                placeholder="Pesquisar objeções..."
                value={objectionSearch}
                onChange={(e) => setObjectionSearch(e.target.value)}
                className="w-full bg-vertus-card border border-vertus-gray focus:border-vertus-gold/50 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsBulkImportOpen(true)}
                className="px-3 sm:px-4 py-2.5 rounded-xl border border-vertus-gold/30 hover:border-vertus-gold bg-vertus-gold/10 hover:bg-vertus-gold/20 text-vertus-gold font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Importar dezenas de objeções via PDF (com IA), CSV ou JSON"
              >
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span className="truncate">Importar em Lote</span>
              </button>
              <button 
                onClick={() => {
                  setEditingObjection({});
                  setIsEditingObjection(true);
                }}
                className="gold-gradient text-vertus-bg px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">Nova Objeção</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredObjections.map((obj) => (
              <div 
                key={obj.id}
                className="bg-vertus-card border border-vertus-gray rounded-2xl p-5 space-y-4 hover:border-vertus-gold/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-vertus-gold/15 text-vertus-gold rounded text-[10px] font-bold uppercase tracking-wider">
                        Gatilho
                      </span>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-vertus-white">
                        {obj.trigger}
                      </h3>
                    </div>
                    {obj.reason && (
                      <p className="text-xs text-vertus-white/50 leading-relaxed pl-1">
                        <strong className="text-vertus-white/70">Motivo oculto:</strong> {obj.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingObjection(obj);
                        setIsEditingObjection(true);
                      }}
                      className="p-2 text-vertus-white/40 hover:text-vertus-gold hover:bg-vertus-gray rounded-lg transition-colors"
                      title="Editar Objeção"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setObjectionToDelete(obj)}
                      className="p-2 text-vertus-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Excluir Objeção"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {obj.expertView && (
                  <div className="bg-vertus-gold/5 border-l-2 border-vertus-gold/40 pl-3 py-1.5 text-xs text-vertus-white/70 italic">
                    <span className="font-semibold text-vertus-gold not-italic block text-[10px] uppercase tracking-wider mb-0.5">Visão do Especialista:</span>
                    {obj.expertView}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-3 bg-vertus-bg border border-vertus-gray/60 rounded-xl">
                    <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-wider block mb-1">Rapport</span>
                    <p className="text-xs text-vertus-white/70 italic line-clamp-3">"{obj.rapportResponse || obj.response}"</p>
                  </div>
                  <div className="p-3 bg-vertus-bg border border-vertus-gray/60 rounded-xl">
                    <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-wider block mb-1">Consultiva</span>
                    <p className="text-xs text-vertus-white/70 italic line-clamp-3">"{obj.consultativeResponse || obj.response}"</p>
                  </div>
                  <div className="p-3 bg-vertus-bg border border-vertus-gray/60 rounded-xl">
                    <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-wider block mb-1">Autoridade</span>
                    <p className="text-xs text-vertus-white/70 italic line-clamp-3">"{obj.authorityResponse || obj.response}"</p>
                  </div>
                  <div className="p-3 bg-vertus-bg border border-vertus-gray/60 rounded-xl">
                    <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-wider block mb-1">Geral</span>
                    <p className="text-xs text-vertus-white/70 italic line-clamp-3">"{obj.response}"</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredObjections.length === 0 && (
              <div className="py-16 text-center text-vertus-white/30 text-xs bg-vertus-card/40 border border-dashed border-vertus-gray rounded-2xl">
                Nenhuma objeção encontrada.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: AI Training & Prompt */}
      {activeTab === 'ai' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-vertus-card border border-vertus-gray rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-vertus-gray">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-bold text-vertus-white">Diretrizes & Personalidade da IZA</h3>
                  <p className="text-[11px] sm:text-xs text-vertus-white/50">
                    Defina o comportamento, tom de voz e regras de resposta da inteligência de vendas.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="flex-1 sm:flex-initial justify-center px-3 py-2 rounded-xl text-xs font-semibold bg-vertus-gray hover:bg-vertus-white/10 text-vertus-white/70 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Padrão Roones
                </button>
                <button
                  type="button"
                  onClick={handleSavePrompt}
                  disabled={isSavingPrompt}
                  className="flex-1 sm:flex-initial justify-center gold-gradient text-vertus-bg px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingPrompt ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-vertus-white/60 uppercase tracking-wider">
                Instruções do Sistema (Prompt de Treinamento)
              </label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={16}
                className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl p-4 font-mono text-xs sm:text-sm leading-relaxed outline-none transition-all text-vertus-white resize-y custom-scrollbar"
                placeholder="Insira as instruções completas para a Iza..."
              />
            </div>

            <div className="p-4 bg-vertus-gold/5 border border-vertus-gold/20 rounded-xl flex items-start gap-3 text-xs text-vertus-white/70">
              <Sparkles className="w-4 h-4 text-vertus-gold shrink-0 mt-0.5" />
              <p>
                <strong>Dica:</strong> A IZA utiliza estas instruções em todas as sessões de chat com os consultores.
                Você pode refinar metodologias, adicionar novos scripts de fechamento ou especificar termos proibidos a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit/Create User */}
      <AnimatePresence>
        {isEditingUser && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-vertus-card border border-vertus-gray rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]"
            >
              <div className="p-4 sm:p-5 border-b border-vertus-gray flex items-center justify-between shrink-0">
                <h3 className="font-serif font-bold text-base sm:text-lg text-vertus-white">
                  {editingUser.id ? 'Editar Acesso do Usuário' : 'Liberar Novo Acesso'}
                </h3>
                <button 
                  onClick={() => setIsEditingUser(false)}
                  className="text-vertus-white/40 hover:text-vertus-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveUser} className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-1.5">
                  <label className="font-semibold text-vertus-white/70">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                    placeholder="Ex: Dra. Juliana Santos"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-vertus-white/70">E-mail de Login</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                    placeholder="exemplo@clinica.com.br"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-vertus-white/70">Senha de Acesso</label>
                    <input
                      type="text"
                      value={editingUser.password || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                      placeholder="Senha provisória"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-vertus-white/70">Clínica / Empresa</label>
                    <input
                      type="text"
                      value={editingUser.clinicId || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, clinicId: e.target.value })}
                      className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                      placeholder="Nome da clínica"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-vertus-white/70">Tipo de Usuário</label>
                    <select
                      value={editingUser.role || 'CONSULTOR'}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                      className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                    >
                      <option value="CONSULTOR">Consultor (Padrão)</option>
                      <option value="ROONES_ADMIN">Administrador Roones</option>
                      <option value="VERTUS_ADMIN" className="hidden">Administrador</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-vertus-white/70">Duração do Acesso</label>
                    <select
                      value={editingUser.accessDuration || 'LIFETIME'}
                      onChange={(e) => setEditingUser({ ...editingUser, accessDuration: e.target.value as any })}
                      className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                    >
                      <option value="LIFETIME">Vitalício</option>
                      <option value="30">30 Dias</option>
                      <option value="60">60 Dias</option>
                      <option value="90">90 Dias</option>
                      <option value="180">6 Meses</option>
                      <option value="365">1 Ano</option>
                    </select>
                  </div>
                </div>

                {editingUser.id && (
                  <div className={clsx(
                    "p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2",
                    editingUser.expiresAt && isAfter(new Date(), new Date(editingUser.expiresAt))
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  )}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        {editingUser.expiresAt 
                          ? (isAfter(new Date(), new Date(editingUser.expiresAt))
                              ? `Acesso expirado em ${format(new Date(editingUser.expiresAt), 'dd/MM/yyyy', { locale: ptBR })}`
                              : `Acesso ativo até ${format(new Date(editingUser.expiresAt), 'dd/MM/yyyy', { locale: ptBR })}`)
                          : 'Acesso Vitalício Ativo'}
                      </span>
                    </div>
                    {editingUser.expiresAt && isAfter(new Date(), new Date(editingUser.expiresAt)) && (
                      <span className="font-bold text-[10px] bg-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider text-red-200 self-start sm:self-auto">
                        Selecione período para renovar
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-vertus-gray">
                  <button
                    type="button"
                    onClick={() => setIsEditingUser(false)}
                    className="px-4 py-2 rounded-xl text-vertus-white/60 hover:bg-vertus-gray transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="gold-gradient text-vertus-bg px-6 py-2.5 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Salvar Acesso
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit/Create Objection */}
      <AnimatePresence>
        {isEditingObjection && editingObjection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-vertus-card border border-vertus-gray rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="p-5 border-b border-vertus-gray flex items-center justify-between sticky top-0 bg-vertus-card z-10">
                <h3 className="font-serif font-bold text-lg text-vertus-white">
                  {editingObjection.id ? 'Editar Objeção' : 'Cadastrar Nova Objeção'}
                </h3>
                <button 
                  onClick={() => setIsEditingObjection(false)}
                  className="text-vertus-white/40 hover:text-vertus-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveObjection} className="p-5 space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="font-semibold text-vertus-white/70">Gatilho da Objeção (O que o cliente fala)</label>
                  <input
                    type="text"
                    required
                    value={editingObjection.trigger || ''}
                    onChange={(e) => setEditingObjection({ ...editingObjection, trigger: e.target.value })}
                    className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                    placeholder="Ex: Está caro / Vou falar com meu marido"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-vertus-white/70">Motivo Oculto Real</label>
                  <input
                    type="text"
                    value={editingObjection.reason || ''}
                    onChange={(e) => setEditingObjection({ ...editingObjection, reason: e.target.value })}
                    className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                    placeholder="Ex: O cliente ainda não percebeu a transformação estética profunda..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-vertus-white/70">Visão do Especialista</label>
                  <textarea
                    rows={2}
                    value={editingObjection.expertView || ''}
                    onChange={(e) => setEditingObjection({ ...editingObjection, expertView: e.target.value })}
                    className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                    placeholder="Análise tática para o consultor entender como conduzir..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-vertus-gold">01. Script Rapport (Empatia)</label>
                    <textarea
                      rows={3}
                      value={editingObjection.rapportResponse || ''}
                      onChange={(e) => setEditingObjection({ ...editingObjection, rapportResponse: e.target.value })}
                      className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                      placeholder="Resposta acolhedora validando o sentimento..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-vertus-gold">02. Script Consultivo (Diagnóstico)</label>
                    <textarea
                      rows={3}
                      value={editingObjection.consultativeResponse || ''}
                      onChange={(e) => setEditingObjection({ ...editingObjection, consultativeResponse: e.target.value })}
                      className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                      placeholder="Pergunta estratégica reenquadrando o valor..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-vertus-gold">03. Script Autoridade (Fechamento)</label>
                    <textarea
                      rows={3}
                      value={editingObjection.authorityResponse || ''}
                      onChange={(e) => setEditingObjection({ ...editingObjection, authorityResponse: e.target.value })}
                      className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                      placeholder="Posicionamento firme baseado em resultados..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-vertus-white/70">04. Resposta Geral / Síntese</label>
                    <textarea
                      rows={3}
                      required
                      value={editingObjection.response || ''}
                      onChange={(e) => setEditingObjection({ ...editingObjection, response: e.target.value })}
                      className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl px-3.5 py-2.5 text-vertus-white outline-none"
                      placeholder="Resposta padrão recomendada..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-vertus-gray">
                  <button
                    type="button"
                    onClick={() => setIsEditingObjection(false)}
                    className="px-4 py-2 rounded-xl text-vertus-white/60 hover:bg-vertus-gray transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="gold-gradient text-vertus-bg px-6 py-2.5 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Salvar Objeção
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => userToDelete && deleteUser(userToDelete.id)}
        title="Revogar Acesso"
        message={`Deseja realmente remover o acesso de ${userToDelete?.name} (${userToDelete?.email})? O usuário não conseguirá mais efetuar login.`}
        confirmText="Excluir Usuário"
      />

      {/* Delete Objection Modal */}
      <ConfirmModal
        isOpen={!!objectionToDelete}
        onClose={() => setObjectionToDelete(null)}
        onConfirm={() => objectionToDelete && deleteObjection(objectionToDelete.id)}
        title="Excluir Objeção"
        message={`Deseja remover permanentemente a objeção "${objectionToDelete?.trigger}"?`}
        confirmText="Excluir"
      />

      {/* Bulk Import Objections Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportSuccess={() => refreshData()}
      />
    </div>
  );
};

export default Admin;
