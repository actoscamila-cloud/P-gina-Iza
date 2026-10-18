import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside React tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReset = async () => {
    try {
      if ('caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      localStorage.removeItem('vertus_chat_sessions');
      localStorage.removeItem('vertus_activities');
    } catch (e) {
      console.warn('Error clearing caches:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F0F0F] text-[#F3F3F3] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-lg">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-serif font-bold text-[#C9A96E] mb-2 tracking-wide">
            VERTUS PERFORMANCE
          </h1>
          <p className="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
            Houve uma instabilidade temporária ao carregar a interface no seu dispositivo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C9A96E] text-[#0F0F0F] font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar
            </button>
            <button
              onClick={this.handleClearAndReset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs border border-neutral-700 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Cache
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-8 p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-left text-[11px] text-red-400 max-w-md overflow-auto font-mono">
              {this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
