import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  MessageSquare, 
  Camera, 
  Volume2, 
  Smartphone, 
  Laptop, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  Bot, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  Send,
  MessageCircle,
  Share,
  PlusSquare,
  MoreVertical,
  CheckCircle2,
  PhoneCall,
  Download,
  Sun,
  ArrowDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { triggerHaptic } from '../utils/haptics';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface IzaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'conducao' | 'recursos' | 'app-web' | 'suporte';
}

export const IzaGuideModal: React.FC<IzaGuideModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'conducao'
}) => {
  const [activeTab, setActiveTab] = useState<'conducao' | 'recursos' | 'app-web' | 'suporte'>(defaultTab);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleDirectInstall = async () => {
    triggerHaptic('selection');
    if (isInstallable) {
      const success = await install();
      if (success) {
        toast.success('Aplicativo instalado com sucesso!');
      }
    } else if (isIOS) {
      toast.info('No iPhone: toque no ícone de Compartilhar do Safari e em "Adicionar à Tela de Início".');
    } else if (isInstalled) {
      toast.success('O aplicativo já está instalado no seu dispositivo!');
    } else {
      toast.info('Toque no ícone de Download (seta para baixo) destacado no topo do sistema.');
    }
  };

  // Synchronize defaultTab if changed on open
  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const supportNumber = '+55 43 98442-0087';
  const supportRawNumber = '5543984420087';
  const supportMessage = encodeURIComponent('Olá! Estou usando a Iza na Vertus Performance e gostaria de tirar uma dúvida de suporte comercial.');
  const whatsappUrl = `https://wa.me/${supportRawNumber}?text=${supportMessage}`;

  const promptExamples = [
    {
      title: 'Objeção de Preço / Pesquisa de Mercado',
      weak: '"A paciente achou caro, o que eu falo?"',
      strong: '"A paciente fez avaliação facial, o orçamento foi de R$ 3.600 em 6x e ela disse que achou acima do que esperava e vai pesquisar antes de fechar. Quero uma resposta acolhedora sem dar desconto para valorizar a exclusividade da nossa clínica."',
      benefit: 'A Iza gera uma resposta com ancoragem de valor, foco na segurança e uma pergunta de fechamento elegante.'
    },
    {
      title: 'Objeção "Preciso Falar com Meu Marido"',
      weak: '"Ela disse que vai falar com o esposo."',
      strong: '"A paciente amou o plano de tratamento de preenchimento labial, mas no final disse que precisa conversar com o marido antes de passar o cartão. Como contorno isso com empatia e deixo a vaga pré-reservada?"',
      benefit: 'A Iza cria um script que traz o parceiro como apoiador sem pressionar a paciente.'
    },
    {
      title: 'Recuperação de Paciente que Sumiu (Vácuo)',
      weak: '"Manda mensagem pra paciente sumida."',
      strong: '"Enviei o orçamento há 48 horas e ela visualizou e não respondeu. Quero uma mensagem leve e descontraída para reabrir o diálogo sem parecer cobrança chata."',
      benefit: 'Gera um gatilho de curiosidade acolhedor que resgata a atenção da paciente com respeito.'
    }
  ];

  const handleCopyPrompt = (text: string, index: number) => {
    triggerHaptic('selection');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Exemplo de prompt copiado! Cole no campo da Iza para testar.');
    setTimeout(() => setCopiedIndex(null), 2200);
  };

  const handleCopyPhone = () => {
    triggerHaptic('selection');
    navigator.clipboard.writeText(supportNumber);
    setCopiedPhone(true);
    toast.success('Número de suporte copiado!');
    setTimeout(() => setCopiedPhone(false), 2200);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-vertus-card/95 light:bg-[#FAF8F5] border border-vertus-gray/80 light:border-stone-300 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-auto"
      >
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-vertus-gray/60 light:border-stone-300 flex items-center justify-between gap-3 shrink-0 bg-vertus-bg/60 light:bg-stone-100/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-vertus-gold/15 light:bg-amber-100 border border-vertus-gold/30 light:border-amber-400/50 flex items-center justify-center text-vertus-gold light:text-amber-800 shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-serif font-bold text-vertus-white light:text-stone-950 truncate">
                  Como Usar a Iza com Alta Assertividade
                </h2>
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-vertus-gold/20 text-vertus-gold light:bg-amber-100 light:text-amber-900 border border-vertus-gold/30 light:border-amber-300 uppercase tracking-wider">
                  Web & App
                </span>
              </div>
              <p className="text-xs text-vertus-white/60 light:text-stone-600 truncate">
                Guia estratégico para extrair o melhor da sua Mentora Comercial 24/7
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl text-vertus-white/50 hover:text-vertus-white hover:bg-vertus-white/10 light:text-stone-500 light:hover:text-stone-900 light:hover:bg-stone-200 transition-colors cursor-pointer shrink-0"
            title="Fechar guia"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-3 sm:px-6 pt-2.5 pb-2 bg-vertus-bg/30 light:bg-stone-100/50 border-b border-vertus-gray/40 light:border-stone-200 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('conducao');
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                activeTab === 'conducao'
                  ? "bg-vertus-gold text-vertus-bg font-bold shadow-sm light:bg-amber-600 light:text-white"
                  : "text-vertus-white/70 hover:text-vertus-white hover:bg-vertus-gray/50 light:text-stone-600 light:hover:text-stone-950 light:hover:bg-stone-200/60"
              )}
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Como Conduzir a Iza</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('recursos');
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                activeTab === 'recursos'
                  ? "bg-vertus-gold text-vertus-bg font-bold shadow-sm light:bg-amber-600 light:text-white"
                  : "text-vertus-white/70 hover:text-vertus-white hover:bg-vertus-gray/50 light:text-stone-600 light:hover:text-stone-950 light:hover:bg-stone-200/60"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>O Que Ela Faz</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('app-web');
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                activeTab === 'app-web'
                  ? "bg-vertus-gold text-vertus-bg font-bold shadow-sm light:bg-amber-600 light:text-white"
                  : "text-vertus-white/70 hover:text-vertus-white hover:bg-vertus-gray/50 light:text-stone-600 light:hover:text-stone-950 light:hover:bg-stone-200/60"
              )}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>Instalar App & Versão Web</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('suporte');
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                activeTab === 'suporte'
                  ? "bg-emerald-500 text-white font-bold shadow-sm"
                  : "text-emerald-400 light:text-emerald-800 hover:bg-emerald-500/10 light:hover:bg-emerald-50"
              )}
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>Suporte Direto</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* TAB 1: COMO CONDUZIR A IZA */}
          {activeTab === 'conducao' && (
            <div className="space-y-6">
              {/* Highlight Strategy Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-vertus-gold/15 via-vertus-card to-vertus-card light:from-amber-100/90 light:via-white light:to-white border border-vertus-gold/30 light:border-amber-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-vertus-gold/20 light:bg-amber-200/90 flex items-center justify-center text-vertus-gold light:text-amber-900 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-serif font-bold text-vertus-white light:text-stone-950">
                      O Segredo da Assertividade: Contexto Gera Conversão
                    </h3>
                    <p className="text-xs text-vertus-white/70 light:text-stone-700 leading-relaxed">
                      A Iza foi treinada com as melhores estratégias de vendas consultivas para clínicas de estética e saúde. 
                      Quanto mais <strong>detalhes reais da paciente</strong> você fornecer (procedimento, valor ofertado, objeção e tom desejado), mais irresistível será o script gerado.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Steps to Success */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-vertus-bg/50 light:bg-white border border-vertus-gray/60 light:border-stone-200 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 light:bg-emerald-100 text-emerald-400 light:text-emerald-800 text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-vertus-white light:text-stone-900">Mande a Situação Real</h4>
                  <p className="text-[11px] text-vertus-white/60 light:text-stone-600 leading-relaxed">
                    Diga qual é o tratamento, o valor aproximado e o que a paciente acabou de dizer no WhatsApp ou na recepção.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-vertus-bg/50 light:bg-white border border-vertus-gray/60 light:border-stone-200 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-vertus-gold/20 light:bg-amber-100 text-vertus-gold light:text-amber-800 text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-vertus-white light:text-stone-900">Tire Print da Conversa</h4>
                  <p className="text-[11px] text-vertus-white/60 light:text-stone-600 leading-relaxed">
                    Não quer digitar? Basta clicar em <strong>Print</strong> e subir a foto da conversa. A Iza lê os textos e detecta a objeção oculta automaticamente.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-vertus-bg/50 light:bg-white border border-vertus-gray/60 light:border-stone-200 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 light:bg-amber-100 text-amber-400 light:text-amber-800 text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-vertus-white light:text-stone-900">Refine o Tom com 1 Clique</h4>
                  <p className="text-[11px] text-vertus-white/60 light:text-stone-600 leading-relaxed">
                    Abaixo da mensagem gerada, use os botões <em>Mais Acolhedor</em>, <em>Mais Direto</em> ou ouça a entonação no botão <strong>Ouvir</strong>.
                  </p>
                </div>
              </div>

              {/* Real World Before & After Examples */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-vertus-gold light:text-amber-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Exemplos Práticos: Perguntas Que Funcionam
                  </h4>
                  <span className="text-[10px] text-vertus-white/40 light:text-stone-500">Toque em copiar para testar</span>
                </div>

                <div className="space-y-3">
                  {promptExamples.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-vertus-bg/40 light:bg-white border border-vertus-gray/50 light:border-stone-300 space-y-2.5 transition-all hover:border-vertus-gold/40 light:hover:border-amber-400"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-vertus-white light:text-stone-900">{item.title}</span>
                        <button
                          onClick={() => handleCopyPrompt(item.strong, idx)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-vertus-card light:bg-stone-100 hover:bg-vertus-gold/20 light:hover:bg-amber-100 text-[11px] text-vertus-gold light:text-amber-900 border border-vertus-gold/30 light:border-amber-300 transition-all cursor-pointer shrink-0 active:scale-95"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="font-bold text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-red-500/5 light:bg-red-50 border border-red-500/20 light:border-red-200">
                          <span className="font-bold text-red-400 light:text-red-700 block mb-1">❌ Como NÃO perguntar:</span>
                          <p className="text-vertus-white/60 light:text-stone-600 italic leading-relaxed">{item.weak}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-500/5 light:bg-emerald-50 border border-emerald-500/20 light:border-emerald-200">
                          <span className="font-bold text-emerald-400 light:text-emerald-800 block mb-1"> Como conduzir com assertividade:</span>
                          <p className="text-vertus-white/85 light:text-stone-900 leading-relaxed">{item.strong}</p>
                        </div>
                      </div>

                      <div className="text-[10px] text-vertus-gold/90 light:text-amber-900 flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span><strong>Resultado gerado:</strong> {item.benefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: O QUE A IZA FAZ */}
          {activeTab === 'recursos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Modo WhatsApp */}
                <div className="p-4 rounded-2xl bg-vertus-bg/40 light:bg-white border border-emerald-500/30 light:border-emerald-300 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 light:bg-emerald-100 flex items-center justify-center text-emerald-400 light:text-emerald-800 shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-vertus-white light:text-stone-900">Scripts Prontos para WhatsApp</h4>
                      <span className="text-[10px] text-emerald-400 light:text-emerald-800 font-semibold">1-Clique para copiar e colar</span>
                    </div>
                  </div>
                  <p className="text-xs text-vertus-white/70 light:text-stone-600 leading-relaxed">
                    A Iza entrega a mensagem finalizada, sem robôs, sem saudações artificiais. Você aperta o botão verde <strong>Copiar</strong> e cola instantaneamente na conversa com a paciente.
                  </p>
                </div>

                {/* 2. Modo Áudio & Voz */}
                <div className="p-4 rounded-2xl bg-vertus-bg/40 light:bg-white border border-vertus-gold/30 light:border-amber-300 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-vertus-gold/20 light:bg-amber-100 flex items-center justify-center text-vertus-gold light:text-amber-800 shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-vertus-white light:text-stone-900">Roteiros e Entonação para Áudio</h4>
                      <span className="text-[10px] text-vertus-gold light:text-amber-800 font-semibold">Voz humana com ritmo ideal (~25s)</span>
                    </div>
                  </div>
                  <p className="text-xs text-vertus-white/70 light:text-stone-600 leading-relaxed">
                    Ao selecionar a aba <strong>Áudio / Voz</strong>, a Iza sugere um texto cadenciado. Você clica em <strong>Ouvir</strong> para escutar a pronúncia e entonação perfeitas antes de gravar.
                  </p>
                </div>

                {/* 3. Leitura de Prints */}
                <div className="p-4 rounded-2xl bg-vertus-bg/40 light:bg-white border border-emerald-500/30 light:border-emerald-300 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 light:bg-emerald-100 flex items-center justify-center text-emerald-400 light:text-emerald-800 shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-vertus-white light:text-stone-900">Análise Visual de Prints</h4>
                      <span className="text-[10px] text-emerald-400 light:text-emerald-800 font-semibold">Inteligência multimodal instantânea</span>
                    </div>
                  </div>
                  <p className="text-xs text-vertus-white/70 light:text-stone-600 leading-relaxed">
                    Basta bater uma foto ou subir um print da tela do WhatsApp da paciente. A Iza lê os balões, identifica o humor da paciente e prepara a resposta exata.
                  </p>
                </div>

                {/* 4. Simulador Roleplay */}
                <div className="p-4 rounded-2xl bg-vertus-bg/40 light:bg-white border border-amber-500/30 light:border-amber-300 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 light:bg-amber-100 flex items-center justify-center text-amber-400 light:text-amber-800 shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-vertus-white light:text-stone-900">Simulador de Pacientes Difíceis</h4>
                      <span className="text-[10px] text-amber-400 light:text-amber-800 font-semibold">Treino prático de voz</span>
                    </div>
                  </div>
                  <p className="text-xs text-vertus-white/70 light:text-stone-600 leading-relaxed">
                    Na aba <strong>Simulador</strong>, você simula conversas com diferentes perfis (a paciente cética, a apressada, a caçadora de descontos) e recebe nota e feedback na hora.
                  </p>
                </div>
              </div>

              {/* Banco de Objeções card */}
              <div className="p-4 rounded-2xl bg-vertus-card light:bg-stone-50 border border-vertus-gray/60 light:border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-vertus-white light:text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-vertus-gold light:text-amber-700" />
                    Banco Estratégico de Objeções
                  </h4>
                  <p className="text-xs text-vertus-white/60 light:text-stone-600">
                    Acesse a aba <strong>Objeções</strong> no menu para consultar dezenas de respostas categorizadas por temas (Marido, Preço, Medo de dor, Comparação).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSTALAR APP & VERSÃO WEB */}
          {activeTab === 'app-web' && (
            <div className="space-y-6">
              {/* Dual platform explanation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-vertus-card/80 light:bg-white border border-vertus-gold/30 light:border-amber-300 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-serif font-bold text-vertus-white light:text-stone-950">
                    Use Onde For Mais Confortável: No Navegador ou Instalado
                  </h3>
                </div>
                <p className="text-xs text-vertus-white/70 light:text-stone-600 leading-relaxed">
                  A Vertus Performance foi desenvolvida com tecnologia PWA de ponta. Isso significa que você tem duas formas fantásticas de trabalhar:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-vertus-bg/60 light:bg-stone-50 border border-vertus-gray/60 light:border-stone-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-vertus-white light:text-stone-900">
                      <Laptop className="w-4 h-4 text-vertus-gold light:text-amber-800" />
                      <span>Versão Web (Computador)</span>
                    </div>
                    <p className="text-[11px] text-vertus-white/60 light:text-stone-600 leading-relaxed">
                      Perfeita para a recepção ou consultório lado a lado com o <strong>WhatsApp Web</strong>. Arraste prints diretamente para a tela para gerar respostas rápidas.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-vertus-bg/60 light:bg-stone-50 border border-vertus-gray/60 light:border-stone-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-vertus-white light:text-stone-900">
                      <Smartphone className="w-4 h-4 text-emerald-400 light:text-emerald-700" />
                      <span>Aplicativo Instalado (Celular)</span>
                    </div>
                    <p className="text-[11px] text-vertus-white/60 light:text-stone-600 leading-relaxed">
                      Funciona como um aplicativo nativo no iPhone e Android, em tela cheia, sem barras de navegador, pronto ao lado do seu WhatsApp no celular.
                    </p>
                  </div>
                </div>
              </div>

              {/* ⭐ O ATALHO MAIS RÁPIDO: BOTÃO BAIXAR APP DIRETO NO TOPO (COM CÍRCULO E SETA) */}
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-vertus-card via-vertus-card/95 to-vertus-bg border-2 border-vertus-gold/40 light:border-amber-300 shadow-xl space-y-4 relative overflow-hidden">
                {/* Subtle ambient lighting */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-vertus-gold/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-vertus-gray/50 light:border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 light:text-emerald-700 light:bg-emerald-100">
                      <Download className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-vertus-white light:text-stone-950 flex items-center gap-1.5">
                        O Atalho Mais Rápido: Botão "Baixar App" Direto no Topo
                      </h3>
                      <p className="text-[11px] text-emerald-400 light:text-emerald-700 font-semibold">
                        Instalação em 1 toque sem precisar abrir menus do navegador
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 light:bg-emerald-100 light:text-emerald-800 border border-emerald-500/30 uppercase tracking-wider">
                    Recomendado
                  </span>
                </div>

                {/* VISUAL ILUSTRATIVO IDÊNTICO AO PRINT (TOPO DA TELA COM CÍRCULO E SETA VERDE) */}
                <div className="rounded-2xl bg-vertus-bg/95 light:bg-stone-900 border border-vertus-gray/80 p-3 sm:p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-vertus-white/50 px-1 font-mono">
                    <span>Barra superior do aplicativo da Iza:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Canto superior direito
                    </span>
                  </div>

                  {/* Header Bar Mockup */}
                  <div className="rounded-xl bg-vertus-card/90 light:bg-stone-950/95 border border-vertus-gray/60 p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-md relative">
                    {/* Left: Brand */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex flex-col text-left shrink-0">
                        <span className="font-serif font-bold text-[11px] sm:text-xs text-vertus-gold tracking-[0.2em] leading-none">
                          VERTUS
                        </span>
                        <span className="text-[6.5px] sm:text-[7px] font-sans font-semibold tracking-[0.25em] text-vertus-sidebar-text/60 uppercase mt-0.5 leading-none">
                          PERFORMANCE
                        </span>
                      </div>
                      <div className="h-3.5 w-[1px] bg-vertus-gray/60 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-vertus-white truncate block">
                          Iza • Mentora Comercial
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-[8px] sm:text-[8.5px] text-vertus-gold font-medium uppercase tracking-wider">Online 24/7</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Controls with circled download button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Sun theme icon mock */}
                      <div className="w-7 h-7 rounded-full bg-vertus-gray/60 border border-vertus-gold/20 flex items-center justify-center text-vertus-gold opacity-60">
                        <Sun className="w-3.5 h-3.5" />
                      </div>

                      {/* Circled Download button - Exact representation of user's green drawing */}
                      <div className="relative flex items-center justify-center">
                        {/* Glow & highlighted green ring */}
                        <div className="absolute -inset-2.5 sm:-inset-3 rounded-full border-[2.5px] border-emerald-400 bg-emerald-500/20 animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.7)] pointer-events-none z-10" />

                        <button
                          onClick={handleDirectInstall}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-vertus-gold/25 border border-vertus-gold/60 text-vertus-gold flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-20 shadow-md"
                          title="Clique para testar o atalho direto"
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-vertus-gold animate-bounce" />
                        </button>
                      </div>

                      {/* User Avatar mock */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-900 border border-vertus-gold/60 flex items-center justify-center text-[10px] font-bold text-vertus-gold shadow-sm">
                        CA
                      </div>
                    </div>
                  </div>

                  {/* Visual Arrow & Callout Box */}
                  <div className="pt-1 flex items-start gap-2.5 bg-emerald-950/40 light:bg-emerald-900/25 border border-emerald-500/40 rounded-xl p-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-bold text-emerald-300 light:text-emerald-200 flex items-center gap-1.5 flex-wrap">
                        <span>🟢 Círculo Verde:</span>
                        <span>Toque no botão com a setinha para baixo</span>
                      </p>
                      <p className="text-[11px] text-vertus-white/80 light:text-stone-300 leading-relaxed">
                        Este botão fica permanentemente no topo direito do sistema. Ao clicar nele, você não precisa procurar opções em menus externos: o aplicativo se instala direto no seu celular ou computador!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Practical Step-by-Step Instructions for the Shortcut */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-vertus-bg/60 light:bg-stone-50 border border-vertus-gray/60 light:border-stone-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-vertus-white light:text-stone-900">
                      <span className="w-5 h-5 rounded-full bg-vertus-gold/20 text-vertus-gold light:bg-amber-100 light:text-amber-900 text-[10px] flex items-center justify-center font-bold">1</span>
                      <span>Onde Encontrar</span>
                    </div>
                    <p className="text-[11px] text-vertus-white/70 light:text-stone-600 leading-relaxed">
                      Olhe no canto superior direito do aplicativo, logo ao lado do botão de sol/lua e da sua foto.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-vertus-bg/60 light:bg-stone-50 border border-vertus-gray/60 light:border-stone-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-vertus-white light:text-stone-900">
                      <span className="w-5 h-5 rounded-full bg-vertus-gold/20 text-vertus-gold light:bg-amber-100 light:text-amber-900 text-[10px] flex items-center justify-center font-bold">2</span>
                      <span>Toque no Ícone</span>
                    </div>
                    <p className="text-[11px] text-vertus-white/70 light:text-stone-600 leading-relaxed">
                      Toque no círculo com a seta de download. No Android/PC, a janela de confirmação abre na hora.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-vertus-bg/60 light:bg-stone-50 border border-vertus-gray/60 light:border-stone-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-vertus-white light:text-stone-900">
                      <span className="w-5 h-5 rounded-full bg-vertus-gold/20 text-vertus-gold light:bg-amber-100 light:text-amber-900 text-[10px] flex items-center justify-center font-bold">3</span>
                      <span>Confirme "Instalar"</span>
                    </div>
                    <p className="text-[11px] text-vertus-white/70 light:text-stone-600 leading-relaxed">
                      Confirme e pronto! O ícone da Vertus fica na sua tela de início, pronto para uso diário em tela cheia.
                    </p>
                  </div>
                </div>

                {/* Direct Action Button to Trigger the Installation Shortcut Right Now */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-vertus-bg/40 light:bg-stone-50 p-3 sm:p-4 rounded-2xl border border-vertus-gray/60 light:border-stone-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-vertus-white/80 light:text-stone-700">
                      {isInstalled
                        ? 'Você já está utilizando a versão instalada deste aplicativo.'
                        : 'Você pode testar esse atalho agora mesmo clicando no botão ao lado:'}
                    </span>
                  </div>

                  <button
                    onClick={handleDirectInstall}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-vertus-bg font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 text-vertus-bg" />
                    <span>{isInstalled ? 'App Já Instalado' : 'Testar Atalho / Baixar Agora'}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-step Installation Guides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* iOS iPhone Guide */}
                <div className="p-4 sm:p-5 rounded-2xl bg-vertus-bg/50 light:bg-white border border-vertus-gray/70 light:border-stone-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-vertus-white light:text-stone-900 flex items-center gap-1.5">
                      <span>🍎</span> Como instalar no iPhone (Safari)
                    </span>
                    <span className="text-[10px] font-semibold text-vertus-gold light:text-amber-800 bg-vertus-gold/10 light:bg-amber-50 px-2 py-0.5 rounded-md">
                      iOS Safari
                    </span>
                  </div>

                  <ol className="space-y-2.5 text-xs text-vertus-white/80 light:text-stone-700">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-vertus-gray light:bg-stone-200 text-vertus-gold light:text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Abra o link do sistema pelo navegador <strong>Safari</strong> do seu iPhone.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-vertus-gray light:bg-stone-200 text-vertus-gold light:text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span className="flex items-center gap-1 flex-wrap">
                        Toque no botão de <strong>Compartilhar</strong> 
                        <span className="inline-flex items-center p-0.5 bg-blue-500/20 text-blue-400 rounded">
                          <Share className="w-3.5 h-3.5" />
                        </span> 
                        (ícone do quadrado com a seta para cima na barra inferior).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-vertus-gray light:bg-stone-200 text-vertus-gold light:text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span className="flex items-center gap-1 flex-wrap">
                        Role a lista para baixo e toque em <strong>Adicionar à Tela de Início</strong> 
                        <PlusSquare className="w-3.5 h-3.5 text-vertus-gold" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">✓</span>
                      <span>Toque em <strong>Adicionar</strong> no canto superior direito. Pronto! O app fica na sua tela inicial.</span>
                    </li>
                  </ol>
                </div>

                {/* Android Guide */}
                <div className="p-4 sm:p-5 rounded-2xl bg-vertus-bg/50 light:bg-white border border-vertus-gray/70 light:border-stone-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-vertus-white light:text-stone-900 flex items-center gap-1.5">
                      <span>🤖</span> Como instalar no Android (Chrome)
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 light:text-emerald-800 bg-emerald-500/10 light:bg-emerald-50 px-2 py-0.5 rounded-md">
                      Chrome / Samsung
                    </span>
                  </div>

                  <ol className="space-y-2.5 text-xs text-vertus-white/80 light:text-stone-700">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-vertus-gray light:bg-stone-200 text-vertus-gold light:text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Abra o link do sistema no navegador <strong>Google Chrome</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-vertus-gray light:bg-stone-200 text-vertus-gold light:text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span className="flex items-center gap-1 flex-wrap">
                        Toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-vertus-gray light:bg-stone-200 text-vertus-gold light:text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>
                        Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">✓</span>
                      <span>Confirme em <strong>Instalar</strong>. O ícone da Vertus será adicionado aos seus aplicativos!</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPORTE & DÚVIDAS DIRETO COMIGO */}
          {activeTab === 'suporte' && (
            <div className="space-y-5">
              {/* Premium Support Hero */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-vertus-card to-vertus-bg light:from-emerald-50 light:via-white light:to-stone-50 border border-emerald-500/40 light:border-emerald-300 shadow-xl space-y-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 light:bg-emerald-100 border border-emerald-500/40 flex items-center justify-center text-emerald-400 light:text-emerald-800 shrink-0 shadow-lg">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 light:text-emerald-800 block">
                      Canal de Atendimento Comercial & Técnico
                    </span>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-vertus-white light:text-stone-950">
                      Precisa de Ajuda ou Tem Alguma Dúvida?
                    </h3>
                    <p className="text-xs text-vertus-white/70 light:text-stone-600 leading-relaxed max-w-xl">
                      Estou disponível diretamente no WhatsApp para tirar dúvidas sobre condução de casos com pacientes, suporte técnico no app ou sugestões para a sua clínica.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  {/* WhatsApp Direct Action Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic('selection')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-vertus-bg font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer light:text-white"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Falar Comigo no WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  {/* Copy Phone Button */}
                  <button
                    onClick={handleCopyPhone}
                    className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-vertus-card light:bg-stone-100 hover:bg-vertus-gray light:hover:bg-stone-200 border border-vertus-gray/80 light:border-stone-300 text-xs font-semibold text-vertus-white/90 light:text-stone-800 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copiado: {supportNumber}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-vertus-gold light:text-amber-800" />
                        <span>Copiar: <strong>{supportNumber}</strong></span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Support FAQ / When to Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-vertus-bg/40 light:bg-white border border-vertus-gray/60 light:border-stone-200 space-y-1">
                  <span className="text-xs font-bold text-vertus-gold light:text-amber-900 block">💬 Dúvidas de Atendimento</span>
                  <p className="text-[11px] text-vertus-white/60 light:text-stone-600 leading-relaxed">
                    Ajuda para contornar um caso muito específico ou uma paciente desafiadora na sua clínica.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-vertus-bg/40 light:bg-white border border-vertus-gray/60 light:border-stone-200 space-y-1">
                  <span className="text-xs font-bold text-vertus-gold light:text-amber-900 block">🛠️ Suporte & Configuração</span>
                  <p className="text-[11px] text-vertus-white/60 light:text-stone-600 leading-relaxed">
                    Orientação na instalação no celular, login de consultores ou ajuste de microfone.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-vertus-bg/40 light:bg-white border border-vertus-gray/60 light:border-stone-200 space-y-1">
                  <span className="text-xs font-bold text-vertus-gold light:text-amber-900 block">💡 Feedback & Ideias</span>
                  <p className="text-[11px] text-vertus-white/60 light:text-stone-600 leading-relaxed">
                    Sugira novos tipos de objeções ou funcionalidades para aprimorarmos a plataforma.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-vertus-gray/60 light:border-stone-300 flex items-center justify-between gap-3 bg-vertus-bg/40 light:bg-stone-100/60 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-vertus-white/50 light:text-stone-600 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-vertus-gold light:text-amber-800 shrink-0" />
            <span className="hidden xs:inline">VERTUS PERFORMANCE • Método Comercial de Alta Conversão</span>
            <span className="xs:hidden">VERTUS PERFORMANCE</span>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-vertus-gold text-vertus-bg font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer light:bg-amber-600 light:text-white"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default IzaGuideModal;
