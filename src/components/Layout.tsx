
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import { MobileHeader, MobileBottomNav } from './MobileNavbar';
import OfflineIndicator from './OfflineIndicator';
import { useAuth } from '../context/AuthContext';
import { THEMES } from '../constants';

const Layout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const isFullScreenPage = location.pathname === '/' || location.pathname === '/ia' || location.pathname === '/roleplay';

  // Apply theme globally
  React.useEffect(() => {
    const savedMode = localStorage.getItem('vertus_theme_mode') || user?.themeMode || 'dark';
    const isLight = savedMode === 'light';

    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    if (user?.theme && user.theme !== 'gold') {
      const currentTheme = THEMES.find(t => t.id === user.theme) || THEMES[0];
      document.documentElement.style.setProperty('--gold-primary', currentTheme.primary);
      document.documentElement.style.setProperty('--gold-secondary', currentTheme.secondary);
    } else {
      // Allow CSS :root and .light variables to naturally provide high-contrast gold
      document.documentElement.style.removeProperty('--gold-primary');
      document.documentElement.style.removeProperty('--gold-secondary');
    }
  }, [user?.theme, user?.themeMode]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-vertus-bg relative overflow-hidden">
        <div className="mesh-bg opacity-50" />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="text-center select-none">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl font-serif font-extrabold tracking-[0.18em] text-vertus-gold mb-2"
            >
              ROONES
            </motion.div>
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-xs font-sans font-medium tracking-[0.38em] text-vertus-white/60 uppercase"
            >
              PERFORMANCE
            </motion.div>
          </div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-[1.5px] bg-gradient-to-r from-transparent via-vertus-gold to-transparent rounded-full"
          ></motion.div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={clsx(
      "flex flex-col md:flex-row bg-vertus-bg relative text-vertus-white w-full max-w-full overflow-x-hidden",
      "h-[100dvh] overflow-hidden md:h-screen"
    )}>
      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className={clsx(
        "flex-1 min-w-0 min-h-0 w-full flex flex-col relative",
        isFullScreenPage
          ? "overflow-hidden"
          : "overflow-y-auto overflow-x-hidden"
      )}>
        <div className={clsx(
          "flex-1 w-full max-w-7xl mx-auto flex flex-col min-w-0 min-h-0",
          isFullScreenPage 
            ? "p-0 sm:p-4 md:p-6 h-full" 
            : "p-3 sm:p-5 md:p-6 pb-28 md:pb-8"
        )}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomNav />

      {/* Network Offline Status Indicator for Field Use */}
      <OfflineIndicator />
    </div>
  );
};

export default Layout;
