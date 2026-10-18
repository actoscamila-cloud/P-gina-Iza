import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  RotateCcw, 
  Activity, 
  AlertTriangle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

interface InsightData {
  totalAiQueries: number;
  totalObjections: number;
  activeUsersCount: number;
  topObjections: Array<{ trigger: string; count: number }>;
}

const AdminInsights: React.FC = () => {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/insights');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching admin insights:', error);
      toast.error('Não foi possível carregar os insights no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3 bg-vertus-card/30 border border-vertus-gray rounded-2xl">
        <div className="w-8 h-8 border-2 border-vertus-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-vertus-white/50 text-xs">Carregando métricas e termômetro da equipe comercial...</p>
      </div>
    );
  }

  const maxCount = data?.topObjections && data.topObjections.length > 0 
    ? Math.max(...data.topObjections.map(o => o.count), 1)
    : 1;

  const topTrigger = data?.topObjections?.[0]?.trigger;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total AI Queries */}
        <div className="bg-vertus-card border border-vertus-gray rounded-2xl p-5 relative overflow-hidden group hover:border-vertus-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-vertus-white/50 uppercase tracking-wider">
              Orientações da IZA
            </span>
            <div className="w-8 h-8 rounded-lg bg-vertus-gold/15 text-vertus-gold flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-vertus-white">
              {data?.totalAiQueries || 0}
            </span>
            <span className="text-xs text-vertus-gold font-medium">respostas geradas</span>
          </div>
          <p className="text-[11px] text-vertus-white/40 mt-1">
            Scripts e treinamentos táticos solicitados pela equipe
          </p>
        </div>

        {/* Total Objections */}
        <div className="bg-vertus-card border border-vertus-gray rounded-2xl p-5 relative overflow-hidden group hover:border-vertus-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-vertus-white/50 uppercase tracking-wider">
              Banco de Objeções
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-vertus-white">
              {data?.totalObjections || 0}
            </span>
            <span className="text-xs text-emerald-400 font-medium">roteiros ativos</span>
          </div>
          <p className="text-[11px] text-vertus-white/40 mt-1">
            Cadastrados sob metodologia Rapport, Consultiva e Autoridade
          </p>
        </div>

        {/* Commercial Team Access */}
        <div className="bg-vertus-card border border-vertus-gray rounded-2xl p-5 relative overflow-hidden group hover:border-vertus-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-vertus-white/50 uppercase tracking-wider">
              Equipe Comercial
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-vertus-white">
              {data?.activeUsersCount || 0}
            </span>
            <span className="text-xs text-sky-400 font-medium">consultores ativos</span>
          </div>
          <p className="text-[11px] text-vertus-white/40 mt-1">
            Usuários com acesso ao PWA e banco de scripts
          </p>
        </div>
      </div>

      {/* Thermometer & Recommendation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thermometer Chart */}
        <div className="lg:col-span-2 bg-vertus-card border border-vertus-gray rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-vertus-gray/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Flame className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-vertus-white">
                  Termômetro de Objeções Mais Quentes
                </h3>
                <p className="text-[11px] text-vertus-white/40">
                  Ranking em tempo real das objeções mais enfrentadas pela equipe em campo
                </p>
              </div>
            </div>
            <button
              onClick={fetchInsights}
              className="p-1.5 rounded-lg bg-vertus-gray hover:bg-vertus-white/10 text-vertus-white/60 hover:text-vertus-white transition-colors"
              title="Atualizar dados"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {(!data?.topObjections || data.topObjections.length === 0) ? (
              <div className="py-8 text-center text-xs text-vertus-white/40">
                Nenhuma objeção acionada ainda. As consultas registradas no WhatsApp e nos treinos aparecerão aqui.
              </div>
            ) : (
              data.topObjections.map((item, idx) => {
                const percentage = Math.round((item.count / maxCount) * 100);
                const isTop1 = idx === 0;

                return (
                  <div key={item.trigger} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 max-w-[80%]">
                        <span className={clsx(
                          "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
                          isTop1 
                            ? "bg-amber-500 text-vertus-bg" 
                            : idx === 1 
                              ? "bg-vertus-gold/40 text-vertus-white" 
                              : "bg-vertus-gray text-vertus-white/50"
                        )}>
                          #{idx + 1}
                        </span>
                        <span className="font-medium text-vertus-white/90 truncate group-hover:text-vertus-gold transition-colors">
                          "{item.trigger}"
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-vertus-gold">
                          {item.count} {item.count === 1 ? 'uso' : 'usos'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-vertus-bg h-2 rounded-full overflow-hidden border border-vertus-gray/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={clsx(
                          "h-full rounded-full",
                          isTop1 
                            ? "bg-gradient-to-r from-amber-500 to-red-500" 
                            : "bg-gradient-to-r from-vertus-gold/60 to-vertus-gold"
                        )}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recommendation & Strategic Advice */}
        <div className="bg-vertus-card border border-vertus-gray rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-vertus-gray/60">
              <div className="w-8 h-8 rounded-lg bg-vertus-gold/15 text-vertus-gold flex items-center justify-center">
                <Lightbulb className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-vertus-white">
                  Diagnóstico Tático Vertus
                </h3>
                <span className="text-[10px] text-vertus-gold uppercase font-bold tracking-wider">
                  Recomendação de Gestão
                </span>
              </div>
            </div>

            <p className="text-xs text-vertus-white/70 leading-relaxed">
              {topTrigger ? (
                <>
                  A maior fricção identificada na sua clínica é a objeção <strong className="text-vertus-gold">"{topTrigger}"</strong>.
                </>
              ) : (
                <>Identificamos as dúvidas mais frequentes da sua equipe para otimizar os fechamentos.</>
              )}
            </p>

            <div className="bg-vertus-bg/80 border border-vertus-gray rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-vertus-gold font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ação Prática Sugerida</span>
              </div>
              <p className="text-vertus-white/70 leading-relaxed text-[11px]">
                {topTrigger?.toLowerCase().includes('caro') ? (
                  'Capacite a equipe a nunca falar o preço antes de validar o benefício transformador e as dores da paciente na consulta consultiva.'
                ) : topTrigger?.toLowerCase().includes('marido') ? (
                  'Oriente as consultoras a envolverem a decisão em um projeto pessoal de autoestima e oferecerem uma pré-reserva com garantia de vaga.'
                ) : topTrigger?.toLowerCase().includes('pensar') ? (
                  'Implemente a técnica de fechamento por exclusão: "Quando uma paciente me diz que vai pensar, é por dúvida sobre o resultado ou sobre as condições?".'
                ) : (
                  'Promova um roleplay de 15 minutos com a IZA no modo simulador para calibrar o tom consultivo e a segurança da equipe.'
                )}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-vertus-gray/60 text-[10px] text-vertus-white/40 flex items-center justify-between">
            <span>Metodologia Consultiva Vertus</span>
            <span className="font-mono text-vertus-gold/80">Atualizado ao vivo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInsights;
