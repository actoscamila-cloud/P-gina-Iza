
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmText = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger'
}) => {
  const actualConfirmLabel = confirmLabel || confirmText;
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-vertus-card border border-vertus-gray rounded-[32px] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                variant === 'danger' ? "bg-red-500/10 text-red-400" : 
                variant === 'warning' ? "bg-orange-500/10 text-orange-400" : 
                "bg-vertus-gold/10 text-vertus-gold"
              )}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <button onClick={onClose} className="p-2 hover:bg-vertus-gray rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-2xl font-serif font-bold mb-2">{title}</h3>
            <p className="text-vertus-white/60 text-sm leading-relaxed mb-8">{message}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-vertus-gray hover:bg-vertus-gray/80 text-vertus-white font-bold rounded-xl transition-all"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={clsx(
                  "flex-1 px-6 py-3 font-bold rounded-xl transition-all",
                  variant === 'danger' ? "bg-red-500 hover:bg-red-600 text-white" :
                  variant === 'warning' ? "bg-orange-500 hover:bg-orange-600 text-white" :
                  "gold-gradient text-vertus-bg"
                )}
              >
                {actualConfirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
