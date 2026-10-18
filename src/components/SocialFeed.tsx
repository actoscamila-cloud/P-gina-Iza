import React from 'react';
import { motion } from 'motion/react';
import { Activity } from '../types';
import { useData } from '../context/DataContext';
import MediaImage from './MediaImage';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';

const SocialFeed: React.FC = () => {
  const { activities, users } = useData();

  // Filter activities to only show those from existing users
  const validActivities = activities.filter(activity => 
    users.some(u => u.id === activity.userId)
  );

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'MODULE_COMPLETED': return <Star className="w-3 h-3 text-vertus-gold" />;
      case 'TRACK_COMPLETED': return <Trophy className="w-3 h-3 text-vertus-gold" />;
      case 'RANKING_UP': return <TrendingUp className="w-3 h-3 text-emerald-400" />;
      case 'STREAK_MILESTONE': return <Zap className="w-3 h-3 text-orange-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-vertus-white/40">Atividade da Comunidade</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-bold uppercase">Ao Vivo</span>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {validActivities.length > 0 ? (
          validActivities.map((activity, index) => {
            const user = users.find(u => u.id === activity.userId);
            const userName = user?.name || activity.userName;
            const userAvatar = user?.avatar || activity.userAvatar;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-2xl bg-vertus-gray/20 border border-vertus-gray/50 hover:border-vertus-gold/20 transition-all group"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-vertus-gray bg-vertus-gray flex items-center justify-center">
                    {userAvatar ? (
                      <MediaImage mediaId={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-vertus-white/20">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-vertus-bg border border-vertus-gray rounded-full flex items-center justify-center">
                    {getIcon(activity.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-tight">
                    <span className="font-bold text-vertus-white group-hover:text-vertus-gold transition-colors">{userName}</span>
                    <span className="text-vertus-white/60"> {activity.message}</span>
                  </p>
                  <p className="text-[10px] text-vertus-white/30 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl bg-vertus-gray/10 border border-dashed border-vertus-gray">
            <p className="text-xs text-vertus-white/30">Nenhuma atividade recente na comunidade.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
