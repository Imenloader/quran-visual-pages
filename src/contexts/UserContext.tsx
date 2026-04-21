import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toArabicNumber } from "@/data/quranData";
import { auth, db, handleFirestoreError, OperationType } from "@/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, Timestamp } from "firebase/firestore";

interface UserProfile {
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const snapshotUnsubscribeRef = React.useRef<(() => void) | null>(null);

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
  }), [t, i18n.language]);

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      
      if (auth.currentUser) {
        updateDoc(doc(db, "users", auth.currentUser.uid), updates).catch(error => {
          console.error("Firestore Update Error:", error);
        });
      }
      
      return newProfile;
    });
  }, []);

  const addPoints = useCallback((amount: number) => {
    setProfile(prev => {
      const updates = { points: prev.points + amount };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [updateProfile]);

  const addAyahRead = useCallback(() => {
    addPoints(10);
    setProfile(prev => {
      const updates = { totalAyahsRead: prev.totalAyahsRead + 1 };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [addPoints, updateProfile]);

  const addPageRead = useCallback(() => {
    addPoints(150);
    setProfile(prev => {
      const updates = { totalPagesRead: prev.totalPagesRead + 1 };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [addPoints, updateProfile]);

  const addJuzCompleted = useCallback(() => {
    addPoints(3000);
    setProfile(prev => {
      const updates = { totalJuzCompleted: prev.totalJuzCompleted + 1 };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [addPoints, updateProfile]);

  const addAthkarRecited = useCallback((count: number = 1) => {
    addPoints(count * 2);
    setProfile(prev => {
      const updates = { totalAthkarRecited: prev.totalAthkarRecited + count };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [addPoints, updateProfile]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (snapshotUnsubscribeRef.current) {
        snapshotUnsubscribeRef.current();
        snapshotUnsubscribeRef.current = null;
      }

      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              ...DEFAULT_PROFILE,
              name: user.displayName || DEFAULT_PROFILE.name,
              avatar: user.photoURL || DEFAULT_PROFILE.avatar,
              joinedDate: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (e) {
          console.error("Firestore Profile Error:", e);
        }

        snapshotUnsubscribeRef.current = onSnapshot(userRef, (snap) => {
          if (snap.exists()) setProfile(snap.data() as UserProfile);
        }, (error) => console.warn("Profile Sync Error:", error));
      } else {
        // Fallback to local storage if no user is signed in
        const saved = localStorage.getItem("user-profile");
        if (saved) {
          try {
            setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
          } catch (e) {
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
    };
  }, [DEFAULT_PROFILE]);

  useEffect(() => {
    localStorage.setItem("user-profile", JSON.stringify(profile));
  }, [profile]);

  const calculateLevel = (pts: number) => {
    const lvl = Math.floor((Math.sqrt(8 * pts / 100 + 1) - 1) / 2);
    return Math.max(1, lvl + 1);
  };

  const getThreshold = (lvl: number) => {
    if (lvl <= 1) return 0;
    const l = lvl - 1;
    return 100 * l * (l + 1) / 2;
  };

  const currentLevel = calculateLevel(profile.points);
  const nextLevelThreshold = getThreshold(currentLevel + 1);
  const prevLevelThreshold = getThreshold(currentLevel);
  const progress = Math.min(100, Math.max(0, ((profile.points - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100));
  
  const levelName = currentLevel <= 20 
    ? t(`profile.levels.${currentLevel}`)
    : `${t(`profile.levels.20`)} (${toArabicNumber(currentLevel)})`;

  return (
    <UserContext.Provider value={{
      profile, updateProfile, addPoints, addAyahRead, addPageRead,
      addJuzCompleted, addAthkarRecited, level: currentLevel,
      nextLevelPoints: nextLevelThreshold, prevLevelPoints: prevLevelThreshold,
      levelProgress: progress, levelName, isAuthReady
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
