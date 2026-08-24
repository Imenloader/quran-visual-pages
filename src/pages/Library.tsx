import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Library as LibraryIcon, 
  Search, 
  Book, 
  Download, 
  Eye, 
  Filter, 
  Loader2,
  BookOpen,
  Bookmark,
  Star,
  Clock,
  ArrowRight,
  X,
  Globe,
  Languages,
  ChevronLeft
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";
import BackButton from "@/components/BackButton";

interface BookData {
  identifier: string;
  title: string;
  creator?: string;
  date?: string;
  description?: string;
  subject?: string[];
  thumbnail?: string;
  language?: string;
}

const CATEGORIES = [
  { id: "all", name: "الكل", nameEn: "All" },
  { id: "tafsir", name: "التفسير", nameEn: "Tafsir", query: "(subject:tafsir OR subject:تفسير)" },
  { id: "hadith", name: "الحديث", nameEn: "Hadith", query: "(subject:hadith OR subject:حديث)" },
  { id: "fiqh", name: "الفقه", nameEn: "Fiqh", query: "(subject:fiqh OR subject:فقه)" },
  { id: "seerah", name: "السيرة", nameEn: "Seerah", query: "(subject:seerah OR subject:سيرة)" },
  { id: "aqidah", name: "العقيدة", nameEn: "Aqidah", query: "(subject:aqidah OR subject:عقيدة)" },
  { id: "history", name: "التاريخ", nameEn: "History", query: "(subject:history OR subject:تاريخ)" },
];

const PROVIDERS = [
  { id: "all", name: "المكتبة الشاملة", nameEn: "Universal Library", filter: "(subject:islam OR subject:quran OR subject:hadith)" },
  { id: "noor", name: "مكتبة نور", nameEn: "Noor Book", filter: "(collection:noor-book OR subject:\"Noor Book\" OR subject:\"مكتبة نور\")" },
  { id: "hindawi", name: "مؤسسة هنداوي", nameEn: "Hindawi Foundation", filter: "(collection:hindawi_foundation OR collection:hindawi-foundation OR subject:\"Hindawi Foundation\" OR creator:\"Hindawi Foundation\")" },
  { id: "shamela", name: "المكتبة الشاملة (PDF)", nameEn: "Shamela (PDF)", filter: "(collection:shamela OR subject:\"Shamela\" OR subject:\"المكتبة الشاملة\")" },
  { id: "sunnah", name: "كتب السنة", nameEn: "Hadith Library", filter: "(subject:hadith OR subject:\"كتب الحديث\" OR subject:sunnah)" },
  { id: "quran_books", name: "علوم القرآن", nameEn: "Quran Sciences", filter: "(subject:quran OR subject:tafsir OR subject:\"تفسير القرآن\")" },
];

const LANGUAGES = [
  { id: "all", name: "جميع اللغات", nameEn: "All Languages" },
  { id: "ar", name: "العربية", nameEn: "Arabic" },
  { id: "en", name: "English", nameEn: "English" },
];

const Library = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLanguage, setActiveLanguage] = useState("all");
  const [activeProvider, setActiveProvider] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [viewType, setViewType] = useState<"reader" | "download">("reader");

  const fetchBooks = async (query: string = "", category: string = "all", lang: string = "all", provider: string = "all") => {
    setLoading(true);
    setError(null);
    try {
      // Highly restrictive base query for Sunni Islamic content only
      const providerFilter = PROVIDERS.find(p => p.id === provider)?.filter || PROVIDERS[0].filter;
      
      // Exclude non-Islamic and Shia content strictly
      const exclusions = "NOT (subject:shia OR subject:shiite OR subject:rafida OR subject:imami OR subject:ismailia OR subject:zaydiyya OR subject:christianity OR subject:judaism OR subject:hinduism OR subject:buddhism OR subject:atheism OR subject:secularism OR title:shia OR title:shiite OR subject:catholic OR subject:protestant OR subject:orthodox OR subject:bible OR subject:jesus OR subject:church)";
      
      let baseQuery = `(${providerFilter}) AND mediatype:texts AND NOT collection:inlibrary AND ${exclusions}`;
      
      if (lang === "ar") baseQuery += " AND (language:ara OR language:Arabic)";
      else if (lang === "en") baseQuery += " AND (language:eng OR language:English)";
      
      if (category !== "all") {
        const cat = CATEGORIES.find(c => c.id === category);
        if (cat?.query) baseQuery = `${cat.query} AND (${baseQuery})`;
      }
      
      if (query) {
        const sanitizedQuery = query.replace(/[^\w\s\u0600-\u06FF]/gi, '');
        baseQuery = `(${baseQuery}) AND (title:(${sanitizedQuery}) OR creator:(${sanitizedQuery}))`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(baseQuery)}&fl[]=identifier,title,creator,date,description,subject,language&rows=20&page=${page}&output=json&sort[]=downloads+desc`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.response && data.response.docs) {
        const formattedBooks = data.response.docs
          .map((doc: { 
            identifier: string; 
            title: string; 
            creator?: string | string[]; 
            date?: string; 
            description?: string; 
            subject?: string | string[]; 
            language?: string | string[];
          }) => {
            // Improved language detection
            let detectedLang = "en";
            const langVal = Array.isArray(doc.language) ? doc.language[0] : doc.language;
            
            if (langVal?.toLowerCase().includes("ara") || langVal?.toLowerCase().includes("arabic") || /[\u0600-\u06FF]/.test(doc.title)) {
              detectedLang = "ar";
            }

            // Clean up title (remove common file extensions and internal codes)
            let cleanTitle = doc.title || "";
            
            // If title is missing or looks like an ID, try to make it readable
            if (!cleanTitle || cleanTitle.length < 3 || /^[a-z0-9_-]+$/i.test(cleanTitle)) {
              const readableId = doc.identifier.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              cleanTitle = readableId;
            }

            // Remove common prefixes/suffixes and clean up Arabic titles
            cleanTitle = cleanTitle.replace(/\.(pdf|epub|txt|doc|docx)$/i, "");
            cleanTitle = cleanTitle.replace(/_(\d+)$/, ""); 
            cleanTitle = cleanTitle.replace(/^[0-9]+[-_]/, ""); // Remove leading numbers
            cleanTitle = cleanTitle.replace(/\[.*?\]/g, ""); // Remove bracketed content
            cleanTitle = cleanTitle.trim();

            let cleanCreator = Array.isArray(doc.creator) ? doc.creator.join(", ") : doc.creator || "";
            cleanCreator = cleanCreator.replace(/^[0-9]+[-_]/, "").trim();

            return {
              identifier: doc.identifier,
              title: cleanTitle,
              creator: cleanCreator,
              date: doc.date,
              description: doc.description,
              subject: Array.isArray(doc.subject) ? doc.subject : doc.subject ? [doc.subject] : [],
              language: detectedLang,
              thumbnail: `https://archive.org/services/img/${doc.identifier}`
            };
          })
          .filter((book: BookData) => {
            // Strict client-side exclusion of Shia content just in case
            const forbidden = ["shia", "shiite", "rafida", "imami", "ismailia", "zaydiyya"];
            const titleLower = (book.title || "").toString().toLowerCase();
            const creatorLower = (book.creator || "").toString().toLowerCase();
            const subjectLower = (book.subject || []).join(" ").toLowerCase();
            
            const isShia = forbidden.some(term => 
              titleLower.includes(term) || 
              creatorLower.includes(term) || 
              subjectLower.includes(term)
            );

            if (isShia) return false;

            if (lang === "ar") return book.language === "ar";
            if (lang === "en") return book.language === "en";
            return true;
          });
        setBooks(formattedBooks);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError(i18n.language === 'ar' ? "انتهت مهلة الطلب. يرجى التحقق من اتصالك بالإنترنت." : "Request timed out. Please check your connection.");
      } else {
        setError(error instanceof Error ? error.message : "Failed to fetch books");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(searchQuery, activeCategory, activeLanguage, activeProvider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeLanguage, activeProvider, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBooks(searchQuery, activeCategory, activeLanguage, activeProvider);
  };

  const openReader = (book: BookData) => {
    setSelectedBook(book);
    setViewType("reader");
    setIsReaderOpen(true);
  };

  const openDownload = (book: BookData) => {
    setSelectedBook(book);
    setViewType("download");
    setIsReaderOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={i18n.language === 'ar' ? "المكتبة الإسلامية" : "Islamic Library"} 
        subtitle={i18n.language === 'ar' ? "آلاف الكتب العربية والإنجليزية بين يديك" : "Thousands of Arabic and English books at your fingertips"} 
        variant="compact" 
      />

      <div className="max-w-7xl mx-auto px-4 mt-4">
        <BackButton variant="outline" />
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        {/* Search and Filters */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:max-w-xl group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder={i18n.language === 'ar' ? "ابحث عن كتاب، مؤلف، موضوع..." : "Search for a book, author, topic..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pr-12 pl-6 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg shadow-soft"
              />
            </form>

            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setActiveLanguage(lang.id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeLanguage === lang.id 
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  {i18n.language === 'ar' ? lang.name : lang.nameEn}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full no-scrollbar">
              {PROVIDERS.map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => {
                    setActiveProvider(prov.id);
                    setPage(1);
                  }}
                  className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeProvider === prov.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                      : "bg-card border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  {i18n.language === 'ar' ? prov.name : prov.nameEn}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeCategory === cat.id 
                      ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 shadow-md" 
                      : "bg-muted/30 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  {i18n.language === 'ar' ? cat.name : cat.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-bold animate-pulse">
              {i18n.language === 'ar' ? "جاري البحث في كنوز المعرفة..." : "Searching through treasures of knowledge..."}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{i18n.language === 'ar' ? "حدث خطأ أثناء التحميل" : "Error loading books"}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
            </div>
            <button 
              onClick={() => fetchBooks(searchQuery, activeCategory, activeLanguage)}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
            >
              {i18n.language === 'ar' ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book, idx) => (
              <ScrollReveal key={book.identifier} delay={idx * 0.05}>
                <div 
                  className="group bg-card border border-border/40 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
                    <img 
                      src={book.thumbnail} 
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=500&auto=format&fit=crop";
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        {book.language === 'ar' ? 'العربية' : 'English'}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => openReader(book)}
                          className="w-full h-12 rounded-xl bg-primary text-white flex items-center justify-center gap-2 font-bold hover:bg-primary-hover transition-colors"
                        >
                          <Eye size={18} />
                          {i18n.language === 'ar' ? "قراءة الآن" : "Read Now"}
                        </button>
                        <button 
                          onClick={() => openDownload(book)}
                          className="w-full h-12 rounded-xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center gap-2 font-bold hover:bg-white/20 transition-colors border border-white/10"
                        >
                          <Download size={18} />
                          {i18n.language === 'ar' ? "خيارات التحميل" : "Download Options"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col space-y-3">
                    <h3 className="font-bold font-serif text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[3rem]">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 font-medium">
                      {book.creator || (i18n.language === 'ar' ? "مؤلف غير معروف" : "Unknown Author")}
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <Clock size={12} />
                        {book.date ? new Date(book.date).getFullYear() : "---"}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} className="fill-current" />
                        <span className="text-[10px] font-bold">Free</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 space-y-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
              <BookOpen size={48} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">{i18n.language === 'ar' ? "لا توجد نتائج" : "No results found"}</h3>
              <p className="text-muted-foreground">{i18n.language === 'ar' ? "حاول البحث بكلمات أخرى أو تغيير التصنيف واللغة" : "Try searching with different keywords or changing the category/language"}</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && books.length > 0 && (
          <div className="flex justify-center items-center gap-4 pt-12">
            <button 
              onClick={() => {
                setPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={page === 1}
              aria-label={i18n.language === 'ar' ? "الصفحة السابقة" : "Previous Page"}
              className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </button>
            <div className="px-6 py-3 glass-card rounded-[2rem] font-bold text-lg shadow-sm">
              {i18n.language === 'ar' ? `صفحة ${page}` : `Page ${page}`}
            </div>
            <button 
              onClick={() => {
                setPage(p => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label={i18n.language === 'ar' ? "الصفحة التالية" : "Next Page"}
              className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center hover:bg-muted transition-all shadow-sm"
            >
              <ChevronLeft className="w-6 h-6 rotate-180 rtl:rotate-0" />
            </button>
          </div>
        )}
      </div>

      {isReaderOpen && selectedBook && (
          <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsReaderOpen(false)}
                  aria-label={i18n.language === 'ar' ? "إغلاق" : "Close"}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="max-w-md">
                  <h2 className="text-white font-bold truncate text-sm">{selectedBook.title}</h2>
                  <p className="text-white/50 text-xs truncate">{selectedBook.creator}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setViewType("reader")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewType === "reader" ? "bg-primary text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {i18n.language === 'ar' ? "قراءة" : "Read"}
                </button>
                <button 
                  onClick={() => setViewType("download")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewType === "download" ? "bg-primary text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {i18n.language === 'ar' ? "تحميل" : "Download"}
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-zinc-900">
              <iframe 
                src={viewType === "reader" 
                  ? `https://archive.org/embed/${selectedBook.identifier}?ui=full` 
                  : `https://archive.org/details/${selectedBook.identifier}?output=embed`
                } 
                className="w-full h-full border-none"
                allowFullScreen
                title={selectedBook.title}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default Library;
