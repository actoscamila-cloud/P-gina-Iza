/**
 * Utilitário Avançado de Síntese de Voz para a Iza (Mentora da Universidade Roones)
 * Focado em máxima humanização, tom caloroso, empático e entusiasmado em Português (pt-BR).
 */

export type VoiceTonePreset = 'acolhedor' | 'entusiasmado' | 'didatico';

export interface VoiceConfig {
  voiceName: string;
  speed: number;
  pitch: number;
  preset: VoiceTonePreset;
  preferCloudTts: boolean;
}

const STORAGE_KEY_CONFIG = 'roones_iza_voice_config_v2';
const STORAGE_SPEED_KEY = 'roones_voice_speed';
const LEGACY_STORAGE_KEY_CONFIG = 'vertus_iza_voice_config_v2';
const LEGACY_STORAGE_SPEED_KEY = 'vertus_voice_speed';

// Configurações padrão humanizadas:
// Pitch em 1.00 preserva o timbre orgânico da voz sem o efeito metálico/robótico
// Velocidade 1.02 confere agilidade natural de fala conversacional brasileira
export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceName: '',
  speed: 1.02,
  pitch: 1.00,
  preset: 'acolhedor',
  preferCloudTts: true
};

export const TONE_PRESETS: Record<VoiceTonePreset, { label: string; description: string; speed: number; pitch: number }> = {
  acolhedor: {
    label: 'Acolhedora & Humana',
    description: 'Tom caloroso, empático e natural. Ritmo confortável para ouvir conselhos e feedbacks.',
    speed: 1.00,
    pitch: 1.00
  },
  entusiasmado: {
    label: 'Entusiasmada & Motivadora',
    description: 'Voz viva, dinâmica e sorridente. Ideal para simulações de vendas e estímulo diário.',
    speed: 1.05,
    pitch: 1.03
  },
  didatico: {
    label: 'Didática & Consultiva',
    description: 'Pausas claras, dicção perfeita e foco em autoridade e estruturação de scripts.',
    speed: 0.98,
    pitch: 1.00
  }
};

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoadedListeners: Array<() => void> = [];

// Inicializa e monitora carregamento de vozes do navegador
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      if (cachedVoices.length > 0) {
        voicesLoadedListeners.forEach(listener => listener());
      }
    } catch (e) {
      console.warn('Erro ao carregar vozes do navegador:', e);
    }
  };

  updateVoices();
  window.speechSynthesis.onvoiceschanged = updateVoices;
}

export function onVoicesLoaded(callback: () => void): () => void {
  voicesLoadedListeners.push(callback);
  if (cachedVoices.length > 0) {
    callback();
  }
  return () => {
    voicesLoadedListeners = voicesLoadedListeners.filter(l => l !== callback);
  };
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function getVoiceConfig(): VoiceConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_VOICE_CONFIG };
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG) || localStorage.getItem(LEGACY_STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        voiceName: parsed.voiceName || '',
        speed: typeof parsed.speed === 'number' && parsed.speed >= 0.8 && parsed.speed <= 1.5 ? parsed.speed : DEFAULT_VOICE_CONFIG.speed,
        pitch: typeof parsed.pitch === 'number' && parsed.pitch >= 0.9 && parsed.pitch <= 1.15 ? parsed.pitch : DEFAULT_VOICE_CONFIG.pitch,
        preset: parsed.preset in TONE_PRESETS ? parsed.preset : DEFAULT_VOICE_CONFIG.preset,
        preferCloudTts: parsed.preferCloudTts !== undefined ? Boolean(parsed.preferCloudTts) : DEFAULT_VOICE_CONFIG.preferCloudTts
      };
    }
    // Fallback para chave antiga caso exista
    const oldSpeed = localStorage.getItem(STORAGE_SPEED_KEY) || localStorage.getItem(LEGACY_STORAGE_SPEED_KEY);
    if (oldSpeed) {
      const parsedSpeed = parseFloat(oldSpeed);
      if (!isNaN(parsedSpeed) && parsedSpeed >= 0.8 && parsedSpeed <= 1.5) {
        return { ...DEFAULT_VOICE_CONFIG, speed: parsedSpeed };
      }
    }
  } catch (e) {
    console.warn('Erro ao ler configuração de voz:', e);
  }
  return { ...DEFAULT_VOICE_CONFIG };
}

export function saveVoiceConfig(config: Partial<VoiceConfig>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getVoiceConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    localStorage.setItem(LEGACY_STORAGE_KEY_CONFIG, JSON.stringify(updated));
    localStorage.setItem(STORAGE_SPEED_KEY, updated.speed.toFixed(2));
    localStorage.setItem(LEGACY_STORAGE_SPEED_KEY, updated.speed.toFixed(2));
  } catch (e) {
    console.warn('Erro ao salvar configuração de voz:', e);
  }
}

export function setVoiceTonePreset(preset: VoiceTonePreset) {
  const presetConfig = TONE_PRESETS[preset];
  if (!presetConfig) return;
  saveVoiceConfig({
    preset,
    speed: presetConfig.speed,
    pitch: presetConfig.pitch
  });
}

export function getSpeechSpeed(): number {
  return getVoiceConfig().speed;
}

export function setSpeechSpeed(speed: number) {
  saveVoiceConfig({ speed });
}

export function cycleSpeechSpeed(): number {
  const current = getSpeechSpeed();
  let next = 1.02;
  if (current < 1.01) {
    next = 1.02; // Normal acolhedor
  } else if (current < 1.15) {
    next = 1.20; // Ágil e Dinâmico
  } else if (current < 1.30) {
    next = 0.95; // Didático e calmo
  } else {
    next = 1.02;
  }
  setSpeechSpeed(next);
  return next;
}

// Lista de palavras masculinas que NUNCA devem ser associadas à Iza
const EXPLICIT_MALE_KEYWORDS = [
  'daniel', 'felipe', 'antonio', 'antónio', 'ricardo', 'george', 'david',
  'male', 'masculino', 'homem', 'man', 'joão', 'carlos', 'tiago', 'pedro', 'lucas'
];

/**
 * Retorna todas as vozes em português disponíveis no sistema do usuário,
 * priorizando vozes femininas e neurais/naturais.
 */
export function getAvailablePortugueseVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return [];

  return voices.filter(v => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang.startsWith('pt');
  });
}

/**
 * Detecta e seleciona a melhor voz natural e acolhedora em português
 */
export function getIzaVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const config = getVoiceConfig();

  // Se o usuário selecionou uma voz específica manualmente e ela ainda existe:
  if (config.voiceName) {
    const chosen = voices.find(v => v.name === config.voiceName);
    if (chosen) return chosen;
  }

  const ptVoices = voices.filter(v => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang.startsWith('pt');
  });

  if (ptVoices.length === 0) {
    // Fallback: qualquer voz feminina no sistema
    return voices.find(v => {
      const n = v.name.toLowerCase();
      return (n.includes('natural') || n.includes('female') || n.includes('neural')) &&
             !EXPLICIT_MALE_KEYWORDS.some(k => n.includes(k));
    }) || null;
  }

  // 1ª Prioridade: Vozes Neurais e Naturais em Português Brasileiro (Edge / Windows Natural, Azure, Apple Enhanced)
  // Exemplo: Microsoft Francisca Online (Natural), Microsoft Thalita Online (Natural), Brenda Natural, Luciana Enhanced
  const neuralVoice = ptVoices.find(v => {
    const n = v.name.toLowerCase();
    const isMale = EXPLICIT_MALE_KEYWORDS.some(k => n.includes(k));
    if (isMale) return false;
    return n.includes('natural') || n.includes('neural') || n.includes('online (natural)') || n.includes('enhanced') || n.includes('premium');
  });
  if (neuralVoice) return neuralVoice;

  // 2ª Prioridade: Vozes Femininas brasileiras de alta reputação por calor vocal e naturalidade
  const warmFemaleKeywords = [
    'francisca', // Alta expressividade
    'thalita',   // Jovem, dinâmica e calorosa
    'brenda',    // Expressão acolhedora
    'luciana',   // macOS / iOS pt-BR acolhedora
    'yara',      // Android pt-BR
    'helena',    // iOS / macOS moderno
    'camila',
    'leticia',
    'letícia',
    'vitória',
    'vitoria',
    'alice',
    'manuela',
    'laura',
    'carolina',
    'raquel'
  ];

  const preferredFemaleVoice = ptVoices.find(v => {
    const n = v.name.toLowerCase();
    const isMale = EXPLICIT_MALE_KEYWORDS.some(k => n.includes(k));
    return !isMale && warmFemaleKeywords.some(k => n.includes(k));
  });
  if (preferredFemaleVoice) return preferredFemaleVoice;

  // 3ª Prioridade: Voz padrão Google do Brasil (Google português do Brasil)
  const googlePtVoice = ptVoices.find(v => {
    const n = v.name.toLowerCase();
    const isMale = EXPLICIT_MALE_KEYWORDS.some(k => n.includes(k));
    return !isMale && n.includes('google') && (n.includes('brasil') || n.includes('brazil') || v.lang.toLowerCase().includes('br'));
  });
  if (googlePtVoice) return googlePtVoice;

  // 4ª Prioridade: Outras vozes em português com identificação feminina
  const otherFemalePt = ptVoices.find(v => {
    const n = v.name.toLowerCase();
    const isMale = EXPLICIT_MALE_KEYWORDS.some(k => n.includes(k));
    return !isMale && (
      n.includes('maria') ||
      n.includes('female') ||
      n.includes('feminina') ||
      n.includes('mulher')
    );
  });
  if (otherFemalePt) return otherFemalePt;

  // 5ª Prioridade: Qualquer voz em português que não seja explicitamente masculina
  const neutralPtVoice = ptVoices.find(v => {
    const n = v.name.toLowerCase();
    return !EXPLICIT_MALE_KEYWORDS.some(k => n.includes(k));
  });
  if (neutralPtVoice) return neutralPtVoice;

  // 6ª Prioridade: Primeira voz em português disponível
  return ptVoices[0];
}

/**
 * Pré-processa o texto para soar como uma fala humana real:
 * - Remove instruções técnicas e formatações
 * - Expande abreviações comuns de clínicas de estética
 * - Insere pausas respiratórias e ritmo conversacional natural
 */
export function formatTextForNaturalSpeech(rawText: string): string {
  if (!rawText) return '';

  let speech = rawText
    // Remove cabeçalhos Markdown (ex: ### Título)
    .replace(/^#{1,6}\s+.+$/gm, '')
    // Remove notas estratégicas ou blocos explicativos após divisores
    .split(/\n---+\n/)[0]
    // Remove marcações de instruções entre colchetes (ex: [Tom acolhedor e seguro], [Pausa])
    .replace(/\[.*?\]/g, '')
    // Remove emojis (que provocam leitura robótica em alguns sintetizadores)
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    // Remove marcações Markdown (*, _, ~, `, >, #)
    .replace(/[\*\_~`>#]/g, '')
    // Remove marcadores de lista como • ou traço isolado
    .replace(/^\s*[•\-\*]\s+/gm, '')
    // Substitui travessões longos por vírgulas para dar pausa respiratória
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*–\s*/g, ', ')
    // Expande abreviações comuns para pronúncia fluida em clínicas
    .replace(/\bDra\.\s*/gi, 'Doutora ')
    .replace(/\bDr\.\s*/gi, 'Doutor ')
    .replace(/\bvc\b/gi, 'você')
    .replace(/\bvcs\b/gi, 'vocês')
    .replace(/\bpq\b/gi, 'porque')
    .replace(/\btbm\b/gi, 'também')
    .replace(/\bobs:\s*/gi, 'observação: ')
    .replace(/\bex:\s*/gi, 'por exemplo, ')
    .replace(/\bwhatsapp\b/gi, 'WhatsApp')
    .replace(/\bR\$\s*(\d+)/gi, '$1 reais')
    .replace(/%/g, ' por cento')
    // Substitui reticências por vírgulas para evitar silêncio artificial longo
    .replace(/\.{3,}/g, ', ')
    // Normaliza quebras de linha em pausas suaves
    .replace(/\n\n+/g, '. ')
    .replace(/\n/g, ', ')
    // Remove pontuação duplicada
    .replace(/([,;])\s*([,;])/g, '$1')
    .replace(/([.?!])\s*([,;])/g, '$1')
    // Espaços múltiplos
    .replace(/\s{2,}/g, ' ')
    .trim();

  return speech;
}

// Controle de reprodução de áudio ativo
let currentAudioElement: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Cache de áudio sintetizado em memória para respostas instantâneas (zero latency)
const audioTtsCache = new Map<string, string>();
const MAX_AUDIO_CACHE_ENTRIES = 60;

function getAudioCacheKey(text: string, tone: string): string {
  // Gera chave normalizada compacta
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
  return `${tone}:${normalized.slice(0, 200)}_${normalized.length}`;
}

export function clearAudioCache() {
  audioTtsCache.clear();
}

export function stopIzaSpeech() {
  if (typeof window !== 'undefined') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentUtterance = null;
  }
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudioElement = null;
  }
}

/**
 * Tenta reproduzir fala via Cloud TTS (Gemini Neural) com cache inteligente
 */
async function tryCloudTts(
  text: string,
  onEnd?: () => void,
  onError?: () => void
): Promise<boolean> {
  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('roones_token') || localStorage.getItem('vertus_token') || localStorage.getItem('roones_auth_token') || localStorage.getItem('vertus_auth_token')) 
    : null;
  if (!token) return false;

  const tone = getVoiceConfig().preset;
  const cacheKey = getAudioCacheKey(text, tone);

  // 1. Verificação instantânea no cache (Zero Latency)
  const cachedUrl = audioTtsCache.get(cacheKey);
  if (cachedUrl) {
    try {
      stopIzaSpeech();
      const audio = new Audio(cachedUrl);
      currentAudioElement = audio;

      audio.onended = () => {
        currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        currentAudioElement = null;
        if (onError) onError();
      };

      await audio.play();
      return true;
    } catch (playErr) {
      console.warn('Falha ao reproduzir áudio do cache, tentando buscar novamente:', playErr);
      audioTtsCache.delete(cacheKey);
    }
  }

  // Se estiver offline ou rede indisponível, faz fallback imediato para voz nativa
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  // 2. Busca no servidor se não estiver no cache com timeout para não travar em rede móvel
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 3200) : null;

  try {
    const res = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: controller?.signal,
      body: JSON.stringify({
        text,
        tone
      })
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    if (!data || !data.audioUrl) {
      return false;
    }

    // Salva no cache com política LRU simplificada
    if (audioTtsCache.size >= MAX_AUDIO_CACHE_ENTRIES) {
      const firstKey = audioTtsCache.keys().next().value;
      if (firstKey) audioTtsCache.delete(firstKey);
    }
    audioTtsCache.set(cacheKey, data.audioUrl);

    stopIzaSpeech();

    const audio = new Audio(data.audioUrl);
    currentAudioElement = audio;

    audio.onended = () => {
      currentAudioElement = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      currentAudioElement = null;
      if (onError) onError();
    };

    await audio.play();
    return true;
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    console.warn('Cloud TTS não disponível ou demorou além do limite de rede, acionando síntese nativa:', err);
    return false;
  }
}

/**
 * Reproduz o texto com a voz acolhedora, humanizada e natural da Iza.
 * Utiliza o pipeline otimizado de pontuação, afinação orgânica e escolha inteligente de voz.
 */
export function speakIzaText(
  rawText: string,
  onEnd?: () => void,
  onError?: () => void,
  customSpeed?: number
): boolean {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError();
    return false;
  }

  stopIzaSpeech();

  const cleanSpeech = formatTextForNaturalSpeech(rawText);
  if (!cleanSpeech) {
    if (onError) onError();
    return false;
  }

  const config = getVoiceConfig();

  // Se preferência por Cloud TTS estiver ativa, tentar sintetizar via modelo neural do backend
  if (config.preferCloudTts) {
    tryCloudTts(cleanSpeech, onEnd, () => {
      // Se a nuvem falhar, faz fallback transparente e instantâneo para Web Speech API
      speakWithWebSpeech(cleanSpeech, config, customSpeed, onEnd, onError);
    }).then(played => {
      if (!played) {
        speakWithWebSpeech(cleanSpeech, config, customSpeed, onEnd, onError);
      }
    }).catch(() => {
      speakWithWebSpeech(cleanSpeech, config, customSpeed, onEnd, onError);
    });
    return true;
  }

  return speakWithWebSpeech(cleanSpeech, config, customSpeed, onEnd, onError);
}

function speakWithWebSpeech(
  cleanSpeech: string,
  config: VoiceConfig,
  customSpeed?: number,
  onEnd?: () => void,
  onError?: () => void
): boolean {
  try {
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'pt-BR';

    const voice = getIzaVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Velocidade: natural, com cadência ágil sem ser apressada
    utterance.rate = customSpeed || config.speed;

    // Afinação (Pitch): Mantido rigorosamente próximo a 1.00 para preservar o calor e harmônicos vocais humanos
    // Se o usuário selecionou tom 'entusiasmado', 1.02 confere um brilho alegre sem distorção
    const safePitch = Math.min(1.08, Math.max(0.95, config.pitch));
    utterance.pitch = safePitch;

    currentUtterance = utterance;

    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      currentUtterance = null;
      console.warn('SpeechSynthesis error:', e);
      if (onError) onError();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Erro ao reproduzir fala com SpeechSynthesis:', err);
    if (onError) onError();
    return false;
  }
}

/**
 * Mensagem de teste calorosa da Iza para validação imediata da voz
 */
export function testIzaVoice(preset?: VoiceTonePreset) {
  const currentConfig = getVoiceConfig();
  const testPreset = preset || currentConfig.preset;

  let testPhrase = 'Olá! Eu sou a Iza, mentora e consultora educacional da Universidade Roones. Como posso te apoiar no seu próximo atendimento hoje?';
  
  if (testPreset === 'entusiasmado') {
    testPhrase = 'Olá, que alegria ter você aqui! Vamos praticar juntos e transformar cada objeção em uma oportunidade incrível de acolhimento e venda!';
  } else if (testPreset === 'didatico') {
    testPhrase = 'Olá! Vamos analisar os fundamentos da abordagem consultiva: escuta ativa, validação das dores da paciente e condução com segurança.';
  }

  speakIzaText(testPhrase);
}
