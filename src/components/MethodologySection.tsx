import { useState } from 'react';
import { PILLARS } from '../data/mockData';
import { ShieldCheck, Heart, Search, Award, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

export function MethodologySection() {
  const [selectedPillar, setSelectedPillar] = useState(0);

  const pillarIcons = [
    <Heart className="w-5 h-5 text-amber-400" key="heart" />,
    <Search className="w-5 h-5 text-amber-400" key="search" />,
    <Award className="w-5 h-5 text-amber-400" key="award" />,
    <CheckCircle2 className="w-5 h-5 text-amber-400" key="check" />
  ];

  return (
    <section id="metodologia-roones" className="py-20 bg-[#0c0d13] relative border-b border-[#1c1f2c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Engenharia Comercial da Roones Performance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Por que a Iza Converte Onde Scripts Comuns Fracassam?
          </h2>
          <p className="mt-3 text-base text-slate-300">
            A Iza não usa frases genéricas de vendas. Ela foi moldada na <strong>Metodologia Roones</strong>, desenhada exclusivamente para os dilemas e a psicologia da paciente de estética.
          </p>
        </div>

        {/* 4 Pillars Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Pillar Selector Tabs */}
          <div className="lg:col-span-5 space-y-3">
            {PILLARS.map((pillar, idx) => {
              const isSelected = selectedPillar === idx;
              return (
                <div
                  key={pillar.number}
                  onClick={() => setSelectedPillar(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#171a25] to-[#12141d] border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-[#111219] border-[#222533] hover:border-[#323648]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-amber-500 text-black' : 'bg-[#191b26] text-amber-400'
                        }`}
                      >
                        {pillar.number}
                      </div>
                      <span className={`font-bold text-base ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {pillar.name}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 pl-12 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>

          {/* Active Pillar Deep Dive Card */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-gradient-to-br from-[#151722] via-[#101118] to-[#0c0d12] p-8 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <span className="font-serif font-black text-8xl text-amber-400">
                  {PILLARS[selectedPillar].number}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  {pillarIcons[selectedPillar]}
                </div>
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Metodologia Roones • Pilar {PILLARS[selectedPillar].number}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {PILLARS[selectedPillar].name}
              </h3>

              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                {PILLARS[selectedPillar].description}
              </p>

              <div className="p-4 rounded-2xl bg-[#090a0f] border border-[#222636] mb-6">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Impacto Imediato na Conversão da Clínica</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {PILLARS[selectedPillar].benefit}
                </p>
              </div>

              {/* Real World Example for Aesthetic Clinic */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Como a Iza orienta a secretária neste pilar:
                </div>
                <div className="p-4 rounded-xl bg-[#141620] border-l-4 border-amber-400 text-xs text-slate-200 italic leading-relaxed">
                  {selectedPillar === 0 &&
                    '"Entendo perfeitamente o seu receio de ficar artificial. Muitas pacientes chegam até nós com esse mesmo medo. Aqui na clínica o foco da doutora é o rejuvenescimento elegante, respeitando a harmonia do seu rosto."'}
                  {selectedPillar === 1 &&
                    '"Para eu te orientar da melhor forma antes de falarmos de valores: o que mais tem te incomodado ultimamente no espelho quando você tira fotos sem filtro?"'}
                  {selectedPillar === 2 &&
                    '"Nosso protocolo utiliza somente produtos com rastreabilidade suíça e lacre aberto na sua presença. Em procedimentos no rosto, você prefere economizar um pouco ou ter a certeza de resultados seguros e duradouros?"'}
                  {selectedPillar === 3 &&
                    '"Consigo reservar para você a condição especial em 10x sem juros se confirmarmos até amanhã às 12h. Temos vaga na quinta às 15h ou sexta às 10h, qual fica mais confortável na sua rotina?"'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
