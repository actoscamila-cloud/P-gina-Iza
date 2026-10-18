import React, { useState } from 'react';
import {
  Bot,
  User,
  MessageSquare,
  Mic,
  Camera,
  UserCheck,
  Sparkles,
  Copy,
  Check,
  Volume2,
  Sliders,
  RotateCcw,
  History,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

interface IzaRealWebMockupProps {
  interactive?: boolean;
}

export const IzaRealWebMockup: React.FC<IzaRealWebMockupProps> = ({ interactive = true }) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'audio'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(true);

  const scriptWhatsAppBase =
    'Entendo perfeitamente, é uma decisão importante e você precisa se sentir segura com ela.\n\nPara eu te ajudar melhor, o que exatamente ficou faltando para você sentir que este é o momento ideal para iniciar o tratamento?';

  const scriptAudioBase =
    'Oi [Nome da Paciente], tudo bem? Passei aqui para te dar um retorno. Lembrei do que conversamos sobre [citar o procedimento] e fiquei pensando no quanto esse cuidado pode trazer mais leveza para o seu dia a dia. Como a nossa agenda está começando a organizar os atendimentos da próxima semana, queria saber se você conseguiu pensar sobre aquele ponto que comentamos ou se ainda tem alguma dúvida que eu possa esclarecer para te deixar mais segura?';

  const [selectedTone, setSelectedTone] = useState<'padrao' | 'formal' | 'acolhedor' | 'direto'>('padrao');

  const getWhatsAppScriptByTone = () => {
    switch (selectedTone) {
      case 'formal':
        return 'Compreendo perfeitamente. Trata-se de uma decisão relevante e sua total segurança é nossa prioridade.\n\nPara que eu possa lhe orientar da melhor forma: restou algum ponto em aberto sobre o procedimento para que sinta ser o momento adequado de darmos início?';
      case 'acolhedor':
        return 'Entendo completamente, de verdade! Cuidar do nosso rosto é algo muito especial e você precisa estar com o coração 100% tranquilo.\n\nMe conta com carinho: o que exatamente ficou faltando para você sentir que agora é o seu momento de cuidar de você?';
      case 'direto':
        return 'Entendo perfeitamente, você precisa se sentir segura antes de começar.\n\nPara eu te ajudar com clareza: o que exatamente pesou mais na sua decisão agora — o investimento ou alguma dúvida técnica do procedimento?';
      default:
        return scriptWhatsAppBase;
    }
  };

  const getAudioScriptByTone = () => {
    switch (selectedTone) {
      case 'formal':
        return 'Prezada paciente, tudo bem? Entro em contato para dar seguimento ao nosso atendimento sobre o procedimento avaliado. Como estamos organizando a grade de agendamentos da próxima semana, gostaria de verificar se restou alguma dúvida pontual sobre o protocolo que possamos esclarecer para sua total tranquilidade.';
      case 'acolhedor':
        return 'Oi [Nome da Paciente], tudo bem com você? Passei aqui para te dar um abraço e um retorno carinhoso. Lembrei da nossa conversa sobre [procedimento] e fiquei imaginando o bem que esse cuidado vai te fazer. Me conta: conseguiu pensar sobre aquele ponto ou quer tirar mais alguma dúvida comigo para se sentir bem segura?';
      case 'direto':
        return 'Oi [Nome], tudo bem? Passando rápido porque estamos fechando a grade de horários da próxima semana. Você conseguiu avaliar aquele ponto que conversamos sobre o [procedimento] ou quer alinhar mais algum detalhe antes de garantirmos seu horário?';
      default:
        return scriptAudioBase;
    }
  };

  const currentScript = activeTab === 'whatsapp' ? getWhatsAppScriptByTone() : getAudioScriptByTone();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScript);
    setCopied(true);
    toast.success('Script copiado! Pronto para colar no WhatsApp.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E7E4DC] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
      {/* 1. REAL DESKTOP BROWSER TOP BAR */}
      <div className="bg-[#F8F7F4] px-4 py-2.5 border-b border-[#EBE7DF] flex items-center justify-between gap-4">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Iza Online • Método Roones</span>
        </div>
      </div>

      {/* 2. REAL APP BODY: Authentic Sidebar + Real Chat Workspace */}
      <div className="grid grid-cols-12 min-h-[460px] sm:min-h-[520px]">
        {/* LEFT: Authentic Roones Sidebar (Desktop Layout) */}
        <aside className="hidden md:flex md:col-span-3 lg:col-span-3 bg-[#111216] text-[#EBEAE6] p-4 flex-col justify-between border-r border-[#22242B]">
          <div className="space-y-6">
            {/* Roones Brand Header */}
            <div className="text-center py-2 border-b border-white/10 pb-4">
              <h2 className="text-xl font-serif font-extrabold tracking-[0.18em] text-[#C9A96E] leading-tight">
                ROONES
              </h2>
              <span className="text-[8px] font-sans font-semibold tracking-[0.3em] text-[#8C8F98] uppercase block mt-0.5">
                PERFORMANCE
              </span>
              <div className="w-6 h-0.5 bg-[#C9A96E] mx-auto mt-2 opacity-80" />
            </div>

            {/* Real Navigation Items from Sidebar.tsx */}
            <nav className="space-y-1 text-xs">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#C9A96E]/20 text-[#E8D2A7] border-l-2 border-[#C9A96E] font-semibold">
                <Bot className="w-4 h-4 text-[#C9A96E]" />
                <span className="truncate">Iza • Mentora</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[#8E929C] hover:text-white transition-colors">
                <UserCheck className="w-4 h-4 text-[#6A6D76]" />
                <span className="truncate">Simulador Roleplay</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[#8E929C] hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 text-[#6A6D76]" />
                <span className="truncate">Banco de Objeções</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[#8E929C] hover:text-white transition-colors">
                <User className="w-4 h-4 text-[#6A6D76]" />
                <span className="truncate">Meu Espaço</span>
              </div>
            </nav>
          </div>

          {/* Sidebar Footer User Info */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-lg bg-[#C9A96E]/20 border border-[#C9A96E]/40 text-[#C9A96E] flex items-center justify-center text-xs font-bold font-serif">
                CL
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">Clínica Estética</p>
                <p className="text-[9px] text-[#7A7D87]">Recepção Comercial</p>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT: Authentic Iza Workspace (ChatInterface.tsx) */}
        <main className="col-span-12 md:col-span-9 lg:col-span-9 flex flex-col justify-between bg-[#FBFBFA]">
          {/* REAL COMMAND BAR */}
          <div className="bg-white border-b border-[#EBE7DF] px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shrink-0">
            {/* Identity */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#966B24]/20 to-[#966B24]/5 border border-[#966B24]/30 flex items-center justify-center text-[#7A5416]">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-sm text-[#141517]">Iza</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F4EFE6] text-[#7A5416] border border-[#E8DFC9] uppercase">
                    Mentora
                  </span>
                </div>
                <span className="text-[10px] text-[#7A7D87] block truncate">
                  Método Roones • 24/7 Ativo
                </span>
              </div>
            </div>

            {/* Segmented Mode Selector from ChatInterface.tsx */}
            <div className="flex items-center p-1 bg-[#F2EFE8] rounded-xl border border-[#E5E1D8]">
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'whatsapp'
                    ? 'bg-white text-[#141517] shadow-xs'
                    : 'text-[#6E7179] hover:text-[#141517]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
                {activeTab === 'whatsapp' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('audio')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-white text-[#141517] shadow-xs'
                    : 'text-[#6E7179] hover:text-[#141517]'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-sky-600" />
                <span>Áudio / Voz</span>
                {activeTab === 'audio' && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
              </button>
            </div>

            {/* Clean Quick Actions */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                <Camera className="w-3 h-3 text-emerald-600" />
                <span>Print</span>
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                <UserCheck className="w-3 h-3 text-amber-700" />
                <span>Roleplay</span>
              </span>
            </div>
          </div>

          {/* CHAT MESSAGES AREA (Authentic Dialog) */}
          <div className="p-3 sm:p-5 space-y-4 flex-1 overflow-y-auto max-h-[380px]">
            {/* 1. User Message (Clinic Secretary asking Iza) */}
            <div className="flex gap-2.5 justify-end">
              <div className="max-w-[88%] sm:max-w-[78%] bg-[#966B24] text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm">
                <p className="font-medium">
                  {activeTab === 'whatsapp'
                    ? 'A paciente mandou no WhatsApp: "Achei o valor do bioestimulador alto... vou pensar e qualquer coisa te retorno". O que responder sem dar desconto?'
                    : 'Como gravo um áudio no WhatsApp de 25 segundos para reaquecer essa paciente com acolhimento e postura de autoridade?'}
                </p>
                <span className="block text-[9px] text-[#E8D4B0] text-right mt-1 font-mono">11:04</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#966B24] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* 2. Iza Response with REAL WhatsAppScriptCard */}
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-stone-200 text-[#7A5416] border border-[#C9A96E]/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-3 max-w-[95%]">
                {/* Authentic WhatsApp Preview Card from WhatsAppScriptCard.tsx */}
                <div className="rounded-xl border border-emerald-600/30 bg-white overflow-hidden shadow-xs">
                  {/* Card Header Bar */}
                  <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                        {activeTab === 'whatsapp' ? (
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-800" />
                        ) : (
                          <Mic className="w-3.5 h-3.5 text-sky-800" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 block">
                          {activeTab === 'whatsapp'
                            ? 'MENSAGEM PRONTA PARA WHATSAPP'
                            : 'ROTEIRO DE ÁUDIO SUGERIDO (~25s)'}
                        </span>
                        <span className="text-[9px] text-emerald-800 font-medium block">
                          1-Clique para colar na conversa com a paciente
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Botão Ouvir mantido aparente e visualmente autêntico, porém não clicável na demonstração para aguçar curiosidade */}
                      <div
                        title="Entonação e voz humanizada da Iza disponíveis no acesso completo"
                        className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-stone-800 border border-stone-300 flex items-center gap-1 shadow-2xs select-none cursor-default"
                        role="img"
                        aria-label="Ouvir demonstração de áudio"
                      >
                        <Volume2 className="w-3 h-3 text-[#7A5416]" />
                        <span>Ouvir</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Real WhatsApp Bubble Preview Body */}
                  <div className="p-3 bg-[#EFEAE2]/60">
                    <div className="bg-[#DCF8C6] border border-emerald-300/80 rounded-xl rounded-tl-none p-3 shadow-xs space-y-2.5">
                      <p className="text-xs leading-relaxed text-neutral-900 font-normal whitespace-pre-line">
                        {currentScript}
                      </p>
                      <div className="flex items-center justify-between pt-1.5 text-[9px] text-stone-600 border-t border-emerald-800/10">
                        <span className="text-emerald-900 font-semibold">
                          {currentScript.length} caracteres • Pronto para envio
                        </span>
                        <span className="text-emerald-800 font-mono font-medium">Agora ✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real Expandable Roones Strategy Accordion from Screenshot */}
                <div className="rounded-xl border border-amber-300/80 bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setStrategyOpen(!strategyOpen)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-amber-50/60 transition-colors cursor-pointer border-b border-stone-200"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#966B24]" />
                      <div>
                        <span className="text-[11px] font-bold text-stone-900 block leading-tight">
                          Visão de Bastidores • Método Roones
                        </span>
                        <span className="text-[9.5px] text-stone-500 font-normal block leading-tight">
                          Por que essa abordagem funciona e o que observar a seguir
                        </span>
                      </div>
                    </div>
                    {strategyOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    )}
                  </button>

                  {strategyOpen && (
                    <div className="p-3.5 bg-amber-50/20 text-[11px] text-stone-700 leading-relaxed border-t border-amber-100 space-y-3">
                      {activeTab === 'whatsapp' ? (
                        <>
                          <p className="font-semibold text-stone-900 text-xs">O que observar na próxima resposta:</p>
                          <ul className="space-y-2 text-[10.5px]">
                            <li>
                              <strong className="text-stone-900">• Se ela falar sobre o preço novamente:</strong>
                              <span className="block text-stone-600 mt-0.5">
                                Ela ainda não percebeu valor suficiente no procedimento. Você deve reforçar os benefícios a longo prazo do bioestimulador (como a produção natural de colágeno) e perguntar o que ela busca melhorar na pele.
                              </span>
                            </li>
                            <li>
                              <strong className="text-stone-900">• Se ela falar sobre medo ou insegurança:</strong>
                              <span className="block text-stone-600 mt-0.5">
                                Ela precisa de mais educação sobre o procedimento. Reforce a segurança e a naturalidade dos resultados.
                              </span>
                            </li>
                            <li>
                              <strong className="text-stone-900">• Se ela for evasiva:</strong>
                              <span className="block text-stone-600 mt-0.5">
                                Ela pode estar apenas comparando com outras clínicas. Mantenha a porta aberta, coloque-se à disposição para tirar dúvidas e marque um follow-up em 2 ou 3 dias.
                              </span>
                            </li>
                          </ul>

                          <div className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-[10.5px] text-stone-700 italic">
                            Você está no caminho certo. O objetivo dessa mensagem não é forçar o agendamento, mas mostrar que você é uma profissional atenciosa que realmente se importa com a jornada dela. Pode enviar com tranquilidade!
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Real Audio Execution Tips from User Screenshot 2 */}
                          <div className="space-y-1.5">
                            <p className="font-bold text-stone-900 text-xs text-[#966B24]">
                              Dicas para a execução (Postura e Tom):
                            </p>
                            <ul className="space-y-1.5 text-[10.5px]">
                              <li>
                                <strong className="text-stone-900">• [Tom de voz]:</strong> Mantenha um tom calmo, pausado e com um sorriso no rosto enquanto fala (isso muda a ressonância da voz e soa muito mais acolhedor).
                              </li>
                              <li>
                                <strong className="text-stone-900">• [Pausas estratégicas]:</strong> Respeite as vírgulas. Não tente falar tudo rápido para caber no tempo. Se o áudio ficar com 22 ou 25 segundos, está perfeito. A calma transmite autoridade.
                              </li>
                              <li>
                                <strong className="text-stone-900">• [Postura]:</strong> Sente-se de forma ereta. Isso projeta melhor o seu diafragma e dá mais firmeza à sua fala.
                              </li>
                              <li>
                                <strong className="text-stone-900">• [O que evitar]:</strong> Fuja de termos como "tá bom?", "né?", ou gírias. Seja direta, porém gentil.
                              </li>
                            </ul>
                          </div>

                          <div className="h-[1px] bg-amber-200/80 my-2" />

                          <div className="space-y-1.5">
                            <p className="font-bold text-stone-900 text-xs">
                              O que observar na próxima resposta:
                            </p>
                            <ul className="space-y-1.5 text-[10.5px]">
                              <li>
                                <strong className="text-stone-900">• Abertura para o diálogo:</strong> Observe se ela traz uma nova objeção ou se ela apenas confirma que "ainda está pensando".
                              </li>
                              <li>
                                <strong className="text-stone-900">• Se ela for evasiva:</strong> Se ela responder algo vago, não pressione. O próximo passo será investigar o que falta para ela se sentir 100% segura.
                              </li>
                              <li>
                                <strong className="text-stone-900">• Se ela perguntar o preço novamente:</strong> Mantenha a calma e reforce o valor do resultado que ela busca, trazendo a conversa de volta para o benefício e não para o custo.
                              </li>
                            </ul>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-[10.5px] text-stone-700 italic">
                            Você está no caminho certo. O objetivo desse áudio não é forçar o agendamento, mas mostrar que você é uma profissional atenciosa que realmente se importa com a jornada dela. Pode gravar com tranquilidade!
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Real Tone Adjuster Toolbar (Padrão da Iza em todos os modos) */}
                <div className="p-2.5 bg-stone-100/80 border border-stone-200/90 rounded-xl space-y-1.5">
                  <span className="text-[9.5px] font-bold tracking-wider text-stone-600 uppercase block">
                    Ajustar Tom do Script:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTone('formal')}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedTone === 'formal'
                          ? 'bg-[#141517] text-white shadow-2xs'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-2xs'
                      }`}
                    >
                      <span>👔</span>
                      <span>Mais Formal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTone('acolhedor')}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedTone === 'acolhedor'
                          ? 'bg-[#141517] text-white shadow-2xs'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-2xs'
                      }`}
                    >
                      <span>🤍</span>
                      <span>Mais Acolhedor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTone('direto')}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedTone === 'direto'
                          ? 'bg-[#141517] text-white shadow-2xs'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-2xs'
                      }`}
                    >
                      <span>🎯</span>
                      <span>Mais Direto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTone('padrao')}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedTone === 'padrao'
                          ? 'bg-[#966B24] text-white shadow-2xs'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-2xs'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Outra Opção (Original)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REAL CHAT INPUT BAR (ChatInterface.tsx) */}
          <div className="p-3 bg-white border-t border-[#EBE7DF] flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-[#E5E1D8] flex items-center justify-center text-[#7A7D87] hover:text-[#966B24] transition-colors"
              title="Carregar Print do WhatsApp"
            >
              <Camera className="w-4 h-4" />
            </button>

            <div className="flex-1 px-3 py-2 bg-[#F8F7F4] border border-[#E5E1D8] rounded-xl text-xs text-[#8C8F98] truncate">
              Compartilhe a dúvida ou a mensagem da paciente para estruturarmos a melhor resposta...
            </div>

            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-[#966B24] hover:bg-[#7A5416] text-white flex items-center justify-center transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
