import { Link } from "react-router-dom";
import { JuzInfo, toArabicNumber } from "@/data/quranData";

interface JuzCardProps {
  juz: JuzInfo;
  index: number;
}

const JuzCard = ({ juz, index }: JuzCardProps) => {
  return (
    <Link
      to={`/juz/${juz.number}`}
      className="group block"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:shadow-islamic hover:border-gold-light hover:-translate-y-1">
        {/* Decorative corner */}
        <div className="absolute top-0 left-0 w-12 h-12 gradient-gold opacity-20 rounded-br-full" />
        
        {/* Juz number */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full gradient-islamic">
          <span className="text-lg font-bold font-amiri text-primary-foreground">
            {toArabicNumber(juz.number)}
          </span>
        </div>

        {/* Juz name */}
        <h3 className="text-center font-amiri text-lg font-bold text-foreground mb-1 group-hover:text-gold-dark transition-colors">
          {juz.nameAr}
        </h3>

        {/* Start surah */}
        <p className="text-center text-sm text-muted-foreground font-naskh">
          {juz.startSurah}
        </p>

        {/* Page range */}
        <p className="text-center text-xs text-muted-foreground mt-2 font-naskh">
          صفحة {toArabicNumber(juz.startPage)} - {toArabicNumber(juz.endPage)}
        </p>
      </div>
    </Link>
  );
};

export default JuzCard;
