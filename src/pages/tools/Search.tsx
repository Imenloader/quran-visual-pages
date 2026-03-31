import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search as SearchIcon, History, X, Loader2, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getJuzAndPageForSurah, juzData as juzList } from "@/data/quranData";

interface SearchResult {
  text: string;
  surah: {
    number: number;
    name: string;
  };
  numberInSurah: number;
}

interface JuzMatch {
  number: number;
  nameAr: string;
  nameEn: string;
}

const Search = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [surahResults, setSurahResults] = useState<{ number: number; name: string; englishName: string }[]>([]);
  const [juzResults, setJuzResults] = useState<JuzMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeArabic = (text: string) => {
    return text
      .replace(/[\u064B-\u0652]/g, "") // Remove diacritics
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي");
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSurahResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const normalizedQuery = normalizeArabic(query);
        const encodedQuery = encodeURIComponent(query);
        
        // 1. Search in Ayahs
        const ayahPromise = fetch(`https://api.alquran.cloud/v1/search/${encodedQuery}/all/ar.quran-simple`)
          .then(res => res.json());
          
        // 2. Search in Surahs (by fetching all and filtering)
        const surahPromise = fetch(`https://api.alquran.cloud/v1/surah`)
          .then(res => res.json());

        const [ayahData, surahData] = await Promise.all([ayahPromise, surahPromise]);

        if (ayahData.status === "OK") {
          setResults(ayahData.data.matches);
        } else {
          setResults([]);
        }

        if (surahData.status === "OK") {
          const filteredSurahs = surahData.data.filter((s: { name: string; englishName: string; number: number }) => {
            const normalizedSurahName = normalizeArabic(s.name);
            return normalizedSurahName.includes(normalizedQuery) || 
                   s.englishName.toLowerCase().includes(query.toLowerCase()) ||
                   normalizedQuery.includes(normalizedSurahName);
          });
          setSurahResults(filteredSurahs);
        }

        // 3. Search in Juz
        const filteredJuz = juzList.filter(j => {
          const normalizedJuzName = normalizeArabic(j.nameAr);
          return normalizedJuzName.includes(normalizedQuery) || 
                 j.nameEn.toLowerCase().includes(query.toLowerCase()) ||
                 query.includes(j.number.toString());
        });
        setJuzResults(filteredJuz);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const recentSearches = [t("search.surahMatches"), t("search.ayahMatches")]; // Placeholder for recent searches

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/hub")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground shrink-0"
          >
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </button>
          <div className="relative flex-1">
            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              placeholder={t("search.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl py-4 pr-12 pl-12 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        <div className="space-y-8">
          {!query && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-bold font-naskh text-foreground flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  {t("search.recent")}
                </h2>
                <button className="text-[10px] text-accent font-bold font-naskh uppercase tracking-widest">{t("search.clearAll")}</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(s => (
                  <button 
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-naskh text-muted-foreground hover:bg-accent/5 hover:text-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-4"
              >
                <Loader2 className="w-10 h-10 text-emerald-deep animate-spin" />
                <p className="text-sm text-muted-foreground font-naskh animate-pulse">{t("search.searching")}</p>
              </motion.div>
            ) : query && (results.length > 0 || surahResults.length > 0 || juzResults.length > 0) ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {juzResults.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-naskh px-2">{i18n.language === 'ar' ? 'نتائج الأجزاء' : 'Juz Matches'}: {juzResults.length}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {juzResults.map((juz) => (
                        <Link
                          key={juz.number}
                          to={`/juz/${juz.number}`}
                          className="flex items-center justify-between p-4 bg-accent/5 border border-accent/10 rounded-2xl hover:bg-accent/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-bold">
                              {juz.number}
                            </div>
                            <div className="text-right">
                              <p className="font-bold font-naskh text-foreground">{juz.nameAr}</p>
                              <p className="text-[10px] text-muted-foreground">{juz.nameEn}</p>
                            </div>
                          </div>
                          <BookOpen className="w-4 h-4 text-accent" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {surahResults.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-naskh px-2">{t("search.surahMatches")}: {surahResults.length}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {surahResults.map((surah) => {
                        const { juz, page } = getJuzAndPageForSurah(surah.number);
                        return (
                          <Link
                            key={surah.number}
                            to={`/juz/${juz}#page-${page}`}
                            className="flex items-center justify-between p-4 bg-emerald-deep/5 border border-emerald-deep/10 rounded-2xl hover:bg-emerald-deep/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-deep text-white flex items-center justify-center text-xs font-bold">
                                {surah.number}
                              </div>
                              <div className="text-right">
                                <p className="font-bold font-naskh text-foreground">{surah.name}</p>
                                <p className="text-[10px] text-muted-foreground">{surah.englishName}</p>
                              </div>
                            </div>
                            <BookOpen className="w-4 h-4 text-emerald-deep" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-naskh px-2">{t("search.ayahMatches")}: {results.length}</p>
                    {results.slice(0, 50).map((result, idx) => {
                      const { juz, page } = getJuzAndPageForSurah(result.surah.number);
                      return (
                        <motion.div
                          key={`${result.surah.number}-${result.numberInSurah}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="p-4 bg-card border border-border rounded-2xl space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-accent font-naskh bg-accent/5 px-2 py-1 rounded-lg">
                              {result.surah.name} - {t("index.verseOfDay.ayah")} {result.numberInSurah}
                            </span>
                            <Link 
                              to={`/juz/${juz}#page-${page}`}
                              className="text-[10px] text-emerald-deep font-bold"
                            >
                              {t("search.openInQuran")}
                            </Link>
                          </div>
                          <p className="text-sm font-naskh text-foreground leading-loose text-right">
                            {result.text}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : query && query.length >= 2 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground/30">
                  <SearchIcon className="w-8 h-8" />
                </div>
                <p className="text-sm text-muted-foreground font-naskh">{t("search.noResults", { query })}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Search;
