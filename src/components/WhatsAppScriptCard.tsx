import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Volume2, 
  VolumeX, 
  Share2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { parseAiMessageParts } from '../utils/textUtils';

interface WhatsAppScriptCardProps {
  text: string;
  isSpeaking: boolean;
  onSpeak: () => void;
  onRefineTone?: (tone: string) => void;
  onRetry?: () => void;
  isLatestAi?: boolean;
  isTyping?: boolean;
  activeMode?: string;
}

export const WhatsAppScriptCard: React.FC<WhatsAppScriptCardProps> = ({
  text,
  isSpeaking,
  onSpeak,
  onRefineTone,
  onRetry,
  isLatestAi = false,
  isTyping = false,
  activeMode = 'whatsapp'
}) => {
  const [copied, setCopied] = useState(false);
  const [isStrategyExpanded, setIsStrategyExpanded] = useState(true);

  const isContingencyNotice = text.includes('Nota da Iza') || text.includes('pico de demanda') || text.includes('demanda temporária');

  const parsed = parseAiMessageParts(text);

  const handleCopy = async () => {
    const textToCopy = parsed.hasScript ? parsed.scriptText : text;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Script copiado com sucesso! Pronto para colar no WhatsApp.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Erro ao copiar texto.');
    }
  };

  const handleShareWhatsApp = () => {
    const textToShare = parsed.hasScript ? parsed.scriptText : text;
    const url = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  // If the message does NOT contain a distinct script (e.g. general conversational greeting),
  // render in high-end editorial markdown.
  if (!parsed.hasScript) {
    return (
      <div className="space-y-3">
        <div className="markdown-body text-vertus-white/90 light:text-stone-900 text-xs sm:text-sm leading-relaxed">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>

        <div className="pt-2 border-t border-vertus-gray/60 light:border-stone-300 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
          <span className="text-vertus-white/40 light:text-stone-600 flex items-center gap-1.5 font-medium text-[10px] sm:text-[11px] shrink-0">
            <Sparkles className="w-3 h-3 text-vertus-gold light:text-amber-800 shrink-0" />
            <span>Orientação Iza</span>
          </span>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
            {onRetry && isLatestAi && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-vertus-gold/15 border border-vertus-gold/40 text-vertus-gold light:bg-amber-100 light:text-amber-900 light:border-amber-300 hover:bg-vertus-gold/25 transition-all text-[11px] sm:text-xs font-semibold cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                title="Reprocessar e gerar nova resposta via IA em tempo real"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">Tentar Novamente</span>
                <span className="sm:hidden">Refazer</span>
              </button>
            )}

            <button
              onClick={onSpeak}
              className={clsx(
                "flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all text-[11px] sm:text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap",
                isSpeaking
                  ? "bg-vertus-gold text-vertus-bg font-bold animate-pulse"
                  : "text-vertus-white/60 hover:text-vertus-white hover:bg-vertus-gray light:text-stone-700 light:hover:text-stone-950 light:hover:bg-stone-200/80"
              )}
              title={isSpeaking ? "Pausar áudio" : "Ouvir com voz humana"}
            >
              {isSpeaking ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-vertus-gold light:text-amber-800" />}
              <span>{isSpeaking ? 'Pausar' : 'Ouvir'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-vertus-white/70 hover:text-vertus-white hover:bg-vertus-gray light:text-stone-700 light:hover:text-stone-950 light:hover:bg-stone-200/80 transition-all text-[11px] sm:text-xs cursor-pointer font-medium shrink-0 whitespace-nowrap"
            >
              {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 light:text-emerald-700 shrink-0" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Script Message: Render dedicated luxury WhatsApp Preview Card + Strategy Section
  return (
    <div className="space-y-4">
      {/* 1. WHATSAPP SCRIPT PREVIEW CARD */}
      <div className="rounded-2xl border border-emerald-500/30 light:border-emerald-600/30 bg-gradient-to-b from-emerald-950/20 to-black/30 light:from-emerald-50/90 light:to-white/95 backdrop-blur-md overflow-hidden shadow-lg light:shadow-md">
        {/* Card Header Bar */}
        <div className="px-3.5 sm:px-4 py-2.5 bg-emerald-950/40 light:bg-emerald-100/90 border-b border-emerald-500/20 light:border-emerald-300/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 light:bg-emerald-200/90 border border-emerald-500/40 light:border-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-800" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-300 light:text-emerald-950 block truncate">
                {activeMode === 'audio' ? 'Roteiro de Áudio Sugerido' : 'Mensagem Pronta para WhatsApp'}
              </span>
              <span className="text-[9px] text-emerald-400/80 light:text-emerald-800 font-medium block">
                {activeMode === 'audio' ? 'Fale de forma natural e pausada (~25s)' : '1-Clique para colar na conversa com a paciente'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={onSpeak}
              className={clsx(
                "px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 whitespace-nowrap",
                isSpeaking
                  ? "bg-vertus-gold text-vertus-bg font-bold animate-pulse shadow-sm"
                  : "bg-vertus-card/80 hover:bg-vertus-card text-vertus-white/80 hover:text-vertus-gold border border-vertus-gray/60 light:bg-white light:text-stone-800 light:border-stone-300 light:hover:text-emerald-800 light:shadow-xs"
              )}
              title={isSpeaking ? "Pausar leitura de voz" : "Ouvir entonação humana recomendada"}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 text-vertus-gold light:text-amber-800 shrink-0" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Pausar' : 'Ouvir'}</span>
            </button>

            <button
              onClick={handleCopy}
              className={clsx(
                "px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap",
                copied
                  ? "bg-emerald-500 text-vertus-bg font-bold light:bg-emerald-600 light:text-white"
                  : "bg-emerald-500/90 hover:bg-emerald-400 text-vertus-bg light:bg-emerald-600 light:hover:bg-emerald-700 light:text-white"
              )}
              title="Copiar exclusivamente a mensagem para enviar à paciente"
            >
              {copied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Bubble Preview Body */}
        <div className="p-3.5 sm:p-4.5 bg-black/20 light:bg-[#EFEAE2]/70">
          <div className="bg-[#111B21]/95 light:bg-[#DCF8C6] border border-emerald-500/20 light:border-emerald-300/80 rounded-2xl rounded-tl-sm p-3.5 sm:p-4 shadow-md light:shadow-sm space-y-2.5 relative">
            <p className="text-xs sm:text-[13px] leading-relaxed text-vertus-white/95 light:text-neutral-900 whitespace-pre-wrap selection:bg-emerald-500/30 selection:text-white font-sans font-normal light:font-medium">
              {parsed.scriptText}
            </p>

            <div className="flex items-center justify-between pt-1 text-[10px] text-vertus-white/40 light:text-stone-600 border-t border-white/5 light:border-emerald-800/15">
              <span className="text-[10px] text-emerald-400/90 light:text-emerald-900 font-semibold">
                {parsed.scriptText.length} caracteres • Pronto para envio
              </span>
              <span className="flex items-center gap-1 text-emerald-400 light:text-emerald-800 font-mono font-medium">
                <span>Agora</span>
                <span>✓✓</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BASTIDORES & ESTRATÉGIA DO MÉTODO VERTUS */}
      {parsed.strategyText && (
        <div className="rounded-xl border border-vertus-gold/20 light:border-amber-300/80 bg-vertus-card/70 light:bg-white overflow-hidden transition-all light:shadow-xs">
          <button
            type="button"
            onClick={() => setIsStrategyExpanded(!isStrategyExpanded)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-vertus-gold/5 light:hover:bg-amber-50/60 transition-colors cursor-pointer border-b border-vertus-gray/40 light:border-stone-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-vertus-gold/15 light:bg-amber-100 flex items-center justify-center text-vertus-gold light:text-amber-800">
                <Sparkles className="w-3 h-3" />
              </div>
              <div>
                <span className="text-xs font-bold text-vertus-gold light:text-amber-900 tracking-wide block">
                  Visão de Bastidores • Método Vertus
                </span>
                <span className="text-[10px] text-vertus-white/50 light:text-stone-600 block">
                  Por que essa abordagem funciona e o que observar a seguir
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-vertus-white/50 light:text-stone-600 hover:text-vertus-white light:hover:text-stone-900">
              <span className="hidden sm:inline">{isStrategyExpanded ? 'Recolher' : 'Expandir'}</span>
              {isStrategyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isStrategyExpanded && (
            <div className="p-3.5 sm:p-4 bg-vertus-bg/40 light:bg-[#FAF8F5] markdown-body text-vertus-white/85 light:text-stone-900 text-xs sm:text-[13px] leading-relaxed border-t border-transparent animate-in fade-in duration-200">
              <ReactMarkdown>{parsed.strategyText}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* 3. TONE REFINEMENT PILLS (Only for latest AI message) */}
      {isLatestAi && !isTyping && onRefineTone && (
        <div className="pt-2 border-t border-vertus-gray/40 light:border-stone-300 space-y-1.5">
          <p className="text-[9px] uppercase tracking-widest text-vertus-white/40 light:text-stone-600 font-bold">
            Ajustar Tom do Script:
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onRefineTone('formal')}
              className="px-2.5 py-1 rounded-lg bg-vertus-bg/80 light:bg-white border border-vertus-gray light:border-stone-300 hover:border-vertus-gold/40 light:hover:border-amber-500 text-[11px] text-vertus-white/80 light:text-stone-800 hover:text-vertus-gold light:hover:text-amber-900 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <span>🎩</span>
              <span>Mais Formal</span>
            </button>
            <button
              onClick={() => onRefineTone('acolhedor')}
              className="px-2.5 py-1 rounded-lg bg-vertus-bg/80 light:bg-white border border-vertus-gray light:border-stone-300 hover:border-vertus-gold/40 light:hover:border-amber-500 text-[11px] text-vertus-white/80 light:text-stone-800 hover:text-vertus-gold light:hover:text-amber-900 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <span>🤍</span>
              <span>Mais Acolhedor</span>
            </button>
            <button
              onClick={() => onRefineTone('direto')}
              className="px-2.5 py-1 rounded-lg bg-vertus-bg/80 light:bg-white border border-vertus-gray light:border-stone-300 hover:border-vertus-gold/40 light:hover:border-amber-500 text-[11px] text-vertus-white/80 light:text-stone-800 hover:text-vertus-gold light:hover:text-amber-900 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <span>🎯</span>
              <span>Mais Direto</span>
            </button>
            <button
              onClick={() => onRefineTone('alternativa')}
              className="px-2.5 py-1 rounded-lg bg-vertus-bg/80 light:bg-white border border-vertus-gray light:border-stone-300 hover:border-vertus-gold/40 light:hover:border-amber-500 text-[11px] text-vertus-white/80 light:text-stone-800 hover:text-vertus-gold light:hover:text-amber-900 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3 h-3 text-vertus-gold light:text-amber-800" />
              <span>Outra Opção</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
