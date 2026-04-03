import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toArabicNumber } from "@/data/quranData";

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  const DEFAULT_PROFILE: UserProfile = {
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
  };

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("user-profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration for new fields
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
        };
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
        points: prev.points + 100, // 100 points for daily login bonus
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
      points: prev.points + 10, // 10 points per ayah
    }));
  };

  const addPageRead = () => {
    setProfile(prev => ({
      ...prev,
      totalPagesRead: prev.totalPagesRead + 1,
      points: prev.points + 150, // 150 points per page
    }));
  };

  const addJuzCompleted = () => {
    setProfile(prev => ({
      ...prev,
      totalJuzCompleted: prev.totalJuzCompleted + 1,
      points: prev.points + 3000, // 3000 points per Juz
    }));
  };

  const addAthkarRecited = (count: number = 1) => {
    setProfile(prev => ({
      ...prev,
      totalAthkarRecited: prev.totalAthkarRecited + count,
      points: prev.points + (count * 2), // 2 points per athkar count
    }));
  };

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
