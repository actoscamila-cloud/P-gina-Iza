import { useState, type FormEvent } from 'react';
import { X, Sparkles, MessageCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface CommercialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommercialOfferModal({ isOpen, onClose }: CommercialOfferModalProps) {
  const [name, setName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [teamSize, setTeamSize] = useState('1 a 2 pessoas');
  const [procedureFocus, setProcedureFocus] = useState('Injetáveis (Botox, Preenchimento, Bioestimulador)');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleWhatsAppRedirect = () => {
    const text = encodeURIComponent(
      `Olá equipe Vertus Performance! Gostaria de agendar uma demonstração VIP da Iza Mentora Comercial para a minha clínica:\n\n` +
      `• Nome: ${name || 'Gestor(a)'}\n` +
      `• Clínica: ${clinicName || 'Clínica de Estética'}\n` +
      `• Cidade: ${city || 'Brasil'}\n` +
      `• Tamanho da equipe de vendas: ${teamSize}\n` +
      `• Foco principal: ${procedureFocus}\n\n` +
      `Quero entender como implantar a versão Web na recepção e o App no celular da equipe.`
    );
    // WhatsApp contact URL (can be customized or opened in a new tab)
    const url = `https://wa.me/5511999999999?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#11131c] border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl text-slate-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1c1e2b] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acesso Comercial VIP • Vertus Performance</span>
            </div>

            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Agende uma Demonstração Personalizada da Iza
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Descubra como colocar a Iza no computador da sua recepção e no celular da sua equipe comercial em menos de 24 horas.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Seu Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Juliana Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a26] border border-[#2b3044] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome da Clínica:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Instituto Santos Estética"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a26] border border-[#2b3044] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cidade / Estado:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Campinas - SP"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a26] border border-[#2b3044] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Seu WhatsApp com DDD:</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a26] border border-[#2b3044] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pessoas no Atendimento/Vendas:</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a26] border border-[#2b3044] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="1 a 2 pessoas">1 a 2 atendentes/secretárias</option>
                    <option value="3 a 5 pessoas">3 a 5 consultoras</option>
                    <option value="6 ou mais pessoas">6 ou mais pessoas (Rede)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Carro-Chefe da Clínica:</label>
                  <select
                    value={procedureFocus}
                    onChange={(e) => setProcedureFocus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181a26] border border-[#2b3044] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Injetáveis (Botox, Preenchimento, Bioestimulador)">Injetáveis & Harmonização</option>
                    <option value="Lasers & Tecnologias de Alto Ticket">Lasers & Tecnologias</option>
                    <option value="Cirurgia Plástica / Corporal">Cirurgia Plástica / Corporal</option>
                    <option value="Tratamentos Combinados de Estética Geral">Estética Integrada Geral</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer"
                >
                  <span>Avançar para Agendamento da Clínica</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Seus dados são confidenciais e protegidos. Atendimento exclusivo para clínicas.</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-2xl font-bold text-white">Solicitação Recebida com Sucesso!</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Obrigado, <strong className="text-amber-300">{name || 'Doutor(a)'}</strong>. A equipe de especialistas da <strong>Vertus Performance</strong> preparou uma demonstração exclusiva para a <strong>{clinicName || 'sua clínica'}</strong>.
            </p>

            <div className="pt-2">
              <button
                onClick={handleWhatsAppRedirect}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Iniciar Conversa no WhatsApp com Consultor Vertus</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer pt-2"
            >
              Fechar janela e continuar explorando a página
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
