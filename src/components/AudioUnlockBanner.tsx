import { useState, useEffect } from "react";
import { Volume2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { useTranslation } from "react-i18next";

export const AudioUnlockBanner = () => {
  const { isAudioUnlocked, unlockAudio } = useAudioUnlock();
  const [isVisible, setIsVisible] = useState(false);
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  useEffect(() => {
    // Show banner after a short delay if not unlocked
    const timer = setTimeout(() => {
      if (!isAudioUnlocked) {
        setIsVisible(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
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
