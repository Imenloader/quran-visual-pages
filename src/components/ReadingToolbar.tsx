import { ZoomIn, ZoomOut, RotateCcw, Bookmark, BookOpen, List, Moon, Sun, Info, MessageSquareText, Type, FileImage, ArrowDown, ArrowRightLeft, Palette, GraduationCap, Sparkles, Server, Wand2, DownloadCloud, EyeOff, Eye } from "lucide-react";
import { toArabicNumber } from "@/data/quranData";
import ShareButton from "./ShareButton";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";
import HifzQuizView from "./HifzQuizView";

interface ReadingToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSaveBookmark: () => void;
  onTogglePageNav: () => void;
  onToggleJuzIndex: () => void;
  currentPage: number;
  bookmarked: boolean;
  juzNumber: number;
  hifzMode: boolean;
  onToggleHifzMode: () => void;
  onToggleSourceSelector: () => void;
  onDownloadAudio?: () => void;
  isDownloadingAudio?: boolean;
}

const ReadingToolbar = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSaveBookmark,
  onTogglePageNav,
  onToggleJuzIndex,
  currentPage,
  bookmarked,
  juzNumber,
  hifzMode,
  onToggleHifzMode,
  onToggleSourceSelector,
  onDownloadAudio,
  isDownloadingAudio
}: ReadingToolbarProps) => {
   const { theme, setTheme, readingMode, setReadingMode, scrollDirection, setScrollDirection, tajweedMode, setTajweedMode, atmosphericBackground, setAtmosphericBackground } = useTheme();
  const [showQuiz, setShowQuiz] = useState(false);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("sepia");
    } else if (theme === "sepia") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const toggleReadingMode = () => {
    const nextMode = readingMode === "image" ? "text" : "image";
    setReadingMode(nextMode);
    
    // Auto-toggle tajweed based on user request: only for text quran
    if (nextMode === "text") {
      setTajweedMode(true);
    } else {
      // In image mode, we typically use the source's own tajweed property, 
      // but the "global" tajweedMode toggle can be off.
      setTajweedMode(false);
    }
  };

  const toggleScrollDirection = () => {
    setScrollDirection(scrollDirection === "vertical" ? "horizontal" : "vertical");
  };

  const toggleTajweedMode = () => {
    const next = !tajweedMode;
    setTajweedMode(next);
    toast(next ? "تم تفعيل التجويد الملون" : "تم إيقاف التجويد الملون", {
      description: next ? "سيتم تلوين الحروف حسب قواعد التجويد" : "تم العودة للوضع العادي",
      duration: 2000,
    });
  };

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-soft">
      <div className="container max-w-5xl mx-auto px-2 md:px-4 py-1.5 md:py-3 flex items-center justify-between gap-1.5 md:gap-4">
        
        {/* Left: Navigation & Index */}
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={(e) => { e.stopPropagation(); onToggleJuzIndex(); }} className="toolbar-btn !p-1.5 md:!p-2.5" title="فهرس الأجزاء">
            <List className="size-[16px] md:size-[20px]" strokeWidth={1.5} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onTogglePageNav(); }} className="toolbar-btn !p-1.5 md:!p-2.5" title="الانتقال لصفحة">
            <BookOpen className="size-[16px] md:size-[20px]" strokeWidth={1.5} />
          </button>
          <div className="h-5 md:h-6 w-px bg-border/40 mx-0.5 md:mx-1 hidden xs:block" />
          <div className="hidden xs:flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl bg-muted/30 text-[10px] md:text-xs font-serif text-primary">
            <span className="text-muted-foreground">صفحة</span>
            <span className="font-bold">{currentPage}</span>
          </div>
        </div>

        {/* Center: App Title/Logo - Hidden on very small screens to save space */}
        <div className="hidden sm:flex flex-col items-center">
          <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-accent uppercase">مصحف المدينة</span>
          <span className="text-[10px] md:text-xs text-primary font-serif italic">الإصدار الرقمي</span>
        </div>

        {/* Right: Tools & Settings */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggleReadingMode(); }}
            className={`toolbar-btn !p-1.5 md:!p-2.5 ${readingMode === "text" ? "text-accent bg-accent/10" : ""}`}
            title={readingMode === "text" ? "عرض الصور" : "عرض النص"}
          >
            {readingMode === "text" ? <FileImage className="size-[16px] md:size-[20px]" strokeWidth={1.5} /> : <Type className="size-[16px] md:size-[20px]" strokeWidth={1.5} />}
          </button>

          {readingMode === "text" && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleTajweedMode(); }}
              className={`toolbar-btn !p-1.5 md:!p-2.5 ${tajweedMode ? "text-emerald-500 bg-emerald-500/10" : ""}`}
              title="التجويد الملون"
            >
              <Sparkles className="size-[16px] md:size-[20px]" strokeWidth={1.5} />
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onToggleSourceSelector(); }}
            className="toolbar-btn !p-1.5 md:!p-2.5"
            title="تغيير مصدر الصور"
          >
            <Server className="size-[16px] md:size-[20px]" strokeWidth={1.5} />
          </button>

          {/* Memorization & Hifz Tools Group */}
          <div className="flex items-center gap-1.5 p-1 bg-accent/5 rounded-2xl border border-accent/10">
            <Button
              variant={hifzMode ? "default" : "ghost"}
              size="icon"
              onClick={onToggleHifzMode}
              className={cn(
                "h-8 w-8 md:h-10 md:w-10 rounded-xl transition-all",
                hifzMode ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-primary hover:bg-accent/10"
              )}
              title={hifzMode ? "إيقاف وضع الحفظ" : "بدء وضع الحفظ (إخفاء الأسطر)"}
            >
              {hifzMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:h-10 md:w-10 rounded-xl text-primary hover:bg-accent/10 transition-all"
                  title="اختبار الحفظ الذكي"
                >
                  <GraduationCap className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[auto] max-h-[90vh] rounded-t-[2.5rem] border-t-accent/20 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
                <SheetHeader className="p-6 border-b border-border/40">
                  <SheetTitle className="text-right font-serif flex items-center gap-2">
                    <GraduationCap className="text-accent" />
                    اختبار الحفظ الذكي
                  </SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto pb-12">
                  <HifzQuizView 
                    pageNumber={currentPage} 
                    onClose={() => {}}
                    onComplete={() => {
                      toast.success("تم تحديث مستوى إتقان الصفحة");
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setAtmosphericBackground(!atmosphericBackground); }}
            className={`toolbar-btn !p-1.5 md:!p-2.5 ${atmosphericBackground ? "text-amber-500 bg-amber-500/10" : ""}`}
            title="تأثيرات جوية"
          >
            <Wand2 className="size-[16px] md:size-[20px]" strokeWidth={1.5} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); toggleScrollDirection(); }}
            className={`toolbar-btn !p-1.5 md:!p-2.5 ${scrollDirection === "horizontal" ? "text-accent bg-accent/10" : ""}`}
            title={scrollDirection === "horizontal" ? "التمرير الرأسي" : "التمرير الأفقي"}
          >
            {scrollDirection === "horizontal" ? <ArrowRightLeft className="size-[16px] md:size-[20px]" strokeWidth={1.5} /> : <ArrowDown className="size-[16px] md:size-[20px]" strokeWidth={1.5} />}
          </button>

          {onDownloadAudio && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownloadAudio(); }}
              disabled={isDownloadingAudio}
              className={`toolbar-btn !p-1.5 md:!p-2.5 ${isDownloadingAudio ? "opacity-50" : ""}`}
              title="تحميل الصوت للتلاوة بدون إنترنت"
            >
              <DownloadCloud className={`size-[16px] md:size-[20px] ${isDownloadingAudio ? "animate-pulse" : ""}`} strokeWidth={1.5} />
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 bg-muted/30 rounded-2xl p-1">
            <button onClick={(e) => { e.stopPropagation(); onZoomOut(); }} className="toolbar-btn !p-1.5" title="تصغير">
              <ZoomOut size={16} strokeWidth={1.5} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onResetZoom(); }} className="px-2 text-[10px] font-serif font-bold text-primary/60">
              {toArabicNumber(zoom)}%
            </button>
            <button onClick={(e) => { e.stopPropagation(); onZoomIn(); }} className="toolbar-btn !p-1.5" title="تكبير">
              <ZoomIn size={16} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="h-5 md:h-6 w-px bg-border/40 mx-0.5 md:mx-1 hidden xs:block" />
          
          <button
            onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
            className={`toolbar-btn !p-1.5 md:!p-2.5 ${theme !== "light" ? "text-accent bg-accent/10" : ""}`}
            title="تغيير المظهر"
          >
            {theme === "dark" ? <Moon className="size-[16px] md:size-[20px]" strokeWidth={1.5} /> : theme === "sepia" ? <Palette className="size-[16px] md:size-[20px]" strokeWidth={1.5} /> : <Sun className="size-[16px] md:size-[20px]" strokeWidth={1.5} />}
          </button>
          
          <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
            <ShareButton juzNumber={juzNumber} currentPage={currentPage} />
          </div>
          
          <button
            onClick={(e) => { e.stopPropagation(); onSaveBookmark(); }}
            className={`toolbar-btn !p-1.5 md:!p-2.5 ${bookmarked ? "text-accent" : ""}`}
            title="حفظ موضع القراءة"
          >
            <Bookmark className="size-[16px] md:size-[20px]" strokeWidth={1.5} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingToolbar;
