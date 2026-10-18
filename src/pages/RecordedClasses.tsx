
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  Play, 
  CheckCircle2, 
  Lock,
  X, 
  ArrowRight, 
  Trophy,
  HelpCircle,
  Clock,
  Star,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Module } from '../types';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../services/mediaStorage';
import MediaImage from '../components/MediaImage';
import { fireCelebration, fireSuccess } from '../utils/confetti';

import { getEmbedUrl } from '../utils/videoUtils';

const RecordedClasses: React.FC = () => {
  const { tracks } = useData();
  const { user, completeModule } = useAuth();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  
  const classTracks = tracks.filter(t => t.type === 'CLASS');
  const allModules = classTracks.flatMap(t => t.modules.map(m => ({ ...m, trackThumbnail: t.thumbnail })));

  const [viewingModule, setViewingModule] = useState<any>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number, total: number } | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    if (moduleId) {
      const module = allModules.find(m => m.id === moduleId);
      if (module) {
        setViewingModule(module);
        setQuizAnswers({});
        setQuizResult(null);
      }
    }
  }, [moduleId, allModules]);

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
      toast.error('Você precisa concluir a aula anterior primeiro!');
      return;
    }
    setViewingModule(module);
    setQuizAnswers({});
    setQuizResult(null);
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
    completeModule(viewingModule.id, finalPoints);
    
    if (allCorrect) {
      fireCelebration();
      toast.success(`Parabéns! Você acertou tudo e ganhou ${finalPoints} pontos!`);
    } else {
      toast.warning(`Você acertou ${correctCount} de ${totalQuestions}. Ganhou ${finalPoints} pontos.`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-vertus-bg" />
            </div>
            <span className="text-[10px] font-bold text-vertus-gold uppercase tracking-widest">Masterclass Roones</span>
          </div>
          <h1 className="text-2xl font-serif font-bold mb-1">Aulas Gravadas</h1>
          <p className="text-vertus-white/50 text-xs">Acesse conteúdos exclusivos e aprofunde seus conhecimentos com nossos especialistas.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allModules.map((module, index) => {
          const isCompleted = user?.completedModuleIds?.includes(module.id);
          const isLocked = index > 0 && !user?.completedModuleIds?.includes(allModules[index - 1].id);
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                "bg-vertus-card border border-vertus-gray rounded-3xl overflow-hidden group transition-all duration-500 vertus-shadow flex flex-col relative",
                isLocked ? "opacity-60 grayscale-[0.5]" : "hover:border-vertus-gold/30"
              )}
            >
              <div className="relative aspect-video overflow-hidden">
                <MediaImage 
                  mediaId={module.thumbnail || module.trackThumbnail}
                  fallback={`https://picsum.photos/seed/vertus-class-${module.id}/800/450`}
                  alt={module.title} 
                  className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <button 
                    onClick={() => handleModuleAction(module, isLocked)}
                    className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500",
                      isLocked ? "bg-vertus-gray text-vertus-white/20 cursor-not-allowed" : "bg-vertus-gold text-vertus-bg cursor-pointer"
                    )}
                  >
                    {isLocked ? <Lock className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                </div>
                {isCompleted && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
                {isLocked && (
                  <div className="absolute top-3 right-3 bg-vertus-bg/80 backdrop-blur-md text-vertus-gold p-1.5 rounded-full shadow-lg border border-vertus-gold/20">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1.5">
                  <Clock className="w-2.5 h-2.5 text-vertus-gold" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider">15 min</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] uppercase tracking-widest text-vertus-gold font-bold">Aula {index + 1}</span>
                  <span className="text-[9px] uppercase tracking-widest text-vertus-white/30 font-bold">• {module.points} Pontos</span>
                </div>
                <h3 className={clsx(
                  "text-lg font-bold mb-2 transition-colors",
                  !isLocked && "group-hover:text-vertus-gold"
                )}>
                  {module.title}
                </h3>
                <p className="text-xs text-vertus-white/50 line-clamp-2 mb-4 flex-1">{module.description}</p>
                
                <button 
                  onClick={() => handleModuleAction(module, isLocked)}
                  className={clsx(
                    "w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                    isCompleted 
                      ? "bg-vertus-gray text-vertus-white/40 hover:bg-vertus-gray/80 cursor-pointer" 
                      : isLocked
                        ? "bg-vertus-gray/50 text-vertus-white/20 cursor-not-allowed"
                        : "gold-gradient text-vertus-bg hover:scale-[1.02] cursor-pointer"
                  )}
                >
                  {isCompleted ? 'Assistir Novamente' : isLocked ? 'Bloqueado' : 'Assistir Aula'}
                  {!isLocked && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {viewingModule && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingModule(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
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
                    <span className="text-[9px] uppercase tracking-widest text-vertus-gold font-bold">Assistindo agora</span>
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
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-vertus-white/20">
                      <Play className="w-16 h-16" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">Vídeo não disponível</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-vertus-gold" />
                        Sobre esta aula
                      </h4>
                      <div className="prose prose-invert max-w-none prose-sm">
                        <div className="markdown-body">
                          <ReactMarkdown>{viewingModule.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {viewingModule.quiz && viewingModule.quiz.questions.length > 0 && (
                      <div className="bg-vertus-bg border border-vertus-gray rounded-3xl p-6 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-vertus-gold/10 rounded-lg flex items-center justify-center text-vertus-gold">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-bold">Quiz da Aula</h4>
                        </div>

                        <div className="space-y-6">
                          {viewingModule.quiz.questions.map((q, qIndex) => (
                            <div key={q.id} className="space-y-3">
                              <p className="text-xs font-medium text-white/90 leading-relaxed">
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
                                        "flex items-center gap-2.5 p-3 rounded-lg border transition-all text-left text-[10px]",
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
                                        "w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0",
                                        isSelected ? "border-vertus-gold" : "border-vertus-white/20"
                                      )}>
                                        {isSelected && <div className="w-1.5 h-1.5 bg-vertus-gold rounded-full" />}
                                      </div>
                                      <span className="font-medium">{option}</span>
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
                            className="w-full py-3 gold-gradient text-vertus-bg rounded-lg font-bold text-xs hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                          >
                            Validar Conhecimento
                          </button>
                        ) : (
                          <div className="text-center space-y-3">
                            <div className="w-10 h-10 bg-vertus-gold rounded-full flex items-center justify-center mx-auto shadow-lg">
                              <Trophy className="w-5 h-5 text-vertus-bg" />
                            </div>
                            <p className="text-[10px] text-vertus-white/60">
                              Você acertou {quizResult.score} de {quizResult.total}.
                            </p>
                            <button 
                              onClick={() => setViewingModule(null)}
                              className="w-full py-2.5 bg-vertus-gold text-vertus-bg rounded-lg font-bold text-[10px] hover:scale-105 transition-all"
                            >
                              Concluir Aula
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordedClasses;
