import { BookOpen } from "lucide-react";

interface QuranHeaderProps {
  title?: string;
  showBack?: boolean;
}

const QuranHeader = ({ title = "القرآن الكريم" }: QuranHeaderProps) => {
  return (
    <header className="relative overflow-hidden gradient-islamic pattern-islamic">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gold/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gold/10 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />
      <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />

      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center gap-2 relative z-10">
        {/* Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg mb-1">
          <BookOpen size={20} className="text-foreground sm:w-6 sm:h-6" />
        </div>

        {/* Bismillah */}
        <p className="font-amiri text-gold text-base sm:text-lg leading-relaxed">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>

        {/* Title */}
        <h1 className="font-amiri text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="font-naskh text-primary-foreground/60 text-xs sm:text-sm">
          اقرأ وتدبر كتاب الله
        </p>
      </div>
    </header>
  );
};

export default QuranHeader;
