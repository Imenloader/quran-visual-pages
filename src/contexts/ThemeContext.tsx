import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "@/lib/storage";

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
  hifzMode: boolean;
  setHifzMode: (mode: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
  preferredImageSource: string | null;
  setPreferredImageSource: (id: string | null) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFullscreen, setIsFullscreenState] = useState(false);
  const [theme, setThemeState] = useState<Theme>("light");
  const [readingMode, setReadingModeState] = useState<ReadingMode>("image");
  const [scrollDirection, setScrollDirectionState] = useState<ScrollDirection>("vertical");
  const [dimming, setDimmingState] = useState<number>(0);
  const [tajweedMode, setTajweedModeState] = useState<boolean>(false);
  const [hifzMode, setHifzModeState] = useState<boolean>(false);
  const [preferredImageSource, setPreferredImageSourceState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = await storage.get("quran-theme");
      const savedReadingMode = await storage.get("quran-reading-mode");
      const savedScrollDirection = await storage.get("quran-scroll-direction");
      const savedDimming = await storage.get("quran-page-dimming");
      const savedTajweed = await storage.get("quran-tajweed-mode");
      const savedHifz = await storage.get("quran-hifz-mode");
      const savedImageSource = await storage.get("quran-preferred-image-source");

      if (savedTheme === "dark" || savedTheme === "night") setThemeState("dark");
      else if (savedTheme === "sepia") setThemeState("sepia");
      else setThemeState("light");

      if (savedReadingMode) setReadingModeState(savedReadingMode as ReadingMode);
      if (savedScrollDirection) setScrollDirectionState(savedScrollDirection as ScrollDirection);
      if (savedDimming) setDimmingState(parseInt(savedDimming));
      if (savedTajweed) setTajweedModeState(savedTajweed === "true");
      if (savedHifz) setHifzModeState(savedHifz === "true");
      if (savedImageSource) setPreferredImageSourceState(savedImageSource);
      
      setIsLoaded(true);
    };
    loadSettings();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await storage.set("quran-theme", newTheme);
  };

  const setReadingMode = async (newMode: ReadingMode) => {
    setReadingModeState(newMode);
    await storage.set("quran-reading-mode", newMode);
  };

  const setScrollDirection = async (newDirection: ScrollDirection) => {
    setScrollDirectionState(newDirection);
    await storage.set("quran-scroll-direction", newDirection);
  };

  const setDimming = async (newDimming: number) => {
    setDimmingState(newDimming);
    await storage.set("quran-page-dimming", newDimming.toString());
  };

  const setTajweedMode = async (newMode: boolean) => {
    setTajweedModeState(newMode);
    await storage.set("quran-tajweed-mode", newMode.toString());
  };

  const setHifzMode = async (newMode: boolean) => {
    setHifzModeState(newMode);
    await storage.set("quran-hifz-mode", newMode.toString());
  };

  const setPreferredImageSource = async (id: string | null) => {
    setPreferredImageSourceState(id);
    if (id) await storage.set("quran-preferred-image-source", id);
    else await storage.remove("quran-preferred-image-source");
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
      hifzMode, setHifzMode,
      isFullscreen, setIsFullscreen,
      preferredImageSource, setPreferredImageSource,
      isLoaded
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
