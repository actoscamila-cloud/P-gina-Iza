
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Track, Objection, Module, User, DailyChallenge, Activity, ChatSession, ChatMessage } from '../types';
import { INITIAL_TRACKS, OBJECTIONS, DEFAULT_AI_PROMPT, DEFAULT_DAILY_CHALLENGE, INITIAL_ACTIVITIES, MOCK_USERS } from '../data/mockData';
import api from '../services/api';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { sanitizeForFirestore, handleFirestoreError, OperationType } from '../utils/firestoreUtils';

interface DataContextType {
  tracks: Track[];
  objections: Objection[];
  users: User[];
  activities: Activity[];
  chatSessions: ChatSession[];
  aiPrompt: string;
  dailyChallenge: DailyChallenge;
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  setObjections: React.Dispatch<React.SetStateAction<Objection[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  setAiPrompt: React.Dispatch<React.SetStateAction<string>>;
  setDailyChallenge: React.Dispatch<React.SetStateAction<DailyChallenge>>;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => Promise<void>;
  saveChatSession: (userId: string, messages: ChatMessage[], mode?: 'whatsapp' | 'audio' | 'deep' | 'roleplay') => Promise<string>;
  endActiveSession: (userId: string, mode?: 'whatsapp' | 'audio' | 'deep' | 'roleplay') => Promise<void>;
  clearChatSessions: () => Promise<void>;
  clearAllCache: () => Promise<void>;
  saveData: () => void;
  syncAdminData: (data?: {
    tracks?: Track[];
    objections?: Objection[];
    users?: User[];
    aiPrompt?: string;
    dailyChallenge?: DailyChallenge;
  }) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [objections, setObjections] = useState<Objection[]>(OBJECTIONS);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [aiPrompt, setAiPrompt] = useState(DEFAULT_AI_PROMPT);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(DEFAULT_DAILY_CHALLENGE);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Real-time Firestore Listeners
  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'config', 'app'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.aiPrompt) setAiPrompt(data.aiPrompt);
        if (data.dailyChallenge) setDailyChallenge(data.dailyChallenge);
      } else {
        // Seed initial config if missing
        setDoc(doc(db, 'config', 'app'), sanitizeForFirestore({
          aiPrompt: DEFAULT_AI_PROMPT,
          dailyChallenge: DEFAULT_DAILY_CHALLENGE
        })).catch(err => {
          console.error('Error seeding config:', err);
          handleFirestoreError(err, OperationType.WRITE, 'config/app');
        });
      }
    }, (err) => {
      console.warn('Firestore Config Listener Error (Expected during initial setup):', err.message);
      setAiPrompt(DEFAULT_AI_PROMPT);
      setDailyChallenge(DEFAULT_DAILY_CHALLENGE);
      handleFirestoreError(err, OperationType.GET, 'config/app');
    });

    const unsubTracks = onSnapshot(collection(db, 'tracks'), (snapshot) => {
      const tracksData = snapshot.docs.map(doc => doc.data() as Track);
      setTracks(tracksData.sort((a, b) => {
        // Sort by order if available
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // Fallback to createdAt
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // Fallback to title (alphabetical)
        return a.title.localeCompare(b.title);
      }));
    }, (err) => {
      console.warn('Firestore Tracks Listener Error:', err.message);
      setTracks(INITIAL_TRACKS);
      handleFirestoreError(err, OperationType.LIST, 'tracks');
    });

    const unsubObjections = onSnapshot(collection(db, 'objections'), (snapshot) => {
      const objectionsData = snapshot.docs.map(doc => doc.data() as Objection);
      if (objectionsData.length >= 24) {
        setObjections(objectionsData.sort((a, b) => (Number(a.id) || 999) - (Number(b.id) || 999)));
      } else {
        // Guarantee all 24 Roones standard objections are always present
        const mergedMap = new Map<string, Objection>();
        OBJECTIONS.forEach(o => mergedMap.set(o.id, o));
        objectionsData.forEach(o => mergedMap.set(o.id, o));
        const mergedList = Array.from(mergedMap.values()).sort((a, b) => (Number(a.id) || 999) - (Number(b.id) || 999));
        setObjections(mergedList);

        // Seed missing standard objections into Firestore
        OBJECTIONS.forEach(o => {
          if (!objectionsData.some(d => d.id === o.id)) {
            setDoc(doc(db, 'objections', o.id), o).catch(() => {});
          }
        });
      }
    }, (err) => {
      console.warn('Firestore Objections Listener Error:', err.message);
      setObjections(OBJECTIONS);
      handleFirestoreError(err, OperationType.LIST, 'objections');
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!snapshot.empty) {
        const rawUsersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User);
        
        // Deduplicate in memory if multiple docs share the exact same email
        const emailMap = new Map<string, User>();
        rawUsersData.forEach(u => {
          const normalized = (u.email || '').toLowerCase().trim();
          if (!normalized) {
            emailMap.set(u.id, u);
            return;
          }
          if (!emailMap.has(normalized)) {
            emailMap.set(normalized, u);
          }
        });

        setUsers(Array.from(emailMap.values()));
      } else {
        // Seed initial users into Firestore
        console.log('Seeding initial users to Firestore...');
        const batch = writeBatch(db);
        MOCK_USERS.forEach(user => {
          const userRef = doc(db, 'users', user.id);
          batch.set(userRef, sanitizeForFirestore(user));
        });
        batch.commit()
          .then(() => console.log('Successfully seeded MOCK_USERS to Firestore.'))
          .catch(err => {
            console.error('Error seeding MOCK_USERS to Firestore:', err);
            setUsers(MOCK_USERS);
          });
      }
    }, (err) => {
      console.warn('Firestore Users Listener Error:', err.message);
      // Fallback to MOCK_USERS if there's a permission error
      setUsers(prev => prev.length > 0 ? prev : MOCK_USERS);
      handleFirestoreError(err, OperationType.LIST, 'users');
    });

    const unsubChatSessions = onSnapshot(collection(db, 'chatSessions'), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => doc.data() as ChatSession);
      setChatSessions(sessionsData.sort((a, b) => 
        new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime()
      ));
    }, (err) => {
      console.warn('Firestore ChatSessions Listener Error:', err.message);
      try {
        const cached = localStorage.getItem('roones_chat_sessions') || localStorage.getItem('vertus_chat_sessions');
        if (cached) {
          setChatSessions(JSON.parse(cached));
        }
      } catch (e) {
        // ignore
      }
      handleFirestoreError(err, OperationType.LIST, 'chatSessions');
    });

    setIsInitialized(true);

    return () => {
      unsubConfig();
      unsubTracks();
      unsubObjections();
      unsubUsers();
      unsubChatSessions();
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/activities');
      if (Array.isArray(response.data)) {
        setActivities(response.data);
      }
    } catch (err: any) {
      // Graceful fallback to local cache without triggering a loud uncaught console.error
      console.warn('Could not fetch activities from server, using local fallback:', err?.message || err);
      try {
        const saved = localStorage.getItem('roones_activities') || localStorage.getItem('vertus_activities');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActivities(parsed);
          }
        }
      } catch {
        // ignore storage parse errors
      }
    }

    try {
      const objRes = await api.get('/objections');
      if (Array.isArray(objRes.data) && objRes.data.length >= 24) {
        setObjections(objRes.data.sort((a, b) => (Number(a.id) || 999) - (Number(b.id) || 999)));
      } else if (Array.isArray(objRes.data) && objRes.data.length > 0) {
        const mergedMap = new Map<string, Objection>();
        OBJECTIONS.forEach(o => mergedMap.set(o.id, o));
        objRes.data.forEach((o: any) => mergedMap.set(o.id, o));
        setObjections(Array.from(mergedMap.values()).sort((a, b) => (Number(a.id) || 999) - (Number(b.id) || 999)));
      }
    } catch (objErr) {
      console.warn('Could not fetch objections from server:', objErr);
    }

    try {
      const usersRes = await api.get('/users');
      if (Array.isArray(usersRes.data) && usersRes.data.length > 0) {
        setUsers(prev => {
          const map = new Map<string, User>();
          usersRes.data.forEach((u: User) => {
            const email = (u.email || '').toLowerCase().trim();
            if (email) map.set(email, u);
            else map.set(u.id, u);
          });
          prev.forEach(u => {
            const email = (u.email || '').toLowerCase().trim();
            if (email) {
              const existing = map.get(email);
              map.set(email, { ...existing, ...u });
            } else {
              map.set(u.id, u);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (usersErr) {
      console.warn('Could not fetch users from server:', usersErr);
    }
  };

  useEffect(() => {
    fetchData();

    // Polling for real-time updates every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const addActivity = async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const localActivity: Activity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...activity,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [localActivity, ...prev].slice(0, 50));

    try {
      const response = await api.post('/activities', activity);
      if (response?.data?.id) {
        setActivities(prev => [response.data, ...prev.filter(a => a.id !== localActivity.id)].slice(0, 50));
      }
    } catch (err: any) {
      console.warn('Unable to sync activity to server, saved locally:', err?.message || err);
    }
  };

  const saveChatSession = async (userId: string, messages: ChatMessage[], mode: 'whatsapp' | 'audio' | 'deep' | 'roleplay' = 'whatsapp') => {
    const activeSession = chatSessions.find(s => s.userId === userId && s.isActive && (s.mode === mode || (!s.mode && mode === 'whatsapp')));
    
    // Use first user message as title if possible
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.text.slice(0, 40) + '...' : (messages[0]?.text.slice(0, 40) + '...');
    
    const now = new Date().toISOString();
    const sessionId = activeSession?.id || `chat_${mode}_${Date.now()}`;
    
    const sessionData: ChatSession = {
      id: sessionId,
      userId,
      messages,
      title,
      mode,
      isActive: true,
      lastInteraction: now
    };

    // Immediately save locally for resilience against offline or quota limits
    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      const next = [sessionData, ...filtered];
      try {
        localStorage.setItem('roones_chat_sessions', JSON.stringify(next.slice(0, 50)));
        localStorage.setItem('vertus_chat_sessions', JSON.stringify(next.slice(0, 50)));
      } catch {
        // ignore
      }
      return next;
    });

    try {
      const sessionDoc = doc(db, 'chatSessions', sessionId);
      await setDoc(sessionDoc, sanitizeForFirestore(sessionData));
      return sessionId;
    } catch (err) {
      console.warn('Unable to sync chat session to Firestore, kept locally:', err);
      handleFirestoreError(err, OperationType.WRITE, `chatSessions/${sessionId}`);
      return sessionId;
    }
  };

  const endActiveSession = async (userId: string, mode?: 'whatsapp' | 'audio' | 'deep' | 'roleplay') => {
    const activeSession = chatSessions.find(s => s.userId === userId && s.isActive && (!mode || s.mode === mode || (!s.mode && mode === 'whatsapp')));
    if (!activeSession) return;

    try {
      // Update Firestore
      const sessionRef = doc(db, 'chatSessions', activeSession.id);
      await updateDoc(sessionRef, { 
        isActive: false,
        lastInteraction: new Date().toISOString()
      });

      // Also sync to legacy server
      try {
        await api.post('/chat-sessions', { 
          id: activeSession.id,
          messages: activeSession.messages, 
          title: activeSession.title,
          mode: activeSession.mode || mode || 'whatsapp',
          isActive: false 
        });
      } catch (apiErr) {
        console.warn('Legacy server sync failed for end session:', apiErr);
      }

      setChatSessions(prev => 
        prev.map(s => s.id === activeSession.id ? { ...s, isActive: false } : s)
      );
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  const clearChatSessions = async () => {
    try {
      await api.delete('/chat-sessions');
      setChatSessions([]);
      toast.success('Histórico de conversas limpo com sucesso.');
    } catch (err) {
      console.error('Error clearing chat sessions:', err);
      toast.error('Erro ao limpar histórico');
    }
  };

  const clearAllCache = async () => {
    try {
      await api.delete('/chat-sessions');
      setChatSessions([]);
      setActivities([]);
      toast.success('Cache de dados limpo com sucesso.');
    } catch (err) {
      console.error('Error clearing cache:', err);
      toast.error('Erro ao limpar cache');
    }
  };

  const saveData = () => {
    // No longer needed as we save via API
  };

  const syncAdminData = async (data?: {
    tracks?: Track[];
    objections?: Objection[];
    users?: User[];
    aiPrompt?: string;
    dailyChallenge?: DailyChallenge;
  }) => {
    try {
      const batch = writeBatch(db);

      // Sync Config
      if (data?.aiPrompt || data?.dailyChallenge) {
        const configRef = doc(db, 'config', 'app');
        batch.set(configRef, sanitizeForFirestore({
          aiPrompt: data?.aiPrompt || aiPrompt,
          dailyChallenge: data?.dailyChallenge || dailyChallenge
        }), { merge: true });
      }

      // Sync Tracks
      if (data?.tracks) {
        const newTrackIds = new Set(data.tracks.map(t => t.id));
        // Find tracks to delete (those in current state but not in new data)
        tracks.forEach(t => {
          if (!newTrackIds.has(t.id)) {
            batch.delete(doc(db, 'tracks', t.id));
          }
        });
        // Set/Update tracks
        data.tracks.forEach(track => {
          const trackRef = doc(db, 'tracks', track.id);
          batch.set(trackRef, sanitizeForFirestore(track));
        });
      }

      // Sync Objections
      if (data?.objections) {
        const newObjectionIds = new Set(data.objections.map(o => o.id));
        objections.forEach(o => {
          if (!newObjectionIds.has(o.id)) {
            batch.delete(doc(db, 'objections', o.id));
          }
        });
        data.objections.forEach(obj => {
          const objRef = doc(db, 'objections', obj.id);
          batch.set(objRef, sanitizeForFirestore(obj));
        });
      }

      // Sync Users
      if (data?.users && Array.isArray(data.users)) {
        data.users.forEach(user => {
          const userRef = doc(db, 'users', user.id);
          batch.set(userRef, sanitizeForFirestore(user), { merge: true });
        });
        setUsers(data.users);
      }

      await batch.commit();
      
      // Also sync to legacy server for compatibility if needed
      const syncPayload: any = {};
      if (data?.tracks) syncPayload.tracks = data.tracks;
      if (data?.objections) syncPayload.objections = data.objections;
      if (data?.users) syncPayload.users = data.users;
      if (data?.aiPrompt) syncPayload.config = { ai_prompt: data.aiPrompt };
      if (data?.dailyChallenge) syncPayload.dailyChallenge = data.dailyChallenge;

      await api.post('/admin/sync', syncPayload);

      toast.success('Dados sincronizados com sucesso no Firebase!');
    } catch (err) {
      console.error('Error syncing admin data to Firestore:', err);
      toast.error('Erro ao sincronizar dados com o Firebase.');
    }
  };

  // Auto-save on changes
  useEffect(() => {
    saveData();
  }, [tracks, objections, users, activities, aiPrompt, dailyChallenge, chatSessions]);

  // Sync data across tabs
  useEffect(() => {
    // One-time reset requested by user to sync points/activities with track resets
    const hasReset = localStorage.getItem('roones_initial_reset_v2') || localStorage.getItem('vertus_initial_reset_v2');
    if (!hasReset) {
      setUsers(prev => prev.map(u => ({
        ...u,
        points: 0,
        progress: 0,
        completedModuleIds: [],
        badges: [],
        certificates: [],
        weeklyPoints: [
          { name: 'Seg', pts: 0 }, { name: 'Ter', pts: 0 }, { name: 'Qua', pts: 0 },
          { name: 'Qui', pts: 0 }, { name: 'Sex', pts: 0 }, { name: 'Sáb', pts: 0 }, { name: 'Dom', pts: 0 },
        ]
      })));
      setActivities([]);
      localStorage.setItem('roones_initial_reset_v2', 'true');
      localStorage.setItem('vertus_initial_reset_v2', 'true');
      saveData();
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'roones_tracks' || e.key === 'vertus_tracks') setTracks(e.newValue ? JSON.parse(e.newValue) : INITIAL_TRACKS);
        if (e.key === 'roones_objections' || e.key === 'vertus_objections') setObjections(e.newValue ? JSON.parse(e.newValue) : OBJECTIONS);
        if (e.key === 'roones_all_users_list' || e.key === 'vertus_all_users_list') setUsers(e.newValue ? JSON.parse(e.newValue) : MOCK_USERS);
        if (e.key === 'roones_activities' || e.key === 'vertus_activities') setActivities(e.newValue ? JSON.parse(e.newValue) : INITIAL_ACTIVITIES);
        if (e.key === 'roones_ai_prompt' || e.key === 'vertus_ai_prompt') setAiPrompt(e.newValue || DEFAULT_AI_PROMPT);
        if (e.key === 'roones_daily_challenge' || e.key === 'vertus_daily_challenge') setDailyChallenge(e.newValue ? JSON.parse(e.newValue) : DEFAULT_DAILY_CHALLENGE);
        if (e.key === 'roones_chat_sessions' || e.key === 'vertus_chat_sessions') setChatSessions(e.newValue ? JSON.parse(e.newValue) : []);
      } catch (err) {
        console.error('Error syncing storage across tabs:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Session timeout check (60 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
      setChatSessions(prev => 
        prev.map(s => {
          if (s.isActive && new Date(s.lastInteraction) < sixtyMinutesAgo) {
            // Update in Firestore too
            const sessionRef = doc(db, 'chatSessions', s.id);
            updateDoc(sessionRef, { isActive: false }).catch(err => console.error('Error auto-ending session:', err));
            return { ...s, isActive: false };
          }
          return s;
        })
      );
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ 
      tracks, 
      objections, 
      users,
      activities,
      chatSessions,
      aiPrompt, 
      dailyChallenge,
      setTracks, 
      setObjections, 
      setUsers,
      setActivities,
      setChatSessions,
      setAiPrompt,
      setDailyChallenge,
      addActivity,
      saveChatSession,
      endActiveSession,
      clearChatSessions,
      clearAllCache,
      saveData,
      syncAdminData,
      refreshData: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
