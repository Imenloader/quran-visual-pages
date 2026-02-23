import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { juzData, toArabicNumber, getQuranPageImageUrl } from "@/data/quranData";
import JuzCard from "@/components/JuzCard";
import JuzIndex from "@/components/JuzIndex";
import QuranHeader from "@/components/QuranHeader";
import { Search, Bookmark, List, Download, Headphones, BookOpen, MoonStar, Shield, Loader2, Check, X, Pause, Play, Settings, Moon, Award } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";

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
  const [showIndex, setShowIndex] = useState(false);
  const [downloadAllState, setDownloadAllState] = useState<"idle" | "downloading" | "paused" | "done">("idle");
  const [downloadAllProgress, setDownloadAllProgress] = useState(0);
  const dlAbortRef = useRef<AbortController | null>(null);
  const dlLoadedRef = useRef(0);
  const [cachingEmbed, setCachingEmbed] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const bookmark = getBookmark();

  const totalPages = 604;

  const downloadAll = useCallback(async () => {
    if (downloadAllState === "downloading") return;
    const startFrom = dlLoadedRef.current;
    setDownloadAllState("downloading");
    const controller = new AbortController();
    dlAbortRef.current = controller;
    let loaded = startFrom;
    setDownloadAllProgress(Math.round((loaded / totalPages) * 100));
    const batchSize = 6;
    try {
      for (let i = startFrom + 1; i <= totalPages; i += batchSize) {
        if (controller.signal.aborted) break;
        const batch = Array.from({ length: Math.min(batchSize, totalPages - i + 1) }, (_, k) => i + k);
        await Promise.all(
          batch.map(async (page) => {
            try {
              const res = await fetch(getQuranPageImageUrl(page), { cache: "force-cache" });
              if (res.ok) await res.blob();
            } catch { /* skip */ }
            loaded++;
            dlLoadedRef.current = loaded;
            setDownloadAllProgress(Math.round((loaded / totalPages) * 100));
          })
        );
      }
      if (!controller.signal.aborted) {
        setDownloadAllState("done");
        dlLoadedRef.current = 0;
        setTimeout(() => setDownloadAllState("idle"), 5000);
      }
    } catch { /* aborted */ }
  }, [downloadAllState]);

  const pauseDownload = useCallback(() => {
    dlAbortRef.current?.abort();
    setDownloadAllState("paused");
  }, []);

  const cacheAndNavigate = useCallback(async (siteId: string, url: string) => {
    setCachingEmbed(prev => ({ ...prev, [siteId]: true }));
    try {
      // Pre-fetch the site to browser cache
      await fetch(url, { mode: "no-cors", cache: "force-cache" }).catch(() => {});
    } catch { /* ignore */ }
    setCachingEmbed(prev => ({ ...prev, [siteId]: false }));
    navigate(`/embed/${siteId}`);
  }, [navigate]);

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

  // removed toggleDarkMode - now handled in Settings page

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
          </div>
        </div>

        {/* Download All Button */}
        <ScrollReveal>
        <div className="w-full mb-4 flex items-center gap-2">
          <button
            onClick={downloadAllState === "downloading" ? pauseDownload : downloadAll}
            className={`flex-1 flex items-center gap-3 border rounded-xl px-4 py-3 transition-all font-naskh text-sm ${
              downloadAllState === "done"
                ? "bg-primary/10 border-primary/30 text-primary"
                : downloadAllState === "downloading"
                ? "bg-gold/10 border-gold/30 text-foreground"
                : downloadAllState === "paused"
                ? "bg-accent border-gold/40 text-foreground"
                : "bg-card border-border text-foreground hover:border-gold/50 hover:shadow-islamic"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              downloadAllState === "done" ? "bg-primary/20" : "gradient-gold"
            }`}>
              {downloadAllState === "downloading" ? (
                <Pause size={18} className="text-foreground" />
              ) : downloadAllState === "done" ? (
                <Check size={18} className="text-primary" />
              ) : downloadAllState === "paused" ? (
                <Play size={18} className="text-foreground" />
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
                  : downloadAllState === "paused"
                  ? `متوقف مؤقتاً - ${downloadAllProgress}%`
                  : "تحميل المصحف كاملاً للأوفلاين"}
              </p>
              <p className="text-xs text-muted-foreground">
                {downloadAllState === "downloading" || downloadAllState === "paused"
                  ? `${Math.round((downloadAllProgress / 100) * 604)} من 604 صفحة`
                  : "604 صفحة - للقراءة بدون إنترنت"}
              </p>
            </div>
          </button>
          {downloadAllState === "paused" && (
            <button
              onClick={() => { dlLoadedRef.current = 0; setDownloadAllProgress(0); setDownloadAllState("idle"); }}
              className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors shrink-0"
              title="إلغاء التحميل"
            >
              <X size={18} />
            </button>
          )}
        </div>
        </ScrollReveal>

        {(downloadAllState === "downloading" || downloadAllState === "paused") && (
          <div className="w-full mb-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-gold transition-all duration-300 rounded-full"
              style={{ width: `${downloadAllProgress}%` }}
            />
          </div>
        )}

        {/* Quick Access Cards */}
        <ScrollReveal className="grid grid-cols-2 gap-3 mb-6">
          <Link
            to="/embed/qiyam"
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-gold/50 hover:shadow-islamic transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Moon size={18} className="text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="font-naskh text-sm font-bold text-foreground">١٠٠ آية</p>
              <p className="text-[11px] text-muted-foreground font-naskh">لقيام الليل</p>
            </div>
          </Link>
          <Link
            to="/embed/khatma"
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-gold/50 hover:shadow-islamic transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Award size={18} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="font-naskh text-sm font-bold text-foreground">ختمة القرآن</p>
              <p className="text-[11px] text-muted-foreground font-naskh">جدول الختمة</p>
            </div>
          </Link>
        </ScrollReveal>

        {/* Results */}
        {filteredJuz.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-naskh">
            لا توجد نتائج للبحث "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredJuz.map((juz, index) => (
              <JuzCard key={juz.number} juz={juz} index={index} isBookmarked={bookmark?.juz === juz.number} />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-6 pb-24 text-muted-foreground text-sm font-naskh border-t border-border">
        القرآن الكريم - مصحف المدينة المنورة
      </footer>

      {showIndex && <JuzIndex onClose={() => setShowIndex(false)} />}
    </div>
  );
};

export default Index;
