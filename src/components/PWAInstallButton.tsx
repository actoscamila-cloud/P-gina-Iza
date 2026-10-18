import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare, Monitor, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Lock body scroll when modal is open - MUST be before any return statement
  useEffect(() => {
    if (showGuide) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showGuide]);

  // If already running as an installed PWA, hide cleanly without breaking hook counts
  if (isInstalled) {
    return null;
  }

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  // Handle click
  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={clsx(
          "bg-vertus-gold/10 border border-vertus-gold/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg",
          className
        )}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-vertus-white">Instalar App no Celular</p>
              <p className="text-[10px] text-vertus-white/60">Acesso rápido 24/7 direto da tela inicial</p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="px-3 py-1.5 rounded-xl bg-vertus-gold text-vertus-bg font-bold text-xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer shadow-md"
          >
            Instalar
          </button>
        </div>
      ) : variant === 'full' ? (
        <button
          onClick={handleClick}
          className={clsx(
            "w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-vertus-gold/10 hover:bg-vertus-gold/20 border border-vertus-gold/30 text-vertus-gold font-bold text-xs transition-all active:scale-98 cursor-pointer",
            className
          )}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>Adicionar App à Tela de Início</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className={clsx(
            "w-7 h-7 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1 rounded-full sm:rounded-xl bg-vertus-gold/15 hover:bg-vertus-gold/25 border border-vertus-gold/30 text-vertus-gold font-semibold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0",
            className
          )}
          title="Instalar aplicativo"
        >
          <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Baixar App</span>
        </button>
      )}

      {/* Adaptive Device Installation Guide Modal rendered in Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showGuide && (
            <div 
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowGuide(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-sm rounded-3xl bg-vertus-card border border-vertus-gold/40 p-5 sm:p-6 shadow-2xl relative my-auto max-h-[88dvh] flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 border-b border-vertus-gray/40 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-vertus-gold/15 border border-vertus-gold/30 flex items-center justify-center text-vertus-gold shrink-0">
                      {isIOS || isAndroid ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-vertus-white">Instalar App Vertus</h3>
                      <p className="text-[10px] text-vertus-white/60">
                        {isIOS ? 'No seu iPhone ou iPad' : isAndroid ? 'No seu celular Android' : 'No seu Computador / Notebook'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGuide(false)}
                    className="p-1.5 rounded-lg text-vertus-white/50 hover:text-vertus-white hover:bg-vertus-gray/50 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto py-3 space-y-3 pr-0.5 my-1">
                  {isIOS ? (
                    <div className="space-y-3 text-xs text-vertus-white/80 bg-vertus-bg/80 border border-vertus-gray p-4 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          1
                        </div>
                        <p>
                          No navegador Safari, toque no botão <strong className="text-vertus-gold inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline" /> Compartilhar</strong> na barra inferior.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          2
                        </div>
                        <p>
                          Role as opções e selecione <strong className="text-vertus-gold inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline" /> Adicionar à Tela de Início</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          3
                        </div>
                        <p>
                          Toque em <strong>Adicionar</strong> no canto superior. O ícone da Vertus funcionará como um app nativo.
                        </p>
                      </div>
                    </div>
                  ) : isAndroid ? (
                    <div className="space-y-3 text-xs text-vertus-white/80 bg-vertus-bg/80 border border-vertus-gray p-4 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          1
                        </div>
                        <p>
                          Toque no menu de <strong className="text-vertus-gold inline-flex items-center gap-1"><MoreVertical className="w-3.5 h-3.5 inline" /> 3 pontos</strong> no canto superior do Chrome.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          2
                        </div>
                        <p>
                          Selecione <strong className="text-vertus-gold">Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          3
                        </div>
                        <p>
                          Confirme em <strong>Instalar</strong> para fixar o app com abertura instantânea.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs text-vertus-white/80 bg-vertus-bg/80 border border-vertus-gray p-4 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          1
                        </div>
                        <p>
                          Clique no ícone de <strong className="text-vertus-gold inline-flex items-center gap-1"><Download className="w-3.5 h-3.5 inline" /> Instalar</strong> no canto direito da barra de endereço do Chrome ou Edge.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          2
                        </div>
                        <p>
                          Ou clique nos <strong className="text-vertus-gold">3 pontos</strong> do navegador &gt; <strong>Salvar e compartilhar</strong> &gt; <strong>Instalar Vertus Performance</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-vertus-gold/20 flex items-center justify-center text-vertus-gold shrink-0 mt-0.5 font-bold">
                          3
                        </div>
                        <p>
                          O sistema abrirá uma janela independente sem abas do navegador, igual a um software desktop.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    onClick={() => setShowGuide(false)}
                    className="w-full py-2.5 rounded-xl bg-vertus-gold text-vertus-bg font-bold text-xs hover:scale-101 active:scale-98 transition-all cursor-pointer shadow-md"
                  >
                    Entendi, voltar ao app
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default PWAInstallButton;
