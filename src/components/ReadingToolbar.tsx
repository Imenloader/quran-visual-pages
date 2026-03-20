import { ZoomIn, ZoomOut, RotateCcw, Bookmark, BookOpen, List, Moon, Sun, Info, MessageSquareText, Type, FileImage } from "lucide-react";
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
}: ReadingToolbarProps) => {
  const { theme, setTheme, readingMode, setReadingMode } = useTheme();

  const toggleDarkMode = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const toggleReadingMode = () => {
    setReadingMode(readingMode === "image" ? "text" : "image");
  };

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-soft">
      <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Navigation & Index */}
        <div className="flex items-center gap-2">
          <button onClick={onToggleJuzIndex} className="toolbar-btn" title="فهرس الأجزاء">
            <List size={20} strokeWidth={1.5} />
          </button>
          <button onClick={onTogglePageNav} className="toolbar-btn" title="الانتقال لصفحة">
            <BookOpen size={20} strokeWidth={1.5} />
          </button>
          <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/30 text-xs font-serif text-primary">
            <span className="opacity-60">صفحة</span>
            <span className="font-bold">{currentPage}</span>
          </div>
        </div>

        {/* Center: App Title/Logo */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">مصحف المدينة</span>
          <span className="text-xs text-primary font-serif italic">الإصدار الرقمي</span>
        </div>

        {/* Right: Tools & Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleReadingMode}
            className={`toolbar-btn ${readingMode === "text" ? "text-accent bg-accent/10" : ""}`}
            title={readingMode === "text" ? "عرض الصور" : "عرض النص"}
          >
            {readingMode === "text" ? <FileImage size={20} strokeWidth={1.5} /> : <Type size={20} strokeWidth={1.5} />}
          </button>

          <div className="hidden md:flex items-center gap-1 bg-muted/30 rounded-2xl p-1">
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
            onClick={toggleDarkMode}
            className={`toolbar-btn ${theme === "dark" ? "text-accent bg-accent/10" : ""}`}
            title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
          >
            {theme === "dark" ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          </button>
          
          <ShareButton juzNumber={juzNumber} currentPage={currentPage} />
          
          <button
            onClick={onSaveBookmark}
            className={`toolbar-btn ${bookmarked ? "text-accent" : ""}`}
            title="حفظ موضع القراءة"
          >
            <Bookmark size={20} strokeWidth={1.5} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingToolbar;
