import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  Trophy, 
  History, 
  ChevronRight,
  Flame,
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toArabicNumber, juzData } from "@/data/quranData";
import { useHifzMastery } from "@/hooks/useHifzMastery";
import { useSmartReview } from "@/hooks/useSmartReview";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import HifzQuizView from "@/components/HifzQuizView";
import MasteryBadge from "@/components/MasteryBadge";
import { useNavigate, useSearchParams } from "react-router-dom";

const HifzTester = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { masteryData } = useHifzMastery();
  const { atRiskPages, isLoaded: smartLoaded } = useSmartReview();
  const [isSmartMode, setIsSmartMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  useEffect(() => {
    if (smartLoaded && searchParams.get('review') === 'true') {
      setIsSmartMode(true);
      setSelectedPage(0); // Dummy page to trigger sheet
    }
  }, [smartLoaded, searchParams]);

  const masteredCount = Object.values(masteryData).filter(m => m.masteryLevel === 3).length;
  const totalTested = Object.keys(masteryData).length;

  const handleStartTest = (page: number) => {
    setSelectedPage(page);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "اختبار الحفظ الذكي" : "Smart Hifz Tester"} 
        subtitle={isAr ? "اختبر إتقانك للصفحات وثبت حفظك" : "Test your page mastery and solidify your hifz"}
        variant="compact"
      />

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bento-card bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">{isAr ? "صفحات متقنة" : "Mastered Pages"}</p>
              <p className="text-2xl font-bold">{isAr ? toArabicNumber(masteredCount) : masteredCount}</p>
            </div>
          </div>

          <div className="bento-card bg-accent/10 border-accent/20 text-accent p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">{isAr ? "إجمالي الاختبارات" : "Total Tests"}</p>
              <p className="text-2xl font-bold">{isAr ? toArabicNumber(totalTested) : totalTested}</p>
            </div>
          </div>

          <div className="bento-card bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">{isAr ? "الاستمرارية" : "Consistency"}</p>
              <p className="text-2xl font-bold">{isAr ? toArabicNumber(5) : 5} <span className="text-sm font-normal">{isAr ? "أيام" : "Days"}</span></p>
            </div>
          </div>
        </div>

        {/* Search & Quick Start */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif px-2">{isAr ? "بدء اختبار سريع" : "Quick Start Test"}</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder={isAr ? "أدخل رقم الصفحة (1-604)..." : "Enter page number (1-604)..."}
                className="h-14 pr-12 rounded-2xl border-border/60 bg-card"
                type="number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartTest(parseInt(searchQuery))}
              />
            </div>
            <Button 
              className="h-14 px-8 rounded-2xl bg-primary"
              onClick={() => handleStartTest(parseInt(searchQuery))}
              disabled={!searchQuery || parseInt(searchQuery) < 1 || parseInt(searchQuery) > 604}
            >
              {isAr ? "ابدأ" : "Start"}
            </Button>
          </div>
        </div>

        {/* Browse by Juz */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif px-2">{isAr ? "تصفح حسب الأجزاء" : "Browse by Juz"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {juzData.map((juz) => (
              <button 
                key={juz.number}
                className="group bento-card !p-4 flex items-center justify-between hover:border-accent/30 transition-all text-right"
                onClick={() => handleStartTest(juz.startPage)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-accent/10 group-hover:text-accent flex items-center justify-center font-bold transition-colors">
                    {isAr ? toArabicNumber(juz.number) : juz.number}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm font-serif">{isAr ? juz.nameAr : juz.nameEn}</p>
                      {masteryData[juz.startPage] && <MasteryBadge level={masteryData[juz.startPage].masteryLevel} />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {isAr ? `من ص ${toArabicNumber(juz.startPage)} إلى ${toArabicNumber(juz.endPage)}` : `Page ${juz.startPage} to ${juz.endPage}`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-[-4px] rtl:group-hover:translate-x-[4px]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={selectedPage !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedPage(null);
          setIsSmartMode(false);
        }
      }}>
        <SheetContent side="bottom" className="h-[auto] max-h-[90vh] rounded-t-[2.5rem] border-t-accent/20 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
          <SheetHeader className="p-6 border-b border-border/40">
            <SheetTitle className="text-right font-serif flex items-center gap-2">
              <GraduationCap className="text-accent" />
              {isSmartMode ? (isAr ? "مراجعة ذكية شاملة" : "Complete Smart Review") : (isAr ? "اختبار الحفظ الذكي" : "Smart Hifz Test")}
            </SheetTitle>
            <SheetDescription className="text-right text-xs">
              {isAr ? "اختبر إتقانك لهذه الصفحة من خلال أسئلة متنوعة" : "Test your mastery of this page through various questions"}
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto pb-12">
            {(selectedPage !== null) && (
              <HifzQuizView 
                pageNumber={isSmartMode ? undefined : selectedPage} 
                isSmartReview={isSmartMode}
                atRiskPages={isSmartMode ? atRiskPages.map(p => p.pageNumber) : undefined}
                onClose={() => {
                  setSelectedPage(null);
                  setIsSmartMode(false);
                }}
                onComplete={() => {
                  setSelectedPage(null);
                  setIsSmartMode(false);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HifzTester;
