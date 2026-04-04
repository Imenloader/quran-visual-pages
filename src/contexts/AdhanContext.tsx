import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { PRAYER_SETTINGS_KEY, DEFAULT_SETTINGS, type PrayerSettings, ADHAN_SOUNDS, PRAYER_NAMES, type PrayerTimesData } from "@/hooks/usePrayerTimes";
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
    if (audioRef.current) {
      if (playPromiseRef.current) {
        playPromiseRef.current.then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.src = "";
        }).catch(() => {});
      } else {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAdhanPlaying(false);
  }, []);

  const playAdhan = useCallback(async (soundId: string, prayerNameAr: string) => {
    const FALLBACK_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

    if (soundId === "tts_arabic") {
      const prayerKey = (Object.keys(PRAYER_NAMES) as (keyof PrayerTimesData)[]).find(
        key => PRAYER_NAMES[key] === prayerNameAr
      );
      if (prayerKey) speakPrayerName(prayerKey);
      setIsAdhanPlaying(true);
      // TTS doesn't have an easy "ended" event for the whole sequence here, 
      // but we can set a timeout or just leave it.
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
      try {
        stopAdhan();

        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.onplay = () => setIsAdhanPlaying(true);
        audio.onended = () => setIsAdhanPlaying(false);
        audio.onpause = () => setIsAdhanPlaying(false);

        const promise = audio.play();
        playPromiseRef.current = promise;
        await promise;
      } catch (err) {
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
