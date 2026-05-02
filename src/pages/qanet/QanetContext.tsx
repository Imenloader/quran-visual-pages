import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { QanetState, QanetLog } from './types';
import { formatHijriDate } from './hijriUtils';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const defaultState: QanetState = {
  hasCompletedOnboarding: false,
  language: 'ar',
  gender: null,
  dailyTarget: 100,
  notificationsEnabled: false,
  reminderTime: '21:00',
  logs: [],
  totalJuzTracked: 0,
  settings: {
    interactiveColors: true,
    hijriCalendar: true,
    hijriOffset: 0,
  }
};

interface TrackingSession {
  startTime: string;
  juzNumber: number;
  startPage: number;
  visitedPages: number[];
}

interface QanetContextType extends QanetState {
  updateState: (updates: Partial<QanetState>) => void;
  updateSettings: (updates: Partial<QanetState['settings']>) => void;
  addLog: (log: QanetLog) => void;
  deleteLog: (id: string) => void;
  resetData: () => void;
  isSyncing: boolean;
  isLogModalOpen: boolean;
  setIsLogModalOpen: (isOpen: boolean) => void;
  isTracking: boolean;
  trackingSession: TrackingSession | null;
  startTracking: (juzNumber: number, startPage: number) => void;
  stopTracking: (save: boolean) => void;
  updateTrackingPage: (pageNumber: number) => void;
}

export const QanetContext = createContext<QanetContextType | undefined>(undefined);

export const QanetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QanetState>(() => {
    try {
      const saved = localStorage.getItem('qanet_state');
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch (e) {
      console.error("Failed to load qanet state", e);
      return defaultState;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const unsubLogsRef = useRef<(() => void) | null>(null);
  const unsubSettingsRef = useRef<(() => void) | null>(null);
  const isFirebaseActive = useRef(false);

  // Always save to localStorage as fallback
  useEffect(() => {
    localStorage.setItem('qanet_state', JSON.stringify(state));
  }, [state]);

  // Firebase sync setup
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      // Cleanup previous listeners
      if (unsubLogsRef.current) { unsubLogsRef.current(); unsubLogsRef.current = null; }
      if (unsubSettingsRef.current) { unsubSettingsRef.current(); unsubSettingsRef.current = null; }

      if (!user) {
        isFirebaseActive.current = false;
        return;
      }

      isFirebaseActive.current = true;
      setIsSyncing(true);

      try {
        // Load settings from Firebase
        const settingsRef = doc(db, 'users', user.uid, 'qanet_settings', 'main');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const fbSettings = settingsSnap.data() as Partial<QanetState>;
          setState(prev => ({
            ...prev,
            ...fbSettings,
            logs: prev.logs, // Don't overwrite logs from settings doc
          }));
        } else {
          // First time — push local state to Firebase
          const { logs, ...settingsOnly } = state;
          await setDoc(settingsRef, settingsOnly);
          // Also push any existing local logs
          if (state.logs.length > 0) {
            const logsRef = collection(db, 'users', user.uid, 'qanet_logs');
            for (const log of state.logs) {
              await addDoc(logsRef, log);
            }
          }
        }

        // Listen for settings changes
        unsubSettingsRef.current = onSnapshot(settingsRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<QanetState>;
            setState(prev => ({
              ...prev,
              ...data,
              logs: prev.logs,
            }));
          }
        }, (err) => console.warn('[Qanet] Settings sync error:', err));

        // Listen for logs collection
        const logsRef = collection(db, 'users', user.uid, 'qanet_logs');
        const logsQuery = query(logsRef, orderBy('date', 'desc'));
        
        unsubLogsRef.current = onSnapshot(logsQuery, (snapshot) => {
          const logs: QanetLog[] = [];
          snapshot.forEach((doc) => {
            logs.push({ ...doc.data(), id: doc.id } as QanetLog);
          });
          setState(prev => ({ ...prev, logs }));
        }, (err) => console.warn('[Qanet] Logs sync error:', err));

      } catch (e) {
        console.error('[Qanet] Firebase sync error:', e);
      } finally {
        setIsSyncing(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubLogsRef.current) unsubLogsRef.current();
      if (unsubSettingsRef.current) unsubSettingsRef.current();
    };
  }, []);

  const updateState = useCallback((updates: Partial<QanetState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Sync to Firebase
      if (isFirebaseActive.current && auth.currentUser) {
        const { logs, ...settingsOnly } = { ...updates };
        if (Object.keys(settingsOnly).length > 0) {
          const settingsRef = doc(db, 'users', auth.currentUser.uid, 'qanet_settings', 'main');
          updateDoc(settingsRef, settingsOnly).catch(err => {
            console.error('[Qanet] Failed to sync settings:', err);
          });
        }
      }
      
      return newState;
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<QanetState['settings']>) => {
    setState(prev => {
      const newSettings = { ...prev.settings, ...updates };
      const newState = { ...prev, settings: newSettings };
      
      if (isFirebaseActive.current && auth.currentUser) {
        const settingsRef = doc(db, 'users', auth.currentUser.uid, 'qanet_settings', 'main');
        updateDoc(settingsRef, { settings: newSettings }).catch(err => {
          console.error('[Qanet] Failed to sync settings:', err);
        });
      }
      
      return newState;
    });
  }, []);

  const addLog = useCallback((log: QanetLog) => {
    if (isFirebaseActive.current && auth.currentUser) {
      const logsRef = collection(db, 'users', auth.currentUser.uid, 'qanet_logs');
      const { id, ...logData } = log;
      addDoc(logsRef, logData).catch(err => {
        console.error('[Qanet] Failed to add log:', err);
        // Fallback to local
        setState(prev => ({ ...prev, logs: [...prev.logs, log] }));
      });
      // The onSnapshot listener will update the state automatically
    } else {
      setState(prev => ({ ...prev, logs: [...prev.logs, log] }));
    }
  }, []);

  const deleteLog = useCallback((id: string) => {
    if (isFirebaseActive.current && auth.currentUser) {
      const logRef = doc(db, 'users', auth.currentUser.uid, 'qanet_logs', id);
      deleteDoc(logRef).catch(err => {
        console.error('[Qanet] Failed to delete log:', err);
      });
      // The onSnapshot listener will update the state automatically
    } else {
      setState(prev => ({
        ...prev,
        logs: prev.logs.filter(l => l.id !== id),
      }));
    }
  }, []);

  const [isTracking, setIsTracking] = useState(false);
  const [trackingSession, setTrackingSession] = useState<TrackingSession | null>(null);

  const startTracking = useCallback((juzNumber: number, startPage: number) => {
    setIsTracking(true);
    setTrackingSession({
      startTime: new Date().toISOString(),
      juzNumber,
      startPage,
      visitedPages: [startPage]
    });
  }, []);

  const stopTracking = useCallback((save: boolean) => {
    if (save && trackingSession) {
      // Calculate ayahs (rough estimate based on pages, or use a data map)
      // For now, let's say average 15 ayahs per page
      const totalAyahs = trackingSession.visitedPages.length * 15;
      const hijriDateStr = formatHijriDate(new Date(), state.settings.hijriOffset);
      
      addLog({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        hijriDate: hijriDateStr,
        shafaWitr: false,
        totalAyahs,
        ranges: [{
          startSurah: 1,
          startAyah: 1,
          endSurah: 114,
          endAyah: 6
        }],
        startSurah: 1,
        startAyah: 1,
        endSurah: 114,
        endAyah: 6
      });

      // Update total juz tracked
      setState(prev => {
        let newTotal = prev.totalJuzTracked + (trackingSession.visitedPages.length / 20); // 20 pages per juz
        if (newTotal >= 1000) newTotal = 0; // Reset every 1000 juz
        return { ...prev, totalJuzTracked: newTotal };
      });
    }
    setIsTracking(false);
    setTrackingSession(null);
  }, [trackingSession, addLog]);

  const updateTrackingPage = useCallback((pageNumber: number) => {
    setTrackingSession(prev => {
      if (!prev) return null;
      if (prev.visitedPages.includes(pageNumber)) return prev;
      return {
        ...prev,
        visitedPages: [...prev.visitedPages, pageNumber]
      };
    });
  }, []);

  const resetData = useCallback(() => {
    // Clear local
    setState(defaultState);
    localStorage.removeItem('qanet_state');
    
    // Note: Firebase data is NOT deleted here for safety.
    // The user would need to explicitly delete their account data.
    if (isFirebaseActive.current && auth.currentUser) {
      const settingsRef = doc(db, 'users', auth.currentUser.uid, 'qanet_settings', 'main');
      const { logs, ...settingsOnly } = defaultState;
      setDoc(settingsRef, settingsOnly).catch(err => {
        console.error('[Qanet] Failed to reset settings:', err);
      });
    }
  }, []);

  return (
    <QanetContext.Provider value={{ 
      ...state, 
      updateState, 
      updateSettings, 
      addLog, 
      deleteLog, 
      resetData, 
      isSyncing, 
      isLogModalOpen, 
      setIsLogModalOpen,
      isTracking,
      trackingSession,
      startTracking,
      stopTracking,
      updateTrackingPage
    }}>
      {children}
    </QanetContext.Provider>
  );
};

export const useQanet = () => {
  const context = useContext(QanetContext);
  if (!context) throw new Error('useQanet must be used within a QanetProvider');
  return context;
};
