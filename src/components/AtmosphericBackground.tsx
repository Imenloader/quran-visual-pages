import { useTheme } from "@/contexts/ThemeContext";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useEffect, useState } from "react";

const AtmosphericBackground = () => {
  const { theme, atmosphericBackground } = useTheme();
  const { nextPrayer } = usePrayerTimes();
  const [phase, setPhase] = useState<"night" | "dawn" | "morning" | "afternoon" | "sunset" | "evening">("morning");

  useEffect(() => {
    if (!nextPrayer) return;
    switch (nextPrayer.name) {
      case "Fajr":
        setPhase("night");
        break;
      case "Sunrise":
        setPhase("dawn");
        break;
      case "Dhuhr":
        setPhase("morning");
        break;
      case "Asr":
        setPhase("afternoon");
        break;
      case "Maghrib":
        setPhase("sunset");
        break;
      case "Isha":
        setPhase("evening");
        break;
      default:
        setPhase("morning");
    }
  }, [nextPrayer]);

  if (!atmosphericBackground) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-1000">
      
      {/* Night (Pitch dark, lots of stars) */}
      <div className={`absolute inset-0 transition-opacity duration-3000 ${phase === "night" || theme === "dark" ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-[#0a0a1a] to-black" />
        {[...Array(50)].map((_, i) => (
          <div
            key={`night-${i}`}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse-slow"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3 + Math.random() * 0.7
            }}
          />
        ))}
      </div>

      {/* Dawn (Soft pinks, purples, early light) */}
      {theme !== "dark" && (
        <div className={`absolute inset-0 transition-opacity duration-3000 mix-blend-screen ${phase === "dawn" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-rose-400/20 via-indigo-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-300/20 to-transparent blur-[50px]" />
        </div>
      )}

      {/* Morning (Bright, golden sun rays) */}
      {theme !== "dark" && (
        <div className={`absolute inset-0 transition-opacity duration-3000 ${phase === "morning" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-amber-200/20 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-400/5 via-transparent to-amber-500/5" />
          {[...Array(15)].map((_, i) => (
            <div
              key={`morning-${i}`}
              className="absolute w-1 h-1 bg-gold/20 rounded-full blur-[1px]"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                opacity: 0.1 + Math.random() * 0.2
              }}
            />
          ))}
        </div>
      )}

      {/* Afternoon (Clear sky, warm) */}
      {theme !== "dark" && (
        <div className={`absolute inset-0 transition-opacity duration-3000 ${phase === "afternoon" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-sky-300/10 to-transparent" />
          <div className="absolute -right-[20%] top-[10%] w-[50%] h-[50%] bg-amber-300/10 rounded-full blur-[100px]" />
        </div>
      )}

      {/* Sunset (Rich oranges, reds) */}
      {theme !== "dark" && (
        <div className={`absolute inset-0 transition-opacity duration-3000 mix-blend-multiply ${phase === "sunset" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 via-rose-500/10 to-transparent" />
          <div className="absolute bottom-0 left-[20%] right-[20%] h-[60%] bg-amber-500/10 blur-[80px]" />
        </div>
      )}

      {/* Evening (Dusk, deep blue, first stars) */}
      {theme !== "dark" && (
        <div className={`absolute inset-0 transition-opacity duration-3000 ${phase === "evening" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 to-slate-900/40" />
          {[...Array(20)].map((_, i) => (
            <div
              key={`evening-${i}`}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse-slow"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.2 + Math.random() * 0.5
              }}
            />
          ))}
        </div>
      )}

      {/* Sepia Mode Override */}
      {theme === "sepia" && (
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-100 mix-blend-color">
          <div className="absolute inset-0 bg-amber-900/10" />
        </div>
      )}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AtmosphericBackground;
