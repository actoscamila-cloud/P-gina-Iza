
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  MessageSquare, 
  RefreshCw, 
  CheckCircle2, 
  Lock, 
  Play,
  FileText,
  HelpCircle,
  X,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Module } from '../types';

const iconMap: Record<string, any> = {
  BookOpen,
  Brain,
  MessageSquare,
  RefreshCw
};

import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../services/mediaStorage';
import MediaImage from '../components/MediaImage';
import { fireCelebration, fireSuccess } from '../utils/confetti';
import { Maximize2, Minimize2 } from 'lucide-react';

import { getEmbedUrl } from '../utils/videoUtils';
import { generateModulePDF } from '../utils/modulePdfGenerator';

const Tracks: React.FC = () => {
  const { tracks: allTracks } = useData();
  const tracks = allTracks.filter(t => t.type === 'TRACK' || !t.type);
  const { user, completeModule } = useAuth();
  const [searchParams] = useSearchParams();
  const trackIdParam = searchParams.get('trackId');
  
  const initialTrack = (tracks.find(t => t.id === trackIdParam) || tracks[0]) || null;
  const [selectedTrack, setSelectedTrack] = useState(initialTrack);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number, total: number } | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [explainingModule, setExplainingModule] = useState<Module | null>(null);

  // Update selected track if tracks change (e.g. edited in admin)
  useEffect(() => {
    if (!selectedTrack && tracks.length > 0) {
      setSelectedTrack(tracks[0]);
      return;
    }
    if (selectedTrack) {
      const updatedTrack = tracks.find(t => t.id === selectedTrack.id);
      if (updatedTrack) {
        setSelectedTrack(updatedTrack);
      } else if (tracks.length > 0) {
        setSelectedTrack(tracks[0]);
      } else {
        setSelectedTrack(null);
      }
    }
  }, [tracks, selectedTrack?.id]);

  useEffect(() => {
    let url: string | null = null;
    const loadVideo = async () => {
      if (viewingModule?.videoData && viewingModule.videoData.startsWith('media_')) {
        url = await getMediaUrl(viewingModule.videoData);
        setLocalVideoUrl(url);
      } else {
        setLocalVideoUrl(null);
      }
    };
    loadVideo();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [viewingModule]);

  const handleModuleAction = (module: Module, isLocked: boolean) => {
    if (isLocked) {
      toast.error('Você precisa concluir o módulo anterior primeiro!');
      return;
    }
    setViewingModule(module);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const isTrackCompleted = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return false;
    return track.modules.every(m => user?.completedModuleIds?.includes(m.id));
  };

  const handleQuizSubmit = () => {
    if (!viewingModule?.quiz) return;

    let correctCount = 0;
    viewingModule.quiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const totalQuestions = viewingModule.quiz.questions.length;
    const allCorrect = correctCount === totalQuestions;
    const finalPoints = allCorrect ? 100 : 20;

    setQuizResult({ score: correctCount, total: totalQuestions });
    
    // Use the new completeModule function which handles individual user progress
    completeModule(viewingModule.id, finalPoints);
    
    if (allCorrect) {
      fireCelebration();
      toast.success(`Parabéns! Você acertou tudo e ganhou ${finalPoints} pontos!`);
    } else {
      toast.warning(`Você acertou ${correctCount} de ${totalQuestions}. Ganhou ${finalPoints} pontos.`);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-serif font-bold mb-1">Trilhas de Conhecimento</h1>
          <p className="text-vertus-white/50 text-xs">Especialize-se na metodologia Vertus e domine o mercado.</p>
        </header>

        <div className="flex flex-col items-center justify-center p-12 bg-vertus-card border border-vertus-gray rounded-3xl text-center">
          <div className="w-16 h-16 bg-vertus-gray rounded-2xl flex items-center justify-center text-vertus-white/20 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Nenhuma trilha disponível</h2>
          <p className="text-vertus-white/50 max-w-xs text-sm">
            Fique atento! Novas trilhas serão disponibilizadas em breve pelos administradores.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedTrack) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-serif font-bold mb-1">Trilhas de Conhecimento</h1>
        <p className="text-vertus-white/50 text-xs">Especialize-se na metodologia Vertus e domine o mercado.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tracks.map((track, index) => {
          const Icon = iconMap[track.icon];
          const isActive = selectedTrack?.id === track.id;
          const completedCount = track.modules.filter(m => user?.completedModuleIds?.includes(m.id)).length;
          
          // Track is locked if it's not the first one and the previous one isn't completed
          const isLocked = index > 0 && !isTrackCompleted(tracks[index - 1].id);
          
          return (
            <button
              key={track.id}
              onClick={() => {
                if (isLocked) {
                  toast.error('Você precisa concluir a trilha anterior primeiro!');
                  return;
                }
                setSelectedTrack(track);
              }}
              className={clsx(
                "p-4 rounded-2xl border transition-all duration-300 text-left group relative overflow-hidden",
                isActive 
                  ? "bg-vertus-gold/10 border-vertus-gold vertus-shadow" 
                  : isLocked
                    ? "bg-vertus-card/50 border-vertus-gray opacity-60 cursor-not-allowed"
                    : "bg-vertus-card border-vertus-gray hover:border-vertus-gold/30 cursor-pointer"
              )}
            >
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors overflow-hidden",
                isActive ? "bg-vertus-gold text-vertus-bg" : "bg-vertus-gray text-vertus-gold group-hover:bg-vertus-gold/20"
              )}>
                {isLocked ? (
                  <Lock className="w-5 h-5" />
                ) : track.thumbnail ? (
                  <MediaImage mediaId={track.thumbnail} alt={track.title} className="w-full h-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <h3 className={clsx(
                "text-sm font-bold mb-0.5",
                isActive ? "text-vertus-gold" : "text-white"
              )}>{track.title}</h3>
              <p className="text-[9px] text-vertus-white/40 uppercase tracking-widest font-bold">
                {track.modules.length} Módulos • {completedCount} Concluídos
              </p>
              {isLocked && (
                <div className="absolute top-4 right-4 text-vertus-white/20">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-vertus-card border border-vertus-gray rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-vertus-gray flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold tracking-tight mb-1">{selectedTrack.title}</h2>
            <p className="text-vertus-white/60 max-w-2xl text-xs">{selectedTrack.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-vertus-white/40 font-bold">Progresso da Trilha</p>
              <p className="text-lg font-bold text-vertus-gold">
                {Math.round((selectedTrack.modules.filter(m => user?.completedModuleIds?.includes(m.id)).length / selectedTrack.modules.length) * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center relative">
              <svg className="w-full h-full absolute -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-vertus-gray"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={175.93}
                  strokeDashoffset={175.93 * (1 - selectedTrack.modules.filter(m => user?.completedModuleIds?.includes(m.id)).length / selectedTrack.modules.length)}
                  className="text-vertus-gold transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <CheckCircle2 className="w-5 h-5 text-vertus-gold relative z-10" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {selectedTrack.modules.map((module, index) => {
            const isCompleted = user?.completedModuleIds?.includes(module.id);
            // Module is locked if it's not the first one and the previous one isn't completed
            const isLocked = index > 0 && !user?.completedModuleIds?.includes(selectedTrack.modules[index - 1].id);

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleModuleAction(module, isLocked)}
                className={clsx(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all group relative",
                  isCompleted 
                    ? "bg-vertus-gray/30 border-vertus-gray/50 cursor-pointer" 
                    : isLocked
                      ? "bg-vertus-card/50 border-vertus-gray opacity-60 cursor-not-allowed"
                      : "bg-vertus-bg border-vertus-gray hover:border-vertus-gold/30 cursor-pointer"
                )}
              >
                  <div className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden",
                    isCompleted ? "bg-vertus-gold/10 text-vertus-gold" : "bg-vertus-gray text-vertus-white/30"
                  )}>
                    {isLocked ? (
                      <Lock className="w-6 h-6" />
                    ) : (selectedTrack.thumbnail || module.thumbnail) ? (
                      <MediaImage 
                        mediaId={selectedTrack.thumbnail || module.thumbnail} 
                        alt={module.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                      />
                    ) : (
                      isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Play className="w-6 h-6" />
                    )}
                  </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] uppercase tracking-widest text-vertus-gold font-bold">Módulo {index + 1}</span>
                    <span className="text-[9px] uppercase tracking-widest text-vertus-white/30 font-bold">• {module.points} Pontos</span>
                  </div>
                  <h4 className="text-base font-bold flex items-center gap-2">
                    {module.title}
                    {isLocked && <Lock className="w-3.5 h-3.5 text-vertus-white/20" />}
                  </h4>
                  <p className="text-xs text-vertus-white/50 line-clamp-1">{module.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLocked) {
                          toast.error('Módulo bloqueado');
                          return;
                        }
                        generateModulePDF(module);
                        toast.success('Gerando PDF para impressão...');
                      }}
                      className="p-1.5 bg-vertus-gray rounded-lg text-vertus-white/40 hover:text-vertus-gold transition-colors" 
                      title="Imprimir Material"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setExplainingModule(module);
                      }}
                      className="p-1.5 bg-vertus-gray rounded-lg text-vertus-white/40 hover:text-vertus-gold transition-colors" 
                      title="Sobre este módulo"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <button className={clsx(
                    "px-4 py-2 rounded-lg font-bold text-xs transition-all",
                    isCompleted 
                      ? "bg-vertus-gray text-vertus-white/40 cursor-pointer" 
                      : isLocked
                        ? "bg-vertus-gray/50 text-vertus-white/20 cursor-not-allowed"
                        : "gold-gradient text-vertus-bg hover:scale-105 cursor-pointer"
                  )}>
                    {isCompleted ? 'Revisar' : isLocked ? 'Bloqueado' : 'Iniciar'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {explainingModule && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExplainingModule(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-vertus-card border border-vertus-gray rounded-[24px] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-vertus-gold/10 rounded-xl flex items-center justify-center text-vertus-gold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <button 
                  onClick={() => setExplainingModule(null)}
                  className="p-1.5 hover:bg-vertus-gray rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-vertus-white/40" />
                </button>
              </div>
              
              <h3 className="text-xl font-serif font-bold mb-3">{explainingModule.title}</h3>
              <p className="text-vertus-white/70 leading-relaxed mb-6 text-sm">
                {explainingModule.description}
              </p>
              
              <div className="p-3 bg-vertus-gray/30 rounded-xl border border-vertus-gray">
                <p className="text-[10px] text-vertus-white/40 uppercase tracking-widest font-bold mb-1">Objetivo do Módulo</p>
                <p className="text-xs text-vertus-white/80">
                  Este módulo foi desenhado para fornecer as ferramentas práticas e o conhecimento teórico necessário para dominar este pilar da metodologia Vertus.
                </p>
              </div>

              <button 
                onClick={() => setExplainingModule(null)}
                className="w-full mt-6 py-3 bg-vertus-gold text-vertus-bg rounded-xl font-bold hover:scale-[1.02] transition-all text-sm"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}

        {viewingModule && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingModule(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                maxWidth: isFocusMode ? '100%' : '900px',
                height: isFocusMode ? '100%' : 'auto',
                borderRadius: isFocusMode ? '0px' : '32px'
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={clsx(
                "relative w-full max-h-[95vh] bg-vertus-card border border-vertus-gray shadow-2xl overflow-hidden flex flex-col transition-all duration-500",
                isFocusMode && "fixed inset-0 z-[210] max-h-screen"
              )}
            >
              <div className="p-6 border-b border-vertus-gray flex items-center justify-between bg-vertus-card/50 backdrop-blur-xl">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] uppercase tracking-widest text-vertus-gold font-bold">Módulo em andamento</span>
                    <span className="text-[9px] uppercase tracking-widest text-vertus-white/30 font-bold">• {viewingModule.points} Pontos em jogo</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold">{viewingModule.title}</h3>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className="p-2 bg-vertus-gray rounded-xl text-vertus-white/60 hover:text-white transition-colors mr-2"
                    title={isFocusMode ? "Sair do Modo Foco" : "Modo Foco"}
                  >
                    {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => {
                      setViewingModule(null);
                      setIsFocusMode(false);
                    }}
                    className="p-2 bg-vertus-gray rounded-xl text-vertus-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
                {(viewingModule.videoUrl || viewingModule.videoData) ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-vertus-gray bg-black shadow-2xl">
                    {viewingModule.videoUrl ? (
                      <iframe 
                        src={getEmbedUrl(viewingModule.videoUrl)} 
                        title={viewingModule.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    ) : (viewingModule.videoData || localVideoUrl) ? (
                      <video 
                        src={localVideoUrl || viewingModule.videoData} 
                        controls 
                        className="w-full h-full object-contain"
                        poster={viewingModule.thumbnail}
                      />
                    ) : null}
                  </div>
                ) : (viewingModule.thumbnail || selectedTrack.thumbnail) ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-vertus-gray">
                    <MediaImage 
                      mediaId={viewingModule.thumbnail || selectedTrack.thumbnail} 
                      fallback={`https://picsum.photos/seed/vertus-track-${viewingModule.id}/800/450`}
                      alt={viewingModule.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : null}
                <div className="prose prose-invert max-w-none prose-sm">
                  <div className="markdown-body">
                    <ReactMarkdown>{viewingModule.content}</ReactMarkdown>
                  </div>
                </div>

                {viewingModule.quiz && viewingModule.quiz.questions.length > 0 && (
                  <div className="pt-8 border-t border-vertus-gray space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-vertus-gold/10 rounded-xl flex items-center justify-center text-vertus-gold">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">Desafio do Módulo</h4>
                        <p className="text-xs text-vertus-white/50">Responda corretamente para garantir a pontuação máxima.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {viewingModule.quiz.questions.map((q, qIndex) => (
                        <div key={q.id} className="space-y-4">
                          <p className="text-base font-medium text-white/90">
                            <span className="text-vertus-gold mr-2">{qIndex + 1}.</span>
                            {q.question}
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((option, oIndex) => {
                              const isSelected = quizAnswers[q.id] === oIndex;
                              const isCorrect = q.correctOptionIndex === oIndex;
                              const showResult = quizResult !== null;
                              
                              return (
                                <button
                                  key={oIndex}
                                  disabled={showResult}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIndex })}
                                  className={clsx(
                                    "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                                    showResult 
                                      ? isCorrect 
                                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                        : isSelected
                                          ? "bg-red-500/10 border-red-500/50 text-red-400"
                                          : "bg-vertus-gray/20 border-vertus-gray/50 opacity-50"
                                      : isSelected
                                        ? "bg-vertus-gold/10 border-vertus-gold text-vertus-gold"
                                        : "bg-vertus-bg border-vertus-gray hover:border-vertus-gold/30"
                                  )}
                                >
                                  <div className={clsx(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                    isSelected ? "border-vertus-gold" : "border-vertus-white/20"
                                  )}>
                                    {isSelected && <div className="w-2.5 h-2.5 bg-vertus-gold rounded-full" />}
                                  </div>
                                  <span className="font-medium text-sm">{option}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!quizResult ? (
                      <button 
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < viewingModule.quiz.questions.length}
                        className="w-full py-4 gold-gradient text-vertus-bg rounded-xl font-bold text-base hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        Finalizar e Ganhar Pontos
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="p-6 bg-vertus-gold/5 border border-vertus-gold/20 rounded-3xl text-center space-y-3">
                        <div className="w-16 h-16 bg-vertus-gold rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-vertus-gold/20">
                          <Trophy className="w-8 h-8 text-vertus-bg" />
                        </div>
                        <h4 className="text-xl font-serif font-bold text-vertus-gold">Módulo Concluído!</h4>
                        <p className="text-xs text-vertus-white/60">
                          Você acertou {quizResult.score} de {quizResult.total} perguntas.
                        </p>
                        <button 
                          onClick={() => setViewingModule(null)}
                          className="px-8 py-3 bg-vertus-gold text-vertus-bg rounded-xl font-bold hover:scale-105 transition-all text-sm"
                        >
                          Voltar para Trilhas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tracks;
