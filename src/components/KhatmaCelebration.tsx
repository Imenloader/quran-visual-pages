import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-emerald-deep/95 backdrop-blur-xl overflow-hidden"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: window.innerHeight + 100,
                  rotate: 0,
                  opacity: 0.8
                }}
                animate={{ 
                  y: -100,
                  rotate: 360,
                  x: (Math.random() - 0.5) * 200 + (Math.random() * window.innerWidth)
                }}
                transition={{ 
                  duration: Math.random() * 5 + 5, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                className="absolute text-gold/20"
              >
                {i % 3 === 0 ? <Star size={24} /> : i % 3 === 1 ? <Heart size={20} /> : <Sparkles size={22} />}
              </motion.div>
            ))}
          </div>

          <div className="absolute inset-0 pattern-islamic opacity-5 pointer-events-none" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={showContent ? { scale: 1, opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="relative z-10 max-w-lg w-full mx-4 p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_0_100px_-20px_rgba(212,175,55,0.3)] text-center backdrop-blur-2xl"
          >
            {/* Celebration Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center mx-auto mb-8 shadow-2xl relative"
            >
              <Trophy className="w-12 h-12 md:w-16 md:h-16 text-emerald-deep" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white text-emerald-deep p-3 rounded-2xl shadow-xl"
              >
                <PartyPopper size={24} />
              </motion.div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-gold font-serif text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-2">
                  {t("hub.khatma_complete.badge")}
                </h2>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                  {t("hub.khatma_complete.title")}
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto opacity-50" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white/80 font-serif italic text-lg md:text-xl leading-relaxed"
              >
                {t("hub.khatma_complete.description")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-8"
              >
                <button
                  onClick={onClose}
                  className="px-10 py-4 rounded-2xl bg-gold text-emerald-deep font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {t("hub.khatma_complete.button")}
                </button>
              </motion.div>
            </div>

            {/* Decorative Corner Ornaments */}
            <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-gold/30 rounded-tl-2xl" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-gold/30 rounded-br-2xl" />
          </motion.div>

          {/* Confetti Effect (Simplified) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  top: -20, 
                  left: `${Math.random() * 100}%`,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{ 
                  top: "110%",
                  rotate: 720,
                  left: `${Math.random() * 100}%`
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: Math.random() * 2
                }}
                className={`absolute w-2 h-2 rounded-full ${
                  i % 3 === 0 ? "bg-gold" : i % 3 === 1 ? "bg-white" : "bg-yellow-400"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KhatmaCelebration;
