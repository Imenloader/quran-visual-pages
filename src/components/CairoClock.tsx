import { getCairoDate } from "@/hooks/usePrayerTimes";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { toZonedTime } from "date-fns-tz";

const CairoClock = () => {
  const [time, setTime] = useState("");
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const updateTime = () => {
      const now = getCairoDate();
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setTime(new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isAr]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group mt-6"
    >
      {/* Outer Glow */}
      <div className="absolute -inset-4 bg-gold/10 blur-[40px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {/* Main Container */}
      <div className="relative flex flex-col items-center bg-black/40 backdrop-blur-[20px] border border-gold/30 px-12 py-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden">
        
        {/* Animated Scanning Line */}
        <motion.div 
          animate={{ top: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent z-0"
        />

        {/* Header Label */}
        <div className="flex items-center gap-2 mb-3 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-gold/80 drop-shadow-sm font-mono">
            {isAr ? "توقيت القاهرة (المعادي)" : "CAIRO (MAADI) LOCAL"}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        </div>

        {/* Time Display */}
        <div className="relative z-10">
          <span className="font-mono text-5xl md:text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {time}
          </span>
        </div>

        {/* Footer Details */}
        <div className="flex items-center gap-4 mt-4 z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-[8px] text-emerald-500/80 font-mono uppercase tracking-widest">
              {isAr ? "مزامنة حية" : "LIVE SYNC"}
            </span>
          </div>
          <div className="h-3 w-px bg-gold/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-gold/60 font-mono uppercase tracking-widest">
              {isAr ? "دقة عالية" : "HI-RES"}
            </span>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/40 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/40 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/40 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/40 rounded-br-2xl" />
      </div>
    </motion.div>
  );
};

export default CairoClock;
