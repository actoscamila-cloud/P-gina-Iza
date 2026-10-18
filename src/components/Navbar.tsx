import { useState } from 'react';
import { Sparkles, Smartphone, Monitor, ChevronRight, MessageSquareCode, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenDemoModal: () => void;
}

export function Navbar({ onOpenDemoModal }: NavbarProps) {
  const [isScrolled] = useState(false);

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-[#0b0c10]/95 backdrop-blur-md border-[#232630]'
          : 'bg-[#0b0c10]/80 backdrop-blur-md border-[#1e2029]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8c2c] p-[1.5px] shadow-lg shadow-amber-500/10">
            <div className="w-full h-full bg-[#0b0c10] rounded-[10px] flex items-center justify-center">
              <span className="font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-lg tracking-wider">
                R
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-[0.16em] text-xs uppercase text-amber-200/90 font-bold">
                ROONES PERFORMANCE
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE 24/7
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Iza <span className="text-amber-400 font-light">•</span> Mentora Comercial
            </h1>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a
            href="#demonstracao-interativa"
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Demonstração Ao Vivo</span>
          </a>
          <a
            href="#praticidade-web-app"
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>Versão Web & App</span>
          </a>
          <a
            href="#metodologia-vertus"
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Metodologia Vertus</span>
          </a>
          <a
            href="#calculadora-roi"
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <MessageSquareCode className="w-4 h-4 text-amber-400" />
            <span>Calculadora de ROI</span>
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            id="btn-nav-demo-modal"
            onClick={onOpenDemoModal}
            className="relative group overflow-hidden rounded-xl p-[1px] font-medium text-xs sm:text-sm focus:outline-none"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-xl transition-all duration-300 group-hover:opacity-90" />
            <span className="relative px-4 py-2.5 rounded-[11px] bg-[#121318] flex items-center gap-2 text-amber-200 group-hover:bg-[#181a22] transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-semibold tracking-wide">Agendar Demonstração</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
