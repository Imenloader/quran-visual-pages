import { ZoomIn, ZoomOut, RotateCcw, Bookmark, BookOpen, List, Moon, Sun, Info, MessageSquareText, Type, FileImage, ArrowDown, ArrowRightLeft, Palette, GraduationCap, Sparkles, Server, Wand2, DownloadCloud, EyeOff, Eye, Trophy } from "lucide-react";
import { toArabicNumber } from "@/data/quranData";
import ShareButton from "./ShareButton";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "./ui/sheet";
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
  const [isQuizOpen, setIsQuizOpen] = useState(false);

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
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md md:backdrop-blur-xl border-b border-border/40 shadow-soft transform-gpu transition-all" dir="ltr">
      <div className="container max-w-7xl mx-auto px-2 md:px-4 py-1.5 md:py-2.5 flex items-center gap-2 overflow-hidden">
        
        {/* Left Side: Tools Group (Scrollable on Mobile) */}
        <div className="flex-1 flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onSaveBookmark(); }}
            className={cn("toolbar-btn !p-1.5 md:!p-2.5 transition-all active:scale-90", bookmarked ? "text-accent" : "text-primary/70")}
            title="حفظ الموضع"
          >
            <Bookmark className="size-[16px] md:size-[20px]" fill={bookmarked ? "currentColor" : "none"} />
          </button>

          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <ShareButton juzNumber={juzNumber} currentPage={currentPage} />
          </div>

          <button onClick={(e) => { e.stopPropagation(); toggleTheme(); }} className="toolbar-btn !p-1.5 md:!p-2.5 text-primary/70 shrink-0">
            {theme === "dark" ? <Moon className="size-[16px] md:size-[20px]" /> : <Sun className="size-[16px] md:size-[20px]" />}
          </button>

          <button onClick={(e) => { e.stopPropagation(); onDownloadAudio?.(); }} className={cn("toolbar-btn !p-1.5 md:!p-2.5 text-primary/70 shrink-0", isDownloadingAudio && "animate-pulse text-accent")}>
            <DownloadCloud className="size-[16px] md:size-[20px]" />
          </button>

          <button onClick={(e) => { e.stopPropagation(); toggleScrollDirection(); }} className="toolbar-btn !p-1.5 md:!p-2.5 text-primary/70 shrink-0">
            {scrollDirection === "vertical" ? <ArrowDown className="size-[16px] md:size-[20px]" /> : <ArrowRightLeft className="size-[16px] md:size-[20px]" />}
          </button>

          <button onClick={(e) => { e.stopPropagation(); setAtmosphericBackground(!atmosphericBackground); }} className={cn("toolbar-btn !p-1.5 md:!p-2.5 shrink-0", atmosphericBackground ? "text-accent" : "text-primary/70")}>
            <Wand2 className="size-[16px] md:size-[20px]" />
          </button>

          {/* Hifz Group Pill */}
          <div className="flex items-center gap-0.5 bg-muted/40 rounded-full p-0.5 border border-border/20 mx-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setIsQuizOpen(true); }}
              className="p-1.5 md:p-2 rounded-full text-primary/60 hover:text-primary transition-all"
              title="اختبار الحفظ"
            >
              <GraduationCap className="size-[14px] md:size-[18px]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleHifzMode(); }}
              className={cn("p-1.5 md:p-2 rounded-full transition-all", hifzMode ? "bg-accent text-white shadow-sm" : "text-primary/60 hover:text-primary")}
              title="وضع الحفظ (الإخفاء)"
            >
              <EyeOff className="size-[14px] md:size-[18px]" />
            </button>
          </div>

          <button onClick={(e) => { e.stopPropagation(); onToggleSourceSelector(); }} className="toolbar-btn !p-1.5 md:!p-2.5 text-primary/70 shrink-0" title="مصدر الصور">
            <Server className="size-[16px] md:size-[20px]" />
          </button>

          <button onClick={(e) => { e.stopPropagation(); toggleReadingMode(); }} className="toolbar-btn !p-1.5 md:!p-2.5 text-primary/70 shrink-0">
            {readingMode === "image" ? <Type className="size-[16px] md:size-[20px]" /> : <FileImage className="size-[16px] md:size-[20px]" />}
          </button>

          {/* Zoom Group Pill */}
          <div className="flex items-center gap-0.5 bg-muted/40 rounded-full p-0.5 border border-border/20 mx-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onZoomOut(); }}
              className="p-1.5 md:p-2 rounded-full text-primary/60 hover:text-primary transition-all active:scale-90"
              title="تصغير"
            >
              <ZoomOut className="size-[14px] md:size-[18px]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onResetZoom(); }}
              className="px-1.5 py-1 text-[9px] md:text-[10px] font-bold text-primary/50 hover:text-accent transition-colors tabular-nums min-w-[32px] text-center"
            >
              {zoom}%
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onZoomIn(); }}
              className="p-1.5 md:p-2 rounded-full text-primary/60 hover:text-primary transition-all active:scale-90"
              title="تكبير"
            >
              <ZoomIn className="size-[14px] md:size-[18px]" />
            </button>
          </div>
        </div>

        {/* Center: Title (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center px-4 shrink-0" dir="rtl">
          <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase font-naskh">مصحف المدينة</span>
          <span className="text-[12px] text-primary/80 font-serif italic">الإصدار الرقمي</span>
        </div>

        {/* Right Side: Navigation Tools */}
        <div className="flex items-center gap-1 md:gap-3 shrink-0 ml-auto border-l border-border/20 pl-2">
          <button onClick={(e) => { e.stopPropagation(); onTogglePageNav(); }} className="toolbar-btn !p-1.5 md:!p-2.5 text-primary/70" title="الانتقال لصفحة">
            <BookOpen className="size-[16px] md:size-[20px]" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggleJuzIndex(); }} className="toolbar-btn !p-1.5 md:!p-2.5 text-primary/70" title="الفهرس">
            <List className="size-[16px] md:size-[20px]" />
          </button>
        </div>
      </div>

      {/* Hifz Quiz Dialog */}
      <Sheet open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <SheetContent side="bottom" className="rounded-t-[2.5rem] border-t-accent/20 bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
           <SheetHeader>
             <SheetTitle className="text-right font-serif">اختبار الحفظ</SheetTitle>
             <SheetDescription className="text-right">اختبر حفظك للصفحة الحالية عبر أسئلة ذكية</SheetDescription>
           </SheetHeader>
           <HifzQuizView 
             pageNumber={currentPage} 
             onClose={() => setIsQuizOpen(false)}
             onComplete={() => {}}
           />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ReadingToolbar;
