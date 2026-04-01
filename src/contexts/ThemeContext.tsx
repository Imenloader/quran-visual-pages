import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "sepia";
type ReadingMode = "image" | "text";
type ScrollDirection = "vertical" | "horizontal";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  dimming: number;
  setDimming: (dimming: number) => void;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  scrollDirection: ScrollDirection;
  setScrollDirection: (direction: ScrollDirection) => void;
  tajweedMode: boolean;
  setTajweedMode: (mode: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFullscreen, setIsFullscreenState] = useState(false);
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("quran-theme");
    if (saved === "dark" || saved === "night") return "dark";
    if (saved === "sepia") return "sepia";
    return "light";
  });

  const [readingMode, setReadingModeState] = useState<ReadingMode>(() => {
    const saved = localStorage.getItem("quran-reading-mode");
    return (saved as ReadingMode) || "image";
  });

  const [scrollDirection, setScrollDirectionState] = useState<ScrollDirection>(() => {
    const saved = localStorage.getItem("quran-scroll-direction");
    return (saved as ScrollDirection) || "vertical";
  });

  const [dimming, setDimmingState] = useState<number>(() => {
    const saved = localStorage.getItem("quran-page-dimming");
    return saved ? parseInt(saved) : 0;
  });

  const [tajweedMode, setTajweedModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem("quran-tajweed-mode");
    return saved === "true";
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("quran-theme", newTheme);
  };

  const setReadingMode = (newMode: ReadingMode) => {
    setReadingModeState(newMode);
    localStorage.setItem("quran-reading-mode", newMode);
  };

  const setScrollDirection = (newDirection: ScrollDirection) => {
    setScrollDirectionState(newDirection);
    localStorage.setItem("quran-scroll-direction", newDirection);
  };

  const setDimming = (newDimming: number) => {
    setDimmingState(newDimming);
    localStorage.setItem("quran-page-dimming", newDimming.toString());
  };

  const setTajweedMode = (newMode: boolean) => {
    setTajweedModeState(newMode);
    localStorage.setItem("quran-tajweed-mode", newMode.toString());
  };

  const setIsFullscreen = (v: boolean) => {
    setIsFullscreenState(v);
    if (v) {
      document.documentElement.classList.add("fullscreen-reading");
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.classList.remove("fullscreen-reading");
      document.body.style.overflow = "";
    }
  };

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark", "sepia");
    
    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "sepia") {
      html.classList.add("sepia");
    }

    // Apply dimming - Now works as "Intensity" (0 = none, 100 = full dark)
    const opacity = (dimming / 100) * 0.8; // Max 80% opacity to prevent total black screen
    const brightness = 1 - (dimming / 100) * 0.7; // Reduce brightness up to 70%
    html.style.setProperty("--page-brightness", brightness.toString());
    html.style.setProperty("--page-dimming-opacity", opacity.toString());
  }, [theme, dimming]);

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, 
      dimming, setDimming, 
      readingMode, setReadingMode,
      scrollDirection, setScrollDirection,
      tajweedMode, setTajweedMode,
      isFullscreen, setIsFullscreen
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
