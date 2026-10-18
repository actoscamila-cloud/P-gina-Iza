import { MessageCircle, Volume2, ShieldCheck, Zap, BookOpen, Sliders, ArrowUpRight } from 'lucide-react';

interface FeaturesGridProps {
  onOpenDemoModal: () => void;
}

export function FeaturesGrid({ onOpenDemoModal }: FeaturesGridProps) {
  const features = [
    {
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />,
      tag: '1-Clique Copiar',
      title: 'Mensagens Prontas para WhatsApp',
      desc: 'A secretária cola a dúvida da paciente e recebe a resposta formatada, no tamanho exato e com botão de cópia instantânea.',
    },
    {
      icon: <Volume2 className="w-5 h-5 text-amber-400" />,
      tag: 'Conexão Humana',
      title: 'Orientação de Áudio & Tom de Voz',
      desc: 'Ensina pausas estratégicas, postura de segurança e tom acolhedor. O objetivo não é vender o botox, é ajudar a paciente a se sentir bem.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-sky-400" />,
      tag: 'Auditoria de Atendimento',
      title: 'Diagnóstico de Prints & Conversas',
      desc: 'Cole o print de um atendimento perdido e a Iza aponta exatamente o momento em que a paciente esfriou e como resgatar.',
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      tag: 'Treinamento Prático',
      title: 'Simulador de Paciente Real (Roleplay)',
      desc: 'Simula pacientes exigentes com objeções de preço alto e concorrência para treinar atendentes sem queimar leads reais.',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-purple-400" />,
      tag: 'Metodologia Vertus',
      title: 'Banco Estratégico de Objeções',
      desc: 'Mais de 50 situações de estética médica categorizadas em Rapport, Abordagem Consultiva, Autoridade Médica e Síntese.',
    },
    {
      icon: <Sliders className="w-5 h-5 text-rose-400" />,
      tag: 'Personalização',
      title: 'Ajuste Imediato de Tom',
      desc: 'Alterne o mesmo script para "Mais Formal", "Mais Acolhedor" ou "Mais Direto" de acordo com o perfil da paciente.',
    },
  ];

  return (
    <section className="py-20 bg-[#0c0d12] relative border-b border-[#1b1f2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            Arsenal Comercial Completo
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tudo o Que Sua Equipe Precisa para Não Perder Mais Vendas
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Cada recurso foi extraído da vivência prática em centenas de clínicas estéticas de alta performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#12141d] border border-[#232738] hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-[#171926] border border-[#2b3145]">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#181a26] text-slate-400 border border-[#292e40]">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-[#1c202d] flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span>Disponível no App & Web</span>
                <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
