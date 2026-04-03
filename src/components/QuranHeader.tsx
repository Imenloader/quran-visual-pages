import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

interface QuranHeaderProps {
  title?: string;
  showBack?: boolean;
}

const QuranHeader = ({ title = "القرآن الكريم", showBack = false }: QuranHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="relative overflow-hidden bg-emerald-deep min-h-[40vh] md:min-h-[50vh] flex items-center justify-center">
      {/* Back Button */}
      {showBack && (
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-primary/10 backdrop-blur-md text-primary hover:bg-primary/20 transition-all active:scale-90 flex items-center gap-2 group"
        >
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-xs font-serif font-bold">العودة</span>
        </button>
      )}
      {/* Immersive Background Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 pattern-islamic scale-[2] opacity-20" 
        />
        
        {/* Atmospheric Gradients & Light Rays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-deep/40 to-emerald-deep" />
        
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.3, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -right-1/4 w-[120%] h-[120%] bg-gold/15 rounded-full blur-[100px] md:blur-[160px]" 
        />
        
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1.3, 1, 1.3],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -left-1/4 w-[100%] h-[100%] bg-emerald-light/15 rounded-full blur-[80px] md:blur-[140px]" 
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0 
              }}
              animate={{ 
                y: [null, "-20%"],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-1 h-1 bg-gold/30 rounded-full blur-[1px]"
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-24 flex flex-col items-center text-center">
        
        {/* Micro-label with animated lines */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex items-center gap-3 md:gap-6 mb-6 md:mb-12"
        >
          <motion.div 
            animate={{ width: [0, 32, 24] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-px bg-gradient-to-l from-gold/60 to-transparent" 
          />
          <span className="text-[8px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.5em] font-bold text-gold drop-shadow-sm">
            المصحف الإلكتروني الشامل
          </span>
          <motion.div 
            animate={{ width: [0, 32, 24] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-px bg-gradient-to-r from-gold/60 to-transparent" 
          />
        </motion.div>

        {/* Main Title with Depth and Shadow */}
        <div className="relative mb-8 md:mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-light text-white leading-none tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {title}
            </h1>
            
            {/* Decorative Sparkles */}
            <motion.div
              animate={{ 
                opacity: [0.2, 0.6, 0.2],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-8 -right-8 md:-top-12 md:-right-12 text-gold/40 pointer-events-none"
            >
              <Sparkles size={48} strokeWidth={0.5} className="md:w-16 md:h-16" />
            </motion.div>
          </motion.div>
        </div>

        {/* Bismillah - Exquisite Calligraphic Feel */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.2 }}
          className="flex flex-col items-center gap-6 md:gap-8"
        >
          <p className="font-quran text-2xl sm:text-4xl md:text-5xl text-gold leading-relaxed italic drop-shadow-md">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
          
          <div className="flex items-center gap-4 md:gap-6">
            <motion.div 
              animate={{ scaleX: [0, 1] }}
              transition={{ delay: 1.2, duration: 1 }}
              className="h-[1px] w-12 md:w-16 bg-gradient-to-l from-gold/40 to-transparent origin-right" 
            />
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-gold/20 rounded-full scale-150"
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

        {/* Floating Footer micro-details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 md:bottom-16 flex flex-col items-center gap-3 md:gap-4"
        >
          <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-bold text-white">
            تلاوة • تدبّر • حفظ
          </span>
          <motion.div 
            animate={{ height: [0, 48, 32] }}
            transition={{ duration: 2, delay: 1.8 }}
            className="w-px bg-gradient-to-b from-gold/60 to-transparent shadow-gold-glow" 
          />
        </motion.div>
      </div>

      {/* Elegant bottom transition with layered blurs */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-background via-background/80 to-transparent z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 backdrop-blur-sm z-10" />
    </header>
  );
};

export default QuranHeader;
