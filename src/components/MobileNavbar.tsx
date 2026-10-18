import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, MessageCircle, User, ShieldCheck, LogOut, Sparkles, UserCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../hooks/useThemeMode';
import { useVisualViewport } from '../hooks/useVisualViewport';
import { clsx } from 'clsx';
import PWAInstallButton from './PWAInstallButton';
import { UserAvatar } from './UserAvatar';
import { triggerHaptic } from '../utils/haptics';

export const MobileHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { isLight, toggleThemeMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/ia':
        return 'Iza • Mentora Comercial';
      case '/roleplay':
        return 'Simulador de Pacientes';
      case '/objections':
        return 'Banco de Objeções';
      case '/perfil':
        return 'Meu Espaço';
      case '/admin':
        return 'Painel Administrativo';
      default:
        return 'ROONES PERFORMANCE';
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-vertus-sidebar/95 backdrop-blur-xl border-b border-vertus-gray/30 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between shadow-md shrink-0 w-full max-w-full">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        <button 
          onClick={() => navigate('/')} 
          className="flex flex-col text-left active:scale-95 transition-transform shrink-0 cursor-pointer"
        >
          <span className="font-serif font-bold text-sm sm:text-[15px] text-vertus-gold tracking-[0.14em] leading-tight">
            ROONES
          </span>
          <span className="text-[8px] sm:text-[8.5px] font-sans font-semibold tracking-[0.16em] text-vertus-sidebar-text/80 light:text-stone-600 uppercase mt-0.5 leading-none">
            PERFORMANCE
          </span>
        </button>
        <div className="h-4 w-[1px] bg-vertus-gray/60 shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[11px] sm:text-xs font-semibold text-vertus-white truncate max-w-[120px] xs:max-w-[160px] sm:max-w-xs">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[8.5px] sm:text-[9px] text-vertus-gold font-medium uppercase tracking-wider">Online 24/7</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={() => {
            triggerHaptic('light');
            toggleThemeMode();
          }}
          className={clsx(
            "w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer",
            isLight
              ? "bg-amber-100/80 border-amber-300 text-amber-800 shadow-sm"
              : "bg-vertus-gray/60 border-vertus-gold/20 text-vertus-gold hover:bg-vertus-gray"
          )}
          title={isLight ? "Mudar para Modo Noturno (Escuro)" : "Mudar para Modo Recepção (Claro)"}
        >
          {isLight ? <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
        </button>

        <PWAInstallButton variant="compact" />
        <button
          onClick={() => {
            triggerHaptic('selection');
            navigate('/perfil');
          }}
          className="active:scale-95 transition-transform shrink-0 cursor-pointer"
          title="Meu Espaço"
        >
          <UserAvatar 
            name={user?.name || 'V'} 
            size="sm" 
            styleType={user?.monogramStyle || 'black'} 
          />
        </button>
      </div>
    </header>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { isKeyboardOpen } = useVisualViewport();

  // If virtual keyboard is open on mobile, hide the bottom nav bar
  // to give maximum screen real estate to the input bar and chat messages
  if (isKeyboardOpen) {
    return null;
  }

  const navItems = [
    { icon: MessageSquare, label: 'Iza Mentora', path: '/' },
    { icon: UserCheck, label: 'Simulador', path: '/roleplay' },
    { icon: MessageCircle, label: 'Objeções', path: '/objections' },
    { icon: User, label: 'Meu Espaço', path: '/perfil' },
  ];

  if (user?.role === 'VERTUS_ADMIN' || user?.role === 'SUPER_ADMIN') {
    navItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  return (
    <nav className="md:hidden shrink-0 w-full max-w-full z-30 bg-vertus-sidebar/95 backdrop-blur-xl border-t border-vertus-gray/40 px-1 py-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between w-full">
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? (location.pathname === '/' || location.pathname === '/ia')
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => triggerHaptic('selection')}
              className={clsx(
                "flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 active:scale-90",
                isActive 
                  ? "text-vertus-gold font-bold" 
                  : "text-vertus-sidebar-text/50 hover:text-vertus-gold"
              )}
            >
              <div className={clsx(
                "p-1 rounded-xl transition-all relative",
                isActive && "bg-vertus-gold/15 text-vertus-gold shadow-sm"
              )}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-vertus-gold rounded-full ring-2 ring-vertus-sidebar" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 font-medium tracking-tight truncate max-w-[62px] text-center">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
