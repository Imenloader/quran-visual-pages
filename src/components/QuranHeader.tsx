import { Link } from "react-router-dom";
import { Home } from "lucide-react";

interface QuranHeaderProps {
  title?: string;
  showBack?: boolean;
}

const QuranHeader = ({ title = "القرآن الكريم", showBack = false }: QuranHeaderProps) => {
  return (
    <header className="gradient-islamic pattern-islamic py-8 px-4 text-center relative overflow-hidden">
      {/* Decorative gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
      
      {showBack && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1 text-primary-foreground/80 hover:text-gold transition-colors font-naskh text-sm"
          >
            <Home size={14} />
            الرئيسية
          </Link>
        </div>
      )}

      {/* Bismillah */}
      <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
      
      <h1 className="font-amiri text-3xl md:text-4xl font-bold text-primary-foreground">
        {title}
      </h1>
      
      <p className="font-naskh text-primary-foreground/70 text-sm mt-2">
        اقرأ وتدبر كتاب الله
      </p>
    </header>
  );
};

export default QuranHeader;
