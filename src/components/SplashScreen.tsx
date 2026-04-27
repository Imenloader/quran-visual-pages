import React, { useEffect, useState } from "react";

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-emerald-deep overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-islamic opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-deep" />

      {/* Decorative Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 ornament-border opacity-20 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-gold/30 to-gold/10 backdrop-blur-xl flex items-center justify-center mb-10 border border-gold/40 shadow-[0_0_50px_-12px_rgba(212,175,55,0.5)]">
          <span className="text-6xl md:text-7xl text-gold drop-shadow-2xl">
            📖
          </span>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter">
              مصحف المدينة
            </h1>
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto opacity-50" />
          </div>
          <p className="text-gold font-serif italic text-xl md:text-2xl tracking-wide opacity-90">
            التجربة الرقمية الفاخرة
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="w-56 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full w-full bg-gradient-to-r from-gold/50 via-gold to-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.4em]">
              جاري تهيئة المساحة الإيمانية
            </span>
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
              Loading Spiritual Space
            </span>
          </div>
        </div>
      </div>

      {/* Footer Ornament */}
      <div className="absolute bottom-12 font-amiri text-gold text-5xl">
        ﷽
      </div>
    </div>
  );
};

export default SplashScreen;

export default SplashScreen;
