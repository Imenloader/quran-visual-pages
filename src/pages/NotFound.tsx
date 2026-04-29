import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from "lucide-react";
import BackButton from "@/components/BackButton";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-emerald-deep flex items-center justify-center p-6 relative overflow-hidden selection:bg-gold/20">
      <div className="absolute top-6 right-6 z-50">
        <BackButton variant="ghost" />
      </div>
      {/* Background Layers */}
      <div className="absolute inset-0 pattern-islamic opacity-10 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-deep z-0" />
      
      {/* Atmospheric Elements */}
      <div 
        className="absolute -top-1/2 -right-1/4 w-full h-full bg-gold/20 rounded-full blur-[120px] z-0 animate-pulse" 
        style={{ animationDuration: '10s' }}
      />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <div
          className="transition-all duration-1000 ease-out opacity-100 scale-100"
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

          <p 
            className="font-amiri text-gold text-3xl mt-16 animate-pulse"
            style={{ animationDuration: '4s' }}
          >
            ﷽
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
