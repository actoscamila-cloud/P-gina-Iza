import { Sparkles, ArrowRight, ShieldCheck, Zap, Smartphone, CheckCircle2, TrendingUp, Play } from 'lucide-react';

interface HeroSectionProps {
  onOpenDemoModal: () => void;
  onScrollToDemo: () => void;
}

export function HeroSection({ onOpenDemoModal, onScrollToDemo }: HeroSectionProps) {
  return (
    <section id="hero-section" className="relative pt-12 pb-20 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-yellow-600/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-12 right-10 w-72 h-72 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Tag & Context */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181a22] border border-amber-500/30 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Apoio Comercial & Mentoria para Clínicas de Estética
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#15171f] border border-[#2b2f3d] text-xs text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Versão Web no Computador + App no Celular</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Quantas pacientes a sua clínica perdeu esta semana no{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
              "Vou Pensar"
            </span>{' '}
            ou{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
              "Achei Caro"
            </span>
            ?
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Apresentamos a <strong className="text-white font-semibold">Iza</strong>: a Mentora Comercial com{' '}
            <span className="text-amber-300 underline decoration-amber-500/40 decoration-2 underline-offset-4">
              Metodologia Vertus Performance
            </span>{' '}
            que apoia a sua secretária e equipe de vendas em tempo real no WhatsApp para fechar procedimentos de alto ticket.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="btn-hero-scroll-demo"
              onClick={onScrollToDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0b0c10] font-bold text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
              <span>Ver a Iza em Ação no Simulador</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              id="btn-hero-open-modal"
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#171922] hover:bg-[#202330] border border-[#2e3344] text-white font-semibold text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Quero a Iza na Minha Clínica</span>
            </button>
          </div>

          {/* Micro Trust Proof Points */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Scripts prontos com 1-clique para colar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Simulador com Paciente Fictícia (Roleplay)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Orientação de tom de voz para áudios</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Banco com +50 objeções de estética médica</span>
            </div>
          </div>
        </div>

        {/* Quick Value Metrics Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#13141b] border border-[#242735] hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Conversão de Orçamentos</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">+42% de Fechamentos</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pacientes que diziam "vou pensar" ou "achei caro" passam por perguntas diagnósticas acolhedoras que reabrem a conversa com alto valor.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#13141b] border border-[#242735] hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Agilidade na Recepção</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">Resposta em Segundos</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sua equipe não fica mais travada sem saber o que responder. A Iza entrega a resposta pronta no tom perfeito da sua clínica com 1 clique de cópia.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#13141b] border border-[#242735] hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Metodologia Validada</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">Padrão Vertus Performance</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Desenvolvida com os 4 pilares: Rapport, Abordagem Consultiva, Autoridade Médica e Síntese. A sua equipe treinada todos os dias.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
