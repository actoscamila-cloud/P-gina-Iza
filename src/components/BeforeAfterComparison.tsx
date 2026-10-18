import { COMPARISON_DATA } from '../data/mockData';
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface BeforeAfterComparisonProps {
  onOpenDemoModal: () => void;
}

export function BeforeAfterComparison({ onOpenDemoModal }: BeforeAfterComparisonProps) {
  return (
    <section className="py-20 bg-[#0c0d13] relative border-b border-[#1c202d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            Comparativo de Atendimento
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            O Que Acontece no WhatsApp da sua Clínica Hoje vs. Com a Iza
          </h2>
          <p className="mt-3 text-base text-slate-300">
            O dinheiro investido em tráfego e posts no Instagram é desperdiçado quando a comunicação no WhatsApp é amadora.
          </p>
        </div>

        {/* Table / Cards Comparison */}
        <div className="max-w-5xl mx-auto space-y-4">
          {COMPARISON_DATA.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#12131b] border border-[#202434] overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#202434]"
            >
              {/* Context Label */}
              <div className="p-5 md:col-span-4 bg-[#0e0f16] flex items-center">
                <span className="text-sm font-bold text-slate-200">{item.criterion}</span>
              </div>

              {/* Without Iza (Red) */}
              <div className="p-5 md:col-span-4 bg-rose-950/10 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-400 block mb-1">
                    Sem a Iza (Como a maioria faz)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.withoutIza}</p>
                </div>
              </div>

              {/* With Iza (Emerald/Amber) */}
              <div className="p-5 md:col-span-4 bg-emerald-950/15 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                    Com a Iza (Metodologia Vertus)
                  </span>
                  <p className="text-xs text-slate-100 font-medium leading-relaxed">{item.withIza}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onOpenDemoModal}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <span>Quero Elevar o Padrão da Minha Recepção</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
