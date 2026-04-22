import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Share2, 
  Copy,
  Filter,
  Book,
  Shield,
  X,
  ExternalLink,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import { toast } from "sonner";
import QuranHeader from "@/components/QuranHeader";
import { toArabicNumber } from "@/data/quranData";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/hooks/useFavorites";
import { useTheme } from "@/contexts/ThemeContext";
import FontSizeAdjuster from "@/components/FontSizeAdjuster";

interface HadithBook {
  id: string;
  name: string;
  available: number;
}

interface HadithItem {
  number: number;
  arab: string;
  id: string;
}

const bookNamesAr: Record<string, string> = {
  "bukhari": "صحيح البخاري",
  "muslim": "صحيح مسلم",
  "tirmidzi": "سنن الترمذي",
  "nasai": "سنن النسائي",
  "abu-daud": "سنن أبي داود",
  "ibnu-majah": "سنن ابن ماجه",
  "ahmad": "مسند أحمد",
  "darimi": "سنن الدارمي",
  "malik": "موطأ مالك"
};

const getHadithGrade = (bookId: string) => {
  if (bookId === "bukhari" || bookId === "muslim") return "صحيح";
  if (bookId === "malik") return "صحيح (موطأ)";
  return "انظر الحاشية"; // Default for others as API doesn't provide per-hadith grade
};

const Hadith = () => {
  const { t, i18n } = useTranslation();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { fontSizes } = useTheme();
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("bukhari");
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [showBookSelector, setShowBookSelector] = useState(false);

  const itemsPerPage = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dorarUrl, setDorarUrl] = useState("");
  const [searchTerms, setSearchTerms] = useState("");

  const fetchBooks = useCallback(async () => {
    try {
      const response = await fetch("https://api.hadith.gading.dev/books");
      const data = await response.json();
      if (data.code === 200) {
        const mappedBooks = data.data.map((book: HadithBook) => ({
          ...book,
          name: i18n.language === 'ar' ? (bookNamesAr[book.id] || book.name) : book.name
        }));
        setBooks(mappedBooks);
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast.error("فشل في تحميل قائمة الكتب");
    }
  }, [i18n.language]);

  const fetchHadiths = useCallback(async (bookId: string, pageNum: number, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const start = (pageNum - 1) * itemsPerPage + 1;
      const end = pageNum * itemsPerPage;
      const response = await fetch(`https://api.hadith.gading.dev/books/${bookId}?range=${start}-${end}`);
      const data = await response.json();
      
      if (data.code === 200) {
        if (isLoadMore) {
          setHadiths(prev => [...prev, ...data.data.hadiths]);
        } else {
          setHadiths(data.data.hadiths);
          setTotalAvailable(data.data.available);
        }
      }
    } catch (error) {
      console.error("Failed to fetch hadiths:", error);
      toast.error("فشل في تحميل الأحاديث");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    fetchHadiths(selectedBook, 1);
    setPage(1);
  }, [selectedBook, fetchHadiths]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHadiths(selectedBook, nextPage, true);
  };

  const copyHadith = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الحديث");
  };

  const shareHadith = async (hadith: HadithItem) => {
    const bookName = bookNamesAr[selectedBook] || selectedBook;
    const shareText = `${hadith.arab}\n\n[${bookName} - حديث رقم ${toArabicNumber(hadith.number)}]`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `حديث نبوي - ${bookName}`,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Share failed:", err);
        }
      }
    } else {
      copyHadith(shareText);
    }
  };

  const verifyOnDorar = (text: string) => {
    // Remove diacritics (Tashkeel) and punctuation for better search matching
    const noTashkeel = text.replace(/[\u064B-\u065F\u0640]/g, "").replace(/[^\u0600-\u06FF\s]/g, " ");
    
    // Try to find the start of the Matn (the actual Hadith text)
    // We look for the last "قال" or "يقول" or "سمعت" in the first 70% of the text
    const searchLimit = Math.floor(noTashkeel.length * 0.7);
    const prefix = noTashkeel.substring(0, searchLimit);
    
    // Common markers for the end of Isnad (narrator chain)
    const markers = ["قال رسول الله", "قال النبي", "يقول", "سمعت", "قال"];
    let lastMarkerIndex = -1;
    let foundMarker = "";

    for (const marker of markers) {
      const idx = prefix.lastIndexOf(marker);
      if (idx > lastMarkerIndex) {
        lastMarkerIndex = idx;
        foundMarker = marker;
      }
    }

    let matn = noTashkeel;
    if (lastMarkerIndex !== -1) {
      // Start after the marker
      matn = noTashkeel.substring(lastMarkerIndex + foundMarker.length);
    }

    // Clean up common honorifics
    const finalCleaned = matn
      .replace(/صلى الله عليه وسلم/g, "")
      .replace(/عليه الصلاة والسلام/g, "")
      .replace(/رسول الله/g, "")
      .replace(/النبي/g, "")
      .replace(/عليه السلام/g, "")
      .replace(/رضي الله عنهم/g, "")
      .replace(/رضي الله عنها/g, "")
      .replace(/رضي الله عنه/g, "")
      .trim();

    // If cleaning made it too short, fallback to original
    const queryBase = finalCleaned.length > 15 ? finalCleaned : noTashkeel;
    
    // Take a small chunk of the text (around 4-6 words) to ensure we get matches
    // Longer queries often fail due to slight variations in text between books
    const terms = queryBase.split(/\s+/).filter(w => w.length > 1).slice(0, 5).join(' ');
    
    setSearchTerms(terms);
    updateDorarUrl(terms);
    setIsModalOpen(true);
  };

  const updateDorarUrl = (query: string) => {
    // st=p: Search in Hadith text
    // d[]=1: Search in all books
    const url = `https://dorar.net/hadith/search?q=${encodeURIComponent(query)}&st=p&d[]=1`;
    setDorarUrl(url);
  };

  const filteredHadiths = hadiths.filter(h => 
    (h.arab && h.arab.includes(searchQuery)) || (h.number && h.number.toString().includes(searchQuery))
  );

  const selectedBookName = books.find(b => b.id === selectedBook)?.name || bookNamesAr[selectedBook] || "صحيح البخاري";

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title="الأحاديث النبوية" 
        subtitle="مجموعة شاملة من الأحاديث الصحيحة من الكتب التسعة"
        variant="compact"
      />

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث في الأحاديث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border/40 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-naskh"
            />
          </div>
          <button
            onClick={() => setShowBookSelector(!showBookSelector)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-lg transition-all"
          >
            <Filter size={20} />
            <span>{selectedBookName}</span>
          </button>

          <FontSizeAdjuster context="tafsir" className="md:self-center" />
        </div>

        {/* Book Selector Grid */}
        <AnimatePresence>
          {showBookSelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-3xl border border-border/40">
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book.id);
                      setShowBookSelector(false);
                    }}
                    className={`p-4 rounded-xl text-center transition-all border ${
                      selectedBook === book.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                        : "bg-card hover:bg-muted border-border/40"
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">{book.name}</div>
                    <div className="text-[10px] opacity-60">
                      {toArabicNumber(book.available)} حديث
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hadith List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-naskh">جاري تحميل الأحاديث...</p>
            </div>
          ) : filteredHadiths.length > 0 ? (
            <>
              {filteredHadiths.map((hadith, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={`${selectedBook}-${hadith.number}`}
                  className="bento-card !p-8 space-y-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {toArabicNumber(hadith.number)}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase">
                          {selectedBookName}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-muted-foreground">درجة الحديث:</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedBook === 'bukhari' || selectedBook === 'muslim' 
                              ? "bg-emerald-500/10 text-emerald-600" 
                              : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {getHadithGrade(selectedBook)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleFavorite({
                          type: "hadith",
                          id: hadith.number,
                          bookId: selectedBook,
                          bookName: selectedBookName,
                          text: hadith.arab
                        })}
                        className={`p-2 rounded-lg transition-colors ${
                          isFavorite("hadith", hadith.number) 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                        title={isFavorite("hadith", hadith.number) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                      >
                        {isFavorite("hadith", hadith.number) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                      <button 
                        onClick={() => verifyOnDorar(hadith.arab)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-bold transition-all"
                        title="التحقق من الصحة عبر الدرر السنية"
                      >
                        <Shield size={14} />
                        <span>تحقق من الصحة</span>
                      </button>
                      <button 
                        onClick={() => copyHadith(hadith.arab)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title="نسخ"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={() => shareHadith(hadith)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title="مشاركة"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>

                  <p 
                    className="font-quran leading-loose text-right text-foreground"
                    style={{ fontSize: `${fontSizes.tafsir || 20}px` }}
                  >
                    {hadith.arab}
                  </p>
                </motion.div>
              ))}

              {hadiths.length < totalAvailable && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-3 px-8 py-4 bg-muted hover:bg-muted/80 rounded-2xl font-bold transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ChevronLeft size={20} />
                    )}
                    <span>تحميل المزيد من الأحاديث</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 space-y-4">
              <Book className="w-16 h-16 text-muted/20 mx-auto" />
              <p className="text-muted-foreground font-naskh">لم يتم العثور على أحاديث تطابق بحثك</p>
            </div>
          )}
        </div>
      </div>
      {/* Dorar Verification Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-border"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex flex-col gap-4 bg-card/50 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {i18n.language === 'ar' ? "التحقق من صحة الحديث" : "Verify Hadith Authenticity"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {i18n.language === 'ar' ? "بواسطة موقع الدرر السنية" : "Powered by Dorar.net"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => window.open(dorarUrl, '_blank')}
                      className="p-2 rounded-xl hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
                      title={i18n.language === 'ar' ? "فتح في نافذة جديدة" : "Open in new window"}
                    >
                      <ExternalLink size={20} />
                    </button>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 rounded-xl hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Search Query Editor */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Search size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={searchTerms}
                    onChange={(e) => {
                      setSearchTerms(e.target.value);
                      updateDorarUrl(e.target.value);
                    }}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder={i18n.language === 'ar' ? "عدل نص البحث هنا إذا لم تظهر نتائج..." : "Edit search text if no results appear..."}
                  />
                </div>
              </div>

              {/* Modal Content - Iframe */}
              <div className="flex-1 bg-white relative">
                <iframe 
                  src={dorarUrl} 
                  className="w-full h-full border-none"
                  title="Dorar Verification"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
                
                {/* Loading Indicator for Iframe */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  {i18n.language === 'ar' ? "تنبيه: النتائج تظهر من موقع خارجي" : "Note: Results are from an external site"}
                </p>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  {i18n.language === 'ar' ? "إغلاق" : "Close"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hadith;
