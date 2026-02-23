import { useState } from "react";
import { X } from "lucide-react";
import { toArabicNumber } from "@/data/quranData";

interface PageNavigatorProps {
  pages: number[];
  currentPage: number;
  onGoToPage: (page: number) => void;
  onClose: () => void;
}

const PageNavigator = ({ pages, currentPage, onGoToPage, onClose }: PageNavigatorProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputValue);
    if (pageNum && pages.includes(pageNum)) {
      onGoToPage(pageNum);
    }
  };

  return (
    <div className="sticky top-[calc(0.25rem+2.75rem)] z-20 bg-card border-b border-border shadow-md animate-fade-in">
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-naskh text-sm font-bold text-foreground">الانتقال لصفحة</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Quick input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
          <input
            type="number"
            min={pages[0]}
            max={pages[pages.length - 1]}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`${pages[0]} - ${pages[pages.length - 1]}`}
            className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm font-naskh text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-center"
            dir="ltr"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-naskh hover:opacity-90 transition-opacity"
          >
            انتقال
          </button>
        </form>

        {/* Page grid */}
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1 max-h-32 overflow-y-auto">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onGoToPage(page)}
              className={`text-xs font-naskh py-1 rounded transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {toArabicNumber(page)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageNavigator;
