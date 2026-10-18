import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Sparkles, 
  Image as ImageIcon, 
  User, 
  Bot, 
  X, 
  History, 
  PlusCircle, 
  Trash2, 
  Copy, 
  Check,
  MessageSquare, 
  Mic, 
  Compass, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sliders,
  Camera
} from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, ChatSession } from '../types';
import ConfirmModal from './ConfirmModal';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { IzaGuideModal } from './IzaGuideModal';
import api from '../services/api';
import { toast } from 'sonner';
import { extractSuggestedMessage } from '../utils/textUtils';
import { speakIzaText, stopIzaSpeech, getSpeechSpeed, cycleSpeechSpeed } from '../utils/speechUtils';
import { useVisualViewport } from '../hooks/useVisualViewport';
import { triggerHaptic } from '../utils/haptics';
import { WhatsAppScriptCard } from './WhatsAppScriptCard';

export type IzaMode = 'whatsapp' | 'audio' | 'deep';

export interface IzaModeConfig {
  id: IzaMode;
  label: string;
  tabTitle: string;
  shortTitle: string;
  deliverable: string;
  deliverableTag: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  color: string;
  activeBorder: string;
  indicatorColor: string;
  badgeBg: string;
  cardActiveBg: string;
  cardInactiveHover: string;
  iconActiveBg: string;
  iconInactiveBg: string;
  placeholder: string;
  welcomeMessage: string;
  suggestedPrompts: string[];
}

export const IZA_MODES: IzaModeConfig[] = [
  {
    id: 'whatsapp',
    label: 'Iza WhatsApp',
    tabTitle: 'Iza WhatsApp',
    shortTitle: 'WhatsApp',
    deliverable: 'Condução & Mensagens',
    deliverableTag: 'Abordagem Prática',
    title: 'Iza WhatsApp • Condução & Mensagens',
    shortDesc: 'Vamos estruturar juntas mensagens acolhedoras e estratégicas para suas pacientes',
    icon: MessageSquare,
    badge: 'Orientação Prática',
    color: 'text-emerald-400',
    activeBorder: 'border-emerald-500',
    indicatorColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    cardActiveBg: 'bg-emerald-500/15 border-emerald-500/70 shadow-lg shadow-emerald-500/15',
    cardInactiveHover: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    iconActiveBg: 'bg-emerald-500 text-vertus-bg shadow-sm font-bold',
    iconInactiveBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    placeholder: 'Compartilhe a dúvida ou a mensagem da paciente para estruturarmos a melhor resposta...',
    welcomeMessage: 'Olá! Sou a **Iza**. Estou aqui para te apoiar, orientar e ensinar a conduzir cada atendimento no WhatsApp com segurança e empatia. Me envie a situação ou a objeção que a sua paciente trouxe: vamos analisar juntas e estruturar uma resposta clara e estratégica para você alcançar melhores resultados!',
    suggestedPrompts: [
      'Como conduzir a paciente que diz que achou o valor alto?',
      'Como retomar o contato com uma paciente que parou de responder?',
      'Como responder com acolhimento quando a paciente diz que vai falar com o marido?',
      'Como fazer perguntas de qualificação no WhatsApp para entender a real necessidade da paciente?'
    ]
  },
  {
    id: 'audio',
    label: 'Iza Áudio / Voz',
    tabTitle: 'Iza Áudio / Voz',
    shortTitle: 'Áudio / Voz',
    deliverable: 'Roteiros Falados & Postura',
    deliverableTag: 'Tom & Conexão',
    title: 'Iza Áudio / Voz • Roteirização & Conexão',
    shortDesc: 'Aprenda a dosar entonação, pausas e autoridade acolhedora em mensagens de voz',
    icon: Mic,
    badge: 'Voz e Postura',
    color: 'text-sky-400',
    activeBorder: 'border-sky-500',
    indicatorColor: 'bg-sky-400',
    badgeBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    cardActiveBg: 'bg-sky-500/15 border-sky-500/70 shadow-lg shadow-sky-500/15',
    cardInactiveHover: 'hover:border-sky-500/50 hover:bg-sky-500/5',
    iconActiveBg: 'bg-sky-500 text-vertus-bg shadow-sm font-bold',
    iconInactiveBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    placeholder: 'Me conte o que precisa comunicar e vou te ensinar como gravar esse áudio com segurança...',
    welcomeMessage: 'Olá! Sou a **Iza Áudio / Voz**. O áudio é um recurso muito especial para gerar conexão humana e transmitir confiança. Me conte o que você precisa falar para a sua paciente: vou te ensinar como dosar o tom, as pausas e a postura para conduzi-la com naturalidade e acolhimento.',
    suggestedPrompts: [
      'Como gravar um áudio acolhedor para reaquecer uma paciente pós-avaliação?',
      'Orientações de tom de voz para transmitir segurança sem soar distante',
      'Roteiro de áudio para explicar as opções de pagamento com naturalidade',
      'Como usar pausas e ênfase para valorizar o plano de tratamento'
    ]
  },
  {
    id: 'deep',
    label: 'Iza Diagnóstico',
    tabTitle: 'Iza Diagnóstico',
    shortTitle: 'Diagnóstico',
    deliverable: 'Análise de Conversa & Pontos Cegos',
    deliverableTag: 'Visão Estratégica',
    title: 'Iza Diagnóstico • Análise e Aprendizado',
    shortDesc: 'Vamos entender o comportamento da paciente e identificar pontos de melhoria',
    icon: Compass,
    badge: 'Análise Estratégica',
    color: 'text-purple-400',
    activeBorder: 'border-purple-500',
    indicatorColor: 'bg-purple-400',
    badgeBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    cardActiveBg: 'bg-purple-500/15 border-purple-500/70 shadow-lg shadow-purple-500/15',
    cardInactiveHover: 'hover:border-purple-500/50 hover:bg-purple-500/5',
    iconActiveBg: 'bg-purple-500 text-vertus-bg shadow-sm font-bold',
    iconInactiveBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    placeholder: 'Cole o diálogo ou anexe um print para analisarmos juntos os pontos de melhoria...',
    welcomeMessage: 'Olá! Sou a **Iza Diagnóstico**. O objetivo aqui é aprender com cada atendimento. Cole o diálogo ou anexe o print do WhatsApp: vou te ajudar a compreender as reais intenções e receios da paciente, identificar pontos que passaram despercebidos e te ensinar caminhos para evoluir suas conversões.',
    suggestedPrompts: [
      'Análise de atendimento: paciente elogiou o plano mas sumiu depois do orçamento',
      'Como identificar se a paciente tem receio do procedimento ou questão financeira?',
      'Analisar print de WhatsApp para encontrar pontos de melhoria na condução',
      'O que aprender quando a paciente compara nosso atendimento com outra clínica?'
    ]
  }
];

interface ChatInterfaceProps {
  fullScreen?: boolean;
}

const createGreeting = (text: string): ChatMessage => ({
  role: 'ai',
  text,
  timestamp: new Date().toISOString()
});

const ChatInterface: React.FC<ChatInterfaceProps> = ({ fullScreen = false }) => {
  const { aiPrompt, chatSessions, saveChatSession, endActiveSession, clearChatSessions } = useData();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode from URL query (e.g. ?tab=whatsapp, ?tab=audio, ?tab=diagnostico)
  const tabParam = (searchParams.get('tab') || searchParams.get('mode') || '').toLowerCase();

  // If directed with roleplay, redirect cleanly to dedicated /roleplay page
  useEffect(() => {
    if (tabParam === 'roleplay') {
      navigate('/roleplay', { replace: true });
    }
  }, [tabParam, navigate]);

  const initialMode: IzaMode = 
    tabParam === 'audio' || tabParam === 'voz' ? 'audio' :
    tabParam === 'deep' || tabParam === 'diagnostico' ? 'deep' :
    'whatsapp';

  const [activeMode, setActiveMode] = useState<IzaMode>(initialMode);
  const [conversations, setConversations] = useState<Record<IzaMode, ChatMessage[]>>({
    whatsapp: [],
    audio: [],
    deep: []
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | IzaMode>('all');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(() => getSpeechSpeed());
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialLoadDone = useRef(false);

  // Keep input and recent messages visible when virtual keyboard opens on mobile
  useVisualViewport(textareaRef, scrollRef);

  // Auto-expand textarea vertically as user types (WhatsApp style, up to ~5 lines / 140px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    // Base height 42px for single line, up to 140px for multi-line
    const newHeight = Math.min(Math.max(scrollH, 42), 140);
    el.style.height = `${newHeight}px`;
  }, [input]);

  const currentModeConfig = IZA_MODES.find(m => m.id === activeMode) || IZA_MODES[0];
  const currentMessages: ChatMessage[] = conversations[activeMode] && conversations[activeMode].length > 0 
    ? conversations[activeMode] 
    : [createGreeting(currentModeConfig.welcomeMessage)];

  const userSessions = chatSessions.filter(s => s.userId === user?.id && s.mode !== 'roleplay');
  const filteredUserSessions = userSessions.filter(s => {
    if (historyFilter === 'all') return true;
    const sMode = s.mode || 'whatsapp';
    return sMode === historyFilter;
  });

  // Keep activeMode in sync with search params
  useEffect(() => {
    const tab = (searchParams.get('tab') || searchParams.get('mode') || '').toLowerCase();
    if (tab && tab !== 'roleplay') {
      const validMode: IzaMode = 
        tab === 'audio' || tab === 'voz' ? 'audio' :
        tab === 'deep' || tab === 'diagnostico' ? 'deep' :
        'whatsapp';
      if (validMode !== activeMode) {
        setActiveMode(validMode);
      }
    }
  }, [searchParams]);

  // Load active sessions per mode on mount
  useEffect(() => {
    if (user && chatSessions.length > 0 && !initialLoadDone.current) {
      const loadedConvs: Record<IzaMode, ChatMessage[]> = {
        whatsapp: [],
        audio: [],
        deep: []
      };

      (['whatsapp', 'audio', 'deep'] as IzaMode[]).forEach((mode) => {
        const active = chatSessions.find(
          s => s.userId === user.id && s.isActive && (s.mode === mode || (!s.mode && mode === 'whatsapp'))
        );
        const modeCfg = IZA_MODES.find(m => m.id === mode)!;
        if (active && active.messages && active.messages.length > 0) {
          const sanitized = active.messages.map((msg, idx) => {
            if (idx === 0 && msg.role === 'ai' && (
              msg.text.includes('script perfeito') ||
              msg.text.includes('fechamento rápido') ||
              msg.text.includes('mentora de elite') ||
              msg.text.includes('elite') ||
              msg.text.includes('alta conversão para a paciente? Me conte a situação e eu te passo o roteiro')
            )) {
              return { ...msg, text: modeCfg.welcomeMessage };
            }
            return msg;
          });
          loadedConvs[mode] = sanitized;
        } else {
          loadedConvs[mode] = [createGreeting(modeCfg.welcomeMessage)];
        }
      });

      setConversations(loadedConvs);
      initialLoadDone.current = true;
    } else if (user && !initialLoadDone.current) {
      const defaultConvs: Record<IzaMode, ChatMessage[]> = {
        whatsapp: [createGreeting(IZA_MODES[0].welcomeMessage)],
        audio: [createGreeting(IZA_MODES[1].welcomeMessage)],
        deep: [createGreeting(IZA_MODES[2].welcomeMessage)]
      };
      setConversations(defaultConvs);
      initialLoadDone.current = true;
    }
  }, [user?.id, chatSessions]);

  // Check if routed with initial prompt from Objections page
  useEffect(() => {
    const state = location.state as { initialPrompt?: string; mode?: IzaMode } | undefined;
    if (state?.initialPrompt) {
      setInput(state.initialPrompt);
      if (state.mode && ['whatsapp', 'audio', 'deep', 'roleplay'].includes(state.mode)) {
        handleSwitchTab(state.mode);
      }
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
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
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [currentMessages.length, isTyping, activeMode]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopIzaSpeech();
    };
  }, []);

  const handleSwitchTab = (newMode: IzaMode) => {
    if (newMode === activeMode) return;
    setActiveMode(newMode);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', newMode);
      return p;
    }, { replace: true });

    // Guarantee default greeting if empty
    setConversations(prev => {
      if (!prev[newMode] || prev[newMode].length === 0) {
        const cfg = IZA_MODES.find(m => m.id === newMode)!;
        return {
          ...prev,
          [newMode]: [createGreeting(cfg.welcomeMessage)]
        };
      }
      return prev;
    });

    const targetConfig = IZA_MODES.find(m => m.id === newMode);
    toast.info(`Aba ${targetConfig?.tabTitle || targetConfig?.label} ativada.`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('A imagem é muito grande. Escolha uma imagem de até 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        toast.success('Imagem anexada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (customText?: string) => {
    triggerHaptic('medium');

    const textToSend = customText || input;
    if (!textToSend.trim() && !attachedImage) return;

    const userText = textToSend;
    const userImage = attachedImage;
    setInput('');
    setAttachedImage(null);
    
    const newUserMessage: ChatMessage = { 
      role: 'user', 
      text: userText + (userImage ? '\n\n[Imagem Anexada]' : ''),
      timestamp: new Date().toISOString(),
      ...(userImage && { image: userImage })
    };

    const updatedWithUser = [...currentMessages, newUserMessage];
    setConversations(prev => ({
      ...prev,
      [activeMode]: updatedWithUser
    }));
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        messages: updatedWithUser,
        prompt: aiPrompt,
        mode: activeMode
      });

      const aiMessage: ChatMessage = { 
        role: 'ai', 
        text: response.data.text || 'Desculpe, não consegui processar sua solicitação no momento.',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedWithUser, aiMessage];
      setConversations(prev => ({
        ...prev,
        [activeMode]: finalMessages
      }));

      if (user) {
        saveChatSession(user.id, finalMessages, activeMode);
      }
      triggerHaptic('light');
    } catch (error: any) {
      console.error('AI Error:', error);
      let serverMessage = error.response?.data?.message;
      if (!serverMessage) {
        if (typeof error.response?.data === 'string' && error.response.data.includes('502')) {
          serverMessage = 'O servidor Railway está reiniciando ou temporariamente indisponível (502 Bad Gateway). Aguarde 1 minuto e tente novamente.';
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          serverMessage = 'A resposta da IZA demorou mais que o esperado (tempo limite). Por favor, tente enviar novamente.';
        } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
          serverMessage = 'Você parece estar sem conexão com a internet. Verifique sua rede Wi-Fi ou dados móveis.';
        } else {
          serverMessage = error.message || 'Erro ao comunicar com a IZA. Verifique sua conexão com a internet ou tente novamente em instantes.';
        }
      }
      const errorMessage: ChatMessage = { 
        role: 'ai', 
        text: serverMessage,
        timestamp: new Date().toISOString()
      };
      setConversations(prev => ({
        ...prev,
        [activeMode]: [...updatedWithUser, errorMessage]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageUpload({ target: { files: [file] } } as any);
        }
      }
    }
  };

  // Copy ONLY the suggested message/script to forward, stripped of internal explanations
  const handleCopySuggestedMessage = (fullText: string, index: number) => {
    triggerHaptic('success');
    const textToSend = extractSuggestedMessage(fullText);
    navigator.clipboard.writeText(textToSend);
    setCopiedIndex(index);
    toast.success('Mensagem sugerida copiada! Pronta para colar na conversa.');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Navegador não suporta reprodução de voz.');
      return;
    }
    triggerHaptic('light');
    if (speakingIndex === index) {
      stopIzaSpeech();
      setSpeakingIndex(null);
      return;
    }

    // Only speak the script to send, omitting strategic notes
    const messageToSpeak = extractSuggestedMessage(text) || text;

    setSpeakingIndex(index);
    const success = speakIzaText(
      messageToSpeak,
      () => setSpeakingIndex(null),
      () => setSpeakingIndex(null)
    );

    if (success) {
      toast.info('Reproduzindo áudio com a voz da Iza...');
    } else {
      setSpeakingIndex(null);
    }
  };

  const handleRefineTone = (tone: 'formal' | 'acolhedor' | 'direto' | 'alternativa') => {
    if (isTyping) return;
    triggerHaptic('selection');
    let prompt = '';
    if (tone === 'formal') {
      prompt = 'Iza, por favor reescreva a resposta anterior em um tom mais formal, sóbrio e executivo, com foco em autoridade clínica.';
    } else if (tone === 'acolhedor') {
      prompt = 'Iza, por favor reescreva a resposta anterior em um tom mais caloroso, acolhedor e empático, criando conexão e validação emocional.';
    } else if (tone === 'direto') {
      prompt = 'Iza, por favor encurte e reescreva a resposta anterior de forma bem direta, objetiva e concisa para o WhatsApp.';
    } else {
      prompt = 'Iza, por favor me apresente uma abordagem alternativa e diferente da anterior para esse mesmo cenário.';
    }
    handleSend(prompt);
  };

  const handleResetCurrentTab = () => {
    if (user) {
      endActiveSession(user.id, activeMode);
    }
    const freshMessages: ChatMessage[] = [
      createGreeting(currentModeConfig.welcomeMessage)
    ];
    setConversations(prev => ({
      ...prev,
      [activeMode]: freshMessages
    }));
    if (user) {
      saveChatSession(user.id, freshMessages, activeMode);
    }
    toast.success('Novo atendimento iniciado nesta aba!');
  };

  const loadSession = (session: ChatSession) => {
    const sessionMode = (session.mode || 'whatsapp') as IzaMode;
    setActiveMode(sessionMode);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', sessionMode);
      return p;
    }, { replace: true });

    setConversations(prev => ({
      ...prev,
      [sessionMode]: session.messages
    }));
    setShowHistory(false);
    const targetConfig = IZA_MODES.find(m => m.id === sessionMode);
    toast.success(`Sessão de ${targetConfig?.tabTitle || 'Iza'} restaurada!`);
  };

  return (
    <div className={clsx(
      "flex flex-col overflow-hidden bg-vertus-card/40 light:bg-white backdrop-blur-xl relative shadow-xl light:shadow-md",
      fullScreen ? "h-full border-0 sm:border border-vertus-gray rounded-none sm:rounded-2xl md:rounded-3xl" : "h-full border border-vertus-gray rounded-2xl"
    )}>
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
                  <History className="w-5 h-5 text-vertus-gold" />
                  <h3 className="font-serif font-bold text-base text-vertus-white">Histórico de Atendimentos</h3>
                </div>
                <div className="flex items-center gap-1">
                  {userSessions.length > 0 && (
                    <button 
                      onClick={() => setIsConfirmClearOpen(true)}
                      className="p-1.5 text-vertus-white/40 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                      title="Limpar Histórico"
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

              {/* History Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={clsx(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap",
                    historyFilter === 'all'
                      ? "bg-vertus-gold text-vertus-bg light:text-white"
                      : "bg-vertus-bg text-vertus-white/50 hover:text-vertus-white light:bg-stone-100 light:text-stone-700"
                  )}
                >
                  Todos ({userSessions.length})
                </button>
                {IZA_MODES.map((m) => {
                  const count = userSessions.filter(s => (s.mode || 'whatsapp') === m.id).length;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setHistoryFilter(m.id)}
                      className={clsx(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap",
                        historyFilter === m.id
                          ? clsx(m.badgeBg, "font-extrabold")
                          : "bg-vertus-bg text-vertus-white/50 hover:text-vertus-white light:bg-stone-100 light:text-stone-700"
                      )}
                    >
                      {m.shortTitle} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                {filteredUserSessions.length === 0 ? (
                  <div className="text-center py-12 text-vertus-white/30 text-xs">
                    Nenhum atendimento registrado nesta categoria.
                  </div>
                ) : (
                  filteredUserSessions.map((session) => {
                    const sessionModeCfg = IZA_MODES.find(m => m.id === (session.mode || 'whatsapp')) || IZA_MODES[0];
                    const Icon = sessionModeCfg.icon;
                    return (
                      <button
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className="w-full text-left p-3.5 rounded-xl bg-vertus-bg/80 border border-vertus-gray hover:border-vertus-gold/40 hover:bg-vertus-gold/5 transition-all text-xs group light:bg-stone-50 light:border-stone-200 light:hover:border-amber-500"
                      >
                        <div className="flex items-center justify-between text-[10px] text-vertus-white/40 mb-1.5 light:text-stone-500">
                          <span className={clsx("px-1.5 py-0.5 rounded font-bold flex items-center gap-1", sessionModeCfg.badgeBg)}>
                            <Icon className="w-2.5 h-2.5" />
                            <span>{sessionModeCfg.tabTitle}</span>
                          </span>
                          <span>{new Date(session.lastInteraction || session.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="font-medium text-vertus-white/80 line-clamp-2 group-hover:text-vertus-gold transition-colors light:text-stone-800 light:group-hover:text-amber-800">
                          {session.messages.find(m => m.role === 'user')?.text || 'Conversa com a Iza'}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LUXURY CONCIERGE COMMAND BAR: Responsive Desktop & Mobile layout */}
      {/* Desktop Version */}
      <div className="hidden sm:flex bg-vertus-card/95 light:bg-white border-b border-vertus-gray/80 px-4 sm:px-5 py-2.5 sm:py-3 items-center justify-between gap-3 shrink-0">
        {/* 1. IZA'S PRESTIGE MENTOR IDENTITY */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-vertus-gold/25 via-vertus-card to-vertus-gold/10 border border-vertus-gold/40 flex items-center justify-center shadow-md light:bg-amber-50 light:border-amber-400">
              <Bot className="w-5 h-5 text-vertus-gold" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-vertus-card shadow-sm animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-serif font-bold text-vertus-white tracking-tight">
                Iza
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30 uppercase tracking-wider light:bg-amber-100/90 light:text-amber-950 light:border-amber-300">
                Mentora Comercial
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-vertus-white/50 light:text-stone-600 font-sans">
              Método Vertus • 24/7 Ativo
            </p>
          </div>
        </div>

        {/* 2. STREAMLINED SEGMENTED MODE SELECTOR */}
        <div className="flex items-center p-1 bg-vertus-bg/90 light:bg-stone-200/90 rounded-2xl border border-vertus-gray/70 light:border-stone-300 shrink-0">
          {IZA_MODES.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSwitchTab(m.id)}
                className={clsx(
                  "relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-vertus-card text-vertus-white shadow-sm border border-vertus-gold/30 light:bg-white light:text-stone-950 light:border-stone-300 light:shadow-md font-bold"
                    : "text-vertus-white/60 hover:text-vertus-white hover:bg-vertus-card/40 light:text-stone-600 light:hover:text-stone-900 light:hover:bg-white/70"
                )}
                title={m.shortDesc}
              >
                <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-vertus-gold light:text-amber-800" : "text-vertus-white/50 light:text-stone-500")} />
                <span>{m.shortTitle}</span>
                {isActive && (
                  <span className={clsx("w-1.5 h-1.5 rounded-full", m.indicatorColor)} />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. CLEAN HIGH-VALUE ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 light:bg-emerald-50 light:hover:bg-emerald-100 light:border-emerald-400 light:text-emerald-900 text-xs font-semibold light:font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Carregar ou tirar foto de print do WhatsApp para análise estratégica da Iza"
          >
            <Camera className="w-4 h-4 text-emerald-400 light:text-emerald-700 shrink-0" />
            <span className="whitespace-nowrap">Analisar Print</span>
          </button>

          <Link
            to="/roleplay"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 light:bg-amber-50 light:hover:bg-amber-100 light:border-amber-400 light:text-amber-950 text-xs font-semibold light:font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            title="Ir para a arena de simulação de atendimento e treino de voz"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400 light:text-amber-700 shrink-0" />
            <span className="whitespace-nowrap">Roleplay</span>
          </Link>

          <button
            onClick={() => {
              triggerHaptic('selection');
              setIsGuideOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vertus-gold/15 hover:bg-vertus-gold/25 border border-vertus-gold/40 text-vertus-gold light:bg-amber-100 light:hover:bg-amber-200 light:border-amber-400 light:text-amber-950 text-xs font-semibold light:font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Como usar a Iza com alta assertividade, instalar app e suporte direto"
          >
            <Sparkles className="w-3.5 h-3.5 text-vertus-gold light:text-amber-800 shrink-0" />
            <span className="whitespace-nowrap">Como Usar</span>
          </button>

          {/* Grouped utility icon-buttons */}
          <div className="flex items-center gap-1 pl-1 border-l border-vertus-gray/60 light:border-stone-300">
            <button
              onClick={() => setIsVoiceSettingsOpen(true)}
              className="p-2 rounded-xl bg-vertus-bg/80 hover:bg-vertus-card text-vertus-white/70 hover:text-vertus-gold light:bg-stone-100 light:hover:bg-stone-200 light:text-stone-700 light:hover:text-amber-800 transition-colors cursor-pointer border border-vertus-gray/50 light:border-stone-300/80"
              title="Personalizar tom, velocidade e voz da Iza"
            >
              <Sliders className="w-3.5 h-3.5 text-vertus-gold light:text-amber-800" />
            </button>

            <button
              onClick={handleResetCurrentTab}
              className="p-2 rounded-xl bg-vertus-bg/80 hover:bg-vertus-card text-vertus-white/70 hover:text-vertus-white light:bg-stone-100 light:hover:bg-stone-200 light:text-stone-700 light:hover:text-stone-950 transition-colors cursor-pointer border border-vertus-gray/50 light:border-stone-300/80"
              title="Iniciar novo atendimento nesta aba"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-xl bg-vertus-bg/80 hover:bg-vertus-card text-vertus-white/70 hover:text-vertus-white light:bg-stone-100 light:hover:bg-stone-200 light:text-stone-700 light:hover:text-stone-950 transition-colors cursor-pointer border border-vertus-gray/50 light:border-stone-300/80"
              title="Ver histórico de conversas"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile App Version: 100% full-width adaptive header with zero horizontal overflow */}
      <div className="sm:hidden bg-vertus-card/95 light:bg-white border-b border-vertus-gray/80 px-2.5 py-2 flex flex-col gap-1.5 shrink-0 w-full max-w-full">
        {/* Row 1: Full-width 3-tab segmented selector */}
        <div className="grid grid-cols-3 gap-1 bg-vertus-bg/90 light:bg-stone-200/90 p-1 rounded-xl border border-vertus-gray/70 light:border-stone-300 w-full">
          {IZA_MODES.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSwitchTab(m.id)}
                className={clsx(
                  "flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-semibold transition-all duration-150 cursor-pointer min-w-0",
                  isActive
                    ? "bg-vertus-card text-vertus-white shadow-sm border border-vertus-gold/40 light:bg-white light:text-stone-950 light:border-stone-300 font-bold"
                    : "text-vertus-white/60 hover:text-vertus-white light:text-stone-600"
                )}
                title={m.shortDesc}
              >
                <Icon className={clsx("w-3 h-3 shrink-0", isActive ? "text-vertus-gold light:text-amber-800" : "text-vertus-white/50 light:text-stone-500")} />
                <span className="truncate">{m.shortTitle}</span>
                {isActive && (
                  <span className={clsx("w-1 h-1 rounded-full shrink-0", m.indicatorColor)} />
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2: Streamlined quick action bar */}
        <div className="flex items-center justify-between gap-1.5 w-full pt-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 light:bg-emerald-50 light:text-emerald-900 text-[11px] font-semibold transition-all cursor-pointer active:scale-95 shrink-0"
              title="Analisar print do WhatsApp"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Print</span>
            </button>

            <Link
              to="/roleplay"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 light:bg-amber-50 light:text-amber-950 text-[11px] font-semibold transition-all cursor-pointer active:scale-95 shrink-0"
              title="Ir para simulação de treino de voz"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Treino</span>
            </Link>

            <button
              onClick={() => {
                triggerHaptic('selection');
                setIsGuideOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-vertus-gold/15 hover:bg-vertus-gold/25 border border-vertus-gold/40 text-vertus-gold light:bg-amber-100 light:text-amber-950 text-[11px] font-semibold transition-all cursor-pointer active:scale-95 shrink-0"
              title="Guia de como usar a Iza e suporte comercial"
            >
              <Sparkles className="w-3.5 h-3.5 text-vertus-gold light:text-amber-800 shrink-0" />
              <span>Guia</span>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsVoiceSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-vertus-bg/80 border border-vertus-gray/50 text-vertus-gold light:bg-stone-100 light:border-stone-300 active:scale-95 transition-all cursor-pointer"
              title="Ajustar voz da Iza"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetCurrentTab}
              className="p-1.5 rounded-lg bg-vertus-bg/80 border border-vertus-gray/50 text-vertus-white/70 light:bg-stone-100 light:border-stone-300 active:scale-95 transition-all cursor-pointer"
              title="Nova conversa"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowHistory(true)}
              className="p-1.5 rounded-lg bg-vertus-bg/80 border border-vertus-gray/50 text-vertus-white/70 light:bg-stone-100 light:border-stone-300 active:scale-95 transition-all cursor-pointer"
              title="Histórico"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>


      {/* Messages Area for Current Active Tab */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4 custom-scrollbar"
      >
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-4">
          {currentMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLatestAi = !isUser && idx === currentMessages.map(m => m.role).lastIndexOf('ai');
            const isSpeakingThis = speakingIndex === idx;

            return (
              <div 
                key={idx} 
                className={clsx(
                  "flex gap-2.5 sm:gap-3.5 animate-in fade-in slide-in-from-bottom-1 duration-200",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className={clsx(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-0.5",
                  isUser 
                    ? "bg-vertus-gold text-vertus-bg light:text-white font-bold text-xs" 
                    : "bg-vertus-gray light:bg-stone-200 text-vertus-gold light:text-amber-800 border border-vertus-gold/20 light:border-amber-300"
                )}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={clsx(
                  "rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md group/bubble relative",
                  isUser 
                    ? "bg-vertus-gold text-vertus-bg light:text-white p-3.5 sm:p-4 rounded-tr-none font-medium max-w-[90%] sm:max-w-[80%] md:max-w-[75%]" 
                    : "bg-vertus-card light:bg-[#FAF8F5] border border-vertus-gray/80 light:border-stone-300 text-vertus-white light:text-stone-900 p-3.5 sm:p-5 rounded-tl-none light:shadow-sm flex-1 min-w-0 max-w-full"
                )}>
                  {isUser ? (
                    <div className="space-y-2">
                      {msg.image && (
                        <div className="rounded-xl overflow-hidden border border-black/15 shadow-sm max-w-xs bg-black/5">
                          <img 
                            src={msg.image} 
                            alt="Anexo enviado" 
                            className="w-full h-auto object-contain max-h-60 rounded-lg" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  ) : (
                    <WhatsAppScriptCard
                      text={msg.text}
                      isSpeaking={isSpeakingThis}
                      onSpeak={() => handleSpeak(msg.text, idx)}
                      onRefineTone={handleRefineTone}
                      onRetry={currentMessages.some(m => m.role === 'user') ? () => {
                        const lastUser = [...currentMessages].reverse().find(m => m.role === 'user');
                        if (lastUser) {
                          const cleanPrompt = lastUser.text.replace('\n\n[Imagem Anexada]', '');
                          handleSend(cleanPrompt);
                        }
                      } : undefined}
                      isLatestAi={isLatestAi}
                      isTyping={isTyping}
                      activeMode={activeMode}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2.5 sm:gap-3.5 items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-vertus-gray light:bg-stone-200 text-vertus-gold light:text-amber-800 border border-vertus-gold/20 light:border-amber-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-vertus-card light:bg-white border border-vertus-gray light:border-stone-300 px-4 py-3 rounded-2xl rounded-tl-none light:shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="text-[11px] text-vertus-white/50 light:text-stone-600 mr-1 font-medium">
                    Iza estruturando orientação e aprendizado
                  </span>
                  <div className="w-1.5 h-1.5 bg-vertus-gold rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-vertus-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-vertus-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Guide & Strategic Onboarding Strip */}
          {currentMessages.length <= 1 && (
            <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-vertus-gold/15 via-vertus-card to-vertus-card light:from-amber-100/90 light:via-white light:to-white border border-vertus-gold/40 light:border-amber-300 shadow-md">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-vertus-gold/20 light:bg-amber-200/80 flex items-center justify-center text-vertus-gold light:text-amber-900 shrink-0 shadow-sm mt-0.5 sm:mt-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-vertus-white light:text-stone-900 leading-snug">
                      Como conduzir a Iza com máxima assertividade?
                    </p>
                    <p className="text-[11px] text-vertus-white/70 light:text-stone-600 mt-1 leading-relaxed">
                      Exemplos de prompts, envio de prints, atalho para baixar o app e suporte direto.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('selection');
                    setIsGuideOpen(true);
                  }}
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-vertus-gold text-vertus-bg font-bold text-xs light:bg-amber-600 light:text-white shrink-0 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Abrir Guia
                </button>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('selection');
                  setIsGuideOpen(true);
                }}
                className="sm:hidden w-full mt-3 py-2.5 px-3 rounded-xl bg-vertus-gold text-vertus-bg font-bold text-xs light:bg-amber-600 light:text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center shadow-sm"
              >
                Abrir Guia
              </button>
            </div>
          )}

          {/* Suggested Prompts tailored for the active Tab (desktop only, hidden on mobile for clean focused screen) */}
          {currentMessages.length <= 1 && (
            <div className="hidden md:block pt-4 space-y-2">
              <p className="text-[10px] text-vertus-white/40 light:text-stone-600 uppercase tracking-widest font-bold px-1">
                Sugestões Rápidas • {currentModeConfig.tabTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentModeConfig.suggestedPrompts.map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(promptText)}
                    className="p-3 sm:p-3.5 rounded-xl bg-vertus-bg/60 border border-vertus-gray hover:border-vertus-gold/40 hover:bg-vertus-gold/5 text-left text-xs sm:text-sm text-vertus-white/80 hover:text-vertus-gold transition-all flex items-start gap-2.5 group cursor-pointer light:bg-white light:border-stone-300 light:shadow-sm light:text-stone-800 light:hover:text-amber-950 light:hover:border-amber-500 light:hover:bg-amber-50/50"
                  >
                    <Sparkles className="w-4 h-4 text-vertus-gold light:text-amber-700 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="leading-relaxed font-normal light:font-medium">{promptText}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2 sm:p-3 md:p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-vertus-bg/95 light:bg-[#F4F0E8] backdrop-blur-md border-t border-vertus-gray/60 light:border-stone-300 shrink-0 z-20">
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-2">
          {/* Image Attachment Preview & Strategic WhatsApp Analysis */}
          {attachedImage && (
            <div className="p-3 bg-vertus-card/90 light:bg-white border border-emerald-500/30 light:border-emerald-400 rounded-2xl space-y-2.5 shadow-lg light:shadow-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0 bg-black/20">
                    <img src={attachedImage} alt="Print WhatsApp" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 light:bg-emerald-600 animate-pulse" />
                      <p className="text-xs font-bold text-emerald-400 light:text-emerald-800">Print do WhatsApp Carregado</p>
                    </div>
                    <p className="text-[10px] text-vertus-white/60 light:text-stone-600">Escolha uma ação rápida abaixo ou faça sua pergunta:</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1.5 text-vertus-white/40 hover:text-red-400 hover:bg-red-400/10 light:text-stone-500 light:hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Remover anexo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Analysis Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-vertus-gray/40 light:border-stone-200">
                <button
                  type="button"
                  onClick={() => handleSend("Iza, analise este print do WhatsApp com a paciente: qual o nível de interesse (fria, morna ou quente), onde a conversa travou e qual a mensagem ideal para destravar agora?")}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 light:bg-emerald-50 light:border-emerald-300 light:text-emerald-900 text-[11px] font-medium transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>🔍</span> Diagnóstico & Destrave
                </button>
                <button
                  type="button"
                  onClick={() => handleSend("Gere apenas a mensagem de WhatsApp pronta para eu copiar e enviar para destravar essa conversa imediatamente.")}
                  className="px-2.5 py-1.5 rounded-lg bg-vertus-gold/15 hover:bg-vertus-gold/25 border border-vertus-gold/30 text-vertus-gold light:bg-amber-50 light:border-amber-300 light:text-amber-900 text-[11px] font-medium transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>💬</span> Script Direto
                </button>
                <button
                  type="button"
                  onClick={() => handleSend("Qual o melhor roteiro de áudio de 20 a 25 segundos para eu mandar para essa paciente agora?")}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 light:bg-amber-50 light:border-amber-300 light:text-amber-900 text-[11px] font-medium transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>🎙️</span> Roteiro em Áudio
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp-Style Dynamic Auto-Expanding Input Bar */}
          <div className="flex items-end gap-2 sm:gap-3">
            {/* Main Input Pill (Auto-expands vertically showing 3+ lines cleanly as user types) */}
            <div className="flex-1 min-w-0 flex items-end bg-vertus-card light:bg-white border border-vertus-gray/80 light:border-stone-300 focus-within:border-vertus-gold/60 focus-within:light:border-amber-600 focus-within:ring-1 focus-within:ring-vertus-gold/30 focus-within:light:ring-amber-500/20 rounded-2xl sm:rounded-3xl px-2 sm:px-3 py-1.5 sm:py-2 transition-all shadow-sm">
              {/* Attachment Button */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all flex items-center justify-center shrink-0 active:scale-95 mb-0.5 cursor-pointer",
                  attachedImage 
                    ? "bg-emerald-500/20 text-emerald-400 light:bg-emerald-100 light:text-emerald-800 ring-1 ring-emerald-500/40" 
                    : "text-vertus-white/40 hover:text-vertus-gold hover:bg-vertus-white/5 light:text-stone-400 light:hover:text-amber-800 light:hover:bg-stone-100"
                )}
                title="Anexar print ou imagem de conversa do WhatsApp"
              >
                <ImageIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>

              {/* Dynamic Auto-Expanding Textarea */}
              <textarea
                ref={textareaRef}
                id="chat-input"
                name="chat-input"
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
                onPaste={handlePaste}
                placeholder="Digite a dúvida ou situação da paciente..."
                className="flex-1 bg-transparent text-[15px] sm:text-sm text-vertus-white light:text-stone-900 placeholder:text-vertus-white/35 light:placeholder:text-stone-400 outline-none resize-none min-h-[40px] max-h-[140px] px-2 sm:px-2.5 py-2 leading-relaxed custom-scrollbar font-sans"
                rows={1}
              />
            </div>

            {/* WhatsApp-Style Circular Action / Send Button */}
            <button 
              type="button"
              onClick={() => handleSend()} 
              disabled={(!input.trim() && !attachedImage) || isTyping}
              className={clsx(
                "w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all flex items-center justify-center shrink-0 shadow-md",
                (input.trim() || attachedImage) && !isTyping 
                  ? "bg-vertus-gold text-vertus-bg light:bg-amber-600 light:text-white hover:scale-105 active:scale-95 cursor-pointer font-bold shadow-vertus-gold/25 light:shadow-amber-600/30" 
                  : "bg-vertus-card/80 light:bg-stone-200 border border-vertus-gray/60 light:border-stone-300 text-vertus-white/20 light:text-stone-400 cursor-not-allowed"
              )}
              title="Enviar mensagem para Iza"
            >
              <Send className={clsx(
                "w-4 h-4 sm:w-5 sm:h-5 transition-transform",
                (input.trim() || attachedImage) && !isTyping ? "translate-x-0.5 text-vertus-bg light:text-white" : ""
              )} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={() => {
          clearChatSessions();
          setConversations({
            whatsapp: [createGreeting(IZA_MODES[0].welcomeMessage)],
            audio: [createGreeting(IZA_MODES[1].welcomeMessage)],
            deep: [createGreeting(IZA_MODES[2].welcomeMessage)]
          });
          setIsConfirmClearOpen(false);
          setShowHistory(false);
          toast.success('Histórico de conversas apagado.');
        }}
        title="Limpar Histórico"
        message="Tem certeza que deseja apagar todo o histórico de atendimentos anteriores com a Iza?"
        confirmText="Limpar Tudo"
      />

      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />

      <IzaGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};

export default ChatInterface;
