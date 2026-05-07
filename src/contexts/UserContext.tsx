import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toArabicNumber } from "@/data/quranData";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { activityService, ActivityType } from "@/services/activityService";
import { normalizeArabic } from "@/lib/arabicUtils";


interface UserProfile {
  uid?: string;
  name: string;
  avatar: string;
  joinedDate: string;
  points: number;
  totalAyahsRead: number;
  totalPagesRead: number;
  totalJuzCompleted: number;
  totalAthkarRecited: number;
  daysActive: number;
  lastActiveDate: string;
  role: 'user' | 'admin';
  completedQuests?: string[];
  lastQuestDate?: string;
  dailyReadingHistory?: { date: string; pages: number }[];
  lastKhatmaSyncPages?: number;
  gender?: 'male' | 'female' | 'unspecified';
  privacySettings?: {
    profileVisible: boolean;
    showStats: boolean;
    allowRequests: boolean;
  };
  friendCount?: number;
  friendIds?: string[];
  searchName?: string;
  isBanned?: boolean;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addPoints: (amount: number) => void;
  addAyahRead: () => void;
  addPageRead: () => void;
  addJuzCompleted: () => void;
  addAthkarRecited: (count?: number) => void;
  level: number;
  nextLevelPoints: number;
  prevLevelPoints: number;
  levelProgress: number;
  levelName: string;
  isAuthReady: boolean;
  isAdmin: boolean;
  completeQuest: (questId: string, points: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const snapshotUnsubscribeRef = useRef<(() => void) | null>(null);

  // Debounced Firestore sync ref — keeps a timer to batch rapid updates
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const DEFAULT_PROFILE: UserProfile = useMemo(() => ({
    name: t("profile.defaultName") || (i18n.language === 'ar' ? "زائر كريم" : "Honored Guest"),
    avatar: "/avatar-man-1.svg",
    joinedDate: new Date().toISOString(),
    points: 0,
    totalAyahsRead: 0,
    totalPagesRead: 0,
    totalJuzCompleted: 0,
    totalAthkarRecited: 0,
    daysActive: 1,
    lastActiveDate: new Date().toISOString().split("T")[0],
    role: 'user' as const,
    completedQuests: [],
    lastQuestDate: new Date().toISOString().split("T")[0],
    dailyReadingHistory: [],
    lastKhatmaSyncPages: 0,
    gender: 'unspecified',
    privacySettings: {
      profileVisible: true,
      showStats: true,
      allowRequests: true,
    },
    friendCount: 0,
    friendIds: [],
  }), [t, i18n.language]);

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  /**
   * Syncs a partial profile update to Firestore with debouncing.
   * This is kept outside state updaters to avoid side-effects inside React updaters.
   */
  const syncToFirestore = useCallback((updates: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        // 1. Update private user doc
        updateDoc(doc(db, "users", uid), updates as Record<string, unknown>).catch(error => {
          console.error("Firestore Update Error (users):", error);
        });

        // 2. Update public profile doc (only if profile is visible)
        // We only mirror fields that are safe to show publicly
        const publicFields = ['name', 'avatar', 'points', 'totalAyahsRead', 'totalPagesRead', 'totalJuzCompleted', 'totalAthkarRecited', 'daysActive', 'role', 'privacySettings', 'friendCount', 'gender', 'friendIds', 'searchName'];
        const publicUpdates: Record<string, any> = {};
        let hasPublicUpdate = false;
        
        publicFields.forEach(field => {
          if (field in updates) {
            publicUpdates[field] = (updates as any)[field];
            hasPublicUpdate = true;
          }
        });

        if (hasPublicUpdate) {
          setDoc(doc(db, "profiles", uid), publicUpdates, { merge: true }).catch(error => {
             console.error("Firestore Update Error (profiles):", error);
          });
        }
      }
    }, 1500);
  }, []);

  /**
   * updateProfile: Updates local state immediately, then schedules a debounced
   * Firestore sync. No side-effects inside the React updater.
   */
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    const finalUpdates = { ...updates };
    if (updates.name) {
      finalUpdates.searchName = normalizeArabic(updates.name);
    }
    setProfile(prev => ({ ...prev, ...finalUpdates }));
    syncToFirestore(finalUpdates);
  }, [syncToFirestore]);

  const addPoints = useCallback((amount: number) => {
    setProfile(prev => {
      const updates = { points: prev.points + amount };
      syncToFirestore(updates);
      return { ...prev, ...updates };
    });
  }, [syncToFirestore]);

  const addAyahRead = useCallback(() => {
    setProfile(prev => {
      const updates = {
        totalAyahsRead: prev.totalAyahsRead + 1,
        points: prev.points + 10,
      };
      syncToFirestore(updates);
      return { ...prev, ...updates };
    });
  }, [syncToFirestore]);

  const addPageRead = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setProfile(prev => {
      const currentHistory = prev.dailyReadingHistory || [];
      const dayIndex = currentHistory.findIndex(h => h.date === today);

      let newHistory;
      if (dayIndex >= 0) {
        newHistory = [...currentHistory];
        newHistory[dayIndex] = { ...newHistory[dayIndex], pages: newHistory[dayIndex].pages + 1 };
      } else {
        newHistory = [...currentHistory, { date: today, pages: 1 }];
      }

      const updates = {
        totalPagesRead: prev.totalPagesRead + 1,
        points: prev.points + 150,
        dailyReadingHistory: newHistory
      };
      syncToFirestore(updates);
      return { ...prev, ...updates };
    });
  }, [syncToFirestore]);

  const addJuzCompleted = useCallback(() => {
    setProfile(prev => {
      const updates = {
        totalJuzCompleted: prev.totalJuzCompleted + 1,
        points: prev.points + 3000,
      };
      syncToFirestore(updates);
      activityService.logActivity(auth.currentUser!.uid, 'JUZ_COMPLETE', { detail: `الجزء ${prev.totalJuzCompleted + 1}` });
      return { ...prev, ...updates };
    });
  }, [syncToFirestore]);

  const athkarBufferRef = useRef(0);
  const athkarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addAthkarRecited = useCallback((count: number = 1) => {
    athkarBufferRef.current += count;

    if (athkarTimerRef.current) clearTimeout(athkarTimerRef.current);

    athkarTimerRef.current = setTimeout(() => {
      const totalToAdd = athkarBufferRef.current;
      if (totalToAdd === 0) return;
      athkarBufferRef.current = 0;

      setProfile(prev => {
        const updates = {
          totalAthkarRecited: prev.totalAthkarRecited + totalToAdd,
          points: prev.points + totalToAdd * 2,
        };
        syncToFirestore(updates);
        return { ...prev, ...updates };
      });
    }, 2000);
  }, [syncToFirestore]);

  const completeQuest = useCallback((questId: string, points: number) => {
    const today = new Date().toISOString().split("T")[0];
    setProfile(prev => {
      // Guard: don't complete the same quest twice on the same day
      if (prev.lastQuestDate === today && prev.completedQuests?.includes(questId)) return prev;

      const newQuests = prev.lastQuestDate === today
        ? [...(prev.completedQuests || []), questId]
        : [questId];

      const updates = {
        points: prev.points + points,
        completedQuests: newQuests,
        lastQuestDate: today
      };
      syncToFirestore(updates);
      activityService.logActivity(auth.currentUser!.uid, 'QUEST_COMPLETE', { detail: questId });
      return { ...prev, ...updates };
    });
  }, [syncToFirestore]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Tear down previous snapshot listener when the auth state changes
      if (snapshotUnsubscribeRef.current) {
        snapshotUnsubscribeRef.current();
        snapshotUnsubscribeRef.current = null;
      }

      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setProfile({ uid: user.uid, ...snap.data() } as UserProfile);
          } else {
            const name = user.displayName || DEFAULT_PROFILE.name;
            const newProfile: UserProfile = {
              ...DEFAULT_PROFILE,
              uid: user.uid,
              name,
              searchName: normalizeArabic(name),
              avatar: user.photoURL || DEFAULT_PROFILE.avatar,
              joinedDate: new Date().toISOString(),
              gender: (window as any)._initialGender || DEFAULT_PROFILE.gender
            };
            delete (window as any)._initialGender;
            
            // Create both private and public records
            await Promise.all([
              setDoc(userRef, newProfile),
              setDoc(doc(db, "profiles", user.uid), {
                name: newProfile.name,
                searchName: newProfile.searchName,
                avatar: newProfile.avatar,
                points: newProfile.points,
                totalAyahsRead: newProfile.totalAyahsRead,
                totalPagesRead: newProfile.totalPagesRead,
                totalJuzCompleted: newProfile.totalJuzCompleted,
                totalAthkarRecited: newProfile.totalAthkarRecited,
                daysActive: newProfile.daysActive,
                role: newProfile.role,
                privacySettings: newProfile.privacySettings,
                friendCount: newProfile.friendCount,
                gender: newProfile.gender,
                friendIds: newProfile.friendIds
              })
            ]);
            
            setProfile(newProfile);
            activityService.logActivity(user.uid, 'USER_JOINED', { detail: 'انضم إلى المنصة حديثاً' });
          }
        } catch (e) {
          console.error("Firestore Profile Error:", e);
        }

        // Real-time sync: update local state when Firestore changes (e.g., from another device)
        snapshotUnsubscribeRef.current = onSnapshot(userRef, async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            
            // Also sync friends list if not present or stale
            const friendsQuery = query(
              collection(db, "friendships"),
              where("users", "array-contains", user.uid),
              where("status", "==", "accepted")
            );
            const friendsSnap = await getDocs(friendsQuery);
            const friendIds = friendsSnap.docs.map(d => {
              const u = d.data().users;
              return u[0] === user.uid ? u[1] : u[0];
            });

            setProfile({ uid: user.uid, ...data, friendIds });
          }
        }, (error) => console.warn("Profile Sync Error:", error));
      } else {
        // No authenticated user — fall back to local storage
        const saved = localStorage.getItem("user-profile");
        if (saved) {
          try {
            setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
          } catch {
            setProfile(DEFAULT_PROFILE);
          }
        } else {
          setProfile(DEFAULT_PROFILE);
        }
      }
      setIsAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (snapshotUnsubscribeRef.current) snapshotUnsubscribeRef.current();
      if (athkarTimerRef.current) clearTimeout(athkarTimerRef.current);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [DEFAULT_PROFILE]);

  // Daily streak handler — only runs once auth is ready and lastActiveDate is set
  useEffect(() => {
    if (!isAuthReady || !profile.lastActiveDate) return;

    const today = new Date().toISOString().split("T")[0];
    if (profile.lastActiveDate === today) return; // Already logged today, no action needed

    const lastDate = new Date(profile.lastActiveDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = profile.daysActive || 1;
    if (diffDays === 1) {
      newStreak += 1; // Consecutive day
    } else if (diffDays > 1) {
      newStreak = 1;  // Streak broken, reset
    }

    updateProfile({
      daysActive: newStreak,
      lastActiveDate: today,
      points: profile.points + 100,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, profile.lastActiveDate]);

  // Persist profile to localStorage as a fast-access cache
  useEffect(() => {
    localStorage.setItem("user-profile", JSON.stringify(profile));
  }, [profile]);

  const calculateLevel = (pts: number) => {
    const lvl = Math.floor((Math.sqrt(8 * pts / 5000 + 1) - 1) / 2);
    return Math.max(1, lvl + 1);
  };

  const getThreshold = (lvl: number) => {
    if (lvl <= 1) return 0;
    const l = lvl - 1;
    return 5000 * l * (l + 1) / 2;
  };

  const currentLevel = calculateLevel(profile.points);
  const nextLevelThreshold = getThreshold(currentLevel + 1);
  const prevLevelThreshold = getThreshold(currentLevel);
  const progress = Math.min(100, Math.max(0,
    ((profile.points - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100
  ));

  const levelName = currentLevel <= 20
    ? t(`profile.levels.${currentLevel}`)
    : `${t(`profile.levels.20`)} (${toArabicNumber(currentLevel)})`;

  const isAdmin = profile.role === 'admin' || auth.currentUser?.email === "3wdkyarb@gmail.com";

  return (
    <UserContext.Provider value={{
      profile, updateProfile, addPoints, addAyahRead, addPageRead,
      addJuzCompleted, addAthkarRecited, level: currentLevel,
      nextLevelPoints: nextLevelThreshold, prevLevelPoints: prevLevelThreshold,
      levelProgress: progress, levelName, isAuthReady, completeQuest,
      isAdmin,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error("useUser must be used within a UserProvider");
  return context;
};
