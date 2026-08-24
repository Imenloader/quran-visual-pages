import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { X, BookOpen, Check } from "lucide-react";
import { juzData, toArabicNumber } from "@/data/quranData";
import { useHifzMastery } from "@/hooks/useHifzMastery";
import MasteryBadge from "./MasteryBadge";

interface JuzIndexProps {
  onClose: () => void;
  currentJuz?: number;
  variant?: "modal" | "sheet";
}

const JuzIndex = ({ onClose, currentJuz, variant = "modal" }: JuzIndexProps) => {
  const { masteryData } = useHifzMastery();
  const completedJuz = useMemo(() => {
    try {
      const history = JSON.parse(localStorage.getItem("quran-reading-history") || "{}");
      return Object.keys(history).filter(key => history[key].completed).map(Number);
    } catch {
      return [];
    }
  }, []);

  const content = (
    <div
      className={variant === "modal" ? "bg-card border border-border rounded-3xl shadow-2xl w-[90vw] max-w-md max-h-[70vh] flex flex-col overflow-hidden" : "w-full flex flex-col h-[60vh]"}
      onClick={(e) => e.stopPropagation()}
    >
      {variant === "modal" && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen size={20} className="text-primary" />
            </div>
            <h2 className="font-amiri text-xl font-bold text-foreground">فهرس الأجزاء</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:bg-muted hover:text-foreground transition-all"
          >
            <X size={20} />
          </button>
        </div>
      )}


        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
          {juzData.map((juz) => {
            const isCompleted = completedJuz.includes(juz.number);
            return (
              <Link
                key={juz.number}
                to={`/juz/${juz.number}`}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden ${
                  currentJuz === juz.number
                    ? "bg-accent/10 border border-accent/20"
                    : "bg-background border border-border/40 shadow-sm hover:bg-muted/60"
                } ${isCompleted ? "border-emerald-500/30" : ""}`}
              >
                {/* Number circle */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 relative ${
                  currentJuz === juz.number ? "gradient-islamic" : (isCompleted ? "bg-emerald-500/10" : "bg-muted")
                }`}>
                  {isCompleted ? (
                    <Check size={16} className="text-emerald-500" strokeWidth={3} />
                  ) : (
                    <span className={`text-sm font-bold font-amiri ${
                      currentJuz === juz.number ? "text-primary-foreground" : "text-foreground"
                    }`}>
                      {juz.number}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-amiri text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">{juz.nameAr}</p>
                    {isCompleted && (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">مكتمل</span>
                    )}
                    {masteryData[juz.startPage] && <MasteryBadge level={masteryData[juz.startPage].masteryLevel} />}
                  </div>
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
          );
        })}
      </div>
    </div>
  );

  if (variant === "sheet") {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60" onClick={onClose}>
      {content}
    </div>
  );
};

export default JuzIndex;
