import React from "react";
import { useHifzMastery } from "@/hooks/useHifzMastery";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Trophy, Target, BookOpen } from "lucide-react";

interface HifzMasteryMapProps {
  onPageClick?: (page: number) => void;
}

const HifzMasteryMap: React.FC<HifzMasteryMapProps> = ({ onPageClick }) => {
  const { t, i18n } = useTranslation();
  const { masteryData, isLoaded } = useHifzMastery();
  const isAr = i18n.language === "ar";

  const totalPages = 604;
  const masteredCount = Object.values(masteryData).filter(m => m.masteryLevel === 3).length;
  const inProgressCount = Object.values(masteryData).filter(m => m.masteryLevel > 0 && m.masteryLevel < 3).length;

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <Trophy className="mx-auto mb-1 text-emerald-500" size={16} />
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
            {isAr ? "متقن" : "Mastered"}
          </p>
          <p className="text-lg font-serif font-bold text-emerald-600">{masteredCount}</p>
        </div>
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
          <Target className="mx-auto mb-1 text-amber-500" size={16} />
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
            {isAr ? "قيد المراجعة" : "Reviewing"}
          </p>
          <p className="text-lg font-serif font-bold text-amber-600">{inProgressCount}</p>
        </div>
        <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center">
          <BookOpen className="mx-auto mb-1 text-primary" size={16} />
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
            {isAr ? "المتبقي" : "Remaining"}
          </p>
          <p className="text-lg font-serif font-bold text-primary">{totalPages - masteredCount - inProgressCount}</p>
        </div>
      </div>

      {/* The Map Grid */}
      <div className="bg-primary/5 rounded-[2rem] p-4 border border-primary/10">
        <div 
          className="grid gap-1" 
          style={{ 
            gridTemplateColumns: 'repeat(auto-fill, minmax(8px, 1fr))',
            direction: 'rtl' 
          }}
        >
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const mastery = masteryData[pageNum];
            let color = "bg-primary/10"; // Default
            
            if (mastery) {
              if (mastery.masteryLevel === 3) color = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
              else if (mastery.masteryLevel > 0) color = "bg-amber-500";
              else color = "bg-red-400";
            }

            return (
              <motion.div
                key={pageNum}
                whileHover={{ scale: 1.5, zIndex: 10 }}
                onClick={() => onPageClick?.(pageNum)}
                className={`aspect-square rounded-[2px] transition-colors cursor-pointer ${color}`}
                title={`Page ${pageNum}`}
              />
            );
          })}
        </div>
      </div>
      
      <p className="text-[10px] text-center text-muted-foreground font-serif italic">
        {isAr 
          ? "خريطة الإتقان: الأخضر (متقن)، البرتقالي (قيد العمل)، الأحمر (يحتاج مراجعة)"
          : "Mastery Map: Green (Mastered), Amber (In Progress), Red (Needs Review)"}
      </p>
    </div>
  );
};

export default HifzMasteryMap;
