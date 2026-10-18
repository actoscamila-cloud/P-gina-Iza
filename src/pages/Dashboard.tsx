
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Flame, 
  ChevronRight, 
  PlayCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner';
import { fireCelebration } from '../utils/confetti';

import SocialFeed from '../components/SocialFeed';
import MediaImage from '../components/MediaImage';
import { Star, Award, ShieldCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, addPoints, completeChallenge } = useAuth();
  const { tracks, dailyChallenge } = useData();
  const navigate = useNavigate();

  const isChallengeCompleted = user?.completedChallengeIds?.includes(dailyChallenge.id);

  const chartData = user?.weeklyPoints || [
    { name: 'Seg', pts: 0 },
    { name: 'Ter', pts: 0 },
    { name: 'Qua', pts: 0 },
    { name: 'Qui', pts: 0 },
    { name: 'Sex', pts: 0 },
    { name: 'Sáb', pts: 0 },
    { name: 'Dom', pts: 0 },
  ];

  // Calculate dynamic progress
  const totalModules = tracks?.reduce((acc, track) => acc + (track?.modules?.length || 0), 0) || 0;
  const completedModules = tracks?.reduce((acc, track) => {
    const modules = track?.modules || [];
    return acc + modules.filter(m => user?.completedModuleIds?.includes(m.id)).length;
  }, 0) || 0;
  const dynamicProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Get modules to continue learning (incomplete ones first)
  const allModules = (tracks || []).flatMap(t => (t?.modules || []).map(m => ({ ...m, trackTitle: t.title, trackThumbnail: t.thumbnail })));
  const continueLearning = allModules
    .filter(m => !user?.completedModuleIds?.includes(m.id))
    .slice(0, 3);
  
  // If no incomplete modules, show the first 3
  const displayModules = continueLearning.length > 0 ? continueLearning : allModules.slice(0, 3);

  const handleAction = (trackId: string, moduleTitle: string, moduleId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track?.type === 'CLASS') {
      navigate(`/aulas?moduleId=${moduleId}`);
    } else {
      navigate(`/trilhas?trackId=${trackId}`);
    }
    toast.success(`Iniciando: ${moduleTitle}`);
  };

  const totalWeeklyPoints = chartData.reduce((acc, curr) => acc + curr.pts, 0);
  // Calculate a slightly more "real" growth based on points
  const percentageGrowth = totalWeeklyPoints > 0 ? Math.min(Math.round((totalWeeklyPoints / 500) * 100), 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-serif font-bold tracking-tight">
                {getGreeting()}, {user?.name.split(' ')[0]}
              </h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-vertus-gold/10 border border-vertus-gold/20 rounded-full">
                <ShieldCheck className="w-3 h-3 text-vertus-gold" />
                <span className="text-[9px] font-bold text-vertus-gold uppercase tracking-wider">{user?.prestige || 'Bronze'}</span>
              </div>
            </div>
            <p className="text-xs text-vertus-white/50">Sua jornada de alta performance continua hoje.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="bg-vertus-card border border-vertus-gray px-4 py-2 rounded-xl flex items-center gap-3 hover-glow">
              <div className="w-8 h-8 rounded-lg bg-vertus-gold/10 flex items-center justify-center">
                < Star className="w-5 h-5 text-vertus-gold" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-vertus-white/40 font-bold">Nível {user?.level || 1}</p>
                <p className="text-lg font-bold">{user?.points} <span className="text-xs text-vertus-white/30 font-normal">XP</span></p>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-2 bg-vertus-card border border-vertus-gray rounded-3xl p-6 vertus-shadow hover-glow"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-bold">Desempenho Semanal</h3>
              <div className="flex items-center gap-2 text-vertus-gold text-[10px] font-bold">
                <TrendingUp className="w-3 h-3" />
                {percentageGrowth >= 0 ? '+' : ''}{percentageGrowth}% vs semana passada
              </div>
            </div>
            
            <div className="h-[240px] w-full" style={{ minHeight: '240px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={5}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const daysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      const isToday = payload.value === daysMap[new Date().getDay()];
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0}
                            y={0}
                            dy={12}
                            textAnchor="middle"
                            fill={isToday ? 'var(--gold-primary)' : '#888'}
                            style={{ fontSize: '10px', fontWeight: isToday ? 'bold' : 'normal' }}
                          >
                            {payload.value}
                          </text>
                          {isToday && (
                            <circle cx={0} cy={20} r={1.5} fill="var(--gold-primary)" />
                          )}
                        </g>
                      );
                    }}
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => value > 0 ? value : ''}
                    width={25}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--chart-tooltip-bg)', 
                      border: '1px solid var(--chart-tooltip-border)', 
                      borderRadius: '8px',
                      color: 'var(--vertus-white)',
                      fontSize: '10px'
                    }}
                    itemStyle={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}
                    cursor={{ stroke: 'var(--gold-primary)', strokeWidth: 1 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pts" 
                    stroke="#C9A96E" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPts)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Circular Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-vertus-card border border-vertus-gray rounded-3xl p-6 flex flex-col items-center justify-center text-center hover-glow"
          >
            <h3 className="text-base font-serif font-bold mb-6">Progresso da Trilha</h3>
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-vertus-gray"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={402.12}
                  strokeDashoffset={402.12 * (1 - dynamicProgress / 100)}
                  className="text-vertus-gold transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{dynamicProgress}%</span>
                <span className="text-[9px] uppercase tracking-widest text-vertus-white/40 font-bold">Concluído</span>
              </div>
            </div>
            <p className="text-[11px] text-vertus-white/60">
              {completedModules === totalModules 
                ? "Parabéns! Você concluiu todos os módulos disponíveis."
                : `Faltam apenas ${totalModules - completedModules} módulos para você se tornar um Consultor Master.`}
            </p>
          </motion.div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold">Continuar Aprendendo</h2>
            <button 
              onClick={() => navigate('/trilhas')}
              className="text-vertus-gold text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              Ver todas as trilhas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayModules.map((module, i) => {
              const isCompleted = user?.completedModuleIds?.includes(module.id);
              return (
                <motion.div 
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    const track = tracks.find(t => t.modules.some(m => m.id === module.id));
                    handleAction(track?.id || '', module.title, module.id);
                  }}
                  className="bg-vertus-card border border-vertus-gray rounded-2xl p-4 group cursor-pointer hover-glow"
                >
                  <div className="w-full aspect-video bg-vertus-gray rounded-xl mb-3 overflow-hidden relative">
                    <MediaImage 
                      mediaId={module.thumbnail || module.trackThumbnail} 
                      fallback={`https://picsum.photos/seed/vertus${module.id}/800/450`}
                      alt={module.title} 
                      className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] bg-vertus-gold/10 text-vertus-gold px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {module.trackTitle}
                    </span>
                    <span className="text-[9px] text-vertus-white/40 font-bold uppercase tracking-wider">15 min</span>
                  </div>
                  <h4 className="text-sm font-bold mb-2 group-hover:text-vertus-gold transition-colors line-clamp-1">{module.title}</h4>
                  <div className="w-full bg-vertus-gray h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-vertus-gold h-full transition-all duration-500" 
                      style={{ width: isCompleted ? '100%' : '33%' }}
                    ></div>
                  </div>
                </motion.div>
              );
            })}
            {displayModules.length === 0 && (
              <div className="col-span-full py-10 text-center text-vertus-white/30 border border-dashed border-vertus-gray rounded-3xl">
                Nenhum módulo disponível no momento.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="xl:col-span-1">
        <div className="sticky top-5 space-y-6">
          <div className="bg-vertus-card border border-vertus-gray rounded-3xl p-5 hover-glow">
            <SocialFeed />
          </div>
          
          <div className="bg-vertus-card border border-vertus-gold/10 rounded-3xl p-6 vertus-shadow hover-glow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-vertus-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-vertus-gold/10 transition-all duration-700" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-vertus-gold flex items-center gap-2">
                < Zap className="w-3 h-3 fill-current" />
                Desafio Relâmpago
              </h3>
              <div className="w-1.5 h-1.5 bg-vertus-gold rounded-full animate-ping" />
            </div>
            
            <p className="text-sm font-serif font-medium mb-5 leading-tight relative z-10">{dailyChallenge.question}</p>
            
            <div className="space-y-2 relative z-10">
              {isChallengeCompleted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-vertus-white font-bold uppercase tracking-widest">Desafio Concluído!</p>
                    <p className="text-[10px] text-vertus-white/40">Sua pontuação foi atualizada.</p>
                  </div>
                  <p className="text-[9px] text-vertus-white/20 italic pt-2">Volte amanhã para um novo desafio.</p>
                </motion.div>
              ) : (
                dailyChallenge.options.map((opt, i) => (
                  <motion.button 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (i === dailyChallenge.correctAnswer) {
                        fireCelebration();
                        toast.success(`Correto! +${dailyChallenge.points} pontos de bônus diário.`);
                        completeChallenge(dailyChallenge.id, dailyChallenge.points);
                      } else {
                        toast.error('Não foi dessa vez! Tente novamente amanhã.');
                        completeChallenge(dailyChallenge.id, 0); // Mark as completed even if wrong
                      }
                    }}
                    className="w-full text-left p-3 rounded-xl bg-vertus-bg/50 border border-vertus-gray hover:border-vertus-gold/50 hover:bg-vertus-gold/5 text-[11px] font-medium transition-all duration-300"
                  >
                    {opt}
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
