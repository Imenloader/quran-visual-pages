import { Link } from "react-router-dom";
import { X, BookOpen } from "lucide-react";
import { juzData, toArabicNumber } from "@/data/quranData";
import { motion } from "framer-motion";

interface JuzIndexProps {
  onClose: () => void;
  currentJuz?: number;
}

const JuzIndex = ({ onClose, currentJuz }: JuzIndexProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card border border-border rounded-3xl shadow-2xl w-[90vw] max-w-md max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen size={20} className="text-primary" />
            </div>
            <h2 className="font-amiri text-xl font-bold text-foreground">فهرس الأجزاء</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
          {juzData.map((juz) => (
            <Link
              key={juz.number}
              to={`/juz/${juz.number}`}
              onClick={onClose}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${
                currentJuz === juz.number
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted border border-transparent"
              }`}
            >
              {/* Number circle */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${
                currentJuz === juz.number ? "gradient-islamic" : "bg-muted"
              }`}>
                <span className={`text-sm font-bold font-amiri ${
                  currentJuz === juz.number ? "text-primary-foreground" : "text-foreground"
                }`}>
                  {juz.number}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-amiri text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">{juz.nameAr}</p>
                <p className="text-xs text-muted-foreground font-naskh">{juz.startSurah}</p>
              </div>

              {/* Page range */}
              <div className="text-left">
                <span className="text-[10px] block text-muted-foreground/60 uppercase tracking-tighter">الصفحات</span>
                <span className="text-xs text-foreground font-naskh font-bold">
                  {juz.startPage} - {juz.endPage}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default JuzIndex;
