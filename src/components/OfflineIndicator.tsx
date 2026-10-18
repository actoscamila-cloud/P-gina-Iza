import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-2xl backdrop-blur-md border border-amber-400/40 select-none"
        >
          <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping shrink-0" />
          <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
          <span>Modo Campo Offline • Conteúdo e treinos em cache ativos</span>
        </motion.div>
      )}

      {isOnline && showReconnected && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-2xl backdrop-blur-md border border-emerald-400/40 select-none"
        >
          <Wifi className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>Conexão restabelecida • Sincronizado</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
