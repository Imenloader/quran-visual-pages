import { useState, useEffect } from "react";
import { Volume2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { useTranslation } from "react-i18next";
import { PRAYER_SETTINGS_KEY, DEFAULT_SETTINGS } from "@/hooks/usePrayerTimes";

export const AudioUnlockBanner = () => {
  const { isAudioUnlocked, unlockAudio } = useAudioUnlock();
  const [isVisible, setIsVisible] = useState(false);
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const checkVisibility = () => {
      try {
        const stored = localStorage.getItem(PRAYER_SETTINGS_KEY);
        const settings = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
        
        // Show banner only if notifications are NOT enabled AND audio is not unlocked
        if (!settings.notificationsEnabled && !isAudioUnlocked) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (e) {
        if (!isAudioUnlocked) setIsVisible(true);
      }
    };

    // Show banner after a short delay
    const timer = setTimeout(checkVisibility, 2000);
    
    // Also listen for storage events to update visibility if settings change
    window.addEventListener('storage', checkVisibility);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', checkVisibility);
    };
  }, [isAudioUnlocked]);

  if (isAudioUnlocked || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96"
      >
        <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Volume2 className="animate-pulse" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-naskh font-bold text-sm">
              {isAr ? "تفعيل صوت الأذان" : "Enable Adhan Sound"}
            </p>
            <p className="text-[10px] opacity-90 leading-tight">
              {isAr 
                ? "اضغط هنا لتفعيل صوت الأذان والتنبيهات في متصفحك" 
                : "Click here to enable Adhan sound and notifications in your browser"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                unlockAudio();
                setIsVisible(false);
              }}
              className="bg-white text-amber-600 px-4 py-2 rounded-xl font-naskh text-xs font-bold hover:bg-white/90 transition-all shadow-md whitespace-nowrap"
            >
              {isAr ? "تفعيل الآن" : "Enable Now"}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
