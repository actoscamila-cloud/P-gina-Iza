import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Copy, 
  Check, 
  MessageSquare, 
  AlertCircle, 
  Sparkles, 
  Star, 
  Share2,
  X,
  Volume2,
  UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import api from '../services/api';
import BulkImportModal from '../components/BulkImportModal';

const SYNONYM_MAP: Record<string, string[]> = {
  caro: ['preço', 'valor', 'dinheiro', 'orçamento', 'parcelar', 'desconto', 'condição', 'salgado', 'investimento', 'custo'],
  marido: ['esposo', 'terceiro', 'família', 'sócio', 'namorado', 'mãe', 'acompanhante', 'decidir'],
  pensar: ['tempo', 'depois', 'semana', 'mês', 'calma', 'pesquisar', 'esperar', 'dúvida', 'analisar'],
  natural: ['medo', 'resultado', 'artificial', 'dor', 'segurança', 'exagerado', 'deformar', 'arrependimento'],
  concorrente: ['outro', 'outra clínica', 'mais barato', 'promoção', 'orçamento menor']
};

const Objections: React.FC = () => {
  const { objections, refreshData } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedWhatsAppId, setCopiedWhatsAppId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'fav'>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vertus_fav_objections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vertus_fav_objections', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(id);
      if (isFav) {
        toast.info('Removido dos favoritos.');
        return prev.filter(f => f !== id);
      } else {
        toast.success('Adicionado aos favoritos!');
        return [...prev, id];
      }
    });
  };

  const trackUsage = async (trigger: string, type: string) => {
    try {
      await api.post('/objections/track-usage', { trigger, type });
    } catch {
      // Background metric tracking
    }
  };

  // Convert markdown to native WhatsApp formatting
  const formatForWhatsApp = (text: string): string => {
    let formatted = text;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '*$1*');
    formatted = formatted.replace(/^[\*\-]\s+/gm, '• ');
    formatted = formatted.replace(/^#{1,6}\s+(.*)$/gm, '*$1*');
    formatted = formatted.replace(/^>\s+/gm, '');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    return formatted.trim();
  };

  const handleCopy = (text: string | undefined, id: string, trigger: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    trackUsage(trigger, type);
    toast.success('Script copiado com sucesso!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyWhatsApp = (text: string | undefined, id: string, trigger: string, type: string) => {
    if (!text) return;
    const formatted = formatForWhatsApp(text);
    navigator.clipboard.writeText(formatted);
    setCopiedWhatsAppId(id);
    trackUsage(trigger, `${type}-whatsapp`);
    toast.success('Script formatado para WhatsApp copiado!');
    setTimeout(() => setCopiedWhatsAppId(null), 2500);
  };

  const handlePracticeWithIza = (trigger: string) => {
    trackUsage(trigger, 'practice');
    navigate('/', { 
      state: { 
        initialPrompt: `Iza, estou lidando com a objeção: "${trigger}". Como você me orienta a conduzir essa conversa de forma personalizada para a minha paciente?` 
      } 
    });
  };

  // Sorted and filtered list: sorted numerically by ID (1..24)
  const filteredObjections = useMemo(() => {
    const sorted = [...objections].sort((a, b) => (Number(a.id) || 999) - (Number(b.id) || 999));

    return sorted.filter(obj => {
      if (filterMode === 'fav') {
        if (!favorites.includes(obj.id)) return false;
      }

      if (!searchTerm.trim()) return true;

      const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      let searchTokens: string[] = [...words];
      words.forEach(w => {
        Object.entries(SYNONYM_MAP).forEach(([key, syns]) => {
          if (w.includes(key) || syns.some(s => w.includes(s))) {
            searchTokens.push(key, ...syns);
          }
        });
      });

      const searchableText = [
        obj.trigger,
        obj.response,
        obj.reason || '',
        obj.expertView || '',
        obj.rapportResponse || '',
        obj.consultativeResponse || '',
        obj.authorityResponse || ''
      ].join(' ').toLowerCase();

      return searchTokens.some(token => searchableText.includes(token));
    });
  }, [objections, filterMode, favorites, searchTerm]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 min-w-0">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight text-vertus-white break-words">
              Banco Estratégico de Objeções
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30 uppercase tracking-wider shrink-0">
              Metodologia Roones
            </span>
          </div>
          <p className="text-xs sm:text-sm text-vertus-white/50 leading-relaxed break-words">
            Scripts estruturados nos 4 pilares: Rapport, Abordagem Consultiva, Autoridade Médica e Síntese Geral.
          </p>
        </div>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="gold-gradient text-vertus-bg px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Importar em Lote</span>
        </button>
      </header>

      {/* Search & Filter Bar */}
      <div className="space-y-3 w-full min-w-0">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vertus-white/30" />
          <input
            type="text"
            placeholder="Busca inteligente (ex: caro, parcelamento, marido, medo, pensar...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-vertus-card border border-vertus-gray focus:border-vertus-gold/40 rounded-xl py-2.5 sm:py-3 pl-10 pr-10 text-xs sm:text-sm outline-none transition-all placeholder:text-vertus-white/30"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-vertus-white/40 hover:text-vertus-white p-0.5 active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs: Lista única com opção de marcar as favoritas */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setFilterMode('all')}
            className={clsx(
              "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95",
              filterMode === 'all'
                ? "bg-vertus-gold text-vertus-bg shadow-sm font-bold scale-[1.02]"
                : "bg-vertus-card border border-vertus-gray text-vertus-white/70 hover:border-vertus-gold/30 hover:text-vertus-white"
            )}
          >
            <span>Todas as Objeções</span>
            <span className={clsx(
              "px-2 py-0.5 rounded-full text-[10px] font-bold",
              filterMode === 'all' ? "bg-vertus-bg/25 text-vertus-bg" : "bg-vertus-gray text-vertus-white/60"
            )}>
              {objections.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('fav')}
            className={clsx(
              "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95",
              filterMode === 'fav'
                ? "bg-amber-400 text-vertus-bg shadow-sm font-bold scale-[1.02]"
                : "bg-vertus-card border border-vertus-gray text-vertus-white/70 hover:border-amber-400/40 hover:text-amber-300"
            )}
          >
            <Star className={clsx("w-3.5 h-3.5", filterMode === 'fav' ? "fill-vertus-bg" : "text-amber-400 fill-amber-400/40")} />
            <span>Favoritas</span>
            <span className={clsx(
              "px-2 py-0.5 rounded-full text-[10px] font-bold",
              filterMode === 'fav' ? "bg-vertus-bg/25 text-vertus-bg" : "bg-vertus-gray text-vertus-white/60"
            )}>
              {favorites.length}
            </span>
          </button>
        </div>
      </div>

      {/* Objections List */}
      <div className="space-y-4 sm:space-y-6 w-full min-w-0">
        <AnimatePresence>
          {filteredObjections.map((obj) => {
            const isFav = favorites.includes(obj.id);
            return (
              <motion.div
                key={obj.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-vertus-card border border-vertus-gray rounded-2xl sm:rounded-3xl p-4 sm:p-6 vertus-shadow space-y-4 hover:border-vertus-gold/30 transition-all w-full min-w-0 overflow-hidden"
              >
                {/* Trigger & Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-vertus-gray/60 min-w-0">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">
                        {obj.id && !isNaN(Number(obj.id)) ? `Objeção ${String(obj.id).padStart(2, '0')}` : 'Objeção'}
                      </span>
                      <h3 className="text-base sm:text-xl font-serif font-bold text-vertus-gold tracking-wide break-words">
                        "{obj.trigger}"
                      </h3>
                    </div>

                    {obj.reason && (
                      <p className="text-xs text-vertus-white/70 leading-relaxed pl-1 break-words">
                        <strong className="text-vertus-gold/90 font-medium">Motivo Oculto:</strong> {obj.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(obj.id, e)}
                      className={clsx(
                        "p-2 rounded-xl border transition-all cursor-pointer active:scale-95",
                        isFav 
                          ? "bg-amber-400/15 border-amber-400/40 text-amber-400 shadow-sm" 
                          : "bg-vertus-gray border-vertus-gray text-vertus-white/40 hover:text-amber-400 hover:border-amber-400/30"
                      )}
                      title={isFav ? "Remover dos favoritos" : "Salvar nos favoritos"}
                    >
                      <Star className={clsx("w-4 h-4", isFav && "fill-amber-400")} />
                    </button>

                    {/* Practice With Iza */}
                    <button
                      onClick={() => handlePracticeWithIza(obj.trigger)}
                      className="px-3 py-1.5 rounded-xl bg-vertus-gray hover:bg-vertus-gold hover:text-vertus-bg text-vertus-white/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-vertus-gold/20 active:scale-95 shrink-0"
                      title="Treinar esta objeção com a IZA"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-vertus-gold group-hover:text-vertus-bg shrink-0" />
                      <span>Treinar com a IZA</span>
                    </button>
                  </div>
                </div>

                {/* Expert View */}
                {obj.expertView && (
                  <div className="bg-vertus-gold/5 border-l-2 border-vertus-gold/40 pl-3.5 pr-2.5 py-2.5 rounded-r-xl min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-vertus-gold shrink-0" />
                      <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-widest">
                        Visão do Especialista Roones
                      </span>
                    </div>
                    <p className="text-xs text-vertus-white/70 leading-relaxed italic break-words">
                      {obj.expertView}
                    </p>
                  </div>
                )}

                {/* 4 Pillars of Response */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 min-w-0">
                  {/* 1. Rapport */}
                  <div className="bg-vertus-bg/70 border border-vertus-gray rounded-xl p-3 sm:p-3.5 flex flex-col justify-between hover:border-vertus-gold/30 transition-all min-w-0">
                    <div className="space-y-1.5 mb-3 min-w-0">
                      <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-widest block">
                        01. Rapport
                      </span>
                      <p className="text-xs text-vertus-white/80 leading-relaxed italic break-words">
                        "{obj.rapportResponse || obj.response}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-vertus-gray/60">
                      <button
                        onClick={() => handleCopyWhatsApp(obj.rapportResponse || obj.response, `${obj.id}-rap-wp`, obj.trigger, 'rapport')}
                        className={clsx(
                          "w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer active:scale-95",
                          copiedWhatsAppId === `${obj.id}-rap-wp`
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        )}
                        title="Copiar script pronto para colar no WhatsApp"
                      >
                        {copiedWhatsAppId === `${obj.id}-rap-wp` ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            <span>Copiar Script</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 2. Consultiva */}
                  <div className="bg-vertus-bg/70 border border-vertus-gray rounded-xl p-3 sm:p-3.5 flex flex-col justify-between hover:border-vertus-gold/30 transition-all min-w-0">
                    <div className="space-y-1.5 mb-3 min-w-0">
                      <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-widest block">
                        02. Consultiva
                      </span>
                      <p className="text-xs text-vertus-white/80 leading-relaxed italic break-words">
                        "{obj.consultativeResponse || obj.response}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-vertus-gray/60">
                      <button
                        onClick={() => handleCopyWhatsApp(obj.consultativeResponse || obj.response, `${obj.id}-con-wp`, obj.trigger, 'consultiva')}
                        className={clsx(
                          "w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer active:scale-95",
                          copiedWhatsAppId === `${obj.id}-con-wp`
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        )}
                        title="Copiar script pronto para colar no WhatsApp"
                      >
                        {copiedWhatsAppId === `${obj.id}-con-wp` ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            <span>Copiar Script</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3. Autoridade */}
                  <div className="bg-vertus-bg/70 border border-vertus-gray rounded-xl p-3 sm:p-3.5 flex flex-col justify-between hover:border-vertus-gold/30 transition-all min-w-0">
                    <div className="space-y-1.5 mb-3 min-w-0">
                      <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-widest block">
                        03. Autoridade
                      </span>
                      <p className="text-xs text-vertus-white/80 leading-relaxed italic break-words">
                        "{obj.authorityResponse || obj.response}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-vertus-gray/60">
                      <button
                        onClick={() => handleCopyWhatsApp(obj.authorityResponse || obj.response, `${obj.id}-aut-wp`, obj.trigger, 'autoridade')}
                        className={clsx(
                          "w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer active:scale-95",
                          copiedWhatsAppId === `${obj.id}-aut-wp`
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        )}
                        title="Copiar script pronto para colar no WhatsApp"
                      >
                        {copiedWhatsAppId === `${obj.id}-aut-wp` ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            <span>Copiar Script</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 4. Resposta Geral */}
                  <div className="bg-vertus-bg/70 border border-vertus-gray rounded-xl p-3 sm:p-3.5 flex flex-col justify-between hover:border-vertus-gold/30 transition-all min-w-0">
                    <div className="space-y-1.5 mb-3 min-w-0">
                      <span className="text-[10px] font-bold text-vertus-white/50 uppercase tracking-widest block">
                        04. Síntese Geral
                      </span>
                      <p className="text-xs text-vertus-white/80 leading-relaxed italic break-words">
                        "{obj.response}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-vertus-gray/60">
                      <button
                        onClick={() => handleCopyWhatsApp(obj.response, `${obj.id}-gen-wp`, obj.trigger, 'geral')}
                        className={clsx(
                          "w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer active:scale-95",
                          copiedWhatsAppId === `${obj.id}-gen-wp`
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        )}
                        title="Copiar script pronto para colar no WhatsApp"
                      >
                        {copiedWhatsAppId === `${obj.id}-gen-wp` ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            <span>Copiar Script</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredObjections.length === 0 && (
          <div className="py-14 text-center space-y-3 bg-vertus-card/30 border border-dashed border-vertus-gray rounded-3xl p-6">
            {filterMode === 'fav' ? (
              <>
                <Star className="w-10 h-10 text-amber-400/40 mx-auto" />
                <h4 className="text-vertus-white font-serif font-bold text-base">Nenhuma objeção favoritada ainda</h4>
                <p className="text-vertus-white/50 text-xs sm:text-sm font-medium max-w-md mx-auto">
                  Clique na estrela ⭐ no canto superior de qualquer uma das 24 objeções da Roones para salvá-la como favorita e acessá-la rapidamente aqui.
                </p>
                <button
                  onClick={() => setFilterMode('all')}
                  className="mt-2 px-4 py-2 rounded-xl bg-vertus-gray hover:bg-vertus-gold hover:text-vertus-bg text-vertus-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  Ver Todas as {objections.length} Objeções
                </button>
              </>
            ) : (
              <>
                <AlertCircle className="w-10 h-10 text-vertus-white/20 mx-auto" />
                <p className="text-vertus-white/40 text-xs sm:text-sm font-medium">
                  Nenhuma objeção encontrada para a busca "{searchTerm}".
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-vertus-gray text-vertus-white/70 hover:text-vertus-white text-xs font-medium transition-all"
                >
                  Limpar busca
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => refreshData()}
      />
    </div>
  );
};

export default Objections;
