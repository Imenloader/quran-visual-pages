import React from "react";
import { useHifzMastery } from "@/hooks/useHifzMastery";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Trophy, Target, BookOpen, ExternalLink, PlayCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { getSurahByPage } from "@/data/quranData";

interface HifzMasteryMapProps {
  onPageClick?: (page: number) => void;
}

const HifzMasteryMap: React.FC<HifzMasteryMapProps> = ({ onPageClick }) => {
  const { t, i18n } = useTranslation();
  const { masteryData, isLoaded } = useHifzMastery();
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = React.useState<number | null>(null);
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
                onClick={() => setSelectedPage(pageNum)}
                className={`aspect-square rounded-[2px] transition-colors cursor-pointer ${color}`}
              />
            );
          })}
        </div>
      </div>

      {/* Page Detail Dialog */}
      <Dialog open={selectedPage !== null} onOpenChange={(open) => !open && setSelectedPage(null)}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none bg-card/95 backdrop-blur-xl shadow-2xl">
          {selectedPage && (() => {
            const surah = getSurahByPage(selectedPage);
            const mastery = masteryData[selectedPage];
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-xl">
                      {selectedPage}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-serif font-bold text-primary">
                        {isAr ? surah?.name : surah?.englishName}
                      </DialogTitle>
                      <DialogDescription className="text-xs font-serif italic text-muted-foreground">
                        {isAr ? `الصفحة ${selectedPage}` : `Page ${selectedPage}`}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                      {isAr ? "مستوى الإتقان" : "Mastery Level"}
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(lvl => (
                        <div 
                          key={lvl} 
                          className={`h-2 flex-1 rounded-full ${
                            (mastery?.masteryLevel || 0) >= lvl ? "bg-emerald-500" : "bg-primary/10"
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                      {isAr ? "آخر اختبار" : "Last Tested"}
                    </p>
                    <p className="text-xs font-serif font-medium">
                      {mastery ? new Date(mastery.lastTested).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : (isAr ? 'لم يختبر بعد' : 'Not tested')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    className="h-14 rounded-2xl bg-accent hover:bg-accent/90 text-white gap-3 font-serif font-bold"
                    onClick={() => {
                      if (onPageClick) onPageClick(selectedPage);
                      else navigate(`/quran/page/${selectedPage}?test=true`);
                      setSelectedPage(null);
                    }}
                  >
                    <PlayCircle size={20} />
                    {isAr ? "ابدأ اختبار الحفظ" : "Start Hifz Test"}
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-14 rounded-2xl border-primary/10 bg-primary/5 hover:bg-primary/10 text-primary gap-3 font-serif font-bold"
                    onClick={() => {
                      navigate(`/quran/page/${selectedPage}`);
                      setSelectedPage(null);
                    }}
                  >
                    <ExternalLink size={18} />
                    {isAr ? "قراءة الصفحة" : "Read Page"}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      
      <p className="text-[10px] text-center text-muted-foreground font-serif italic">
        {isAr 
          ? "خريطة الإتقان: الأخضر (متقن)، البرتقالي (قيد العمل)، الأحمر (يحتاج مراجعة)"
          : "Mastery Map: Green (Mastered), Amber (In Progress), Red (Needs Review)"}
      </p>
    </div>
  );
};

export default HifzMasteryMap;
