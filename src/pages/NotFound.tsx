import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-emerald-deep flex items-center justify-center p-6 relative overflow-hidden selection:bg-gold/20">
      {/* Background Layers */}
      <div className="absolute inset-0 pattern-islamic opacity-10 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-deep z-0" />
      
      {/* Atmospheric Elements */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/2 -right-1/4 w-full h-full bg-gold/20 rounded-full blur-[120px] z-0" 
      />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-24 h-24 rounded-[2.5rem] bg-gold/20 backdrop-blur-md flex items-center justify-center mx-auto mb-10 border border-gold/30 shadow-gold-glow">
            <Search size={40} className="text-gold" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-8xl sm:text-9xl font-serif font-bold text-white mb-6 tracking-tighter drop-shadow-2xl">
            ٤٠٤
          </h1>
          
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gold mb-6">
            عذراً، الصفحة غير موجودة
          </h2>
          
          <p className="text-white/80 font-serif italic text-lg mb-12 leading-relaxed">
            يبدو أنك ضللت الطريق، ولكن كل الطرق في رحاب القرآن تؤدي إلى السكينة
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-4 h-16 px-10 rounded-[2rem] bg-gold text-emerald-deep font-serif text-lg font-bold shadow-xl hover:shadow-gold/20 transition-all active:scale-95"
          >
            <Home size={20} strokeWidth={2} />
            العودة للرئيسية
          </Link>

          <motion.p 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="font-amiri text-gold text-3xl mt-16"
          >
            ﷽
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
