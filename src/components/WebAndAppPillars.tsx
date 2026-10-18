import { Monitor, Smartphone, Zap, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface WebAndAppPillarsProps {
  onOpenDemoModal: () => void;
}

export function WebAndAppPillars({ onOpenDemoModal }: WebAndAppPillarsProps) {
  return (
    <section id="praticidade-web-app" className="py-20 bg-[#0a0b0f] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            Praticidade Absoluta no Dia a Dia da Clínica
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            A Força da Versão Web + A Liberdade do App Mobile
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Não adianta ter uma ferramenta poderosa se a sua equipe não usa por ser complicada. A Iza foi desenhada para a rotina veloz e sem atritos de uma clínica de estética.
          </p>
        </div>

        {/* The 2 Core Environments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Versão Web Desktop */}
          <div className="rounded-3xl bg-gradient-to-b from-[#141622] to-[#0f1017] p-8 border border-[#242938] hover:border-amber-500/40 transition-all duration-300 shadow-xl relative group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
              <Monitor className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Na Recepção & Comercial</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300">Versão Web</span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              Velocidade Máxima ao lado do WhatsApp Web
            </h3>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Sua secretária trabalha no computador com o WhatsApp Web aberto o dia todo. Com a Iza Web, ela cola a objeção da paciente e, com <strong>1 clique</strong>, já copia o script perfeito sem precisar sair da janela.
            </p>

            <ul className="space-y-3 text-xs text-slate-300 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero atrito:</strong> Sem planilhas pesadas ou arquivos PDF que ninguém abre na correria.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Multi-telas & Split screen:</strong> Perfeito para monitores duplos ou tela dividida lado a lado.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Resgate de orçamentos em lote:</strong> Analise prints de conversas antigas para reativar pacientes paradas.</span>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-[#0a0b10] border border-[#1e2230] text-xs text-amber-200/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Reduz o tempo de resposta em até <strong>70%</strong></span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">1-Clique Copiar</span>
            </div>
          </div>

          {/* Card 2: Versão App Mobile */}
          <div className="rounded-3xl bg-gradient-to-b from-[#141622] to-[#0f1017] p-8 border border-[#242938] hover:border-emerald-500/40 transition-all duration-300 shadow-xl relative group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Na Palma da Mão</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">App Mobile</span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              Mentoria 24/7 no Bolso de Médicos e Consultoras
            </h3>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Ideal para a dona da clínica acompanhar a qualidade do atendimento, para consultoras de vendas responderem plantões e para a equipe treinar com o simulador em qualquer lugar.
            </p>

            <ul className="space-y-3 text-xs text-slate-300 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Orientação de Áudio & Postura:</strong> A vendedora escuta dicas de modulação de voz antes de gravar áudios para a paciente.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Simulador de Pacientes (Roleplay):</strong> Treinamento prático em qualquer momento livre do dia.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Banco de Objeções Instantâneo:</strong> Acesso rápido a scripts categorizados em 4 pilares estratégicos.</span>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-[#0a0b10] border border-[#1e2230] text-xs text-emerald-200/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Responda pacientes em trânsito com segurança</span>
              </div>
              <span className="font-mono text-amber-400 font-bold">iOS & Android</span>
            </div>
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#151722] to-emerald-500/10 border border-[#272c3d] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold text-sm shrink-0">
              V
            </div>
            <div>
              <div className="text-white font-bold text-base">Pronto para padronizar o atendimento da sua clínica?</div>
              <div className="text-xs text-slate-400">Instalação imediata sem mexer na estrutura de TI da sua clínica.</div>
            </div>
          </div>

          <button
            onClick={onOpenDemoModal}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <span>Solicitar Acesso Comercial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
