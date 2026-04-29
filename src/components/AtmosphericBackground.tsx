import { useTheme } from "@/contexts/ThemeContext";

const AtmosphericBackground = () => {
  const { theme, atmosphericBackground } = useTheme();

  if (!atmosphericBackground) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {theme === "dark" && (
        <div 
          className="absolute inset-0 transition-opacity duration-1000 opacity-100"
        >
          {/* Stars (Static with subtle CSS pulse) */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse-slow"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.5 + Math.random() * 0.5
              }}
            />
          ))}
          {/* Deep Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(67,56,202,0.1),transparent_70%)]" />
        </div>
      )}

      {theme === "light" && (
        <div 
          className="absolute inset-0 transition-opacity duration-1000 opacity-100"
        >
          {/* Sun Rays */}
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-amber-200/10 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5" />
          
          {/* Floating Particles (Static but visually textured) */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold/10 rounded-full blur-[1px]"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                opacity: 0.1 + Math.random() * 0.2
              }}
            />
          ))}
        </div>
      )}

      {theme === "sepia" && (
        <div 
          className="absolute inset-0 transition-opacity duration-1000 opacity-100"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,53,15,0.05),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900/5 to-transparent" />
          
          {/* Soft Dust Particles (Static but visually textured) */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 border border-gold/5 rounded-sm"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: 0.1 + Math.random() * 0.1
              }}
            />
          ))}
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
