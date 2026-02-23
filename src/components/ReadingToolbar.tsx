import { ZoomIn, ZoomOut, RotateCcw, Bookmark, BookOpen, List, Moon, Sun } from "lucide-react";
import { toArabicNumber } from "@/data/quranData";
import ShareButton from "./ShareButton";
import { useState } from "react";

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
  const [isNight, setIsNight] = useState(() => {
    return document.documentElement.classList.contains("night-reading");
  });

  const toggleNightMode = () => {
    const html = document.documentElement;
    if (isNight) {
      // Restore previous theme
      const saved = localStorage.getItem("quran-theme");
      html.classList.remove("dark", "night-reading", "sepia");
      if (saved === "dark") html.classList.add("dark");
      else if (saved === "sepia") html.classList.add("sepia");
      else if (saved !== "night") {
        // was night, revert to dark
        html.classList.add("dark");
        localStorage.setItem("quran-theme", "dark");
      }
      setIsNight(false);
    } else {
      html.classList.remove("sepia");
      html.classList.add("dark", "night-reading");
      localStorage.setItem("quran-theme", "night");
      setIsNight(true);
    }
  };
  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container max-w-4xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-1 sm:gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button onClick={onZoomOut} className="toolbar-btn" title="تصغير">
            <ZoomOut size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={onResetZoom}
            className="toolbar-btn text-xs font-naskh min-w-[2.5rem] sm:min-w-[3rem]"
            title="إعادة الحجم الأصلي"
          >
            {toArabicNumber(zoom)}%
          </button>
          <button onClick={onZoomIn} className="toolbar-btn" title="تكبير">
            <ZoomIn size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        {/* Current page indicator */}
        {currentPage > 0 && (
          <span className="text-xs text-muted-foreground font-naskh hidden sm:block">
            صفحة {toArabicNumber(currentPage)}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={toggleNightMode}
            className={`toolbar-btn ${isNight ? "text-gold bg-gold/10" : ""}`}
            title={isNight ? "إيقاف وضع القراءة الليلية" : "وضع القراءة الليلية"}
          >
            {isNight ? <Sun size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />}
          </button>
          <button onClick={onToggleJuzIndex} className="toolbar-btn" title="فهرس الأجزاء">
            <List size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <ShareButton juzNumber={juzNumber} currentPage={currentPage} />
          <button onClick={onTogglePageNav} className="toolbar-btn" title="الانتقال لصفحة">
            <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            onClick={onSaveBookmark}
            className={`toolbar-btn ${bookmarked ? "text-gold" : ""}`}
            title="حفظ موضع القراءة"
          >
            <Bookmark size={16} className="sm:w-[18px] sm:h-[18px]" fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingToolbar;
