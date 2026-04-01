import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface UserProfile {
  name: string;
  avatar: string;
  joinedDate: string;
  points: number;
  totalAyahsRead: number;
  daysActive: number;
  lastActiveDate: string;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addPoints: (amount: number) => void;
  addAyahRead: () => void;
  level: number;
  nextLevelPoints: number;
  levelProgress: number;
  levelName: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  const DEFAULT_PROFILE: UserProfile = {
    name: t("profile.defaultName"),
    avatar: "",
    joinedDate: new Date().toISOString(),
    points: 0,
    totalAyahsRead: 0,
    daysActive: 1,
    lastActiveDate: new Date().toISOString().split("T")[0],
  };

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("user-profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user profile", e);
      }
    }
    return DEFAULT_PROFILE;
  });

  // Update default name if it's still the default and language changed
  useEffect(() => {
    if (profile.name === "زائر كريم" || profile.name === "Honored Guest") {
      setProfile(prev => ({ ...prev, name: t("profile.defaultName") }));
    }
  }, [t, profile.name]);

  useEffect(() => {
    localStorage.setItem("user-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    // Check for daily active points
    const today = new Date().toISOString().split("T")[0];
    if (profile.lastActiveDate !== today) {
      setProfile(prev => ({
        ...prev,
        lastActiveDate: today,
        daysActive: prev.daysActive + 1,
        points: prev.points + 10, // 10 points for daily login
      }));
    }
  }, [profile.lastActiveDate]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const addPoints = (amount: number) => {
    setProfile(prev => ({ ...prev, points: prev.points + amount }));
  };

  const addAyahRead = () => {
    setProfile(prev => ({
      ...prev,
      totalAyahsRead: prev.totalAyahsRead + 1,
      points: prev.points + 1, // 1 point per ayah
    }));
  };

  // Level logic
  const getLevelInfo = (points: number) => {
    if (points < 100) return { level: 1, next: 100 };
    if (points < 300) return { level: 2, next: 300 };
    if (points < 600) return { level: 3, next: 600 };
    if (points < 1000) return { level: 4, next: 1000 };
    if (points < 2000) return { level: 5, next: 2000 };
    if (points < 4000) return { level: 6, next: 4000 };
    if (points < 7000) return { level: 7, next: 7000 };
    if (points < 11000) return { level: 8, next: 11000 };
    if (points < 16000) return { level: 9, next: 16000 };
    return { level: 10, next: 1000000 };
  };

  const levelInfo = getLevelInfo(profile.points);
  const levelName = t(`profile.levels.${levelInfo.level}`);
  
  // Handle default name translation
  const displayProfile = {
    ...profile,
    name: profile.name === "Honored Guest" || profile.name === "زائر كريم" 
      ? t("profile.defaultName") 
      : profile.name
  };
  
  // Calculate previous level threshold to get accurate progress within current level
  const getPrevThreshold = (currentLevel: number) => {
    if (currentLevel <= 1) return 0;
    // Find the threshold of the level just before current
    const thresholds = [0, 100, 300, 600, 1000, 2000, 4000, 7000, 11000, 16000];
    return thresholds[currentLevel - 1] || 0;
  };

  const prevThreshold = getPrevThreshold(levelInfo.level);
  const levelProgress = Math.min(100, Math.max(0, ((profile.points - prevThreshold) / (levelInfo.next - prevThreshold)) * 100));

  return (
    <UserContext.Provider
      value={{
        profile: displayProfile,
        updateProfile,
        addPoints,
        addAyahRead,
        level: levelInfo.level,
        nextLevelPoints: levelInfo.next,
        levelProgress,
        levelName: levelName,
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
