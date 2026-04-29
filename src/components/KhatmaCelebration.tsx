import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Star, Heart, Sparkles, PartyPopper } from "lucide-react";

interface KhatmaCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
}

const KhatmaCelebration: React.FC<KhatmaCelebrationProps> = ({ isVisible, onClose }) => {
  const { t } = useTranslation();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-emerald-deep/95 backdrop-blur-xl overflow-hidden transition-opacity duration-500 opacity-100"
    >
      {/* Background Ornaments (Static but visually rich) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-gold/10"
            style={{ 
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
              transition: 'all 1s ease-in-out'
            }}
          >
            {i % 3 === 0 ? <Star size={24} /> : i % 3 === 1 ? <Heart size={20} /> : <Sparkles size={22} />}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 pattern-islamic opacity-5 pointer-events-none" />

      <div
        className={`relative z-10 max-w-lg w-full mx-4 p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_0_100px_-20px_rgba(212,175,55,0.3)] text-center backdrop-blur-2xl transition-all duration-700 ${
          showContent ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10"
        }`}
      >
        {/* Celebration Icon */}
        <div
          className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center mx-auto mb-8 shadow-2xl relative transition-transform duration-1000 hover:scale-105"
        >
          <Trophy className="w-12 h-12 md:w-16 md:h-16 text-emerald-deep" />
          <div
            className="absolute -top-4 -right-4 bg-white text-emerald-deep p-3 rounded-2xl shadow-xl animate-bounce"
          >
            <PartyPopper size={24} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="transition-all duration-500 delay-300">
            <h2 className="text-gold font-serif text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-2 opacity-60">
              {t("hub.khatma_complete.badge")}
            </h2>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight">
              {t("hub.khatma_complete.title")}
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto opacity-50" />
          </div>

          <p
            className="text-white/80 font-serif italic text-lg md:text-xl leading-relaxed transition-opacity duration-500 delay-500"
          >
            {t("hub.khatma_complete.description")}
          </p>

          <div
            className="pt-8 transition-all duration-500 delay-700"
          >
            <button
              onClick={onClose}
              className="px-10 py-4 rounded-2xl bg-gold text-emerald-deep font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {t("hub.khatma_complete.button")}
            </button>
          </div>
        </div>

        {/* Decorative Corner Ornaments */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-gold/30 rounded-tl-2xl" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-gold/30 rounded-br-2xl" />
      </div>

      {/* Static Confetti Fallback (Visual texture) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-20 ${
              i % 3 === 0 ? "bg-gold" : i % 3 === 1 ? "bg-white" : "bg-yellow-400"
            }`}
            style={{ 
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default KhatmaCelebration;
