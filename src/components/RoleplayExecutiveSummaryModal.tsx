import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  X, 
  ArrowRight,
  TrendingUp,
  Brain,
  Quote
} from 'lucide-react';
import { speakIzaText, stopIzaSpeech } from '../utils/speechUtils';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { RoleplayExecutiveSummary } from '../types';
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface RoleplayMessage {
  role: 'user' | 'assistant' | 'ai';
  text: string;
}

interface RoleplayExecutiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioTitle: string;
  scenarioId?: string;
  messages: RoleplayMessage[];
}

export const RoleplayExecutiveSummaryModal: React.FC<RoleplayExecutiveSummaryModalProps> = ({
  isOpen,
  onClose,
  scenarioTitle,
  scenarioId,
  messages
}) => {
  const { user, updateUser } = useAuth();
  const { addActivity } = useData();

  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<RoleplayExecutiveSummary | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Stop speech when closing modal
  useEffect(() => {
    if (!isOpen) {
      stopIzaSpeech();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Generate or fetch summary when opening
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      generateSummary();
    }
  }, [isOpen]);

  const generateSummary = async () => {
    setIsLoading(true);
    setIsSaved(false);

    try {
      const token = localStorage.getItem('vertus_auth_token');
      const res = await fetch('/api/ai/roleplay-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          scenarioTitle,
          scenarioId,
          messages
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Erro na requisição da IA, aplicando motor de diagnóstico Vertus:', err);
    }

    // Heuristic diagnostic fallback (Garante entrega imediata mesmo sem rede ou API key)
    const userReplies = messages.filter(m => m.role === 'user');
    const userTextCombined = userReplies.map(m => m.text).join(' ').toLowerCase();

    // Check specific Vertus patterns
    const askedQuestions = (userTextCombined.match(/\?/g) || []).length;
    const mentionedPriceEarly = userTextCombined.includes('r$') || userTextCombined.includes('reais') || userTextCombined.includes('parcel');
    const validatedEmotion = userTextCombined.includes('entendo') || userTextCombined.includes('compreendo') || userTextCombined.includes('comum');
    const focusedOnDesire = userTextCombined.includes('incomoda') || userTextCombined.includes('deseja') || userTextCombined.includes('natural');

    let calculatedScore = 7.5;
    if (askedQuestions >= 2) calculatedScore += 1.0;
    if (validatedEmotion) calculatedScore += 0.8;
    if (focusedOnDesire) calculatedScore += 0.7;
    if (mentionedPriceEarly) calculatedScore -= 1.5;
    calculatedScore = Math.min(10, Math.max(5.5, Number(calculatedScore.toFixed(1))));

    const strengths: string[] = [];
    if (validatedEmotion) {
      strengths.push('Validação empática da paciente: você acolheu a dúvida sem rebater de imediato ou entrar na defensiva.');
    } else {
      strengths.push('Manutenção de postura respeitosa e tom educado ao longo da conversa.');
    }

    if (askedQuestions >= 1) {
      strengths.push('Uso de perguntas investigativas para entender o contexto antes de despejar informações.');
    } else {
      strengths.push('Clareza e objetividade ao responder as dúvidas iniciais da paciente.');
    }

    const improvements: string[] = [];
    if (mentionedPriceEarly) {
      improvements.push('Concessão precoce de valor: Você mencionou valores ou condições antes de consolidar o benefício e o desejo da paciente.');
    } else {
      improvements.push('Falta de ancoragem de valor: Poderia aprofundar mais o incômodo antes de avançar para a solução.');
    }

    if (askedQuestions < 2) {
      improvements.push('A conversa correu risco de morrer: É essencial finalizar cada resposta com uma pergunta estratégica (quem pergunta, conduz).');
    } else {
      improvements.push('Condução para o agendamento presencial: Lembrar de orientar a paciente para uma avaliação diagnóstica individualizada.');
    }

    const fallbackSummary: RoleplayExecutiveSummary = {
      id: 'summary-' + Date.now(),
      scenarioId,
      scenarioTitle,
      score: calculatedScore,
      headline: calculatedScore >= 8.5 
        ? 'Excelente condução consultiva com rapport e autoridade' 
        : calculatedScore >= 7.0 
        ? 'Boa condução comercial com pontos de aprimoramento em fechamento' 
        : 'Atendimento necessita de maior posicionamento e perguntas estratégicas',
      strengths,
      improvementAreas: improvements,
      recommendedScript: '"Compreendo perfeitamente sua cautela com o investimento, Maria. Antes de falarmos de números, me conta uma coisa: além do valor, o que é mais importante para você se sentir 100% segura com o resultado do procedimento?"',
      practicalTip: 'Metodologia Vertus: A paciente nunca compra o procedimento em si; ela compra a segurança, o rejuvenescimento e a autoestima. Conduza pelo desejo.',
      date: new Date().toLocaleDateString('pt-BR')
    };

    setSummary(fallbackSummary);
    setIsLoading(false);
  };

  const handleSpeakSummary = () => {
    if (!summary) return;

    if (isSpeaking) {
      stopIzaSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const textToSpeak = `Aqui está o seu Resumo Executivo da simulação. 
Nota de desempenho: ${summary.score} de 10. ${summary.headline}.
Primeiro, o que você fez de bom: ${summary.strengths.join('. ')}.
Segundo, onde você precisa ter atenção: ${summary.improvementAreas.join('. ')}.
Terceiro, sua frase recomendada para a próxima consulta: ${summary.recommendedScript}.
${summary.practicalTip || ''}`;

    speakIzaText(
      textToSpeak,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleCopySummary = () => {
    if (!summary) return;

    const formattedText = `📋 *RESUMO EXECUTIVO PÓS-ROLEPLAY • VERTUS PERFORMANCE*
🎯 *Cenário:* ${summary.scenarioTitle}
⭐ *Nota de Desempenho:* ${summary.score}/10 (${summary.headline})
📅 *Data:* ${summary.date}

🌟 *1. O QUE VOCÊ FEZ DE BOM (PONTOS FORTES):*
${summary.strengths.map(s => `• ${s}`).join('\n')}

⚠️ *2. ONDE VOCÊ PERDEU O CONTROLE DA CONVERSA (PONTOS DE ATENÇÃO):*
${summary.improvementAreas.map(i => `• ${i}`).join('\n')}

💡 *3. FRASE RECOMENDADA PARA A PRÓXIMA CONSULTA (SCRIPT DE OURO):*
${summary.recommendedScript}

📌 *Dica Prática:* ${summary.practicalTip || 'Quem faz a pergunta conduz a conversa.'}
`;

    navigator.clipboard.writeText(formattedText);
    setIsCopied(true);
    toast.success('Resumo Executivo copiado para a área de transferência!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveToDevelopmentPlan = () => {
    if (!summary) return;

    try {
      // 1. Salvar no localStorage de planos de desenvolvimento
      const existingPlansRaw = localStorage.getItem('vertus_dev_plans');
      const existingPlans = existingPlansRaw ? JSON.parse(existingPlansRaw) : [];
      const updatedPlans = [summary, ...existingPlans.filter((p: any) => p.id !== summary.id)].slice(0, 30);
      localStorage.setItem('vertus_dev_plans', JSON.stringify(updatedPlans));

      // 2. Registrar como atividade recente no sistema
      addActivity({
        userId: user?.id || 'guest',
        userName: user?.name || 'Consultora',
        userAvatar: user?.avatar,
        type: 'ROLEPLAY_COMPLETED',
        message: `Completou simulação de "${summary.scenarioTitle}" com Resumo Executivo (Nota ${summary.score}/10)`
      });

      // 3. Atribuir pontos de treino ao usuário
      if (user) {
        const bonusPoints = 75;
        updateUser({
          points: (user.points || 0) + bonusPoints
        });
        toast.success(`Salvo no seu Plano de Desenvolvimento! (+${bonusPoints} XP)`, {
          description: 'Acesse seu histórico e metas na aba Meu Espaço.'
        });
      }

      setIsSaved(true);
    } catch (err) {
      console.error('Erro ao salvar resumo:', err);
      toast.error('Erro ao salvar no plano de desenvolvimento.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-vertus-card border border-vertus-gold/40 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-vertus-gray/80 flex items-center justify-between gap-3 bg-vertus-card/95 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-vertus-gold/25 to-vertus-gold/5 border border-vertus-gold/40 flex items-center justify-center text-vertus-gold shadow-md shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-vertus-white">
                  Resumo Executivo Pós-Roleplay
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-vertus-gold/20 text-vertus-gold font-bold uppercase tracking-wider border border-vertus-gold/30">
                  Metodologia Vertus
                </span>
              </div>
              <p className="text-xs text-vertus-white/60 truncate max-w-sm sm:max-w-md mt-0.5">
                Cenário: <strong className="text-vertus-white/90">{scenarioTitle}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-vertus-gray/60 hover:bg-vertus-gray text-vertus-white/70 hover:text-vertus-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-vertus-gold/15 border border-vertus-gold/30 flex items-center justify-center text-vertus-gold animate-spin">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-vertus-white">Analisando sua condução comercial...</p>
                <p className="text-xs text-vertus-white/50 mt-1 max-w-xs">
                  A mentora Iza está extraindo seus pontos fortes, gargalos de conversão e a melhor frase de impacto.
                </p>
              </div>
            </div>
          ) : summary ? (
            <>
              {/* Scorecard Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-vertus-gold/15 via-vertus-card to-vertus-gold/10 border border-vertus-gold/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-vertus-gold font-bold uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Diagnóstico de Performance
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-vertus-white">
                    {summary.headline}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-vertus-white/50 uppercase block font-semibold">Nota da Sessão</span>
                    <span className="text-2xl font-serif font-bold text-vertus-gold">
                      {summary.score}
                      <span className="text-xs text-vertus-white/40 font-normal">/10</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tópico 1: O que você fez de bom */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    1. O que você fez de bom (Pontos Fortes)
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-vertus-white/85 leading-relaxed pl-1">
                  {summary.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tópico 2: Onde você perdeu o controle da conversa */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    2. Onde você perdeu o controle da conversa (Gargalos)
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-vertus-white/85 leading-relaxed pl-1">
                  {summary.improvementAreas.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tópico 3: Frase recomendada para a próxima consulta */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-vertus-gold/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-vertus-gold">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      3. Frase recomendada para a próxima consulta (Script de Ouro)
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(summary.recommendedScript.replace(/^"|"$/g, ''));
                      toast.success('Script copiado para usar no WhatsApp!');
                    }}
                    className="text-[11px] text-vertus-gold hover:text-vertus-white transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                    title="Copiar apenas a frase sugerida"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar Frase</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-vertus-bg/90 border border-vertus-gold/25 relative">
                  <Quote className="w-5 h-5 text-vertus-gold/20 absolute top-2.5 right-2.5 pointer-events-none" />
                  <p className="text-xs sm:text-sm font-serif italic text-vertus-white/95 leading-relaxed pr-6">
                    {summary.recommendedScript}
                  </p>
                </div>

                {summary.practicalTip && (
                  <p className="text-[11px] text-vertus-white/60 italic leading-snug">
                    💡 <strong className="text-vertus-gold/90">Dica da Mentora:</strong> {summary.practicalTip}
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-vertus-gray/80 bg-vertus-card/95 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakSummary}
              disabled={isLoading || !summary}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                isSpeaking
                  ? "bg-amber-500 text-vertus-bg border-amber-400 font-bold animate-pulse"
                  : "bg-vertus-gray/60 hover:bg-vertus-gray text-vertus-white border-vertus-gray"
              )}
              title="Ouvir análise com a voz da Iza"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-vertus-gold" />}
              <span>{isSpeaking ? 'Pausar Voz' : 'Ouvir com a Iza'}</span>
            </button>

            <button
              onClick={handleCopySummary}
              disabled={isLoading || !summary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-vertus-gray/60 hover:bg-vertus-gray text-vertus-white border border-vertus-gray transition-all cursor-pointer"
              title="Copiar resumo estruturado em texto"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-vertus-white/70" />}
              <span>{isCopied ? 'Copiado!' : 'Copiar Resumo'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveToDevelopmentPlan}
              disabled={isLoading || !summary || isSaved}
              className={clsx(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer active:scale-95",
                isSaved
                  ? "bg-emerald-600 text-white shadow-emerald-600/20"
                  : "bg-vertus-gold text-vertus-bg hover:brightness-110 shadow-vertus-gold/20"
              )}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Salvo no Meu Plano!' : 'Salvar no Meu Plano de Desenvolvimento'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleplayExecutiveSummaryModal;
