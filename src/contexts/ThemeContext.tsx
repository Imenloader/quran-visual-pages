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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    return saved ? parseInt(saved) : 80;
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

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark", "sepia", "night-reading");
    
    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "sepia") {
      html.classList.add("sepia");
    }

    // Apply dimming
    const brightness = dimming / 100;
    const opacity = (100 - dimming) / 100;
    html.style.setProperty("--page-brightness", brightness.toString());
    html.style.setProperty("--page-dimming-opacity", opacity.toString());
  }, [theme, dimming]);

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, 
      dimming, setDimming, 
      readingMode, setReadingMode,
      scrollDirection, setScrollDirection
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
