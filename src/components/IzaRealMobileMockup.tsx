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
  ShieldCheck,
  MessageCircle,
  Sun,
  Send,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

export const IzaRealMobileMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'audio'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'padrao' | 'formal' | 'acolhedor' | 'direto'>('padrao');

  const scriptWhatsAppBase =
    'Entendo perfeitamente, é uma decisão importante e você precisa se sentir segura com ela.\n\nPara eu te ajudar melhor, o que exatamente ficou faltando para você sentir que este é o momento ideal para iniciar o tratamento?';

  const scriptAudioBase =
    'Oi [Nome da Paciente], tudo bem? Passei aqui para te dar um retorno. Lembrei do que conversamos sobre [citar o procedimento] e fiquei pensando no quanto esse cuidado pode trazer mais leveza para o seu dia a dia. Como a nossa agenda está começando a organizar os atendimentos da próxima semana, queria saber se você conseguiu pensar sobre aquele ponto que comentamos ou se ainda tem alguma dúvida que eu possa esclarecer para te deixar mais segura?';

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
    toast.success('Script copiado para o WhatsApp!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-[310px] sm:w-[330px] rounded-[44px] bg-[#0C0D11] p-3 shadow-2xl border-4 border-[#252830] select-none text-[#E6E4DD]">
      {/* Phone Speaker & Dynamic Island */}
      <div className="w-24 h-4 bg-[#1E2027] rounded-full mx-auto mb-2 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#0C0D11]" />
      </div>

      {/* Real Screen Canvas (Dark Theme as in Roones App Mobile Screenshot) */}
      <div className="rounded-[32px] bg-[#121318] overflow-hidden flex flex-col h-[560px] border border-[#232530] text-xs">
        {/* Status Bar */}
        <div className="px-5 py-1.5 flex items-center justify-between text-[11px] text-[#8C8F98] bg-[#121318]">
          <span className="font-semibold text-white">17:30</span>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-emerald-500 font-bold">5G</span>
            <span>82%</span>
          </div>
        </div>

        {/* Real Mobile Header (Screenshot 2 and 3) */}
        <div className="px-3.5 py-2 bg-[#16171E] border-b border-[#232530] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-[12px] text-[#C9A96E] tracking-[0.14em] block leading-tight">
                ROONES
              </span>
              <span className="text-[7.5px] font-sans font-semibold tracking-[0.16em] text-[#9FA2AB] uppercase leading-none mt-0.5 block">
                PERFORMANCE
              </span>
            </div>
            <div className="h-4 w-[1px] bg-white/15 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10.5px] font-bold text-white block truncate">
                Iza • Mentora Come...
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">
                  ONLINE 24/7
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-[#8C8F98]" />
            <div className="w-6 h-6 rounded-lg bg-[#C9A96E]/20 border border-[#C9A96E]/40 text-[#C9A96E] flex items-center justify-center text-[10px] font-bold font-serif">
              RO
            </div>
          </div>
        </div>

        {/* Mode Selector (WhatsApp • | Áudio / Voz | Diagnóstico) */}
        <div className="px-3 py-1.5 bg-[#121318] border-b border-[#232530] flex items-center gap-1.5 text-[10.5px]">
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-[#1D212A] text-[#C9A96E] border border-[#C9A96E]/40 shadow-xs'
                : 'text-[#8C8F98] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-[#1D212A] text-[#C9A96E] border border-[#C9A96E]/40 shadow-xs'
                : 'text-[#8C8F98] hover:text-white'
            }`}
          >
            <Mic className="w-3 h-3 text-sky-400" />
            <span>Áudio / Voz</span>
          </button>

          <span className="text-[#646875] text-[10px] hidden sm:inline px-1">Diagnóstico</span>
        </div>

        {/* Action Pills Bar: Print, Treino, Guia */}
        <div className="px-3 py-1.5 bg-[#16171E] border-b border-[#232530] flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 font-medium">
              <Camera className="w-3 h-3 text-emerald-400" />
              <span>Print</span>
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-200 border border-amber-700/50 font-medium">
              <UserCheck className="w-3 h-3 text-amber-400" />
              <span>Treino</span>
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E2029] text-[#C9A96E] border border-[#C9A96E]/30 font-medium">
              <Sparkles className="w-3 h-3 text-[#C9A96E]" />
              <span>Guia</span>
            </span>
          </div>
        </div>

        {/* Real Chat Area with WhatsApp Script Card & Visão de Bastidores */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-[#101116] text-[#E6E4DD]">
          {/* User Request Bubble */}
          <div className="flex justify-end">
            <div className="max-w-[90%] p-2.5 rounded-2xl rounded-tr-none bg-[#966B24] text-white text-[11px] leading-relaxed shadow-sm">
              <p>
                {activeTab === 'whatsapp'
                  ? 'A paciente mandou no WhatsApp: "Achei o valor do bioestimulador alto... vou pensar e qualquer coisa te retorno". O que responder sem dar desconto?'
                  : 'Como gravo um áudio no WhatsApp de 25 segundos para reaquecer essa paciente com acolhimento e postura de autoridade?'}
              </p>
              <span className="block text-[8.5px] text-[#F3E6CE] text-right mt-1 font-mono">11:04</span>
            </div>
          </div>

          {/* Iza Response Card (Green Frame from Screenshot) */}
          <div className="rounded-xl border border-emerald-500/40 bg-[#0B1A14] overflow-hidden shadow-md">
            {/* Header: MENSAGEM PR... / ROTEIRO DE ÁUDIO + Ouvir + Copiar */}
            <div className="px-2.5 py-2 border-b border-emerald-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {activeTab === 'whatsapp' ? 'MENSAGEM PRONTA' : 'ROTEIRO DE ÁUDIO SUGERIDO (~25S)'}
                </span>
                <span className="text-[8.5px] text-emerald-400/90 font-medium block">
                  1-Clique para colar na conversa com a paciente
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Botão Ouvir mantido aparente, porém não clicável na demonstração para aguçar curiosidade */}
                <div
                  className="p-1 rounded-md bg-[#132A21] border border-emerald-700/60 text-emerald-300 cursor-default select-none"
                  title="Áudio com voz da Iza disponível no acesso completo"
                  role="img"
                  aria-label="Ouvir demonstração"
                >
                  <Volume2 className="w-3 h-3 text-emerald-300" />
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Bubble preview */}
            <div className="p-2.5 bg-[#06110D]/70">
              <div className="p-2.5 rounded-lg bg-[#0E2E23] border border-emerald-600/50 text-[10.5px] text-emerald-50 leading-relaxed whitespace-pre-line shadow-xs">
                {currentScript}
                <div className="flex items-center justify-between pt-1.5 mt-1.5 text-[9px] text-emerald-400 border-t border-emerald-800/30">
                  <span>{currentScript.length} caracteres • Pronto para envio</span>
                  <span className="font-mono">Agora ✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visão de Bastidores • Método Roones from Screenshot 2 and 3 */}
          <div className="p-2.5 rounded-xl bg-[#161821] border border-amber-500/30 text-[10px] text-[#C4C7D0] leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 text-[#E6C98B] font-bold text-[10.5px]">
              <Sparkles className="w-3 h-3 text-[#C9A96E]" />
              <span>Visão de Bastidores • Método Roones</span>
            </div>
            <p className="text-[9px] text-[#8C8F98]">
              Por que essa abordagem funciona e o que observar a seguir
            </p>

            {activeTab === 'whatsapp' ? (
              <div className="pt-1 text-[9.5px] space-y-1.5 text-[#E6E4DD]">
                <p className="font-semibold text-white">O que observar na próxima resposta:</p>
                <p>
                  <strong className="text-amber-300">• Se ela falar sobre o preço novamente:</strong>{' '}
                  Ela ainda não percebeu valor suficiente no procedimento. Você deve reforçar os benefícios a longo prazo do bioestimulador (como a produção natural de colágeno) e perguntar o que ela busca melhorar na pele.
                </p>
                <p>
                  <strong className="text-amber-300">• Se ela falar sobre medo ou insegurança:</strong>{' '}
                  Ela precisa de mais educação sobre o procedimento. Reforce a segurança e a naturalidade dos resultados.
                </p>
                <p>
                  <strong className="text-amber-300">• Se ela for evasiva:</strong>{' '}
                  Ela pode estar apenas comparando com outras clínicas. Mantenha a porta aberta, coloque-se à disposição para tirar dúvidas e marque um follow-up em 2 ou 3 dias.
                </p>

                <p className="text-[9px] text-amber-200/90 italic bg-amber-950/30 p-1.5 rounded border border-amber-700/30 mt-2">
                  Você está no caminho certo. O objetivo dessa mensagem não é forçar o agendamento, mas mostrar que você é uma profissional atenciosa que realmente se importa com a jornada dela. Pode enviar com tranquilidade!
                </p>
              </div>
            ) : (
              <div className="pt-1 text-[9.5px] space-y-2 text-[#E6E4DD]">
                <div>
                  <p className="font-bold text-[#E6C98B]">Dicas para a execução (Postura e Tom):</p>
                  <ul className="mt-1 space-y-1 text-[9px] text-[#C4C7D0]">
                    <li>• <strong className="text-white">[Tom de voz]:</strong> Mantenha um tom calmo, pausado e com sorriso no rosto.</li>
                    <li>• <strong className="text-white">[Pausas]:</strong> Respeite as vírgulas, não corra. 22 a 25 segundos é perfeito.</li>
                    <li>• <strong className="text-white">[Postura]:</strong> Sente-se ereta para projetar o diafragma.</li>
                    <li>• <strong className="text-white">[O que evitar]:</strong> Fuja de "tá bom?", "né?", ou gírias.</li>
                  </ul>
                </div>

                <div className="h-[1px] bg-white/10" />

                <div>
                  <p className="font-bold text-white">O que observar na próxima resposta:</p>
                  <ul className="mt-1 space-y-1 text-[9px] text-[#C4C7D0]">
                    <li>• <strong className="text-amber-300">Abertura:</strong> Observe se traz nova dúvida ou se ainda está pensando.</li>
                    <li>• <strong className="text-amber-300">Se for evasiva:</strong> Não pressione, mantenha a porta aberta.</li>
                    <li>• <strong className="text-amber-300">Preço novamente:</strong> Traga a conversa de volta para o benefício.</li>
                  </ul>
                </div>

                <p className="text-[9px] text-amber-200/90 italic bg-amber-950/30 p-1.5 rounded border border-amber-700/30">
                  Você está no caminho certo. O objetivo desse áudio não é forçar o agendamento, mas mostrar que você é uma profissional atenciosa que realmente se importa com a jornada dela. Pode gravar com tranquilidade!
                </p>
              </div>
            )}
          </div>

          {/* Tone Adjuster Toolbar (Padrão da Iza em todos os modos) */}
          <div className="p-2 bg-[#121319] border border-white/10 rounded-xl space-y-1.5">
            <span className="text-[8.5px] font-bold tracking-wider text-[#A0A4B0] uppercase block">
              Ajustar Tom do Script:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTone('formal')}
                className={`px-2 py-1 rounded-lg text-[9.5px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTone === 'formal'
                    ? 'bg-[#C9A96E] text-[#121318]'
                    : 'bg-[#1A1C24] text-[#C4C7D0] hover:bg-[#222530] border border-white/5'
                }`}
              >
                <span>👔</span>
                <span>Mais Formal</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTone('acolhedor')}
                className={`px-2 py-1 rounded-lg text-[9.5px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTone === 'acolhedor'
                    ? 'bg-[#C9A96E] text-[#121318]'
                    : 'bg-[#1A1C24] text-[#C4C7D0] hover:bg-[#222530] border border-white/5'
                }`}
              >
                <span>🤍</span>
                <span>Mais Acolhedor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTone('direto')}
                className={`px-2 py-1 rounded-lg text-[9.5px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTone === 'direto'
                    ? 'bg-[#C9A96E] text-[#121318]'
                    : 'bg-[#1A1C24] text-[#C4C7D0] hover:bg-[#222530] border border-white/5'
                }`}
              >
                <span>🎯</span>
                <span>Mais Direto</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTone('padrao')}
                className={`px-2 py-1 rounded-lg text-[9.5px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTone === 'padrao'
                    ? 'bg-[#966B24] text-white'
                    : 'bg-[#1A1C24] text-[#C4C7D0] hover:bg-[#222530] border border-white/5'
                }`}
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Original</span>
              </button>
            </div>
          </div>
        </div>

        {/* Input Bar (Screenshot 2 and 3) */}
        <div className="p-2.5 bg-[#16171E] border-t border-[#232530] flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-[#8C8F98]" />
          <div className="flex-1 text-[10px] text-[#6E7280] truncate">
            Digite a dúvida ou situação da paciente...
          </div>
          <Send className="w-3.5 h-3.5 text-[#C9A96E]" />
        </div>

        {/* Real Mobile Bottom Navigation Bar (Screenshot 2 and 3) */}
        <div className="bg-[#121318] border-t border-[#232530] py-2 px-2 flex items-center justify-around text-[8.5px] shrink-0">
          <div className="flex flex-col items-center text-[#C9A96E] font-bold">
            <Bot className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="mt-0.5">Iza Mentora</span>
          </div>

          <div className="flex flex-col items-center text-[#8C8F98]">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="mt-0.5">Simulador</span>
          </div>

          <div className="flex flex-col items-center text-[#8C8F98]">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="mt-0.5">Objeções</span>
          </div>

          <div className="flex flex-col items-center text-[#8C8F98]">
            <User className="w-3.5 h-3.5" />
            <span className="mt-0.5">Meu Espaço</span>
          </div>

          <div className="flex flex-col items-center text-[#8C8F98]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="mt-0.5">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
