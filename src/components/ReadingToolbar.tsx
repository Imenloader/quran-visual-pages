import { ZoomIn, ZoomOut, RotateCcw, Bookmark, BookOpen, List, Moon, Sun, Info, MessageSquareText, Type, FileImage, ArrowDown, ArrowRightLeft, Palette, GraduationCap } from "lucide-react";
import { toArabicNumber } from "@/data/quranData";
import ShareButton from "./ShareButton";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

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
}: ReadingToolbarProps) => {
  const { theme, setTheme, readingMode, setReadingMode, scrollDirection, setScrollDirection } = useTheme();

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
    setReadingMode(readingMode === "image" ? "text" : "image");
  };

  const toggleScrollDirection = () => {
    setScrollDirection(scrollDirection === "vertical" ? "horizontal" : "vertical");
  };

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-soft">
      <div className="container max-w-5xl mx-auto px-2 sm:px-4 py-2 md:py-3 flex items-center justify-between gap-2 md:gap-4">
        
        {/* Left: Navigation & Index */}
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={onToggleJuzIndex} className="toolbar-btn !p-2 md:!p-2.5" title="فهرس الأجزاء">
            <List className="size-[18px] md:size-[20px]" strokeWidth={1.5} />
          </button>
          <button onClick={onTogglePageNav} className="toolbar-btn !p-2 md:!p-2.5" title="الانتقال لصفحة">
            <BookOpen className="size-[18px] md:size-[20px]" strokeWidth={1.5} />
          </button>
          <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/30 text-xs font-serif text-primary">
            <span className="text-muted-foreground">صفحة</span>
            <span className="font-bold">{currentPage}</span>
          </div>
        </div>

        {/* Center: App Title/Logo - Hidden on very small screens to save space */}
        <div className="hidden xs:flex flex-col items-center">
          <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-accent uppercase">مصحف المدينة</span>
          <span className="text-[10px] md:text-xs text-primary font-serif italic">الإصدار الرقمي</span>
        </div>

        {/* Right: Tools & Settings */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={toggleReadingMode}
            className={`toolbar-btn !p-2 md:!p-2.5 ${readingMode === "text" ? "text-accent bg-accent/10" : ""}`}
            title={readingMode === "text" ? "عرض الصور" : "عرض النص"}
          >
            {readingMode === "text" ? <FileImage className="size-[18px] md:size-[20px]" strokeWidth={1.5} /> : <Type className="size-[18px] md:size-[20px]" strokeWidth={1.5} />}
          </button>

          <button
            onClick={onToggleHifzMode}
            className={`toolbar-btn !p-2 md:!p-2.5 ${hifzMode ? "text-accent bg-accent/10" : ""}`}
            title="وضع التحفيظ والمراجعة"
          >
            <GraduationCap className="size-[18px] md:size-[20px]" strokeWidth={1.5} />
          </button>

          <button
            onClick={toggleScrollDirection}
            className={`toolbar-btn !p-2 md:!p-2.5 ${scrollDirection === "horizontal" ? "text-accent bg-accent/10" : ""}`}
            title={scrollDirection === "horizontal" ? "التمرير الرأسي" : "التمرير الأفقي"}
          >
            {scrollDirection === "horizontal" ? <ArrowRightLeft className="size-[18px] md:size-[20px]" strokeWidth={1.5} /> : <ArrowDown className="size-[18px] md:size-[20px]" strokeWidth={1.5} />}
          </button>

          <div className="hidden lg:flex items-center gap-1 bg-muted/30 rounded-2xl p-1">
            <button onClick={onZoomOut} className="toolbar-btn !p-1.5" title="تصغير">
              <ZoomOut size={16} strokeWidth={1.5} />
            </button>
            <button onClick={onResetZoom} className="px-2 text-[10px] font-serif font-bold text-primary/60">
              {toArabicNumber(zoom)}%
            </button>
            <button onClick={onZoomIn} className="toolbar-btn !p-1.5" title="تكبير">
              <ZoomIn size={16} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />
          
          <button
            onClick={toggleTheme}
            className={`toolbar-btn !p-2 md:!p-2.5 ${theme !== "light" ? "text-accent bg-accent/10" : ""}`}
            title="تغيير المظهر"
          >
            {theme === "dark" ? <Moon className="size-[18px] md:size-[20px]" strokeWidth={1.5} /> : theme === "sepia" ? <Palette className="size-[18px] md:size-[20px]" strokeWidth={1.5} /> : <Sun className="size-[18px] md:size-[20px]" strokeWidth={1.5} />}
          </button>
          
          <div className="hidden sm:block">
            <ShareButton juzNumber={juzNumber} currentPage={currentPage} />
          </div>
          
          <button
            onClick={onSaveBookmark}
            className={`toolbar-btn !p-2 md:!p-2.5 ${bookmarked ? "text-accent" : ""}`}
            title="حفظ موضع القراءة"
          >
            <Bookmark className="size-[18px] md:size-[20px]" strokeWidth={1.5} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingToolbar;
