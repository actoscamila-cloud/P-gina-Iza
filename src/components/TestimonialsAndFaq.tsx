import { useState } from 'react';
import { TESTIMONIALS, FAQ_ITEMS } from '../data/mockData';
import { Star, ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';

export function TestimonialsAndFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="py-20 bg-[#0a0b0f] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Casos Reais em Clínicas
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              O Que Médicos e Gestores de Clínicas Dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((test, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#12141c] border border-[#232738] flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                    "{test.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1f2231] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{test.name}</div>
                    <div className="text-[11px] text-slate-400">{test.role}</div>
                    <div className="text-[10px] text-slate-500">{test.city}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs font-mono">
                    {test.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151722] border border-[#272c3d] text-xs text-amber-300 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Dúvidas Frequentes</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Tudo o Que Você Precisa Saber Sobre a Iza
            </h3>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#13141e] border border-[#222637] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-amber-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#1e2233] pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
