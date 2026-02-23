import { ZoomIn, ZoomOut, RotateCcw, Bookmark, BookOpen } from "lucide-react";
import { toArabicNumber } from "@/data/quranData";

interface ReadingToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSaveBookmark: () => void;
  onTogglePageNav: () => void;
  currentPage: number;
  bookmarked: boolean;
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
}: ReadingToolbarProps) => {
  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="toolbar-btn"
            title="تصغير"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={onResetZoom}
            className="toolbar-btn text-xs font-naskh min-w-[3rem]"
            title="إعادة الحجم الأصلي"
          >
            {toArabicNumber(zoom)}%
          </button>
          <button
            onClick={onZoomIn}
            className="toolbar-btn"
            title="تكبير"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        {/* Current page indicator */}
        {currentPage > 0 && (
          <span className="text-xs text-muted-foreground font-naskh hidden sm:block">
            صفحة {toArabicNumber(currentPage)}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePageNav}
            className="toolbar-btn"
            title="الانتقال لصفحة"
          >
            <BookOpen size={18} />
          </button>
          <button
            onClick={onSaveBookmark}
            className={`toolbar-btn ${bookmarked ? "text-gold" : ""}`}
            title="حفظ موضع القراءة"
          >
            <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingToolbar;
