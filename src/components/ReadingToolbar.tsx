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
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md md:backdrop-blur-xl border-b border-border/40 shadow-soft transform-gpu transition-all">
      <div className="container max-w-5xl mx-auto px-2 md:px-4 py-1.5 md:py-3 flex items-center justify-between gap-1.5 md:gap-4">
        
        {/* Left: Navigation & Index */}
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={(e) => { e.stopPropagation(); onToggleJuzIndex(); }} className="toolbar-btn !p-1.5 md:!p-2.5 transition-all active:scale-90" title="فهرس الأجزاء">
            <List className="size-[16px] md:size-[20px]" strokeWidth={1.5} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onTogglePageNav(); }} className="toolbar-btn !p-1.5 md:!p-2.5 transition-all active:scale-90" title="الانتقال لصفحة">
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
          <div className="flex items-center gap-1 bg-muted/30 rounded-2xl p-1">
            <button onClick={(e) => { e.stopPropagation(); onZoomOut(); }} className="toolbar-btn !p-1 md:!p-1.5 transition-all active:scale-90" title="تصغير">
              <ZoomOut className="size-[14px] md:size-[16px]" strokeWidth={1.5} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onResetZoom(); }} className="px-1 md:px-2 text-[9px] md:text-[10px] font-serif font-bold text-primary/60 hover:text-primary transition-colors">
              {toArabicNumber(zoom)}%
            </button>
            <button onClick={(e) => { e.stopPropagation(); onZoomIn(); }} className="toolbar-btn !p-1 md:!p-1.5 transition-all active:scale-90" title="تكبير">
              <ZoomIn className="size-[14px] md:size-[16px]" strokeWidth={1.5} />
            </button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button className="toolbar-btn !p-1.5 md:!p-2.5 transition-all active:scale-90" title="إعدادات العرض">
                <Palette className="size-[16px] md:size-[20px]" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[2rem] border-t-accent/20 bg-card/95 backdrop-blur-xl">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-right font-serif">إعدادات العرض</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-4 pb-8">
                <Button variant="outline" onClick={toggleTheme} className="flex flex-col gap-2 h-20 rounded-2xl border-border/40">
                  {theme === "dark" ? <Moon className="text-accent" /> : theme === "sepia" ? <Palette className="text-accent" /> : <Sun className="text-accent" />}
                  <span className="text-xs font-naskh">المظهر</span>
                </Button>
                
                <Button variant="outline" onClick={toggleReadingMode} className="flex flex-col gap-2 h-20 rounded-2xl border-border/40">
                  {readingMode === "text" ? <FileImage className="text-accent" /> : <Type className="text-accent" />}
                  <span className="text-xs font-naskh">{readingMode === "text" ? "عرض الصور" : "عرض النص"}</span>
                </Button>

                <Button variant="outline" onClick={toggleScrollDirection} className="flex flex-col gap-2 h-20 rounded-2xl border-border/40">
                  {scrollDirection === "horizontal" ? <ArrowRightLeft className="text-accent" /> : <ArrowDown className="text-accent" />}
                  <span className="text-xs font-naskh">{scrollDirection === "horizontal" ? "التمرير الرأسي" : "التمرير الأفقي"}</span>
                </Button>

                <Button variant="outline" onClick={() => setAtmosphericBackground(!atmosphericBackground)} className={cn("flex flex-col gap-2 h-20 rounded-2xl border-border/40", atmosphericBackground && "bg-amber-500/10 border-amber-500/20")}>
                  <Wand2 className={cn(atmosphericBackground ? "text-amber-500" : "text-muted-foreground")} />
                  <span className="text-xs font-naskh">تأثيرات جوية</span>
                </Button>

                <Button variant="outline" onClick={() => { setIsQuizOpen(true); }} className="flex flex-col gap-2 h-20 rounded-2xl border-border/40">
                  <Trophy className="text-accent" />
                  <span className="text-xs font-naskh">اختبار الحفظ</span>
                </Button>

                <Button variant="outline" onClick={onToggleSourceSelector} className="flex flex-col gap-2 h-20 rounded-2xl border-border/40">
                  <Server className="text-accent" />
                  <span className="text-xs font-naskh">مصدر الصور</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="h-5 md:h-6 w-px bg-border/40 mx-0.5 md:mx-1" />
          
          <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
            <ShareButton juzNumber={juzNumber} currentPage={currentPage} />
          </div>

          {/* Quick Hifz Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleHifzMode(); }}
            className={cn("toolbar-btn !p-1.5 md:!p-2.5 transition-all active:scale-90", hifzMode && "text-accent bg-accent/10")}
            title="وضع الحفظ"
          >
            <GraduationCap className="size-[16px] md:size-[20px]" strokeWidth={1.5} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onSaveBookmark(); }}
            className={`toolbar-btn !p-1.5 md:!p-2.5 transition-all active:scale-90 ${bookmarked ? "text-accent" : ""}`}
            title="حفظ موضع القراءة"
          >
            <Bookmark className="size-[16px] md:size-[20px]" strokeWidth={1.5} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Hifz Quiz Dialog/Sheet */}
      <Sheet open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <SheetContent side="bottom" className="rounded-t-[2.5rem] border-t-accent/20 bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
           <SheetHeader>
             <SheetTitle className="text-right font-serif">اختبار الحفظ</SheetTitle>
             <SheetDescription className="text-right">اختبر حفظك للصفحة الحالية عبر أسئلة ذكية</SheetDescription>
           </SheetHeader>
           <HifzQuizView 
             pageNumber={currentPage} 
             onClose={() => setIsQuizOpen(false)}
             onComplete={(score) => {
               console.log("Quiz completed with score:", score);
             }}
           />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ReadingToolbar;
