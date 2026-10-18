import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export type ThemeMode = 'dark' | 'light';

export function useThemeMode() {
  const { user, updateUser } = useAuth();
  
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('roones_theme_mode') || localStorage.getItem('vertus_theme_mode');
    if (saved === 'light' || saved === 'dark') return saved;
    if (user?.themeMode === 'light' || user?.themeMode === 'dark') return user.themeMode;
    return 'dark';
  });

  // Sync state if user changes
  useEffect(() => {
    if (user?.themeMode && (user.themeMode === 'light' || user.themeMode === 'dark')) {
      setThemeMode(user.themeMode);
      if (user.themeMode === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      localStorage.setItem('roones_theme_mode', user.themeMode);
      localStorage.setItem('vertus_theme_mode', user.themeMode);
    }
  }, [user?.themeMode]);

  // Listen to custom event for multi-component sync
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<{ mode: ThemeMode }>) => {
      setThemeMode(e.detail.mode);
    };
    window.addEventListener('roones_theme_change' as any, handleThemeChange);
    window.addEventListener('vertus_theme_change' as any, handleThemeChange);
    return () => {
      window.removeEventListener('roones_theme_change' as any, handleThemeChange);
      window.removeEventListener('vertus_theme_change' as any, handleThemeChange);
    };
  }, []);

  const toggleThemeMode = useCallback(async () => {
    const nextMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
    localStorage.setItem('roones_theme_mode', nextMode);
    localStorage.setItem('vertus_theme_mode', nextMode);

    if (nextMode === 'light') {
      document.documentElement.classList.add('light');
      toast.success('Modo Recepção (Claro) ativado — ideal para ambientes com alta iluminação.');
    } else {
      document.documentElement.classList.remove('light');
      toast.success('Modo Noturno (Escuro) ativado.');
    }

    // Dispatch event so other components update synchronously
    window.dispatchEvent(new CustomEvent('roones_theme_change', { detail: { mode: nextMode } }));
    window.dispatchEvent(new CustomEvent('vertus_theme_change', { detail: { mode: nextMode } }));

    if (user && updateUser) {
      try {
        await updateUser({ themeMode: nextMode });
      } catch (err) {
        console.warn('Could not persist themeMode to user profile:', err);
      }
    }
  }, [themeMode, user, updateUser]);

  return {
    themeMode,
    isLight: themeMode === 'light',
    toggleThemeMode,
  };
}
