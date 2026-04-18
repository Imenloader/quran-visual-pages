import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toArabicNumber } from "@/data/quranData";
import { auth, db, handleFirestoreError, OperationType } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
  const { t } = useTranslation();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const snapshotUnsubscribeRef = React.useRef<(() => void) | null>(null);

  const DEFAULT_PROFILE: UserProfile = useMemo(() => ({
    name: t("profile.defaultName"),
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
  }), [t]);

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      
      if (auth.currentUser) {
        updateDoc(doc(db, "users", auth.currentUser.uid), updates).catch(error => {
          handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
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
    setProfile(prev => {
      const updates = {
        totalAyahsRead: prev.totalAyahsRead + 1,
        points: prev.points + 10,
      };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [updateProfile]);

  const addPageRead = useCallback(() => {
    setProfile(prev => {
      const updates = {
        totalPagesRead: prev.totalPagesRead + 1,
        points: prev.points + 150,
      };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [updateProfile]);

  const addJuzCompleted = useCallback(() => {
    setProfile(prev => {
      const updates = {
        totalJuzCompleted: prev.totalJuzCompleted + 1,
        points: prev.points + 3000,
      };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [updateProfile]);

  const addAthkarRecited = useCallback((count: number = 1) => {
    setProfile(prev => {
      const updates = {
        totalAthkarRecited: prev.totalAthkarRecited + count,
        points: prev.points + (count * 2),
      };
      updateProfile(updates);
      return { ...prev, ...updates };
    });
  }, [updateProfile]);

  // 1. Auth & Firestore Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up previous snapshot listener if any
      if (snapshotUnsubscribeRef.current) {
        snapshotUnsubscribeRef.current();
        snapshotUnsubscribeRef.current = null;
      }

      try {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          
          // Initial fetch
          try {
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            } else {
              // Create new profile in Firestore
              const newProfile: UserProfile = {
                ...DEFAULT_PROFILE,
                name: user.displayName || t("profile.defaultName"),
                avatar: user.photoURL || "/avatar-man-1.svg",
                joinedDate: new Date().toISOString(),
                points: 0,
                totalAyahsRead: 0,
                totalPagesRead: 0,
                totalJuzCompleted: 0,
                totalAthkarRecited: 0,
                daysActive: 1,
                lastActiveDate: new Date().toISOString().split("T")[0],
                role: 'user' as const,
              };
              await setDoc(userRef, newProfile);
              setProfile(newProfile);
            }
          } catch (error) {
            console.error("Error fetching/creating profile:", error);
            // Fallback to local storage if firestore fails
            const saved = localStorage.getItem("user-profile");
            if (saved) {
              try {
                setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
              } catch (e) {
                setProfile(DEFAULT_PROFILE);
              }
            }
          }

          // Real-time sync
          snapshotUnsubscribeRef.current = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            }
          }, (error) => {
            console.error("Profile snapshot error:", error);
          });
        } else {
          // Not logged in - use local storage or default
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
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (snapshotUnsubscribeRef.current) {
        snapshotUnsubscribeRef.current();
      }
    };
  }, [t, DEFAULT_PROFILE]);

  // Update local storage as fallback
  useEffect(() => {
    localStorage.setItem("user-profile", JSON.stringify(profile));
  }, [profile]);

  // Daily points logic
  useEffect(() => {
    if (!isAuthReady) return;
    const today = new Date().toISOString().split("T")[0];
    if (profile.lastActiveDate !== today) {
      updateProfile({
        lastActiveDate: today,
        daysActive: profile.daysActive + 1,
        points: profile.points + 100,
      });
    }
  }, [profile.lastActiveDate, profile.daysActive, profile.points, isAuthReady, updateProfile]);

  // Level logic: Points = 100 * Level * (Level + 1) / 2
  // Reverse: Level = (sqrt(8 * Points / 100 + 1) - 1) / 2
  const calculateLevel = (points: number) => {
    const level = Math.floor((Math.sqrt(8 * points / 100 + 1) - 1) / 2);
    return Math.max(1, level + 1);
  };

  const getThreshold = (level: number) => {
    if (level <= 1) return 0;
    const l = level - 1;
    return 100 * l * (l + 1) / 2;
  };

  const currentLevel = calculateLevel(profile.points);
  const nextLevelThreshold = getThreshold(currentLevel + 1);
  const prevLevelThreshold = getThreshold(currentLevel);
  
  const levelProgress = Math.min(100, Math.max(0, 
    ((profile.points - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100
  ));

  // Get level name (use translations for 1-20, then generic for higher)
  const levelName = currentLevel <= 20 
    ? t(`profile.levels.${currentLevel}`)
    : `${t(`profile.levels.${(currentLevel % 10) + 10}`)} (${toArabicNumber(currentLevel)})`;
  
  // Handle default name translation
  const displayProfile = {
    ...profile,
    name: profile.name === "Honored Guest" || profile.name === "زائر كريم" 
      ? t("profile.defaultName") 
      : profile.name
  };
  
  return (
    <UserContext.Provider
      value={{
        profile: displayProfile,
        updateProfile,
        addPoints,
        addAyahRead,
        addPageRead,
        addJuzCompleted,
        addAthkarRecited,
        level: currentLevel,
        nextLevelPoints: nextLevelThreshold,
        prevLevelPoints: prevLevelThreshold,
        levelProgress,
        levelName: levelName,
        isAuthReady,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
