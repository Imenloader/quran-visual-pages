import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { juzData, toArabicNumber } from "@/data/quranData";
import JuzCard from "@/components/JuzCard";
import QuranHeader from "@/components/QuranHeader";
import { Search, Bookmark, Moon, Sun } from "lucide-react";

const BOOKMARK_KEY = "quran-bookmark";

interface BookmarkData {
  juz: number;
  page: number;
}

const getBookmark = (): BookmarkData | null => {
  try {
    const data = localStorage.getItem(BOOKMARK_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const navigate = useNavigate();
  const bookmark = getBookmark();

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return juzData;
    const q = searchQuery.trim();
    // Search by number or name or surah
    return juzData.filter(
      (juz) =>
        juz.number.toString().includes(q) ||
        juz.nameAr.includes(q) ||
        juz.startSurah.includes(q) ||
        toArabicNumber(juz.number).includes(q)
    );
  }, [searchQuery]);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("quran-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("quran-theme", "light");
    }
  };

  const handleResumeReading = () => {
    if (bookmark) {
      navigate(`/juz/${bookmark.juz}#page-${bookmark.page}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <QuranHeader />

      <main className="container max-w-5xl mx-auto px-4 py-6">
        {/* Top bar: search + dark mode + bookmark */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن جزء أو سورة..."
              className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm font-naskh text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Resume bookmark */}
            {bookmark && (
              <button
                onClick={handleResumeReading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-naskh hover:opacity-90 transition-opacity"
              >
                <Bookmark size={16} />
                <span>
                  استئناف - صفحة {toArabicNumber(bookmark.page)}
                </span>
              </button>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Results */}
        {filteredJuz.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-naskh">
            لا توجد نتائج للبحث "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredJuz.map((juz, index) => (
              <JuzCard key={juz.number} juz={juz} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-muted-foreground text-sm font-naskh border-t border-border">
        القرآن الكريم - مصحف المدينة المنورة
      </footer>
    </div>
  );
};

export default Index;
