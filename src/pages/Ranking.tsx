
import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { useData } from '../context/DataContext';
import MediaImage from '../components/MediaImage';

const Ranking: React.FC = () => {
  const { tracks, users } = useData();

  const totalModules = tracks.reduce((acc, track) => acc + track.modules.length, 0);

  const sortedUsers = [...users]
    .filter(u => u.role === 'CONSULTOR')
    .sort((a, b) => b.points - a.points);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-8 h-8 text-yellow-400" />;
      case 1: return <Medal className="w-8 h-8 text-gray-300" />;
      case 2: return <Medal className="w-8 h-8 text-amber-600" />;
      default: return <span className="text-xl font-serif font-bold text-vertus-white/30">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 vertus-shadow hover:scale-110 transition-transform cursor-default">
          <Trophy className="w-10 h-10 text-vertus-bg" />
        </div>
        <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">Elite Roones</h1>
        <p className="text-vertus-white/50">Os consultores de maior performance da rede. A competição gera excelência.</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-end mb-8 sm:mb-12 px-2 sm:px-4 md:px-0">
        {/* Top 3 Podium */}
        {sortedUsers.slice(0, 3).map((user, i) => {
          const order = i === 0 ? 'order-1 lg:order-2' : i === 1 ? 'order-2 lg:order-1' : 'order-3';
          const height = i === 0 ? 'h-auto py-6 sm:py-8 sm:h-[420px]' : i === 1 ? 'h-auto py-6 sm:py-8 sm:h-[370px]' : 'h-auto py-6 sm:py-8 sm:h-[330px]';
          const scale = i === 0 ? 'sm:scale-105 md:scale-110 md:z-10' : 'scale-100';
          
          return (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={clsx("flex flex-col items-center w-full", order)}
            >
              <div className="mb-4 sm:mb-6 relative">
                <div className={clsx(
                  "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 p-1 overflow-hidden flex items-center justify-center bg-vertus-gray transition-transform hover:scale-105 duration-500",
                  i === 0 ? "border-yellow-400" : i === 1 ? "border-gray-300" : "border-amber-600"
                )}>
                  {user.avatar ? (
                    <MediaImage mediaId={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="text-xl sm:text-2xl font-bold text-vertus-white/20">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-vertus-bg p-1.5 sm:p-2 rounded-full border border-vertus-gray shadow-xl">
                  {getRankIcon(i)}
                </div>
              </div>
              <div className={clsx(
                "w-full bg-vertus-card border border-vertus-gray rounded-2xl sm:rounded-t-[40px] flex flex-col items-center justify-center p-5 sm:p-8 vertus-shadow transition-all duration-700",
                height,
                scale
              )}>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-center mb-1 line-clamp-1">{user.name}</h3>
                <p className="text-[10px] text-vertus-gold uppercase tracking-widest font-bold mb-4 sm:mb-6">Consultor Master</p>
                <div className="text-3xl sm:text-4xl font-bold mb-1 tracking-tighter text-vertus-white">{user.points}</div>
                <p className="text-[10px] text-vertus-white/40 uppercase tracking-widest font-bold">Pontos Totais</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-vertus-card border border-vertus-gray rounded-2xl sm:rounded-[32px] overflow-hidden"
      >
        {/* Desktop Table Header */}
        <div className="hidden md:block p-6 border-b border-vertus-gray bg-vertus-gray/10">
          <div className="grid grid-cols-12 gap-4 text-[10px] uppercase tracking-widest text-vertus-white/40 font-bold px-6">
            <div className="col-span-1">Pos</div>
            <div className="col-span-6">Consultor</div>
            <div className="col-span-2 text-center">Progresso</div>
            <div className="col-span-2 text-center">Pontos</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
        </div>
        
        {/* Desktop Rows */}
        <div className="hidden md:block divide-y divide-vertus-gray">
          {sortedUsers.map((user, index) => {
            const completedCount = user.completedModuleIds?.length || 0;
            const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
            
            return (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (index * 0.04) }}
                className="grid grid-cols-12 gap-4 items-center p-5 hover:bg-vertus-white/5 transition-all px-8 group cursor-default"
              >
                <div className="col-span-1">
                  {getRankIcon(index)}
                </div>
                <div className="col-span-6 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-vertus-gray flex items-center justify-center bg-vertus-gray group-hover:border-vertus-gold/30 transition-colors shrink-0">
                    {user.avatar ? (
                      <MediaImage mediaId={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs font-bold text-vertus-white/20">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold group-hover:text-vertus-gold transition-colors truncate">{user.name}</p>
                    <p className="text-[10px] text-vertus-white/40 uppercase tracking-widest truncate">Clínica {user.clinicId || 'Roones'}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-full bg-vertus-gray h-1.5 rounded-full overflow-hidden">
                      <div className="bg-vertus-gold h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-vertus-white/60">{progress}%</span>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-base font-bold text-vertus-gold tracking-tight">{user.points}</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Minus className="w-4 h-4 text-vertus-white/20" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Cards List */}
        <div className="md:hidden divide-y divide-vertus-gray/60">
          {sortedUsers.map((user, index) => {
            const completedCount = user.completedModuleIds?.length || 0;
            const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

            return (
              <div key={user.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 text-center shrink-0 font-bold text-sm text-vertus-white/60">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-vertus-gray bg-vertus-gray flex items-center justify-center shrink-0">
                    {user.avatar ? (
                      <MediaImage mediaId={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs font-bold text-vertus-white/40">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-vertus-white truncate">{user.name}</p>
                    <p className="text-[10px] text-vertus-white/40 truncate">Clínica {user.clinicId || 'Roones'} • {progress}% concluído</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-vertus-gold block">{user.points}</span>
                  <span className="text-[9px] text-vertus-white/40 uppercase">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Ranking;
