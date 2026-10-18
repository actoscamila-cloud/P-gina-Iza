
export type UserRole = 'CONSULTOR' | 'SUPER_ADMIN' | 'ROONES_ADMIN' | 'VERTUS_ADMIN';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'MODULE_COMPLETED' | 'TRACK_COMPLETED' | 'RANKING_UP' | 'STREAK_MILESTONE' | 'ROLEPLAY_COMPLETED';
  message: string;
  timestamp: string;
}

export interface RoleplayExecutiveSummary {
  id: string;
  scenarioId?: string;
  scenarioTitle: string;
  score: number; // 0 - 10
  headline: string;
  strengths: string[];
  improvementAreas: string[];
  recommendedScript: string;
  practicalTip?: string;
  date: string;
}

export interface DailyChallenge {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  active: boolean;
}

export interface Certificate {
  id: string;
  trackId?: string;
  trackTitle?: string;
  pointsThreshold?: number;
  title: string;
  issuedAt: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  points: number;
  progress: number;
  avatar?: string;
  monogramStyle?: 'prestige' | 'black' | 'graphite' | 'emerald';
  clinicId: string;
  phone?: string;
  bio?: string;
  theme?: string;
  streak?: number;
  lastLoginDate?: string;
  completedModuleIds?: string[];
  completedChallengeIds?: string[];
  weeklyPoints?: { name: string, pts: number }[];
  themeMode?: 'light' | 'dark';
  badges?: Badge[];
  certificates?: Certificate[];
  level?: number;
  prestige?: string;
  createdAt?: string;
  accessDuration?: '30' | '60' | '90' | 'LIFETIME';
  expiresAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  videoUrl?: string;
  videoData?: string;
  points: number;
  isCompleted: boolean;
  quiz?: Quiz;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  icon: string;
  type?: 'TRACK' | 'CLASS';
  createdAt?: string;
  order?: number;
}

export interface Objection {
  id: string;
  trigger: string;
  reason?: string;
  expertView?: string;
  rapportResponse?: string;
  consultativeResponse?: string;
  authorityResponse?: string;
  response: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  image?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  lastInteraction: string;
  createdAt?: string;
  title?: string;
  isActive: boolean;
  mode?: 'whatsapp' | 'audio' | 'deep' | 'roleplay';
}

export interface AppConfig {
  aiPrompt: string;
  objections: Objection[];
}

export interface DiagnosticResult {
  category: 'Performance' | 'Escalabilidade' | 'Banco de Dados' | 'Arquitetura' | 'Segurança' | 'Multi-tenancy';
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  impactOnScale: string;
  fileName?: string;
  lineSnippet?: string;
}

export interface ExtractedFile {
  name: string;
  path: string;
  content: string;
  size: number;
  extension: string;
  diagnostics: DiagnosticResult[];
}

export interface ScaleReadinessScore {
  overallScore: number;
  databaseScore: number;
  concurrencyScore: number;
  architectureScore: number;
  costEfficiencyScore: number;
  securityScore: number;
}
