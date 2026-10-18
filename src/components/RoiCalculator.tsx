import { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

interface RoiCalculatorProps {
  onOpenDemoModal: () => void;
}

export function RoiCalculator({ onOpenDemoModal }: RoiCalculatorProps) {
  const [monthlyLeads, setMonthlyLeads] = useState<number>(140);
  const [averageTicket, setAverageTicket] = useState<number>(1800);
  const [currentConversion, setCurrentConversion] = useState<number>(12); // in percent

  // Vertus estimated bump is +10% to +18% in conversion
  const estimatedConversionBump = 14;
  const newConversion = currentConversion + estimatedConversionBump;

  const currentPatients = Math.round((monthlyLeads * currentConversion) / 100);
  const newPatients = Math.round((monthlyLeads * newConversion) / 100);
  const extraPatients = Math.max(1, newPatients - currentPatients);

  const extraMonthlyRevenue = extraPatients * averageTicket;
  const extraAnnualRevenue = extraMonthlyRevenue * 12;

  return (
    <section id="calculadora-roi" className="py-20 bg-[#0a0b0f] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora de Receita Resgatada</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Quanto a sua Clínica de Estética está Deixando na Mesa?
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Ajuste os valores abaixo com os números da sua clínica e veja quanto faturamento extra pode entrar no seu caixa ao recuperar pacientes que somem no WhatsApp.
          </p>
        </div>

        <div className="max-w-5xl mx-auto rounded-3xl bg-[#12141c] border-2 border-[#252a3b] p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Input Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1: Leads/Month */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Contatos de WhatsApp / mês:</span>
                  <span className="font-mono text-amber-400 font-bold text-base">{monthlyLeads} pacientes</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="600"
                  step="10"
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  className="w-full h-2 bg-[#222636] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>30</span>
                  <span>300</span>
                  <span>600 pacientes/mês</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Ticket Médio dos Procedimentos:</span>
                  <span className="font-mono text-emerald-400 font-bold text-base">
                    R$ {averageTicket.toLocaleString('pt-BR')}
                  </span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="5000"
                  step="100"
                  value={averageTicket}
                  onChange={(e) => setAverageTicket(Number(e.target.value))}
                  className="w-full h-2 bg-[#222636] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>R$ 600 (Botox 1 região)</span>
                  <span>R$ 2.500 (Bioestimulador)</span>
                  <span>R$ 5.000+ (Full Face / Cirurgia)</span>
                </div>
              </div>

              {/* Slider 3: Current Conversion Rate */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Taxa Atual de Fechamento da Recepção:</span>
                  <span className="font-mono text-white font-bold text-base">{currentConversion}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={currentConversion}
                  onChange={(e) => setCurrentConversion(Number(e.target.value))}
                  className="w-full h-2 bg-[#222636] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>5% (Perdendo muito lead)</span>
                  <span>15% (Média do mercado)</span>
                  <span>35% (Equipe madura)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181a24] border border-[#272c3d] text-xs text-slate-400 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Em média, clínicas que implantam a Iza com os 4 pilares da Vertus aumentam a taxa de conversão em{' '}
                  <strong className="text-amber-300">+{estimatedConversionBump}%</strong> simplesmente contornando o "vou pensar".
                </span>
              </div>
            </div>

            {/* Results Output Box */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-gradient-to-br from-[#181b26] to-[#0e1017] p-6 border-2 border-emerald-500/40 shadow-xl space-y-5">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#25293b] pb-3">
                  <span>Projeção de Retorno Financeiro</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    Impacto Mensal
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">Pacientes extras fechadas por mês:</span>
                  <div className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span>+{extraPatients} pacientes / mês</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs text-slate-400 block mb-1">Faturamento Extra Estimado / Mês:</span>
                  <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                    +R$ {extraMonthlyRevenue.toLocaleString('pt-BR')}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Equivalente a <strong className="text-white">+R$ {extraAnnualRevenue.toLocaleString('pt-BR')}</strong> a mais por ano!
                  </span>
                </div>

                <button
                  onClick={onOpenDemoModal}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Quero Resgatar Esse Faturamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
