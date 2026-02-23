import { BookOpen } from "lucide-react";

interface QuranHeaderProps {
  title?: string;
  showBack?: boolean;
}

const QuranHeader = ({ title = "القرآن الكريم" }: QuranHeaderProps) => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-emerald-deep via-primary to-emerald-light">
      {/* Geometric Islamic pattern overlay */}
      <div className="absolute inset-0 pattern-islamic opacity-60" />

      {/* Radial glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/8 rounded-full blur-3xl" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />

      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]">
        <div className="h-full gradient-gold opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-5xl mx-auto px-4 pt-8 pb-7 sm:pt-10 sm:pb-9 md:pt-12 md:pb-10">
        <div className="flex flex-col items-center text-center gap-3 sm:gap-4">

          {/* Ornamental star/icon */}
          <div className="relative">
            <div className="absolute inset-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gold/20 blur-xl" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gradient-gold flex items-center justify-center shadow-lg shadow-gold/25">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-deep" />
            </div>
          </div>

          {/* Bismillah with decorative lines */}
          <div className="flex items-center gap-3 sm:gap-4 w-full max-w-md">
            <div className="flex-1 h-px bg-gradient-to-l from-gold/50 to-transparent" />
            <p className="font-amiri text-gold text-base sm:text-lg md:text-xl leading-relaxed whitespace-nowrap">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/50 to-transparent" />
          </div>

          {/* Title */}
          <h1 className="font-amiri text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground leading-tight tracking-wide">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="font-naskh text-primary-foreground/50 text-xs sm:text-sm max-w-xs">
            اقرأ وتدبّر كتاب الله عز وجل
          </p>
        </div>
      </div>
    </header>
  );
};

export default QuranHeader;
