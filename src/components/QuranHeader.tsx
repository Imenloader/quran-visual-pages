import { BookOpen, Sparkles } from "lucide-react";
import BackButton from "./BackButton";
import SyncStatusIndicator from "./SyncStatusIndicator";
import { useTranslation } from "react-i18next"; // Required for i18n support

interface QuranHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  variant?: "full" | "compact";
  children?: React.ReactNode;
}

const QuranHeader = ({ 
  title, 
  subtitle,
  showBack = true,
  variant = "full",
  children
}: QuranHeaderProps) => {
  const { t } = useTranslation();
  const isCompact = variant === "compact";
  const displayTitle = title || t("hub.quran");

  return (
    <header className={`relative w-full overflow-x-hidden bg-emerald-deep flex items-center justify-center shadow-islamic ${
      isCompact ? "min-h-[180px] md:min-h-[300px]" : "min-h-[340px] md:min-h-[500px]"
    }`}>
      {/* Back Button */}
      {showBack && (
        <div className="absolute top-6 right-6 z-50">
          <BackButton variant="ghost" />
        </div>
      )}

      {/* Sync Status Indicator */}
      <div className="absolute top-6 left-6 z-50">
        <SyncStatusIndicator />
      </div>
      {/* Immersive Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 pattern-islamic scale-[2] opacity-15 transform-gpu" />
        
        {/* Atmospheric Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-deep/40 to-emerald-deep transform-gpu" />
        
        <div className="absolute -top-1/2 -right-1/4 w-[120%] h-[120%] bg-gold/10 rounded-full blur-[80px] md:blur-[160px] opacity-20 transform-gpu" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[100%] h-[100%] bg-emerald-light/10 rounded-full blur-[60px] md:blur-[140px] opacity-15 transform-gpu" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-24 flex flex-col items-center text-center">
        
        {/* Micro-label */}
        <div className="flex items-center gap-3 md:gap-6 mb-4 md:mb-12 transform-gpu">
          <div className="h-px w-6 bg-gradient-to-l from-gold/60 to-transparent" />
          <span className="text-[8px] md:text-[11px] uppercase font-bold text-gold drop-shadow-sm">
            {t('app.title')}
          </span>
          <div className="h-px w-6 bg-gradient-to-r from-gold/60 to-transparent" />
        </div>

        {/* Main Title */}
        <div className="relative mb-6 md:mb-14 w-full max-w-full overflow-hidden">
          <div className="relative transform-gpu">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-[8rem] font-light text-white leading-tight tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] break-words px-4">
              {displayTitle}
            </h1>
            
            {/* Decorative Sparkles */}
            <div className="absolute -top-6 -right-6 md:-top-12 md:-right-12 text-gold/30 pointer-events-none opacity-50 transform-gpu">
              <Sparkles size={40} strokeWidth={0.5} className="md:w-16 md:h-16" />
            </div>
          </div>
        </div>

        {/* Bismillah */}
        {!isCompact && (
          <div className="flex flex-col items-center gap-6 md:gap-8 transform-gpu">
            {subtitle ? (
              <p className="text-sm md:text-lg text-gold/80 font-naskh max-w-2xl mx-auto px-4 leading-relaxed">
                {subtitle}
              </p>
            ) : (
              <p className="font-quran text-2xl sm:text-4xl md:text-5xl text-gold leading-relaxed italic drop-shadow-md">
                {t('quran.bismillah')}
              </p>
            )}
            
            <div className="flex items-center gap-4 md:gap-6">
              <div className="h-[1px] w-12 md:w-16 bg-gold/40" />
              <div className="relative">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-gold relative z-10" strokeWidth={1} />
              </div>
              <div className="h-[1px] w-12 md:w-16 bg-gold/40" />
            </div>
          </div>
        )}

        {/* Floating Footer details */}
        {!isCompact && (
          <div className="absolute bottom-10 md:bottom-16 flex flex-col items-center gap-3 md:gap-4 opacity-60 transform-gpu">
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-white/80">
              {t('app.subtitle')}
            </span>
            <div className="w-px h-8 bg-gold/30" />
          </div>
        )}

        {children}
      </div>

      {/* bottom transition - refined to be less aggressive with semi-transparent cards */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </header>
  );
};

export default QuranHeader;

