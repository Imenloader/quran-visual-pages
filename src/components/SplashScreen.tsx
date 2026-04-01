import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-emerald-deep overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 pattern-islamic opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-deep" />

          {/* Decorative Ornaments */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 ornament-border opacity-20 pointer-events-none"
          />

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-gold/30 to-gold/10 backdrop-blur-xl flex items-center justify-center mb-10 border border-gold/40 shadow-[0_0_50px_-12px_rgba(212,175,55,0.5)]"
            >
              <motion.span 
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl md:text-7xl text-gold drop-shadow-2xl"
              >
                📖
              </motion.span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter">
                  مصحف المدينة
                </h1>
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto opacity-50" />
              </div>
              <p className="text-gold font-serif italic text-xl md:text-2xl tracking-wide opacity-90">
                التجربة الرقمية الفاخرة
              </p>
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-20 flex flex-col items-center gap-6"
            >
              <div className="w-56 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-gold/50 via-gold to-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.8)]"
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.4em] animate-pulse">
                  جاري تهيئة المساحة الإيمانية
                </span>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  Loading Spiritual Space
                </span>
              </div>
            </motion.div>
          </div>

          {/* Footer Ornament */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 0.3, y: 0 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="absolute bottom-12 font-amiri text-gold text-5xl"
          >
            ﷽
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
