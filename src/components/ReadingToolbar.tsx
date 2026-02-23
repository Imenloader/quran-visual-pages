import { ZoomIn, ZoomOut, RotateCcw, Bookmark, BookOpen } from "lucide-react";
import { toArabicNumber } from "@/data/quranData";
import ShareButton from "./ShareButton";

interface ReadingToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSaveBookmark: () => void;
  onTogglePageNav: () => void;
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
  currentPage,
  bookmarked,
  juzNumber,
}: ReadingToolbarProps) => {
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
