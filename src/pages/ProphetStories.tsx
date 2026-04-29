import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  History, 
  Sparkles, 
  Quote,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Lock,
  Unlock
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";
import BackButton from "@/components/BackButton";
import { prophetStories, ProphetStory as LocalProphetStory } from "@/data/prophetStoriesData";
import { useWakeLock } from "@/hooks/useWakeLock";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const ProphetStories = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const { requestWakeLock, releaseWakeLock, isActive } = useWakeLock();
  const [remoteStories, setRemoteStories] = useState<any[]>([]);

  useEffect(() => {
    const fetchRemote = async () => {
      try {
        const q = query(collection(db, "content_prophet_stories"), orderBy("nameAr"));
        const snap = await getDocs(q);
        setRemoteStories(snap.docs.map(d => ({
          ...d.data(),
          docId: d.id,
          // Map remote fields to local format if they differ
          name: d.data().nameAr,
          nameEn: d.data().nameEn,
          title: d.data().era,
          titleEn: d.data().eraEn,
          summary: (d.data().descriptionAr || "").slice(0, 100) + "...",
          summaryEn: (d.data().descriptionEn || "").slice(0, 100) + "...",
          content: d.data().descriptionAr,
          contentEn: d.data().descriptionEn,
          period: d.data().era,
          lessons: [],
          lessonsEn: [],
          quranVerses: []
        })));
      } catch (err) {
        console.error("ProphetStories fetch error:", err);
      }
    };
    fetchRemote();
  }, []);

  const allStories = [...remoteStories, ...prophetStories];

  useEffect(() => {
    if (selectedStory) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [selectedStory, requestWakeLock, releaseWakeLock]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={i18n.language === 'ar' ? "قصص الأنبياء" : "Stories of the Prophets"} 
        subtitle={i18n.language === 'ar' ? "عبر ودروس من حياة خير البشر" : "Lessons and wisdom from the lives of the best of humanity"} 
        variant="compact" 
      />

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="mb-8">
          <BackButton variant="outline" />
        </div>

        {!selectedStory ? (
          <div className="space-y-12">
            {/* Timeline View */}
            <ScrollReveal>
              <div className="relative flex items-center gap-4 overflow-x-auto pb-8 no-scrollbar">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
                {allStories.map((story, idx) => (
                  <div key={story.id} className="relative z-10 flex flex-col items-center min-w-[150px] group">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background mb-4 group-hover:scale-150 transition-transform" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">{story.period}</span>
                    <button 
                      onClick={() => setSelectedStory(story)}
                      className="px-4 py-2 rounded-xl bg-card border border-border font-bold text-sm hover:border-primary hover:text-primary transition-all whitespace-nowrap"
                    >
                      {i18n.language === 'ar' ? story.name : story.nameEn}
                    </button>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allStories.map((story, idx) => (
                <ScrollReveal key={story.id} delay={idx * 0.1}>
                  <div 
                    onClick={() => setSelectedStory(story)}
                    className="p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/40 hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                      <BookOpen size={80} />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold font-serif">{i18n.language === 'ar' ? story.name : story.nameEn}</h3>
                        <p className="text-primary font-bold text-sm">{i18n.language === 'ar' ? story.title : story.titleEn}</p>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {i18n.language === 'ar' ? story.summary : story.summaryEn}
                      </p>
                      <div className="pt-4 flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        {i18n.language === 'ar' ? "اقرأ القصة" : "Read Story"}
                        <ChevronRight size={14} className="rtl:rotate-180" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ) : (
          <div 
            className="space-y-8"
          >
            <button 
              onClick={() => setSelectedStory(null)}
              className="flex items-center gap-2 text-primary font-bold hover:underline"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              {i18n.language === 'ar' ? "العودة للقائمة" : "Back to List"}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-8 space-y-8">
                <div className="p-10 rounded-[3rem] bg-card border border-border shadow-xl space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-bold font-serif">{i18n.language === 'ar' ? selectedStory.name : selectedStory.nameEn}</h2>
                      <p className="text-xl text-primary font-bold">{i18n.language === 'ar' ? selectedStory.title : selectedStory.titleEn}</p>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold animate-pulse">
                        <Lock className="w-3 h-3" />
                        {i18n.language === 'ar' ? "الشاشة لن تنطفئ" : "Screen Stay On"}
                      </div>
                    )}
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed font-serif first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                      {i18n.language === 'ar' ? selectedStory.content : selectedStory.contentEn}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Quote className="w-6 h-6 text-primary" />
                      {i18n.language === 'ar' ? "من القرآن الكريم" : "From the Holy Quran"}
                    </h3>
                    {selectedStory.quranVerses.map((v, i) => (
                      <div key={i} className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                        <p className="font-serif text-xl text-center leading-loose mb-4 italic">"{v.text}"</p>
                        <div className="flex justify-end text-sm font-bold text-primary">
                          {v.surah} - {v.verse}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-primary text-white shadow-xl shadow-primary/20 space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {i18n.language === 'ar' ? "الدروس المستفادة" : "Key Lessons"}
                  </h3>
                  <ul className="space-y-4">
                    {(i18n.language === 'ar' ? selectedStory.lessons : selectedStory.lessonsEn).map((lesson, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="font-medium">{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    {i18n.language === 'ar' ? "الفترة الزمنية" : "Time Period"}
                  </h3>
                  <p className="text-muted-foreground font-medium">{selectedStory.period}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProphetStories;
