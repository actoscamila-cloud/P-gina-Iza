
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  PlayCircle,
  UserCheck,
  Sun,
  Moon,
  Bot,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../hooks/useThemeMode';
import { clsx } from 'clsx';
import MediaImage from './MediaImage';
import PWAInstallButton from './PWAInstallButton';
import { UserAvatar } from './UserAvatar';
import { IzaGuideModal } from './IzaGuideModal';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isLight, toggleThemeMode } = useThemeMode();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);

  const navItems = [
    { icon: Bot, label: 'Iza • Mentora Comercial', path: '/' },
    { icon: UserCheck, label: 'Simulador de Pacientes', path: '/roleplay' },
    { icon: MessageCircle, label: 'Banco de Objeções', path: '/objections' },
    { icon: User, label: 'Meu Espaço', path: '/perfil' },
  ];

  if (user?.role === 'VERTUS_ADMIN' || user?.role === 'SUPER_ADMIN') {
    navItems.push({ icon: ShieldCheck, label: 'Painel Admin', path: '/admin' });
  }

  return (
    <aside className={clsx(
      "bg-vertus-sidebar border-r border-vertus-gray/60 light:border-vertus-gray hidden md:flex flex-col h-screen sticky top-0 z-40 transition-all duration-500 ease-in-out light:shadow-sm",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={clsx("p-4 flex flex-col items-center relative", isCollapsed && "p-3")}>
        {!isCollapsed ? (
          <div className="flex flex-col items-center justify-center text-center py-2 select-none group cursor-pointer">
            <h1 className="text-2xl font-serif font-extrabold tracking-[0.18em] text-vertus-gold drop-shadow-sm leading-tight transition-transform duration-300 group-hover:scale-105">
              ROONES
            </h1>
            <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-[0.32em] text-vertus-sidebar-text/70 light:text-stone-600 mt-1 uppercase">
              PERFORMANCE
            </span>
            <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent via-vertus-gold to-transparent mt-2.5 opacity-80"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 select-none">
            <span className="text-xl font-serif font-bold text-vertus-gold tracking-widest">R</span>
            <span className="text-[7px] font-sans font-bold tracking-[0.2em] text-vertus-sidebar-text/50 uppercase">P</span>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-vertus-gold text-vertus-bg w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : ''}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-vertus-gold/15 text-vertus-gold border-r-2 border-r-vertus-gold light:bg-amber-100/90 light:text-amber-950 light:border-r-amber-700 light:shadow-sm font-semibold" 
                : "text-vertus-sidebar-text/60 hover:text-vertus-gold hover:bg-white/5 light:text-stone-700 light:hover:text-amber-900 light:hover:bg-amber-50/70",
              isCollapsed && "justify-center px-0"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={clsx("p-3 border-t border-vertus-gray/60 light:border-vertus-gray space-y-2", isCollapsed && "p-2")}>
        <div className={clsx("flex items-center gap-2 px-3 py-2 mb-1", isCollapsed && "px-0 justify-center")}>
          <UserAvatar 
            name={user?.name || 'V'} 
            size="md" 
            styleType={user?.monogramStyle || 'black'} 
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-vertus-sidebar-text">{user?.name}</p>
              <p className="text-[9px] text-vertus-gold uppercase tracking-wider">{user?.role.replace('_', ' ')}</p>
            </div>
          )}
        </div>
        
        {!isCollapsed ? (
          <div className="pt-1">
            <PWAInstallButton variant="full" />
          </div>
        ) : (
          <div className="flex justify-center pt-1">
            <PWAInstallButton variant="compact" />
          </div>
        )}

        <button
          onClick={() => setIsGuideOpen(true)}
          title={isCollapsed ? "Como Usar a Iza (Guia & Suporte)" : ""}
          className={clsx(
            "flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg transition-all duration-200 cursor-pointer bg-vertus-gold/10 hover:bg-vertus-gold/20 text-vertus-gold border border-vertus-gold/30 light:bg-amber-100/70 light:hover:bg-amber-100 light:text-amber-950 light:border-amber-300 shadow-sm",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-vertus-gold light:text-amber-800" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-xs block truncate">Como Usar a Iza</span>
              <span className="text-[9px] text-vertus-gold/70 light:text-amber-800/80 block truncate">Guia & Suporte</span>
            </div>
          )}
        </button>

        <button 
          onClick={toggleThemeMode}
          title={isCollapsed ? (isLight ? 'Modo Noturno (Escuro)' : 'Modo Recepção (Claro)') : ''}
          className={clsx(
            "flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg transition-all duration-200 cursor-pointer",
            isLight
              ? "bg-amber-100/60 text-amber-900 hover:bg-amber-100 border border-amber-200"
              : "text-vertus-sidebar-text/70 hover:text-vertus-gold hover:bg-white/5 border border-transparent",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isLight ? (
            <Moon className="w-4 h-4 shrink-0 text-amber-800" />
          ) : (
            <Sun className="w-4 h-4 shrink-0 text-vertus-gold" />
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="font-medium text-xs block">
                {isLight ? 'Modo Noturno' : 'Modo Recepção'}
              </span>
              <span className="text-[9px] text-vertus-sidebar-text/40 block">
                {isLight ? 'Tema escuro' : 'Tema claro'}
              </span>
            </div>
          )}
        </button>

        <button 
          onClick={logout}
          title={isCollapsed ? 'Sair' : ''}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 w-full text-left text-red-400/70 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all duration-300",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="font-medium text-xs">Sair</span>}
        </button>
      </div>

      <IzaGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;
