
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Certificate } from '../types';
import { isAfter } from 'date-fns';
import { useData } from './DataContext';
import { toast } from 'sonner';
import api from '../services/api';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { sanitizeForFirestore, handleFirestoreError, OperationType } from '../utils/firestoreUtils';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePoints: (points: number) => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  completeModule: (moduleId: string, points: number) => Promise<void>;
  completeChallenge: (challengeId: string, points: number) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getPrestige = (points: number) => {
  if (points >= 10000) return 'Black Roones';
  if (points >= 5000) return 'Platina';
  if (points >= 2500) return 'Ouro';
  if (points >= 1000) return 'Prata';
  return 'Bronze';
};

const getLevel = (points: number) => {
  return Math.floor(points / 500) + 1;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tracks, addActivity } = useData();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('roones_current_user') || localStorage.getItem('vertus_current_user');
    const token = localStorage.getItem('roones_token') || localStorage.getItem('vertus_token');
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        // Check for expiration
        if (parsedUser.expiresAt && isAfter(new Date(), new Date(parsedUser.expiresAt))) {
          localStorage.removeItem('roones_current_user');
          localStorage.removeItem('vertus_current_user');
          localStorage.removeItem('roones_token');
          localStorage.removeItem('vertus_token');
          setUser(null);
        } else {
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Real-time listener for current user data
  useEffect(() => {
    if (user?.id) {
      const userRef = doc(db, 'users', user.id);
      const unsub = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as User;
          
          // If non-admin user access has expired, automatically end session
          const isAdmin = userData.role === 'ROONES_ADMIN' || userData.role === 'VERTUS_ADMIN' || userData.role === 'SUPER_ADMIN';
          if (!isAdmin && userData.expiresAt && isAfter(new Date(), new Date(userData.expiresAt))) {
            toast.error('Seu período de acesso expirou. Entre em contato com o administrador.');
            setUser(null);
            localStorage.removeItem('roones_current_user');
            localStorage.removeItem('vertus_current_user');
            localStorage.removeItem('roones_token');
            localStorage.removeItem('vertus_token');
            return;
          }

          // Only update if data is different to avoid infinite loops
          setUser(prev => {
            if (!prev) return userData;
            // Simple comparison to avoid unnecessary updates
            if (JSON.stringify(prev) === JSON.stringify(userData)) return prev;
            return userData;
          });
          localStorage.setItem('roones_current_user', JSON.stringify(userData));
          localStorage.setItem('vertus_current_user', JSON.stringify(userData));
        } else {
          // Document was removed from Firestore (access revoked/deleted by admin)
          const isMasterAdmin = user.role === 'ROONES_ADMIN' || user.role === 'VERTUS_ADMIN' || user.email === 'admin@roones.com.br' || user.email === 'admin@vertus.com.br';
          if (!isMasterAdmin) {
            toast.error('Seu acesso ao sistema foi revogado pelo administrador.');
            setUser(null);
            localStorage.removeItem('roones_current_user');
            localStorage.removeItem('vertus_current_user');
            localStorage.removeItem('roones_token');
            localStorage.removeItem('vertus_token');
          }
        }
      }, (error) => {
        console.warn('User data listener error:', error);
        handleFirestoreError(error, OperationType.GET, `users/${user.id}`);
      });
      return () => unsub();
    }
  }, [user?.id]);

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { user: newUser, token } = response.data;
      
      localStorage.setItem('vertus_token', token);
      localStorage.setItem('vertus_current_user', JSON.stringify(newUser));
      
      setUser(newUser);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error('Senha é obrigatória');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: foundUser, token } = response.data;

      // Check for expiration
      if (foundUser.expiresAt && isAfter(new Date(), new Date(foundUser.expiresAt))) {
        toast.error('Seu período de acesso expirou. Entre em contato com o administrador.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('vertus_token', token);
      localStorage.setItem('vertus_current_user', JSON.stringify(foundUser));

      setUser({
        ...foundUser,
        level: getLevel(foundUser.points || 0),
        prestige: getPrestige(foundUser.points || 0)
      });
      
      toast.success(`Bem-vindo de volta, ${foundUser.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao entrar');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulating for now, could be an API call
      toast.success('E-mail de redefinição enviado! (Simulado)');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao redefinir senha');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('vertus_current_user');
    localStorage.removeItem('vertus_token');
    toast.info('Sessão encerrada');
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    console.log('Updating user data:', data);

    // Prepare the updated user object
    const updatedUser = { ...user, ...data };
    
    // Optimistically update local state
    setUser(updatedUser);
    localStorage.setItem('vertus_current_user', JSON.stringify(updatedUser));

    try {
      // 1. Update Firestore (Primary)
      const userRef = doc(db, 'users', user.id);
      // We use the full updatedUser object to ensure consistency, 
      // but sanitize it to remove any undefined values.
      await setDoc(userRef, sanitizeForFirestore(updatedUser), { merge: true });
      console.log('Firestore user data updated successfully');
      
      // 2. Update legacy server (Secondary/Sync)
      try {
        await api.put('/user', data);
      } catch (serverError) {
        console.warn('Legacy server sync failed, but Firestore is updated:', serverError);
      }
    } catch (error) {
      console.error('Error updating user data in Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
      toast.error('Erro ao sincronizar dados com o servidor. Verifique sua conexão.');
    }
  };

  const updatePoints = async (pointsToAdd: number) => {
    if (!user) return;
    
    const daysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const currentDayName = daysMap[new Date().getDay()];
    
    const weeklyPoints = user.weeklyPoints ? [...user.weeklyPoints] : [
      { name: 'Seg', pts: 0 }, { name: 'Ter', pts: 0 }, { name: 'Qua', pts: 0 },
      { name: 'Qui', pts: 0 }, { name: 'Sex', pts: 0 }, { name: 'Sáb', pts: 0 }, { name: 'Dom', pts: 0 },
    ];

    const dayIndex = weeklyPoints.findIndex(d => d.name === currentDayName);
    if (dayIndex !== -1) {
      weeklyPoints[dayIndex] = { 
        ...weeklyPoints[dayIndex], 
        pts: (weeklyPoints[dayIndex].pts || 0) + pointsToAdd 
      };
    }

    const newPoints = (user.points || 0) + pointsToAdd;
    await updateUser({ 
      points: newPoints,
      weeklyPoints
    });
  };

  const addPoints = updatePoints;

  const completeModule = async (moduleId: string, pointsToAdd: number) => {
    if (!user) return;
    
    const completedModuleIds = user.completedModuleIds || [];
    if (completedModuleIds.includes(moduleId)) return;

    const daysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const currentDayName = daysMap[new Date().getDay()];
    
    const weeklyPoints = user.weeklyPoints ? [...user.weeklyPoints] : [
      { name: 'Seg', pts: 0 }, { name: 'Ter', pts: 0 }, { name: 'Qua', pts: 0 },
      { name: 'Qui', pts: 0 }, { name: 'Sex', pts: 0 }, { name: 'Sáb', pts: 0 }, { name: 'Dom', pts: 0 },
    ];

    const dayIndex = weeklyPoints.findIndex(d => d.name === currentDayName);
    if (dayIndex !== -1) {
      weeklyPoints[dayIndex] = { 
        ...weeklyPoints[dayIndex], 
        pts: (weeklyPoints[dayIndex].pts || 0) + pointsToAdd 
      };
    }

    const newPoints = (user.points || 0) + pointsToAdd;
    const newCompletedIds = [...completedModuleIds, moduleId];
    
    // Badge Logic
    const newBadges = [...(user.badges || [])];
    if (newCompletedIds.length >= 1 && !newBadges.find(b => b.id === 'first_module')) {
      newBadges.push({
        id: 'first_module',
        name: 'Primeiros Passos',
        description: 'Concluiu seu primeiro módulo na plataforma.',
        icon: 'Zap',
        unlockedAt: new Date().toISOString()
      });
      toast.success('Nova Conquista: Primeiros Passos!');
    }
    
    if (newCompletedIds.length >= 5 && !newBadges.find(b => b.id === 'specialist')) {
      newBadges.push({
        id: 'specialist',
        name: 'Especialista',
        description: 'Concluiu 5 módulos de treinamento.',
        icon: 'Award',
        unlockedAt: new Date().toISOString()
      });
      toast.success('Nova Conquista: Especialista!');
    }

    if (newCompletedIds.length >= 10 && !newBadges.find(b => b.id === 'master')) {
      newBadges.push({
        id: 'master',
        name: 'Mestre Roones',
        description: 'Concluiu 10 módulos. Você é uma autoridade!',
        icon: 'Star',
        unlockedAt: new Date().toISOString()
      });
      toast.success('Nova Conquista: Mestre Roones!');
    }

    // Certificate Logic (Points-based milestones)
    const newCertificates = [...(user.certificates || [])];
    const milestones = [
      { pts: 5000, title: 'Consultor Nível Prata' },
      { pts: 10000, title: 'Consultor Nível Ouro' },
      { pts: 20000, title: 'Consultor Nível Platina' },
      { pts: 30000, title: 'Consultor Nível Black' },
      { pts: 40000, title: 'Consultor Master Roones' },
      { pts: 50000, title: 'Consultor de Alta Performance' },
    ];

    milestones.forEach(milestone => {
      const alreadyHas = newCertificates.find(c => c.pointsThreshold === milestone.pts);
      if (!alreadyHas && newPoints >= milestone.pts) {
        const newCert: Certificate = {
          id: `cert_${Math.random().toString(36).substr(2, 9)}`,
          pointsThreshold: milestone.pts,
          title: milestone.title,
          issuedAt: new Date().toISOString(),
          code: `VRT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        };
        newCertificates.push(newCert);
        addActivity({
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          type: 'TRACK_COMPLETED',
          message: `atingiu ${milestone.pts.toLocaleString()} pontos e conquistou o certificado "${milestone.title}"!`
        });
        toast.success(`Parabéns! Você atingiu ${milestone.pts.toLocaleString()} pontos e ganhou o certificado "${milestone.title}"!`, {
          duration: 5000,
          icon: '🎓'
        });
      }
    });

    const totalModules = tracks.reduce((acc, t) => acc + t.modules.length, 0);
    const progress = totalModules > 0 ? Math.round((newCompletedIds.length / totalModules) * 100) : 0;

    await updateUser({ 
      points: newPoints,
      completedModuleIds: newCompletedIds,
      badges: newBadges,
      certificates: newCertificates,
      weeklyPoints,
      progress
    });

    // Log activity
    const completedModule = tracks.flatMap(t => t.modules).find(m => m.id === moduleId);
    if (completedModule) {
      addActivity({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        type: 'MODULE_COMPLETED',
        message: `concluiu o módulo "${completedModule.title}"`
      });
    }
  };
  
  const completeChallenge = async (challengeId: string, pointsToAdd: number) => {
    if (!user) return;
    
    const completedChallengeIds = user.completedChallengeIds || [];
    if (completedChallengeIds.includes(challengeId)) return;

    const newPoints = (user.points || 0) + pointsToAdd;
    const newCompletedIds = [...completedChallengeIds, challengeId];
    
    await updatePoints(pointsToAdd);
    await updateUser({ 
      completedChallengeIds: newCompletedIds
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updatePoints, addPoints, completeModule, completeChallenge, updateUser, resetPassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
