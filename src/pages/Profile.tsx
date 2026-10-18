
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Palette, 
  Bell, 
  Shield,
  CheckCircle2,
  AlertCircle,
  Database,
  Trash2,
  History,
  MessageSquare,
  Sparkles,
  Check,
  Award,
  TrendingUp,
  Quote,
  Volume2,
  Copy,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';
import { THEMES } from '../constants';
import { clsx } from 'clsx';
import ConfirmModal from '../components/ConfirmModal';
import { UserAvatar, MONOGRAM_STYLES, MonogramStyle } from '../components/UserAvatar';
import { speakIzaText } from '../utils/speechUtils';
import { RoleplayExecutiveSummary } from '../types';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { clearAllCache, clearChatSessions } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'personal' | 'development' | 'security' | 'preferences' | 'storage'>('personal');
  const [devPlans, setDevPlans] = useState<RoleplayExecutiveSummary[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vertus_dev_plans');
      if (saved) {
        setDevPlans(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [activeTab]);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmClearChatOpen, setIsConfirmClearChatOpen] = useState(false);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    theme: user?.theme || 'gold',
    themeMode: user?.themeMode || 'dark',
    emailProgress: true,
    iaAlerts: false,
  });

  // Apply theme on mount and when theme changes
  React.useEffect(() => {
    const currentTheme = THEMES.find(t => t.id === formData.theme) || THEMES[0];
    document.documentElement.style.setProperty('--gold-primary', currentTheme.primary);
    document.documentElement.style.setProperty('--gold-secondary', currentTheme.secondary);
  }, [formData.theme]);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePersonal = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({
      name: formData.name,
      phone: formData.phone,
      bio: formData.bio,
    });
    
    setIsSaving(false);
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleSaveSecurity = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    
    setIsSaving(false);
    toast.success('Senha alterada com sucesso!');
  };

  const handleThemeChange = (themeId: string) => {
    setFormData(prev => ({ ...prev, theme: themeId }));
    updateUser({ theme: themeId });
    toast.success(`Tema ${THEMES.find(t => t.id === themeId)?.name} aplicado!`);
  };

  const handleMonogramStyleChange = (style: MonogramStyle) => {
    updateUser({ monogramStyle: style });
    toast.success(`Estilo de monograma alterado para ${MONOGRAM_STYLES.find(s => s.id === style)?.name}!`);
  };

  return (
    <div className="max-w-5xl mx-auto w-full min-w-0 p-1 sm:p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-10"
      >
        <h1 className="text-2xl sm:text-4xl font-serif font-bold mb-1.5 text-vertus-white">Meu Espaço</h1>
        <p className="text-vertus-white/50 text-xs sm:text-sm">Gerencie seus dados de consultora, monograma e preferências da clínica.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Navigation Tabs Bar / Sidebar */}
        <div className="lg:col-span-1 flex lg:flex-col overflow-x-auto gap-2 lg:gap-0 lg:space-y-2 pb-2 lg:pb-0 scrollbar-none">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 whitespace-nowrap text-xs sm:text-sm ${activeTab === 'personal' ? 'bg-vertus-gold text-vertus-bg font-bold shadow-lg shadow-vertus-gold/20' : 'hover:bg-vertus-gray bg-vertus-card/60 text-vertus-white/70'}`}
          >
            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Identidade & Perfil</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 whitespace-nowrap text-xs sm:text-sm ${activeTab === 'security' ? 'bg-vertus-gold text-vertus-bg font-bold shadow-lg shadow-vertus-gold/20' : 'hover:bg-vertus-gray bg-vertus-card/60 text-vertus-white/70'}`}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Segurança</span>
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 whitespace-nowrap text-xs sm:text-sm ${activeTab === 'preferences' ? 'bg-vertus-gold text-vertus-bg font-bold shadow-lg shadow-vertus-gold/20' : 'hover:bg-vertus-gray bg-vertus-card/60 text-vertus-white/70'}`}
          >
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Aparência</span>
          </button>
          <button 
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 whitespace-nowrap text-xs sm:text-sm ${activeTab === 'storage' ? 'bg-vertus-gold text-vertus-bg font-bold shadow-lg shadow-vertus-gold/20' : 'hover:bg-vertus-gray bg-vertus-card/60 text-vertus-white/70'}`}
          >
            <Database className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Armazenamento</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-vertus-card/50 backdrop-blur-xl border border-vertus-gray rounded-2xl sm:rounded-[32px] p-5 sm:p-8 vertus-shadow"
          >
            {activeTab === 'personal' && (
              <div className="space-y-8">
                {/* Monogram Badge & Style Selector */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 pb-6 border-b border-vertus-gray/60">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <UserAvatar 
                      name={formData.name || user.name} 
                      size="xl" 
                      styleType={user.monogramStyle || 'black'} 
                    />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-vertus-gold/90 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-vertus-gold" />
                      Iniciais Oficiais
                    </span>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-3">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-vertus-white">{user.name}</h3>
                      <p className="text-vertus-gold uppercase tracking-widest text-xs font-bold mt-0.5">{user.role.replace('_', ' ')}</p>
                      <p className="text-vertus-white/40 text-xs mt-1">{user.email}</p>
                    </div>

                    {/* Monogram Style Options */}
                    <div className="pt-2">
                      <label className="text-[11px] uppercase font-bold tracking-wider text-vertus-white/60 block mb-2">
                        Estilo das Iniciais (Identidade Visual):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {MONOGRAM_STYLES.map((style) => {
                          const isSelected = (user.monogramStyle || 'black') === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => handleMonogramStyleChange(style.id)}
                              className={clsx(
                                "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-95",
                                isSelected
                                  ? "bg-vertus-card border-vertus-gold shadow-md ring-1 ring-vertus-gold/40"
                                  : "bg-vertus-bg/70 hover:bg-vertus-card/80 border-vertus-gray/60 hover:border-vertus-gold/30"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <UserAvatar name={formData.name || user.name} size="sm" styleType={style.id} />
                                {isSelected && <Check className="w-3.5 h-3.5 text-vertus-gold" />}
                              </div>
                              <div>
                                <span className={clsx("text-xs font-bold block", isSelected ? "text-vertus-gold" : "text-vertus-white/80")}>
                                  {style.name}
                                </span>
                                <span className="text-[10px] text-vertus-white/40 line-clamp-1 block">
                                  {style.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-vertus-white/40 font-bold ml-1">Nome Completo</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vertus-white/20" />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-vertus-gray/50 border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-vertus-white/40 font-bold ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vertus-white/20" />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-vertus-gray/30 border border-vertus-gray text-vertus-white/30 rounded-2xl py-3 pl-12 pr-4 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-vertus-white/40 font-bold ml-1">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vertus-white/20" />
                      <input 
                        type="text" 
                        name="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-vertus-gray/50 border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-vertus-white/40 font-bold ml-1">Bio / Descrição Profissional</label>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Conte um pouco sobre sua trajetória na clínica..."
                      rows={4}
                      className="w-full bg-vertus-gray/50 border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl p-4 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSavePersonal}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-vertus-gold text-vertus-bg px-8 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-vertus-bg border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 bg-vertus-gold/5 rounded-2xl border border-vertus-gold/20">
                  <Shield className="w-8 h-8 text-vertus-gold" />
                  <div>
                    <h4 className="font-bold">Segurança da Conta</h4>
                    <p className="text-sm text-vertus-white/50">Mantenha sua senha atualizada para garantir a proteção dos seus dados.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-vertus-white/40 font-bold ml-1">Senha Atual</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vertus-white/20" />
                      <input 
                        type="password" 
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full bg-vertus-gray/50 border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-vertus-white/40 font-bold ml-1">Nova Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vertus-white/20" />
                        <input 
                          type="password" 
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full bg-vertus-gray/50 border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-vertus-white/40 font-bold ml-1">Confirmar Nova Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vertus-white/20" />
                        <input 
                          type="password" 
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full bg-vertus-gray/50 border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSaveSecurity}
                    disabled={isSaving || !formData.newPassword}
                    className="flex items-center gap-2 bg-vertus-gold text-vertus-bg px-8 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-vertus-bg border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                    <span>Alterar Senha</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-10">
                <div>
                  <h4 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-vertus-gold" />
                    Tema Visual
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`relative p-4 rounded-2xl border-2 transition-all text-left ${formData.theme === theme.id ? 'border-vertus-gold bg-vertus-gold/5' : 'border-vertus-gray hover:border-vertus-white/20'}`}
                      >
                        <div className="flex gap-1 mb-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">{theme.name}</span>
                        {formData.theme === theme.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-vertus-gold" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-vertus-gold" />
                    Modo de Fundo
                  </h4>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, themeMode: 'dark' }));
                        updateUser({ themeMode: 'dark' });
                        toast.success('Modo Escuro ativado!');
                      }}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${formData.themeMode === 'dark' ? 'border-vertus-gold bg-vertus-gold/5' : 'border-vertus-gray hover:border-vertus-white/20'}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#0F0F0F] border border-white/10"></div>
                      <span className="font-bold">Escuro</span>
                    </button>
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, themeMode: 'light' }));
                        updateUser({ themeMode: 'light' });
                        toast.success('Modo Claro ativado!');
                      }}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${formData.themeMode === 'light' ? 'border-vertus-gold bg-vertus-gold/5' : 'border-vertus-gray hover:border-vertus-white/20'}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#F5F5F5] border border-black/10"></div>
                      <span className="font-bold">Claro</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-vertus-gold" />
                    Notificações
                  </h4>
                  <div className="space-y-4">
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, emailProgress: !prev.emailProgress }))}
                      className="flex items-center justify-between p-4 bg-vertus-gray/30 rounded-2xl border border-vertus-gray cursor-pointer hover:bg-vertus-gray/50 transition-colors"
                    >
                      <div>
                        <p className="font-bold">E-mails de Progresso</p>
                        <p className="text-xs text-vertus-white/40">Receba resumos semanais do seu desempenho.</p>
                      </div>
                      <div className={clsx(
                        "w-12 h-6 rounded-full relative transition-all duration-300",
                        formData.emailProgress ? "bg-vertus-gold" : "bg-vertus-gray"
                      )}>
                        <div className={clsx(
                          "absolute top-1 w-4 h-4 bg-vertus-bg rounded-full shadow-sm transition-all duration-300",
                          formData.emailProgress ? "right-1" : "left-1"
                        )}></div>
                      </div>
                    </div>
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, iaAlerts: !prev.iaAlerts }))}
                      className="flex items-center justify-between p-4 bg-vertus-gray/30 rounded-2xl border border-vertus-gray cursor-pointer hover:bg-vertus-gray/50 transition-colors"
                    >
                      <div>
                        <p className="font-bold">Alertas de IA</p>
                        <p className="text-xs text-vertus-white/40">Notificações quando a IA tiver novas sugestões.</p>
                      </div>
                      <div className={clsx(
                        "w-12 h-6 rounded-full relative transition-all duration-300",
                        formData.iaAlerts ? "bg-vertus-gold" : "bg-vertus-gray"
                      )}>
                        <div className={clsx(
                          "absolute top-1 w-4 h-4 bg-vertus-bg rounded-full shadow-sm transition-all duration-300",
                          formData.iaAlerts ? "right-1" : "left-1"
                        )}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-serif font-bold mb-2">Gerenciar Armazenamento</h3>
                  <p className="text-vertus-white/50 text-sm">Limpe dados temporários e histórico para liberar espaço no seu navegador.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-vertus-gray/30 p-6 rounded-2xl border border-vertus-gray/50">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare className="w-5 h-5 text-vertus-gold" />
                      <h4 className="font-bold">Histórico da Iza</h4>
                    </div>
                    <p className="text-xs text-vertus-white/40 mb-6">Remove todas as conversas salvas com a assistente IA.</p>
                    <button 
                      onClick={() => setIsConfirmClearChatOpen(true)}
                      className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar Histórico
                    </button>
                  </div>

                  <div className="bg-vertus-gray/30 p-6 rounded-2xl border border-vertus-gray/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="w-5 h-5 text-vertus-gold" />
                      <h4 className="font-bold">Cache Geral</h4>
                    </div>
                    <p className="text-xs text-vertus-white/40 mb-6">Limpa histórico de chat e registros de atividades recentes.</p>
                    <button 
                      onClick={() => setIsConfirmClearAllOpen(true)}
                      className="w-full py-3 bg-vertus-gold text-vertus-bg text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar Tudo
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-vertus-gold/5 border border-vertus-gold/20 rounded-xl">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-vertus-gold shrink-0" />
                    <p className="text-xs text-vertus-white/60 leading-relaxed">
                      <strong>Nota:</strong> Seus dados de progresso em cursos, certificados e conquistas são vinculados à sua conta e não serão removidos ao limpar o cache local.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmClearChatOpen}
        onClose={() => setIsConfirmClearChatOpen(false)}
        onConfirm={clearChatSessions}
        title="Limpar Histórico"
        message="Tem certeza que deseja apagar todo o histórico de conversas com a Iza? Esta ação não pode ser desfeita."
        confirmLabel="Limpar Tudo"
        variant="danger"
      />

      <ConfirmModal
        isOpen={isConfirmClearAllOpen}
        onClose={() => setIsConfirmClearAllOpen(false)}
        onConfirm={clearAllCache}
        title="Limpar Cache Geral"
        message="Deseja limpar todo o cache de dados local? Isso removerá o histórico de chat e registros de atividades recentes. Seu progresso nas trilhas não será afetado."
        confirmLabel="Limpar Tudo"
        variant="danger"
      />
    </div>
  );
};

export default Profile;
