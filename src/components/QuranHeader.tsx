import { Link } from "react-router-dom";
import { Home } from "lucide-react";

interface QuranHeaderProps {
  title?: string;
  showBack?: boolean;
}

const QuranHeader = ({ title = "القرآن الكريم", showBack = false }: QuranHeaderProps) => {
  return (
    <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
      {/* Decorative gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />

      {/* Home button row */}
      {showBack && (
        <div className="flex justify-start pt-3 pb-1">
          <Link
            to="/"
            className="flex items-center gap-1.5 bg-gold text-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all font-naskh text-sm font-bold shadow-md"
          >
            <Home size={16} />
            الرئيسية
          </Link>
        </div>
      )}

      <div className={showBack ? "pb-6" : "py-8"}>
        {/* Bismillah */}
        <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        
        <h1 className="font-amiri text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
          {title}
        </h1>
        
        <p className="font-naskh text-primary-foreground/70 text-sm mt-2">
          اقرأ وتدبر كتاب الله
        </p>
      </div>
    </header>
  );
};

export default QuranHeader;
