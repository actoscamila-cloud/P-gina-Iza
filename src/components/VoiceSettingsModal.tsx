import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Check, RefreshCw, X, Play, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  VoiceConfig,
  VoiceTonePreset,
  TONE_PRESETS,
  getVoiceConfig,
  saveVoiceConfig,
  setVoiceTonePreset,
  getAvailablePortugueseVoices,
  getIzaVoice,
  testIzaVoice,
  stopIzaSpeech,
  onVoicesLoaded
} from '../utils/speechUtils';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<VoiceConfig>(() => getVoiceConfig());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'advanced'>('presets');

  useEffect(() => {
    if (!isOpen) return;

    const refreshVoices = () => {
      const voices = getAvailablePortugueseVoices();
      setAvailableVoices(voices);
      setConfig(getVoiceConfig());
    };

    refreshVoices();
    const unsubscribe = onVoicesLoaded(refreshVoices);

    return () => {
      unsubscribe();
      stopIzaSpeech();
      setIsPlayingTest(false);
    };
  }, [isOpen]);

  const activeVoice = getIzaVoice();

  const handleSelectPreset = (preset: VoiceTonePreset) => {
    setVoiceTonePreset(preset);
    const updated = getVoiceConfig();
    setConfig(updated);
  };

  const handleVoiceChange = (voiceName: string) => {
    const updated = { ...config, voiceName };
    saveVoiceConfig(updated);
    setConfig(updated);
  };

  const handleSpeedChange = (speed: number) => {
    const updated = { ...config, speed };
    saveVoiceConfig(updated);
    setConfig(updated);
  };

  const handlePitchChange = (pitch: number) => {
    const updated = { ...config, pitch };
    saveVoiceConfig(updated);
    setConfig(updated);
  };

  const handleTestAudio = () => {
    if (isPlayingTest) {
      stopIzaSpeech();
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);
    testIzaVoice(config.preset);

    // Stop animation after speech estimate or listen for end
    setTimeout(() => {
      setIsPlayingTest(false);
    }, 6000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-vertus-card border border-vertus-gold/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[88dvh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-vertus-gray/40 flex items-center justify-between bg-gradient-to-r from-vertus-gold/10 via-transparent to-transparent shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-vertus-gold/20 border border-vertus-gold/40 flex items-center justify-center text-vertus-gold shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-vertus-white flex items-center gap-2">
                Personalizar Voz da Iza
                <span className="text-[10px] bg-vertus-gold/20 text-vertus-gold px-2 py-0.5 rounded-full font-medium">
                  Humanizada
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-vertus-white/60 line-clamp-1 sm:line-clamp-none">
                Ajuste o tom, calor e entonação para soar natural e acolhedora
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopIzaSpeech();
              onClose();
            }}
            className="p-1.5 rounded-lg text-vertus-white/50 hover:text-vertus-white hover:bg-vertus-gray/50 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Active Voice Info Card */}
          <div className="bg-vertus-bg/70 border border-vertus-gray/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="truncate">
                <span className="text-[10px] font-semibold text-vertus-white/50 uppercase tracking-wider block">
                  Voz Ativa no Navegador
                </span>
                <span className="text-xs font-bold text-vertus-gold truncate block">
                  {activeVoice ? activeVoice.name : 'Voz Padrão do Sistema (pt-BR)'}
                </span>
              </div>
            </div>

            <button
              onClick={handleTestAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0 ${
                isPlayingTest
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                  : 'bg-vertus-gold text-vertus-bg hover:brightness-110'
              }`}
            >
              {isPlayingTest ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Parar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Testar Voz</span>
                </>
              )}
            </button>
          </div>

          {/* Tone Presets Selector */}
          <div>
            <label className="text-xs font-bold text-vertus-white/90 uppercase tracking-wider mb-2.5 block flex items-center justify-between">
              <span>Personalidade & Entonação</span>
              <span className="text-[11px] font-normal text-vertus-white/50 lowercase">
                selecione para aplicar
              </span>
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {(Object.keys(TONE_PRESETS) as VoiceTonePreset[]).map(key => {
                const preset = TONE_PRESETS[key];
                const isSelected = config.preset === key;

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-vertus-gold/15 border-vertus-gold shadow-md shadow-vertus-gold/5'
                        : 'bg-vertus-bg/40 border-vertus-gray/30 hover:border-vertus-gold/40 hover:bg-vertus-bg/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isSelected ? 'text-vertus-gold' : 'text-vertus-white'}`}>
                          {preset.label}
                        </span>
                        {key === 'acolhedor' && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-vertus-white/60 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                      isSelected ? 'border-vertus-gold bg-vertus-gold text-vertus-bg' : 'border-vertus-gray text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine Tuning Accordion / Sliders */}
          <div className="bg-vertus-bg/30 border border-vertus-gray/30 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-vertus-gray/20 pb-2">
              <span className="text-xs font-bold text-vertus-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-vertus-gold" />
                Ajuste Fino da Fala
              </span>
              <span className="text-[10px] text-vertus-white/40">
                Calibrado contra sons robóticos
              </span>
            </div>

            {/* Speed Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-vertus-white/80 font-medium">Velocidade da Fala:</span>
                <span className="text-vertus-gold font-bold">{config.speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.30"
                step="0.05"
                value={config.speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full accent-vertus-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-vertus-white/40 mt-1">
                <span>0.85x (Mais Calma)</span>
                <span>1.0x (Natural)</span>
                <span>1.30x (Ágil)</span>
              </div>
            </div>

            {/* Pitch Slider (Safely limited between 0.95 and 1.06 to prevent chipmunk distortion) */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-vertus-white/80 font-medium">Timbre / Afinação Vocal:</span>
                <span className="text-vertus-gold font-bold">
                  {config.pitch === 1.0 ? 'Natural (1.0x)' : `${config.pitch.toFixed(2)}x`}
                </span>
              </div>
              <input
                type="range"
                min="0.95"
                max="1.06"
                step="0.01"
                value={config.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full accent-vertus-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-vertus-white/40 mt-1">
                <span>0.95x (Mais Serena)</span>
                <span>1.00x (Natural Orgânica)</span>
                <span>1.06x (Brilhante)</span>
              </div>
            </div>

            {/* Available Voices Dropdown */}
            {availableVoices.length > 1 && (
              <div className="pt-2 border-t border-vertus-gray/20">
                <label className="text-xs font-medium text-vertus-white/80 mb-1.5 block">
                  Escolher voz específica instalada no seu aparelho:
                </label>
                <select
                  value={config.voiceName || (activeVoice?.name || '')}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full bg-vertus-card border border-vertus-gray/40 rounded-lg px-3 py-2 text-xs text-vertus-white focus:outline-none focus:border-vertus-gold"
                >
                  <option value="">Automático: Melhor voz natural detectada</option>
                  {availableVoices.map(v => {
                    const isNatural = v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural');
                    return (
                      <option key={v.name} value={v.name}>
                        {v.name} {isNatural ? '⭐ (Neural Natural)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-vertus-gray/40 bg-vertus-bg/50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setVoiceTonePreset('acolhedor');
              setConfig(getVoiceConfig());
            }}
            className="text-xs text-vertus-white/50 hover:text-vertus-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão Acolhedor</span>
          </button>

          <button
            onClick={() => {
              stopIzaSpeech();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-vertus-gold text-vertus-bg font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-vertus-gold/20"
          >
            Concluir & Salvar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
