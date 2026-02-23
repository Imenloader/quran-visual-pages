import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { juzData, toArabicNumber, getQuranPageImageUrl } from "@/data/quranData";
import JuzCard from "@/components/JuzCard";
import JuzIndex from "@/components/JuzIndex";
import QuranHeader from "@/components/QuranHeader";
import { Search, Bookmark, Moon, Sun, List, Download, Headphones, BookOpen, MoonStar, Shield, Loader2, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

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
  const [showIndex, setShowIndex] = useState(false);
  const [downloadAllState, setDownloadAllState] = useState<"idle" | "downloading" | "done">("idle");
  const [downloadAllProgress, setDownloadAllProgress] = useState(0);
  const navigate = useNavigate();
  const bookmark = getBookmark();

  const totalPages = 604;

  const downloadAll = useCallback(async () => {
    if (downloadAllState === "downloading") return;
    setDownloadAllState("downloading");
    setDownloadAllProgress(0);
    let loaded = 0;
    const batchSize = 6;
    for (let i = 1; i <= totalPages; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, totalPages - i + 1) }, (_, k) => i + k);
      await Promise.all(
        batch.map(async (page) => {
          try {
            const res = await fetch(getQuranPageImageUrl(page), { cache: "force-cache" });
            if (res.ok) await res.blob();
          } catch { /* skip */ }
          loaded++;
          setDownloadAllProgress(Math.round((loaded / totalPages) * 100));
        })
      );
    }
    setDownloadAllState("done");
    setTimeout(() => setDownloadAllState("idle"), 5000);
  }, [downloadAllState]);

  const filteredJuz = useMemo(() => {
    if (!searchQuery.trim()) return juzData;
    const q = searchQuery.trim();
    return juzData.filter(
      (juz) =>
        juz.number.toString().includes(q) ||
        juz.nameAr.includes(q) ||
        juz.startSurah.includes(q) ||
        toArabicNumber(juz.number).includes(q) ||
        juz.surahs.some((s) => s.includes(q))
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

  const bookmarkJuzName = bookmark
    ? juzData.find((j) => j.number === bookmark.juz)?.nameAr
    : null;

  return (
    <div className="min-h-screen bg-background">
      <QuranHeader />

      {/* Quick action buttons in header area */}
      <div className="container max-w-5xl mx-auto px-4 -mt-5 relative z-10 mb-2">
        <div className="grid grid-cols-5 gap-2">
          <Link
            to="/recitations"
            className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl px-1 py-3 hover:shadow-islamic hover:border-gold/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-full gradient-islamic flex items-center justify-center">
              <Headphones size={16} className="text-primary-foreground" />
            </div>
            <span className="font-naskh text-[10px] sm:text-xs font-bold text-foreground group-hover:text-gold transition-colors text-center leading-tight">التلاوات</span>
          </Link>
          <Link
            to="/athkar"
            className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl px-1 py-3 hover:shadow-islamic hover:border-gold/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center">
              <Shield size={16} className="text-foreground" />
            </div>
            <span className="font-naskh text-[10px] sm:text-xs font-bold text-foreground group-hover:text-gold transition-colors text-center leading-tight">الأذكار</span>
          </Link>
          <Link
            to="/embed/quraaniat"
            className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl px-1 py-3 hover:shadow-islamic hover:border-gold/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-full gradient-islamic flex items-center justify-center">
              <BookOpen size={16} className="text-primary-foreground" />
            </div>
            <span className="font-naskh text-[10px] sm:text-xs font-bold text-foreground group-hover:text-gold transition-colors text-center leading-tight">ختم القرآن</span>
          </Link>
          <Link
            to="/embed/qiyam"
            className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl px-1 py-3 hover:shadow-islamic hover:border-gold/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center">
              <MoonStar size={16} className="text-foreground" />
            </div>
            <span className="font-naskh text-[10px] sm:text-xs font-bold text-foreground group-hover:text-gold transition-colors text-center leading-tight">قيام الليل</span>
          </Link>
          <Link
            to="/install"
            className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-xl px-1 py-3 hover:shadow-islamic hover:border-gold/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-full gradient-islamic flex items-center justify-center">
              <Download size={16} className="text-primary-foreground" />
            </div>
            <span className="font-naskh text-[10px] sm:text-xs font-bold text-foreground group-hover:text-gold transition-colors text-center leading-tight">تثبيت</span>
          </Link>
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-4">
        {/* Bookmark resume banner */}
        {bookmark && (
          <button
            onClick={handleResumeReading}
            className="w-full mb-4 flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 text-right hover:bg-primary/15 transition-colors group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-islamic shrink-0">
              <Bookmark size={18} className="text-primary-foreground" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-naskh text-sm font-bold text-foreground">أكمل القراءة</p>
              <p className="text-xs text-muted-foreground font-naskh">
                {bookmarkJuzName} - صفحة {toArabicNumber(bookmark.page)}
              </p>
            </div>
            <span className="text-xs text-primary font-naskh group-hover:underline shrink-0">
              استئناف ←
            </span>
          </button>
        )}

        {/* Top bar: search + actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن جزء أو سورة..."
              className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm font-naskh text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIndex(true)}
              className="flex items-center gap-2 bg-card border border-border px-4 py-2.5 rounded-lg text-sm font-naskh text-foreground hover:bg-muted transition-colors"
            >
              <List size={16} />
              <span className="hidden sm:inline">الفهرس</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Download All Button */}
        <button
          onClick={downloadAll}
          disabled={downloadAllState === "downloading"}
          className={`w-full mb-4 flex items-center gap-3 border rounded-xl px-4 py-3 transition-all font-naskh text-sm ${
            downloadAllState === "done"
              ? "bg-primary/10 border-primary/30 text-primary"
              : downloadAllState === "downloading"
              ? "bg-gold/10 border-gold/30 text-foreground"
              : "bg-card border-border text-foreground hover:border-gold/50 hover:shadow-islamic"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            downloadAllState === "done" ? "bg-primary/20" : "gradient-gold"
          }`}>
            {downloadAllState === "downloading" ? (
              <Loader2 size={18} className="animate-spin text-foreground" />
            ) : downloadAllState === "done" ? (
              <Check size={18} className="text-primary" />
            ) : (
              <Download size={18} className="text-foreground" />
            )}
          </div>
          <div className="flex-1 text-right min-w-0">
            <p className="font-bold">
              {downloadAllState === "done"
                ? "✓ تم تحميل المصحف كاملاً"
                : downloadAllState === "downloading"
                ? `جاري التحميل... ${downloadAllProgress}%`
                : "تحميل المصحف كاملاً للأوفلاين"}
            </p>
            <p className="text-xs text-muted-foreground">
              {downloadAllState === "downloading"
                ? `${Math.round((downloadAllProgress / 100) * 604)} من 604 صفحة`
                : "604 صفحة - للقراءة بدون إنترنت"}
            </p>
          </div>
        </button>

        {/* Download progress bar */}
        {downloadAllState === "downloading" && (
          <div className="w-full mb-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-gold transition-all duration-300 rounded-full"
              style={{ width: `${downloadAllProgress}%` }}
            />
          </div>
        )}

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

      <footer className="text-center py-6 text-muted-foreground text-sm font-naskh border-t border-border">
        القرآن الكريم - مصحف المدينة المنورة
      </footer>

      {showIndex && <JuzIndex onClose={() => setShowIndex(false)} />}
    </div>
  );
};

export default Index;
