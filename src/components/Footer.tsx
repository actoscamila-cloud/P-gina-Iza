import { Sparkles, MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenDemoModal: () => void;
}

export function Footer({ onOpenDemoModal }: FooterProps) {
  return (
    <footer className="bg-[#07080a] border-t border-[#181a24] text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-[#181a24]">
          {/* Logo & Slogan */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 p-[1px]">
                <div className="w-full h-full bg-[#0b0c10] rounded-[7px] flex items-center justify-center font-serif text-amber-400 font-bold text-sm">
                  R
                </div>
              </div>
              <span className="font-serif tracking-[0.16em] text-xs uppercase text-amber-200/90 font-bold">
                ROONES PERFORMANCE
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm text-center md:text-left">
              Inteligência e mentoria comercial especializada para clínicas de estética, dermatologia e cirurgia plástica.
            </p>
          </div>

          {/* Quick links & CTA */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300 font-medium">
            <a href="#demonstracao-interativa" className="hover:text-amber-400 transition-colors">
              Demonstração Ao Vivo
            </a>
            <a href="#praticidade-web-app" className="hover:text-amber-400 transition-colors">
              Versão Web & App
            </a>
            <a href="#metodologia-roones" className="hover:text-amber-400 transition-colors">
              Metodologia Roones
            </a>
            <a href="#calculadora-roi" className="hover:text-amber-400 transition-colors">
              Calculadora de ROI
            </a>
            <button
              onClick={onOpenDemoModal}
              className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Solicitar Demonstração VIP</span>
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Roones Performance. Todos os direitos reservados. Iza • Mentora Comercial.
          </div>
          <div>
            Desenvolvido para alta conversão em clínicas médicas e estéticas.
          </div>
        </div>
      </div>
    </footer>
  );
}
