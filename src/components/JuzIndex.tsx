import { Link } from "react-router-dom";
import { X, BookOpen } from "lucide-react";
import { juzData, toArabicNumber } from "@/data/quranData";

interface JuzIndexProps {
  onClose: () => void;
  currentJuz?: number;
}

const JuzIndex = ({ onClose, currentJuz }: JuzIndexProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-xl w-[95vw] max-w-lg max-h-[80vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-gold" />
            <h2 className="font-amiri text-lg font-bold text-foreground">فهرس الأجزاء</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2">
          {juzData.map((juz) => (
            <Link
              key={juz.number}
              to={`/juz/${juz.number}`}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentJuz === juz.number
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted"
              }`}
            >
              {/* Number circle */}
              <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                currentJuz === juz.number ? "gradient-islamic" : "bg-muted"
              }`}>
                <span className={`text-sm font-bold font-amiri ${
                  currentJuz === juz.number ? "text-primary-foreground" : "text-foreground"
                }`}>
                  {toArabicNumber(juz.number)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-amiri text-sm font-bold text-foreground truncate">{juz.nameAr}</p>
                <p className="text-xs text-muted-foreground font-naskh">{juz.startSurah}</p>
              </div>

              {/* Page range */}
              <span className="text-xs text-muted-foreground font-naskh shrink-0">
                ص {toArabicNumber(juz.startPage)} - {toArabicNumber(juz.endPage)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JuzIndex;
