import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import BackButton from "./BackButton";

interface QuranHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  variant?: "full" | "compact";
  children?: React.ReactNode;
}

const QuranHeader = ({ 
  title = "القرآن الكريم", 
  subtitle,
  showBack = true,
  variant = "full",
  children
}: QuranHeaderProps) => {
  const isCompact = variant === "compact";

  return (
    <header className={`relative overflow-hidden bg-emerald-deep flex items-center justify-center transition-shadow duration-500 shadow-islamic ${
      isCompact ? "min-h-[180px] md:min-h-[300px]" : "min-h-[340px] md:min-h-[500px]"
    }`}>
      {/* Back Button */}
      {showBack && (
        <div className="absolute top-6 right-6 z-50">
          <BackButton variant="ghost" />
        </div>
      )}
      {/* Immersive Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 pattern-islamic scale-[2] opacity-15 transform-gpu" 
          style={{ willChange: "opacity" }}
        />
        
        {/* Atmospheric Gradients & Light Rays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-deep/40 to-emerald-deep transform-gpu" />
        
        <motion.div 
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.15, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -right-1/4 w-[120%] h-[120%] bg-gold/10 rounded-full blur-[80px] md:blur-[160px] transform-gpu" 
          style={{ willChange: "transform, opacity" }}
        />
        
        <motion.div 
          animate={{ 
            opacity: [0.08, 0.2, 0.08],
            scale: [1.15, 1, 1.15],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -left-1/4 w-[100%] h-[100%] bg-emerald-light/10 rounded-full blur-[60px] md:blur-[140px] transform-gpu" 
          style={{ willChange: "transform, opacity" }}
        />

        {/* Floating Particles - Reduced for mobile performance */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0 
              }}
              animate={{ 
                y: [null, "-15%"],
                opacity: [0, 0.4, 0]
              }}
              transition={{ 
                duration: Math.random() * 15 + 15, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-1 h-1 bg-gold/20 rounded-full blur-[1px] transform-gpu"
              style={{ willChange: "transform, opacity" }}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-24 flex flex-col items-center text-center">
        
        {/* Micro-label with animated lines */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex items-center gap-3 md:gap-6 mb-4 md:mb-12 transform-gpu"
        >
          <motion.div 
            animate={{ width: [0, 24, 16] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-px bg-gradient-to-l from-gold/60 to-transparent" 
          />
          <span className="text-[8px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.5em] font-bold text-gold drop-shadow-sm">
            المصحف الإلكتروني الشامل
          </span>
          <motion.div 
            animate={{ width: [0, 24, 16] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-px bg-gradient-to-r from-gold/60 to-transparent" 
          />
        </motion.div>

        {/* Main Title with Depth and Shadow */}
        <div className="relative mb-6 md:mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative transform-gpu"
          >
            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-light text-white leading-none tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {title}
            </h1>
            
            {/* Decorative Sparkles */}
            <motion.div
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-6 -right-6 md:-top-12 md:-right-12 text-gold/30 pointer-events-none transform-gpu"
            >
              <Sparkles size={40} strokeWidth={0.5} className="md:w-16 md:h-16" />
            </motion.div>
          </motion.div>
        </div>

        {/* Bismillah - Exquisite Calligraphic Feel */}
        {!isCompact && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1.2 }}
            className="flex flex-col items-center gap-6 md:gap-8 transform-gpu"
          >
            {subtitle ? (
              <p className="text-sm md:text-lg text-gold/80 font-naskh max-w-2xl mx-auto px-4 leading-relaxed">
                {subtitle}
              </p>
            ) : (
              <p className="font-quran text-2xl sm:text-4xl md:text-5xl text-gold leading-relaxed italic drop-shadow-md">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>
            )}
            
            <div className="flex items-center gap-4 md:gap-6">
              <motion.div 
                animate={{ scaleX: [0, 1] }}
                transition={{ delay: 1.2, duration: 1 }}
                className="h-[1px] w-12 md:w-16 bg-gradient-to-l from-gold/40 to-transparent origin-right" 
              />
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-gold/20 rounded-full scale-150 transform-gpu"
                />
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-gold relative z-10" strokeWidth={1} />
              </div>
              <motion.div 
                animate={{ scaleX: [0, 1] }}
                transition={{ delay: 1.2, duration: 1 }}
                className="h-[1px] w-12 md:w-16 bg-gradient-to-r from-gold/40 to-transparent origin-left" 
              />
            </div>
          </motion.div>
        )}

        {/* Floating Footer micro-details */}
        {!isCompact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 md:bottom-16 flex flex-col items-center gap-3 md:gap-4 transform-gpu"
          >
            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-bold text-white/80">
              تلاوة • تدبّر • حفظ
            </span>
            <motion.div 
              animate={{ height: [0, 40, 24] }}
              transition={{ duration: 2, delay: 1.8 }}
              className="w-px bg-gradient-to-b from-gold/50 to-transparent" 
            />
          </motion.div>
        )}

        {children}
      </div>

      {/* Elegant bottom transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-background via-background/60 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 backdrop-blur-[2px] md:backdrop-blur-sm z-10 pointer-events-none hidden sm:block" />
    </header>
  );
};

export default QuranHeader;
