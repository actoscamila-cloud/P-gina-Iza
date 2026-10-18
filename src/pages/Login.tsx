
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Shield, Mail, Lock, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

  const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isResetSent, setIsResetSent] = useState(false);
  
  const { login, resetPassword, isLoading } = useAuth();
  const { clearAllCache } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/ia');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(forgotEmail);
      setIsResetSent(true);
      toast.success('Instruções enviadas para seu e-mail');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar solicitação');
    }
  };

  return (
    <div className="min-h-screen bg-vertus-bg flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-vertus-gold/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-vertus-gold/5 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-vertus-card border border-vertus-gray p-6 sm:p-10 rounded-3xl sm:rounded-[40px] vertus-shadow relative z-10"
      >
        <div className="flex flex-col items-center mb-8 text-center select-none">
          <h1 className="text-4xl font-serif font-bold tracking-[0.24em] text-vertus-gold mb-1">
            ROONES
          </h1>
          <span className="text-xs font-sans font-medium tracking-[0.38em] text-vertus-white/60 uppercase">
            PERFORMANCE
          </span>
          <div className="w-12 h-[1.5px] bg-gradient-to-r from-transparent via-vertus-gold to-transparent mt-4 opacity-80"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-center text-[10px] uppercase tracking-[0.3em] font-bold text-vertus-gold">Acesso Restrito</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-vertus-white/50 font-bold mb-2 ml-1">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vertus-white/30" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 ml-1">
              <label className="block text-[10px] uppercase tracking-widest text-vertus-white/50 font-bold">Senha</label>
              <button 
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[10px] uppercase tracking-widest text-vertus-gold font-bold hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vertus-white/30" />
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="space-y-4">
              <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-wider">{error}</p>
              {error.toLowerCase().includes('quota') && (
                <button
                  type="button"
                  onClick={() => {
                    clearAllCache();
                    setError('Cache de chat e atividades limpo para liberar espaço. Tente entrar novamente.');
                  }}
                  className="w-full py-2 border border-vertus-gold/30 rounded-xl text-[10px] text-vertus-gold uppercase font-bold hover:bg-vertus-gold/5 transition-colors"
                >
                  Limpar Cache de Dados (Liberar Espaço)
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gold-gradient text-vertus-bg font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Acessar Espaço Consultor'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-vertus-gray/60 text-center space-y-2">
          <p className="text-xs text-vertus-white/40">
            Acesso restrito e exclusivo para consultores e parceiros Roones.
          </p>
          <div>
            <a
              href="#/"
              className="text-xs text-vertus-gold hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>← Conhecer a Iza (Apresentação Comercial)</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsForgotModalOpen(false);
                setIsResetSent(false);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-vertus-card border border-vertus-gray p-8 rounded-[40px] shadow-2xl"
            >
              <button 
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setIsResetSent(false);
                }}
                className="absolute top-6 right-6 p-2 hover:bg-vertus-gray rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!isResetSent ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-vertus-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-6 h-6 text-vertus-gold" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-2">Recuperar Senha</h3>
                    <p className="text-sm text-vertus-white/50">Insira seu e-mail para receber as instruções de recuperação.</p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-vertus-white/50 font-bold mb-2 ml-1">E-mail Cadastrado</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl py-4 px-4 outline-none transition-all text-sm"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full gold-gradient text-vertus-bg font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                      {isLoading ? 'Processando...' : 'Enviar Link de Recuperação'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-2">E-mail Enviado</h3>
                  <p className="text-sm text-vertus-white/50 mb-8">
                    Se o e-mail <strong>{forgotEmail}</strong> estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
                  </p>
                  <button
                    onClick={() => {
                      setIsForgotModalOpen(false);
                      setIsResetSent(false);
                    }}
                    className="w-full bg-vertus-gray text-white font-bold py-4 rounded-2xl hover:bg-vertus-gray/80 transition-colors"
                  >
                    Voltar ao Login
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
