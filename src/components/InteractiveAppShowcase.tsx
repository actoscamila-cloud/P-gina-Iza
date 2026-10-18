import { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Copy,
  Check,
  Volume2,
  Sparkles,
  Send,
  MessageCircle,
  Lightbulb,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Zap,
  HelpCircle,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { SCENARIOS, OBJECTIONS_BANK } from '../data/mockData';

export function InteractiveAppShowcase() {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTab, setActiveTab] = useState<'mentora' | 'objecoes' | 'simulador'>('mentora');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [selectedObjectionIndex, setSelectedObjectionIndex] = useState<number>(0);
  const [activeObjectionPillar, setActiveObjectionPillar] = useState<'rapport' | 'consultiva' | 'autoridade' | 'sintese'>('consultiva');
  const [modeFilter, setModeFilter] = useState<'whatsapp' | 'audio' | 'diagnostico'>('whatsapp');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toneAdjustment, setToneAdjustment] = useState<string>('padrão');
  const [simulatedSecretaryInput, setSimulatedSecretaryInput] = useState<string>('');

  const currentScenario = SCENARIOS[selectedScenarioIndex];
  const currentObjection = OBJECTIONS_BANK[selectedObjectionIndex];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2200);
  };

  const getToneModifiedMessage = () => {
    if (toneAdjustment === 'formal') {
      return `Prezada paciente, compreendemos perfeitamente. A segurança é primordial em procedimentos de saúde estética. Poderia nos indicar quais pontos técnicos gostaria de esclarecer para tomar sua decisão com absoluta tranquilidade?`;
    }
    if (toneAdjustment === 'acolhedor') {
      return `Olá! Eu compreendo perfeitamente. É super natural querer pensar com calma quando o assunto é o nosso rosto e nossa autoestima. Me conta: ficou algum ponto em aberto ou alguma dúvida para esclarecermos com tranquilidade?`;
    }
    if (toneAdjustment === 'direto') {
      return `Totalmente compreensível! Para eu te ajudar de forma prática: o que falta para você se sentir 100% segura para iniciarmos seu tratamento? É a forma de parcelamento ou alguma dúvida sobre o resultado?`;
    }
    return currentScenario.izaResponse.message;
  };

  return (
    <section id="demonstracao-interativa" className="py-20 bg-[#0c0d12] relative border-t border-b border-[#1b1e2a]">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador Comercial Interativo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Veja a Iza em Ação: No Celular da Equipe e no Computador da Recepção
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Clique nos cenários reais de clínicas de estética e experimente como a Iza instrui a vendedora em tempo real com scripts prontos, análise psicológica de bastidores e orientação de tom de voz.
          </p>

          {/* Toggle: Mobile App vs Web Desktop */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-[#14161f] border border-[#262a38] shadow-lg">
            <button
              id="btn-switch-mobile"
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-[#0c0d12] shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 Versão App Mobile</span>
            </button>

            <button
              id="btn-switch-desktop"
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-[#0c0d12] shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>💻 Versão Web (Painel da Recepção)</span>
            </button>
          </div>
        </div>

        {/* Quick Scenario Picker Buttons */}
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Escolha uma situação comum da clínica de estética para testar:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {SCENARIOS.map((scen, idx) => (
              <button
                key={scen.id}
                onClick={() => {
                  setSelectedScenarioIndex(idx);
                  setActiveTab('mentora');
                  setToneAdjustment('padrão');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  selectedScenarioIndex === idx && activeTab === 'mentora'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/10'
                    : 'bg-[#151720] text-slate-300 hover:bg-[#1c1f2b] border border-[#232736]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="font-semibold">{scen.procedure}:</span>
                <span className="opacity-90 italic truncate max-w-[200px] sm:max-w-none">"{scen.patientQuestion.slice(0, 45)}..."</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SMARTPHONE APP MOCKUP (Faithful reproduction of Vertus video) */}
        {/* ========================================================================= */}
        {deviceMode === 'mobile' && (
          <div className="flex justify-center">
            <div className="w-full max-w-[430px] rounded-[48px] bg-[#07080a] p-3 shadow-2xl border-4 border-[#272b38] shadow-amber-500/5 relative">
              {/* Phone Speaker & Camera Island */}
              <div className="w-32 h-5 bg-[#14161f] rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#07080a] mr-2" />
                <div className="w-10 h-1 bg-[#272b38] rounded-full" />
              </div>

              {/* Phone Screen Canvas */}
              <div className="rounded-[36px] bg-[#0e0f14] overflow-hidden border border-[#1f222d] flex flex-col h-[740px] text-slate-200">
                {/* Status Bar */}
                <div className="px-5 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-[#181a24] bg-[#0c0d12]">
                  <span className="font-semibold text-white">10:54</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-amber-400 font-mono">5G</span>
                    <span className="text-[10px]">98%</span>
                  </div>
                </div>

                {/* Vertus Header */}
                <div className="px-4 py-3 bg-[#111218] border-b border-[#1f222e] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 p-[1px]">
                      <div className="w-full h-full bg-[#0e0f14] rounded-[7px] flex items-center justify-center text-amber-300 font-black text-xs">
                        V
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-white tracking-tight">Iza • Mentora Comercial</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>ONLINE 24/7 • ROONES</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                      RO
                    </div>
                  </div>
                </div>

                {/* Sub-header Filter Pills (WhatsApp, Áudio/Voz, Diagnóstico) */}
                <div className="px-3 py-2 bg-[#0e1017] border-b border-[#1a1c26] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                    <button
                      onClick={() => setModeFilter('whatsapp')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        modeFilter === 'whatsapp'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#161822] text-slate-400 border border-transparent'
                      }`}
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setModeFilter('audio')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        modeFilter === 'audio'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-[#161822] text-slate-400 border border-transparent'
                      }`}
                    >
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>Áudio / Voz</span>
                    </button>
                    <button
                      onClick={() => setModeFilter('diagnostico')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        modeFilter === 'diagnostico'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-[#161822] text-slate-400 border border-transparent'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3 text-sky-400" />
                      <span>Diagnóstico</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Screen Content Based on Bottom Navigation Tab */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
                  {/* TAB 1: IZA MENTORA CHAT */}
                  {activeTab === 'mentora' && (
                    <>
                      {/* Iza Welcome Card */}
                      <div className="p-3 rounded-2xl bg-[#14161f] border border-[#242735] text-slate-300 space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Orientação Iza
                          </span>
                          <span className="text-[10px] text-slate-400">Metodologia Roones</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-300">
                          {modeFilter === 'audio'
                            ? 'O áudio é um recurso muito especial para gerar conexão humana e transmitir confiança na estética. Me conte o que você precisa falar para a sua paciente: vou te ensinar como dosar o tom, as pausas e a postura com naturalidade.'
                            : modeFilter === 'diagnostico'
                            ? 'O objetivo aqui é aprender com cada atendimento. Cole o diálogo ou envie a dúvida: vou te ajudar a compreender as reais intenções e receios da paciente.'
                            : 'Olá! Sou a Iza. Estou aqui para te apoiar, orientar e ensinar a conduzir cada atendimento no WhatsApp com segurança e empatia para alcançar melhores resultados!'}
                        </p>
                      </div>

                      {/* User Request Bubble */}
                      <div className="flex justify-end">
                        <div className="max-w-[85%] p-3 rounded-2xl rounded-br-sm bg-gradient-to-r from-amber-500/25 to-yellow-500/20 border border-amber-500/40 text-amber-100 text-xs shadow-md">
                          <p className="font-medium">{currentScenario.patientQuestion}</p>
                          <span className="block text-[9px] text-amber-400/80 text-right mt-1 font-mono">10:54</span>
                        </div>
                      </div>

                      {/* Iza Response Card (The Exact Design from the Video) */}
                      <div className="space-y-2">
                        {/* Green Ready Message Card */}
                        <div className="rounded-2xl bg-[#111915] border border-emerald-500/30 overflow-hidden shadow-lg shadow-emerald-950/20">
                          <div className="px-3 py-2 bg-emerald-950/50 border-b border-emerald-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">
                                Mensagem Pronta
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(getToneModifiedMessage(), 'iza-mobile-script')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer"
                            >
                              {copiedId === 'iza-mobile-script' ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>1-Clique Copiar</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-3 text-slate-100 font-normal leading-relaxed text-[11.5px]">
                            {getToneModifiedMessage()}
                          </div>

                          <div className="px-3 py-1.5 bg-[#0b100e] border-t border-emerald-500/10 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                            <span>{getToneModifiedMessage().length} caracteres • Pronto para envio</span>
                            <span className="text-emerald-300 font-bold">Agora ✓✓</span>
                          </div>
                        </div>

                        {/* Visão de Bastidores • Método Roones Card */}
                        <div className="p-3 rounded-2xl bg-[#13151e] border border-[#252a3a] space-y-2 text-slate-300">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Visão de Bastidores • Método Roones</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 leading-tight">
                            {(currentScenario.izaResponse.roonesInsight || currentScenario.izaResponse.vertusInsight)?.reason}
                          </p>

                          {/* Scenarios bullet list */}
                          <div className="space-y-1 pt-1 border-t border-[#202433]">
                            <div className="text-[10px] font-semibold text-slate-300">O que observar na resposta:</div>
                            {(currentScenario.izaResponse.roonesInsight || currentScenario.izaResponse.vertusInsight)?.scenarios.map((sc, sIdx) => (
                              <div key={sIdx} className="text-[10px] text-slate-400 flex items-start gap-1">
                                <span className="text-amber-400 font-bold">•</span>
                                <div>
                                  <strong className="text-slate-200">{sc.condition}:</strong> {sc.action}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Strategic Tip */}
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200 leading-snug">
                            <strong className="text-amber-400">Dica estratégica:</strong>{' '}
                            {(currentScenario.izaResponse.roonesInsight || currentScenario.izaResponse.vertusInsight)?.strategicTip}
                          </div>

                          {/* Voice guidance note */}
                          <div className="p-2 rounded-xl bg-[#181a24] border border-[#2b3040] text-[10px] text-slate-300 flex items-start gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-300">Atenção ao tom de áudio:</strong>{' '}
                              {currentScenario.izaResponse.audioNote}
                            </div>
                          </div>

                          {/* Tone Adjustment Buttons */}
                          <div className="pt-1">
                            <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
                              Ajustar tom do script:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => setToneAdjustment(toneAdjustment === 'formal' ? 'padrão' : 'formal')}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                                  toneAdjustment === 'formal'
                                    ? 'bg-amber-500 text-black font-bold'
                                    : 'bg-[#1b1e2a] text-slate-300 hover:bg-[#232738]'
                                }`}
                              >
                                Mais Formal
                              </button>
                              <button
                                onClick={() => setToneAdjustment(toneAdjustment === 'acolhedor' ? 'padrão' : 'acolhedor')}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                                  toneAdjustment === 'acolhedor'
                                    ? 'bg-amber-500 text-black font-bold'
                                    : 'bg-[#1b1e2a] text-slate-300 hover:bg-[#232738]'
                                }`}
                              >
                                Mais Acolhedor
                              </button>
                              <button
                                onClick={() => setToneAdjustment(toneAdjustment === 'direto' ? 'padrão' : 'direto')}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                                  toneAdjustment === 'direto'
                                    ? 'bg-amber-500 text-black font-bold'
                                    : 'bg-[#1b1e2a] text-slate-300 hover:bg-[#232738]'
                                }`}
                              >
                                Mais Direto
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* TAB 2: BANCO ESTRATÉGICO DE OBJEÇÕES (Exact from video) */}
                  {activeTab === 'objecoes' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-[#141620] border border-[#242838]">
                        <div className="text-amber-400 font-serif font-bold text-sm">Banco Estratégico de Objeções</div>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                          Metodologia Roones • 4 Pilares
                        </span>
                        <p className="text-[10.5px] text-slate-400 mt-1">
                          Scripts estruturados nos 4 pilares: Rapport, Abordagem Consultiva, Autoridade Médica e Síntese Geral.
                        </p>
                      </div>

                      {/* Objection Selector */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {OBJECTIONS_BANK.map((obj, oIdx) => (
                          <button
                            key={obj.id}
                            onClick={() => setSelectedObjectionIndex(oIdx)}
                            className={`px-2.5 py-1 rounded-xl text-[10.5px] font-semibold whitespace-nowrap transition-all ${
                              selectedObjectionIndex === oIdx
                                ? 'bg-amber-500/25 border border-amber-500 text-amber-200'
                                : 'bg-[#161822] text-slate-400 border border-[#222634]'
                            }`}
                          >
                            {obj.code} {obj.title}
                          </button>
                        ))}
                      </div>

                      {/* Selected Objection Card */}
                      <div className="p-3 rounded-2xl bg-[#12141c] border border-amber-500/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{currentObjection.title}</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            {currentObjection.code}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-amber-200/90 italic bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                          <strong>Motivo Oculto:</strong> {currentObjection.hiddenMotive}
                        </div>

                        {/* Pillar Tabs: 01 Rapport, 02 Consultiva, 03 Autoridade, 04 Síntese */}
                        <div className="grid grid-cols-4 gap-1 pt-1">
                          {(['rapport', 'consultiva', 'autoridade', 'sintese'] as const).map((pilar, pIdx) => (
                            <button
                              key={pilar}
                              onClick={() => setActiveObjectionPillar(pilar)}
                              className={`py-1 px-1 rounded-lg text-[9px] font-bold uppercase text-center transition-all ${
                                activeObjectionPillar === pilar
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-[#181a24] text-slate-400 hover:text-white'
                              }`}
                            >
                              0{pIdx + 1}. {pilar.slice(0, 4)}
                            </button>
                          ))}
                        </div>

                        {/* Script Display for Pillar */}
                        <div className="p-2.5 rounded-xl bg-[#0b0c10] border border-emerald-500/20 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase">
                            <span>Pilar: {activeObjectionPillar}</span>
                            <button
                              onClick={() =>
                                handleCopy(currentObjection.scripts[activeObjectionPillar], 'obj-pillar-copy')
                              }
                              className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === 'obj-pillar-copy' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                              <span>{copiedId === 'obj-pillar-copy' ? 'Copiado!' : 'Copiar Script'}</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                            "{currentObjection.scripts[activeObjectionPillar]}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SIMULADOR DE PACIENTE REAL (ROLEPLAY) */}
                  {activeTab === 'simulador' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-[#141620] border border-[#252a3a]">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Simulador de Paciente Real de Estética</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          Roleplay Ao Vivo
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Aqui sua secretária treina cenários difíceis em ambiente seguro sem queimar leads caros da clínica.
                        </p>
                      </div>

                      {/* Patient Scenario Card */}
                      <div className="p-3 rounded-2xl bg-[#1a1315] border border-rose-500/30 space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-rose-400">Paciente Fictícia (Mariana, 42 anos):</span>
                        <p className="text-xs text-rose-100 font-medium italic">
                          "Oi, achei lindo o trabalho de vocês, mas R$ 2.400 no bioestimulador está fora da minha realidade agora. A outra clínica faz por R$ 1.300."
                        </p>
                      </div>

                      {/* Feedback from Iza */}
                      <div className="p-3 rounded-2xl bg-[#111915] border border-emerald-500/30 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Orientação Didática da Iza:</span>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          "Não confronte o preço da concorrente. Valide a busca dela por cuidado e mostre que na estética facial, o barato sai caro com risco de nódulos e baixa durabilidade. Use o pilar 03 de autoridade com acolhimento."
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab('objecoes');
                            setSelectedObjectionIndex(3);
                          }}
                          className="w-full py-1.5 rounded-xl bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Ver Script do Pilar 03 no Banco de Objeções</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar inside Phone */}
                <div className="p-2.5 bg-[#10121a] border-t border-[#1e2230]">
                  <div className="flex items-center gap-2 bg-[#171924] rounded-2xl px-3 py-1.5 border border-[#2b3042]">
                    <input
                      type="text"
                      placeholder="Digite a dúvida ou situação da paciente..."
                      value={simulatedSecretaryInput}
                      onChange={(e) => setSimulatedSecretaryInput(e.target.value)}
                      className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (simulatedSecretaryInput) {
                          setSimulatedSecretaryInput('');
                          setActiveTab('mentora');
                        }
                      }}
                      className="w-7 h-7 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Navigation Bar (Identical to Vertus video: Iza Mentora, Simulador, Objeções, Meu Espaço, Admin) */}
                <div className="px-3 py-2 bg-[#0a0b0f] border-t border-[#181a24] flex items-center justify-around text-[10px] text-slate-400">
                  <button
                    onClick={() => setActiveTab('mentora')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                      activeTab === 'mentora' ? 'text-amber-400 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Iza Mentora</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('simulador')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                      activeTab === 'simulador' ? 'text-amber-400 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Simulador</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('objecoes')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                      activeTab === 'objecoes' ? 'text-amber-400 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Objeções</span>
                  </button>

                  <div className="flex flex-col items-center gap-0.5 opacity-50">
                    <HelpCircle className="w-4 h-4" />
                    <span>Meu Espaço</span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5 opacity-50">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DESKTOP RECEPTION SPLIT-SCREEN (WhatsApp Web + Iza Mentora Web) */}
        {/* ========================================================================= */}
        {deviceMode === 'desktop' && (
          <div className="rounded-3xl bg-[#0b0c12] border-2 border-[#262b3a] overflow-hidden shadow-2xl">
            {/* Desktop Window Header Bar */}
            <div className="px-4 py-3 bg-[#13151f] border-b border-[#202534] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 ml-2 font-mono">
                  Recepção Clínica de Estética — Tela Dividida Operacional (Dual Monitor Workflow)
                </span>
              </div>
              <span className="text-xs text-amber-400 font-semibold">
                WhatsApp Web + Iza Mentora Web
              </span>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#202534]">
              {/* Left Pane: WhatsApp Web da Clínica */}
              <div className="p-5 bg-[#0f1118] flex flex-col justify-between h-[520px]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#1f2330] mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center font-bold text-emerald-400 text-xs">
                        MC
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Mariana Castro (Paciente Lead)</div>
                        <div className="text-[10px] text-emerald-400">online agora • vinda do Instagram</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">WhatsApp Web</span>
                  </div>

                  {/* WhatsApp Message Exchange */}
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-[#1b1e2a] text-slate-200 max-w-[85%]">
                      "Olá! Vi o antes e depois de bioestimulador no Instagram da doutora. Quanto fica para fazer no rosto todo?"
                      <span className="block text-[9px] text-slate-500 text-right mt-1">11:02</span>
                    </div>

                    <div className="p-3 rounded-2xl rounded-tr-sm bg-emerald-950/60 border border-emerald-500/30 text-emerald-100 max-w-[85%] ml-auto">
                      "Oi Mariana! Que bom ter você aqui. A doutora preza muito por resultados naturais e personalizados..."
                      <span className="block text-[9px] text-emerald-400 text-right mt-1">11:03</span>
                    </div>

                    <div className="p-3 rounded-2xl rounded-tl-sm bg-[#1b1e2a] text-slate-200 max-w-[85%]">
                      <strong className="text-amber-300 block mb-1">A Objeção da Paciente:</strong>
                      "{currentScenario.patientQuestion}"
                      <span className="block text-[9px] text-slate-500 text-right mt-1">11:05</span>
                    </div>
                  </div>
                </div>

                {/* Patient Reply Input Preview */}
                <div className="pt-3 border-t border-[#1f2330] flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-xl bg-[#161824] border border-[#282d3d] text-xs text-slate-400 italic">
                    Cole aqui a mensagem gerada pela Iza com 1 clique...
                  </div>
                  <button
                    onClick={() => handleCopy(getToneModifiedMessage(), 'desktop-paste-sim')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>

              {/* Right Pane: Iza Mentora Web Desktop */}
              <div className="p-5 bg-[#12131b] flex flex-col justify-between h-[520px] overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#202534] mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-black font-extrabold flex items-center justify-center text-xs">
                        V
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white">Iza Mentora Comercial — Versão Web</span>
                        <div className="text-[10px] text-amber-400">Painel de Recepção & Comercial</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      Sincronizado
                    </span>
                  </div>

                  {/* Ready Message Box */}
                  <div className="rounded-2xl bg-[#0c1410] border border-emerald-500/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Mensagem Recomendada para Envio
                      </span>
                      <button
                        onClick={() => handleCopy(getToneModifiedMessage(), 'desktop-script-copy')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition-colors cursor-pointer"
                      >
                        {copiedId === 'desktop-script-copy' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar para WhatsApp Web</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-slate-100 leading-relaxed font-normal bg-[#080d0a] p-3 rounded-xl border border-emerald-500/20">
                      {getToneModifiedMessage()}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{getToneModifiedMessage().length} caracteres • Pronto</span>
                      <span className="text-amber-400 font-medium">Metodologia Roones 4 Pilares</span>
                    </div>
                  </div>

                  {/* Strategic Insight */}
                  <div className="mt-4 p-3.5 rounded-xl bg-[#181a24] border border-[#272c3d] text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Por que essa abordagem fecha mais pacientes na clínica:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11.5px]">
                      {currentScenario.izaResponse.vertusInsight.reason}
                    </p>
                  </div>
                </div>

                <div className="pt-3 text-center">
                  <span className="text-xs text-slate-400">
                    A secretária não precisa adivinhar nem escrever textos longos. Basta copiar e colar!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
