import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { PRAYER_SETTINGS_KEY, DEFAULT_SETTINGS, type PrayerSettings, ADHAN_SOUNDS, PRAYER_NAMES, type PrayerTimesData } from "@/data/prayerConstants";
import { speakPrayerName } from "@/services/ttsService";

interface AdhanContextType {
  isAdhanPlaying: boolean;
  playAdhan: (soundId: string, prayerNameAr: string) => Promise<void>;
  stopAdhan: () => void;
}

const AdhanContext = createContext<AdhanContextType | undefined>(undefined);

export const AdhanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const stopAdhan = useCallback(() => {
    const currentAudio = audioRef.current;
    const currentPromise = playPromiseRef.current;

    if (currentAudio) {
      const cleanup = () => {
        try {
          currentAudio.pause();
          currentAudio.src = "";
        } catch (e) {
          // Ignore errors during cleanup
        }
        
        // Only clear refs if they still point to this audio instance
        if (audioRef.current === currentAudio) {
          audioRef.current = null;
          playPromiseRef.current = null;
        }
      };

      if (currentPromise) {
        // Wait for play() to resolve before calling pause() to avoid browser errors
        currentPromise.then(cleanup).catch(cleanup);
      } else {
        cleanup();
      }
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.warn("TTS cancel failed in stopAdhan:", error);
      }
    }
    setIsAdhanPlaying(false);
  }, []);

  const playAdhan = useCallback(async (soundId: string, prayerNameAr: string) => {
    const FALLBACK_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

    // Stop any currently playing audio first and wait for it to be fully stopped
    stopAdhan();

    if (soundId === "tts_arabic") {
      const prayerKey = (Object.keys(PRAYER_NAMES) as (keyof PrayerTimesData)[]).find(
        key => PRAYER_NAMES[key] === prayerNameAr
      );
      if (prayerKey) speakPrayerName(prayerKey);
      setIsAdhanPlaying(true);
      setTimeout(() => setIsAdhanPlaying(false), 10000);
      return;
    }

    const soundUrl = ADHAN_SOUNDS.find(s => s.id === soundId)?.url || ADHAN_SOUNDS[0].url;
    
    let finalUrl = soundUrl;
    if (finalUrl.startsWith("//")) {
      finalUrl = "https:" + finalUrl;
    } else if (finalUrl.startsWith("http://")) {
      finalUrl = finalUrl.replace("http://", "https://");
    }

    const playAudio = async (url: string, isFallback = false): Promise<void> => {
      const audio = new Audio(url);
      audio.preload = "auto";
      
      // Store the current audio instance locally to check against the ref later
      const currentInstance = audio;

      audio.onplay = () => {
        if (audioRef.current === currentInstance) {
          setIsAdhanPlaying(true);
        }
      };
      audio.onended = () => {
        if (audioRef.current === currentInstance) {
          setIsAdhanPlaying(false);
          audioRef.current = null;
          playPromiseRef.current = null;
        }
      };
      audio.onpause = () => {
        if (audioRef.current === currentInstance) {
          setIsAdhanPlaying(false);
        }
      };

      try {
        // Update refs before playing
        audioRef.current = audio;
        const promise = audio.play();
        playPromiseRef.current = promise;
        
        await promise;
      } catch (err) {
        // If this instance is no longer the current one, just ignore the error
        if (audioRef.current !== currentInstance) return;

        // Ignore AbortError which happens when pause() interrupts play()
        if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('interrupted'))) {
          return;
        }
        
        console.error(`Adhan playback failed (${isFallback ? 'fallback' : 'primary'}):`, err);
        if (!isFallback) {
          return playAudio(FALLBACK_SOUND, true);
        }
      }
    };

    return playAudio(finalUrl);
  }, [stopAdhan]);

  // Listen for STOP_ADHAN message from service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'STOP_ADHAN') {
        stopAdhan();
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [stopAdhan]);

  return (
    <AdhanContext.Provider value={{ isAdhanPlaying, playAdhan, stopAdhan }}>
      {children}
    </AdhanContext.Provider>
  );
};

export const useAdhan = () => {
  const context = useContext(AdhanContext);
  if (context === undefined) {
    throw new Error("useAdhan must be used within an AdhanProvider");
  }
  return context;
};
