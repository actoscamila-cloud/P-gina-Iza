import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Sparkles, 
  User, 
  UserCheck, 
  X, 
  History, 
  Trash2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  GraduationCap, 
  ArrowRight, 
  Award,
  AlertCircle,
  Sliders,
  Layers,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, ChatSession } from '../types';
import ConfirmModal from './ConfirmModal';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import RoleplayExecutiveSummaryModal from './RoleplayExecutiveSummaryModal';
import api from '../services/api';
import { toast } from 'sonner';
import { speakIzaText, stopIzaSpeech } from '../utils/speechUtils';
import { useVisualViewport } from '../hooks/useVisualViewport';

export interface RoleplayScenario {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  patientInitialMessage: string;
  description: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
}

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'preco_alto',
    title: 'Objeção de Preço (Valor Alto)',
    shortTitle: 'Preço Alto',
    category: 'Financeiro',
    difficulty: 'Intermediário',
    description: 'A paciente achou o plano de R$ 4.800 muito caro e quer desistir ou pede desconto agressivo.',
    patientInitialMessage: 'Oi! Dei uma olhada na proposta que você me passou... Gostei muito da clínica, mas achei R$ 4.800 muito pesado para o meu momento agora. Não tem como fazer por menos ou me dar um desconto à vista?'
  },
  {
    id: 'concorrencia',
    title: 'Comparativo com Concorrência',
    shortTitle: 'Concorrência',
    category: 'Diferenciação',
    difficulty: 'Avançado',
    description: 'A paciente afirma que outra clínica do bairro ofereceu o mesmo procedimento por metade do preço.',
    patientInitialMessage: 'Menina, fui ver na clínica aqui do lado e eles fazem praticamente o mesmo procedimento por menos da metade desse valor. Por que o de vocês é tão mais caro?'
  },
  {
    id: 'sumico',
    title: 'Reaquecimento de Paciente Sumida',
    shortTitle: 'Paciente Sumida',
    category: 'Follow-up',
    difficulty: 'Iniciante',
    description: 'A paciente fez a avaliação presencial, adorou o plano, mas sumiu após receber os valores.',
    patientInitialMessage: 'Oi, desculpa o sumiço! Foi bem corrido aqui no trabalho essa semana... Ainda estou pensando sobre o que a doutora me indicou.'
  },
  {
    id: 'marido',
    title: 'Objeção de Terceiros ("Falar com Marido")',
    shortTitle: 'Falar c/ Marido',
    category: 'Tomada de Decisão',
    difficulty: 'Intermediário',
    description: 'A paciente usa a validação do parceiro como escudo para adiar o fechamento.',
    patientInitialMessage: 'Olha, eu amei o atendimento e o plano! Mas eu preciso conversar com meu marido antes de fechar qualquer contrato, tá bom? Depois te dou um retorno.'
  },
  {
    id: 'medo_dor',
    title: 'Insegurança com Dor e Resultados',
    shortTitle: 'Medo e Dor',
    category: 'Segurança Clínica',
    difficulty: 'Iniciante',
    description: 'A paciente tem medo de ficar com aspecto artificial ou sofrer com dores no pós.',
    patientInitialMessage: 'Tenho tanta vontade de fazer, mas tenho um pavor enorme de agulha e de ficar com o rosto inchado ou artificial... Vi uns casos na internet que me deram medo.'
  }
];

const DEFAULT_WELCOME: ChatMessage = {
  role: 'ai',
  text: 'Olá! Sou a **Iza**, e este é o nosso espaço de treino prático e desenvolvimento.\n\nAqui simulo uma **paciente real de estética** com dúvidas comuns, receios e questionamentos para que você possa praticar sua condução em um ambiente seguro.\n\nEscolha um cenário acima ou envie sua mensagem inicial. A qualquer momento, você pode clicar em **"Pedir Avaliação da Iza"** para eu sair do papel de paciente e te orientar didaticamente sobre o que você acertou e o que podemos aprimorar para alcançar melhores resultados!',
  timestamp: new Date().toISOString()
};

const RoleplayInterface: React.FC = () => {
  const { aiPrompt, chatSessions, saveChatSession, endActiveSession, clearChatSessions } = useData();
  const { user } = useAuth();
  const location = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isScenariosModalOpen, setIsScenariosModalOpen] = useState(false);
  const [isExecutiveSummaryOpen, setIsExecutiveSummaryOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialLoaded = useRef(false);

  // Keep input and messages in view when virtual keyboard opens on mobile
  useVisualViewport(textareaRef, scrollRef);

  // Auto-expand textarea vertically as user types (WhatsApp style, up to ~5 lines / 140px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    const newHeight = Math.min(Math.max(scrollH, 42), 140);
    el.style.height = `${newHeight}px`;
  }, [input]);

  // Load active roleplay session
  useEffect(() => {
    if (user && chatSessions.length > 0 && !initialLoaded.current) {
      const activeRoleplay = chatSessions.find(
        s => s.userId === user.id && s.isActive && s.mode === 'roleplay'
      );
      if (activeRoleplay && activeRoleplay.messages && activeRoleplay.messages.length > 0) {
        setMessages(activeRoleplay.messages);
      }
      initialLoaded.current = true;
    }
  }, [user?.id, chatSessions]);

  // Handle location state if routed with specific scenario
  useEffect(() => {
    const state = location.state as { scenarioId?: string } | undefined;
    if (state?.scenarioId) {
      handleSelectScenario(state.scenarioId);
    }
  }, [location.state]);

  // Auto scroll to bottom
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages.length, isTyping]);

  // Clean speech on unmount
  useEffect(() => {
    return () => {
      stopIzaSpeech();
    };
  }, []);

  const handleSelectScenario = (scenarioId: string) => {
    const sc = ROLEPLAY_SCENARIOS.find(s => s.id === scenarioId);
    if (!sc) return;

    setSelectedScenarioId(scenarioId);
    if (user) {
      endActiveSession(user.id, 'roleplay');
    }

    const startMessages: ChatMessage[] = [
      {
        role: 'ai',
        text: `**[Cenário Iniciado: ${sc.title}]**\n*Nível: ${sc.difficulty} • Contexto: ${sc.description}*\n\n---\n\n${sc.patientInitialMessage}`,
        timestamp: new Date().toISOString()
      }
    ];

    setMessages(startMessages);
    if (user) {
      saveChatSession(user.id, startMessages, 'roleplay');
    }
    toast.info(`Cenário "${sc.title}" iniciado! Responda como consultora.`);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    setInput('');
    const userMsg: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        messages: updatedWithUser,
        prompt: aiPrompt,
        mode: 'roleplay'
      });

      const aiMsg: ChatMessage = {
        role: 'ai',
        text: response.data.text || 'Entendi seu ponto... mas ainda estou com dúvidas.',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedWithUser, aiMsg];
      setMessages(finalMessages);

      if (user) {
        saveChatSession(user.id, finalMessages, 'roleplay');
      }
    } catch (err: any) {
      console.error('AI Roleplay Error:', err);
      let serverMessage = err.response?.data?.message;
      if (!serverMessage) {
        if (typeof err.response?.data === 'string' && err.response.data.includes('502')) {
          serverMessage = 'O servidor Railway está reiniciando ou temporariamente indisponível (502 Bad Gateway). Aguarde 1 minuto e tente novamente.';
        } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          serverMessage = 'A resposta demorou mais que o esperado (tempo limite). Por favor, tente enviar novamente.';
        } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
          serverMessage = 'Você parece estar sem conexão com a internet. Verifique sua rede Wi-Fi ou dados móveis.';
        } else {
          serverMessage = err.message || 'Erro ao comunicar com a Iza. Tente novamente em instantes.';
        }
      }
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: serverMessage, timestamp: new Date().toISOString() }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRequestEvaluation = () => {
    if (isTyping || messages.length <= 1) return;
    const prompt = 'Iza, por favor saia do personagem de paciente e faça uma AVALIAÇÃO TÉCNICA DETALHADA da minha condução comercial até aqui segundo o método Vertus:\n\n1. O que executei com excelência (Pontos Fortes);\n2. Quais foram os meus pontos cegos ou falhas de condução;\n3. Como eu deveria ter respondido para elevar a chance de fechamento;\n4. Nota de 0 a 10 para o atendimento.';
    handleSend(prompt);
  };

  const handleReset = () => {
    if (user) {
      endActiveSession(user.id, 'roleplay');
    }
    setSelectedScenarioId(null);
    setMessages([DEFAULT_WELCOME]);
    if (user) {
      saveChatSession(user.id, [DEFAULT_WELCOME], 'roleplay');
    }
    toast.success('Simulador reiniciado.');
  };

  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Navegador não suporta reprodução de voz.');
      return;
    }
    if (speakingIndex === index) {
      stopIzaSpeech();
      setSpeakingIndex(null);
      return;
    }

    setSpeakingIndex(index);
    const success = speakIzaText(
      text,
      () => setSpeakingIndex(null),
      () => setSpeakingIndex(null)
    );

    if (success) {
      toast.info('Reproduzindo áudio com a voz da Iza...');
    } else {
      setSpeakingIndex(null);
    }
  };

  const roleplaySessions = chatSessions.filter(
    s => s.userId === user?.id && s.mode === 'roleplay'
  );

  const loadSession = (s: ChatSession) => {
    setMessages(s.messages);
    setShowHistory(false);
    toast.success('Treino de roleplay carregado!');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-vertus-card/40 light:bg-white backdrop-blur-xl border-0 sm:border border-vertus-gray rounded-none sm:rounded-2xl md:rounded-3xl relative shadow-xl light:shadow-md">
      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-96 max-w-full bg-vertus-card border-l border-vertus-gray z-50 p-5 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-vertus-gray mb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-vertus-gold" />
                  <h3 className="font-serif font-bold text-base text-vertus-white">Histórico de Treinos</h3>
                </div>
                <div className="flex items-center gap-1">
                  {roleplaySessions.length > 0 && (
                    <button 
                      onClick={() => setIsConfirmClearOpen(true)}
                      className="p-1.5 text-vertus-white/40 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                      title="Limpar Histórico de Roleplay"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="p-1.5 text-vertus-white/40 hover:text-vertus-white rounded-lg hover:bg-vertus-gray transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                {roleplaySessions.length === 0 ? (
                  <div className="text-center py-12 text-vertus-white/30 text-xs">
                    Nenhum treino de roleplay anterior encontrado.
                  </div>
                ) : (
                  roleplaySessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className="w-full text-left p-3.5 rounded-xl bg-vertus-bg/80 border border-vertus-gray hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-xs group light:bg-stone-50 light:border-stone-200 light:hover:border-amber-500"
                    >
                      <div className="flex items-center justify-between text-[10px] text-vertus-white/40 mb-1.5 light:text-stone-500">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 light:bg-amber-100 light:text-amber-950 font-bold">
                          Roleplay
                        </span>
                        <span>{new Date(session.lastInteraction || session.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="font-medium text-vertus-white/80 line-clamp-2 group-hover:text-amber-300 transition-colors light:text-stone-800 light:group-hover:text-amber-900">
                        {session.messages.find(m => m.role === 'user')?.text || 'Simulação de paciente'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* TOP HEADER: Clean, Dedicated Training Simulator */}
      <div className="bg-vertus-card/90 light:bg-white border-b border-vertus-gray/60 light:border-stone-300 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 light:bg-amber-100 light:border-amber-300 light:text-amber-900 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-base font-serif font-bold text-vertus-white truncate max-w-[120px] sm:max-w-none">
                Roleplay
              </h2>
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 light:bg-amber-100 light:text-amber-950 light:border-amber-300 whitespace-nowrap">
                Ao Vivo
              </span>
            </div>
            <p className="text-[11px] text-vertus-white/50 light:text-stone-600 hidden sm:block">
              Treine contornos de objeções com paciente exigente e receba feedback técnico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsExecutiveSummaryOpen(true)}
            disabled={messages.length <= 1}
            className={clsx(
              "px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer active:scale-95 whitespace-nowrap",
              messages.length > 1
                ? "bg-vertus-gold text-vertus-bg hover:brightness-110 shadow-vertus-gold/25"
                : "bg-vertus-gray/60 light:bg-stone-200 text-vertus-white/30 light:text-stone-400 cursor-not-allowed"
            )}
            title="Gerar Resumo Executivo em 3 tópicos (Pontos Fortes, Gargalos e Script Recomendado)"
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Resumo Executivo</span>
            <span className="sm:hidden">Resumo</span>
          </button>

          <button
            onClick={handleRequestEvaluation}
            disabled={isTyping || messages.length <= 1}
            className={clsx(
              "px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer whitespace-nowrap",
              messages.length > 1 && !isTyping
                ? "bg-amber-500 hover:bg-amber-400 text-vertus-bg light:bg-amber-600 light:text-white light:hover:bg-amber-700 shadow-amber-500/20 active:scale-95"
                : "bg-vertus-gray/60 light:bg-stone-200 text-vertus-white/30 light:text-stone-400 cursor-not-allowed"
            )}
            title="A Iza sai do papel de paciente e faz a avaliação detalhada da sua técnica"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Pedir Avaliação</span>
            <span className="sm:hidden">Avaliar</span>
          </button>

          <button
            onClick={() => setIsVoiceSettingsOpen(true)}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-vertus-gray/60 hover:bg-vertus-gold/20 text-vertus-white/70 hover:text-vertus-gold transition-colors cursor-pointer border border-vertus-gray/50 light:bg-stone-100 light:hover:bg-stone-200 light:text-stone-700 light:border-stone-300 flex items-center gap-1.5 shrink-0"
            title="Personalizar tom e voz da Iza"
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-vertus-gold light:text-amber-800" />
            <span className="hidden lg:inline text-xs font-semibold">Voz da Iza</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-vertus-gray/60 hover:bg-vertus-white/10 text-vertus-white/70 hover:text-vertus-white light:bg-stone-100 light:hover:bg-stone-200 light:text-stone-700 light:hover:text-stone-900 transition-colors cursor-pointer border border-vertus-gray/50 light:border-stone-300 shrink-0"
            title="Reiniciar Simulação"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-vertus-gray/60 hover:bg-vertus-white/10 text-vertus-white/70 hover:text-vertus-white light:bg-stone-100 light:hover:bg-stone-200 light:text-stone-700 light:hover:text-stone-900 transition-colors cursor-pointer border border-vertus-gray/50 light:border-stone-300 shrink-0"
            title="Histórico de Treinos"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* QUICK SCENARIO SELECTOR BAR: Balanced layout with short titles & modal trigger */}
      <div className="px-3.5 sm:px-4 py-2 bg-vertus-bg/95 light:bg-[#F4F0E8] border-b border-vertus-gray/60 light:border-stone-300 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold text-amber-400/90 light:text-amber-950 shrink-0 flex items-center gap-1.5 pr-0.5">
            <Award className="w-3.5 h-3.5 text-amber-400 light:text-amber-700" />
            <span className="hidden sm:inline tracking-wider">Cenários:</span>
          </span>

          {ROLEPLAY_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenarioId === scenario.id;
            const diffDot = 
              scenario.difficulty === 'Iniciante' ? 'bg-emerald-400' :
              scenario.difficulty === 'Intermediário' ? 'bg-amber-400' : 'bg-rose-400';

            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario.id)}
                className={clsx(
                  "px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-medium",
                  isSelected
                    ? "bg-amber-500/20 border border-amber-500/60 text-amber-300 font-bold shadow-sm ring-1 ring-amber-500/30 light:bg-white light:border-amber-600 light:text-amber-950 light:shadow-md"
                    : "bg-vertus-card/70 hover:bg-vertus-card border border-vertus-gray/70 text-vertus-white/70 hover:text-vertus-white active:scale-95 light:bg-white/80 light:border-stone-300 light:text-stone-700 light:hover:text-stone-950 light:hover:bg-white"
                )}
                title={`${scenario.title} (${scenario.difficulty}): ${scenario.description}`}
              >
                <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", diffDot)} />
                <span>{scenario.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Action to explore all scenarios in modal */}
        <button
          onClick={() => setIsScenariosModalOpen(true)}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-vertus-card/90 hover:bg-vertus-gray/90 border border-vertus-gray/80 hover:border-amber-500/40 text-vertus-white/80 hover:text-amber-300 text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 light:bg-white light:border-stone-300 light:text-stone-800 light:hover:border-amber-500 light:hover:text-amber-950"
          title="Ver detalhes de todos os cenários com situação clínica e primeira fala da paciente"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400 light:text-amber-700" />
          <span className="hidden md:inline">Todos os Cenários</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 light:bg-amber-100 light:text-amber-900 font-bold">5</span>
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isSpeakingThis = speakingIndex === idx;

            return (
              <div 
                key={idx} 
                className={clsx(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className={clsx(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5",
                  isUser 
                    ? "bg-vertus-gold text-vertus-bg light:text-white font-bold text-xs" 
                    : "bg-amber-500/20 border border-amber-500/40 text-amber-400 light:bg-amber-100 light:border-amber-300 light:text-amber-900"
                )}>
                  {isUser ? <User className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={clsx(
                  "max-w-[85%] sm:max-w-[78%] rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md p-4 group relative",
                  isUser 
                    ? "bg-vertus-gold text-vertus-bg light:text-white rounded-tr-none font-medium" 
                    : "bg-vertus-card light:bg-[#FAF8F5] border border-vertus-gray light:border-stone-300 text-vertus-white light:text-stone-900 rounded-tl-none light:shadow-sm"
                )}>
                  {isUser ? (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block font-bold text-vertus-bg/70 light:text-white/90 mb-1">
                        Sua Resposta Comercial
                      </span>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-vertus-gray/50 light:border-stone-300 pb-1.5 mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 light:text-amber-950 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 light:bg-amber-600 animate-pulse" />
                          <span>Paciente Fictícia (ou Avaliação Iza)</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSpeak(msg.text, idx)}
                            className={clsx(
                              "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer",
                              isSpeakingThis
                                ? "bg-amber-500 text-vertus-bg light:bg-amber-600 light:text-white font-bold animate-pulse"
                                : "text-vertus-white/50 light:text-stone-600 hover:text-vertus-white light:hover:text-stone-950 hover:bg-vertus-gray light:hover:bg-stone-200"
                            )}
                            title={isSpeakingThis ? "Pausar reprodução" : "Ouvir fala com voz humanizada da Iza"}
                          >
                            {isSpeakingThis ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            <span>{isSpeakingThis ? 'Ouvindo...' : 'Ouvir'}</span>
                          </button>

                          <button
                            onClick={() => setIsVoiceSettingsOpen(true)}
                            className="p-0.5 text-vertus-white/40 light:text-stone-500 hover:text-vertus-gold light:hover:text-amber-800 transition-colors cursor-pointer"
                            title="Personalizar afinação e tom da voz"
                          >
                            <Sliders className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="markdown-body text-vertus-white/90 light:text-stone-900">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 light:bg-amber-100 light:border-amber-300 light:text-amber-900 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="bg-vertus-card light:bg-white border border-vertus-gray light:border-stone-300 px-4 py-3 rounded-2xl rounded-tl-none light:shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="text-xs text-amber-300/80 light:text-stone-700 mr-1 font-medium">
                    Paciente digitando
                  </span>
                  <div className="w-1.5 h-1.5 bg-amber-400 light:bg-amber-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-amber-400 light:bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-amber-400 light:bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="p-3 sm:p-4 bg-vertus-bg/90 backdrop-blur-md border-t border-vertus-gray/60 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 min-w-0 flex items-end bg-vertus-card light:bg-white border border-vertus-gray/80 light:border-stone-300 focus-within:border-amber-500/60 focus-within:light:border-amber-600 focus-within:ring-1 focus-within:ring-amber-500/30 focus-within:light:ring-amber-500/20 rounded-2xl sm:rounded-3xl px-2 sm:px-3 py-1.5 sm:py-2 transition-all shadow-sm">
              <textarea
                ref={textareaRef}
                id="roleplay-input"
                name="roleplay-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  setTimeout(() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: 'smooth'
                      });
                    }
                  }, 250);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Digite sua resposta para a paciente..."
                className="flex-1 bg-transparent text-[15px] sm:text-sm text-vertus-white light:text-stone-900 placeholder:text-vertus-white/35 light:placeholder:text-stone-400 outline-none resize-none min-h-[40px] max-h-[140px] px-2 sm:px-2.5 py-2 leading-relaxed custom-scrollbar font-sans"
                rows={1}
              />
            </div>

            {/* WhatsApp-Style Circular Action / Send Button */}
            <button 
              type="button"
              onClick={() => handleSend()} 
              disabled={!input.trim() || isTyping}
              className={clsx(
                "w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all flex items-center justify-center shrink-0 shadow-md",
                input.trim() && !isTyping 
                  ? "bg-amber-500 hover:bg-amber-400 text-vertus-bg light:bg-amber-600 light:text-white hover:scale-105 active:scale-95 cursor-pointer font-bold shadow-amber-500/25 light:shadow-amber-600/30" 
                  : "bg-vertus-card/80 light:bg-stone-200 border border-vertus-gray/60 light:border-stone-300 text-vertus-white/20 light:text-stone-400 cursor-not-allowed"
              )}
              title="Enviar resposta para a paciente"
            >
              <Send className={clsx(
                "w-4 h-4 sm:w-5 sm:h-5 transition-transform",
                input.trim() && !isTyping ? "translate-x-0.5" : ""
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-vertus-white/40 light:text-stone-600 px-1">
            <span className="hidden sm:inline">Dica: Treine contorno em perguntas abertas antes de fechar a proposta.</span>
            {messages.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0 text-[10.5px] sm:text-[11px]">
                <button
                  onClick={() => setIsExecutiveSummaryOpen(true)}
                  className="text-vertus-gold hover:underline font-bold cursor-pointer flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Resumo Executivo (3 Tópicos)</span>
                  <span className="sm:hidden">Resumo (3 Tópicos)</span>
                </button>
                <span>•</span>
                <button
                  onClick={handleRequestEvaluation}
                  className="text-amber-400 hover:text-amber-300 light:text-amber-800 light:hover:text-amber-950 underline font-medium cursor-pointer"
                >
                  <span className="hidden sm:inline">Pedir Avaliação Técnica</span>
                  <span className="sm:hidden">Pedir Avaliação</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL SCENARIOS EXPLORER MODAL */}
      <AnimatePresence>
        {isScenariosModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScenariosModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-vertus-card border border-vertus-gray/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-vertus-gray/80 flex items-center justify-between gap-3 bg-vertus-card/95">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-vertus-white">
                      Cenários de Treinamento
                    </h3>
                    <p className="text-xs text-vertus-white/60">
                      Escolha uma situação clínica real para simular com a paciente virtual da Iza
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScenariosModalOpen(false)}
                  className="p-1.5 text-vertus-white/50 hover:text-vertus-white rounded-lg hover:bg-vertus-gray/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scenarios Cards Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
                {ROLEPLAY_SCENARIOS.map((sc) => {
                  const isSelected = selectedScenarioId === sc.id;
                  const diffBadge = 
                    sc.difficulty === 'Iniciante' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    sc.difficulty === 'Intermediário' 
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

                  return (
                    <div
                      key={sc.id}
                      className={clsx(
                        "p-4 rounded-xl border transition-all text-left space-y-2.5",
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30"
                          : "bg-vertus-bg/80 border-vertus-gray/70 hover:border-vertus-gold/40 hover:bg-vertus-bg"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", diffBadge)}>
                            {sc.difficulty}
                          </span>
                          <span className="text-xs text-vertus-white/50 font-medium">
                            {sc.category}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Cenário Ativo
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-sm sm:text-base text-vertus-white">
                          {sc.title}
                        </h4>
                        <p className="text-xs text-vertus-white/70 mt-1 leading-relaxed">
                          {sc.description}
                        </p>
                      </div>

                      {/* Patient Initial Voice Preview */}
                      <div className="p-3 rounded-xl bg-vertus-card/90 border border-vertus-gray/60 text-xs text-vertus-white/80 italic font-sans flex items-start gap-2">
                        <span className="text-vertus-gold shrink-0 font-serif font-bold text-base leading-none not-italic">“</span>
                        <span className="leading-relaxed">{sc.patientInitialMessage}</span>
                        <span className="text-vertus-gold shrink-0 font-serif font-bold text-base leading-none not-italic">”</span>
                      </div>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            handleSelectScenario(sc.id);
                            setIsScenariosModalOpen(false);
                          }}
                          className={clsx(
                            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95",
                            isSelected
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                              : "bg-amber-500 hover:bg-amber-400 text-vertus-bg shadow-amber-500/20"
                          )}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Reiniciar Este Cenário' : 'Treinar Este Cenário'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={() => {
          clearChatSessions();
          setMessages([DEFAULT_WELCOME]);
          setIsConfirmClearOpen(false);
          setShowHistory(false);
          toast.success('Histórico de treinos apagado.');
        }}
        title="Limpar Treinos de Roleplay"
        message="Tem certeza que deseja apagar os registros de treinos anteriores?"
        confirmText="Limpar Tudo"
      />

      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />

      <RoleplayExecutiveSummaryModal
        isOpen={isExecutiveSummaryOpen}
        onClose={() => setIsExecutiveSummaryOpen(false)}
        scenarioTitle={
          ROLEPLAY_SCENARIOS.find(s => s.id === selectedScenarioId)?.title ||
          'Simulação Personalizada'
        }
        scenarioId={selectedScenarioId || undefined}
        messages={messages.map(m => ({ role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user', text: m.text }))}
      />
    </div>
  );
};

export default RoleplayInterface;
