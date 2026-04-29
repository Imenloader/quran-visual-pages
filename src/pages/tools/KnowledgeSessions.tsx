import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, GraduationCap, Play, Users, MessageSquare, ChevronRight, Book, Sparkles } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";
import { SCHOLARS_DATA, KNOWLEDGE_CATEGORIES } from "@/data/videoData";
import InternalVideoPlayer from "@/components/InternalVideoPlayer";
import ActivityPlanner from "@/components/ActivityPlanner";

const KnowledgeSessions = () => {
  const { t } = useTranslation();
  const [selectedScholar, setSelectedScholar] = useState(SCHOLARS_DATA[0]);
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title="جلسات علمية" 
        subtitle="مَن سلك طريقًا يلتمس فيه علمًا سهَّل الله له طريقًا إلى الجنة" 
        variant="compact" 
      />
      
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <header className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="h-10 w-[1px] bg-border/40" />
          <p className="text-sm text-muted-foreground font-naskh">طلب العلم الشرعي</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Featured Scholars Horizontal Scroll */}
            <ScrollReveal>
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-lg font-naskh flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    المشايخ والدعاة
                  </h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
                  {SCHOLARS_DATA.map((scholar) => (
                    <button
                      key={scholar.id}
                      onClick={() => setSelectedScholar(scholar)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border min-w-[120px] ${
                        selectedScholar.id === scholar.id
                          ? "bg-accent/10 border-accent/30 shadow-lg shadow-accent/5"
                          : "bg-card border-border/40 hover:border-accent/20"
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                        selectedScholar.id === scholar.id ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {scholar.name[0]}
                      </div>
                      <span className="text-xs font-bold font-naskh whitespace-nowrap">{scholar.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Selected Scholar Series */}
            <div className="space-y-6">
              <ScrollReveal>
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Book className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg font-naskh">سلاسل {selectedScholar.name}</h3>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedScholar.playlists.map((playlist, idx) => (
                  <ScrollReveal key={playlist.id} delay={idx * 100}>
                    <div 
                      className="group p-5 bg-card border border-border/40 rounded-3xl flex items-center justify-between hover:border-accent/30 transition-all cursor-pointer"
                      onClick={() => setActiveVideo({ id: playlist.id, title: playlist.title })}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm font-naskh">{playlist.title}</h4>
                          <p className="text-[10px] text-muted-foreground font-naskh">مشاهدة السلسلة كاملة</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-4px] transition-transform" />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Academy Highlights */}
            <ScrollReveal>
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <GraduationCap className="w-40 h-40" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="px-3 py-1 bg-white/20 rounded-full w-fit backdrop-blur-sm">
                      <Sparkles className="w-4 h-4 text-amber-300 inline mr-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">منهج أكاديمي</span>
                    </div>
                    <h3 className="text-2xl font-bold font-naskh">أكاديمية زاد العلمية</h3>
                    <p className="text-white/80 text-sm font-naskh leading-relaxed">
                      تعلم العلم الشرعي بطريقة منهجية ومبسطة من خلال دروس المستوى الأول في العقيدة، التفسير، الحديث، والفقه.
                    </p>
                    <button 
                      onClick={() => setActiveVideo({ id: 'PL0S_Y1XpM30V_q7Z5z8Q6H1VzYfXy5z8', title: 'أكاديمية زاد - المستوى الأول' })}
                      className="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-xs font-bold font-naskh hover:bg-white/90 transition-colors shadow-lg"
                    >
                      ابدأ التعلم الآن
                    </button>
                  </div>
                  <div className="w-full md:w-48 aspect-video bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <GraduationCap className="w-16 h-16 text-white/40" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar / Planner */}
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal>
              <ActivityPlanner 
                storageKey="knowledge_sessions_planner"
                type="session"
                title="خطة المذاكرة"
              />
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <h4 className="font-bold text-lg font-naskh">قيمة العلم</h4>
                <p className="text-sm font-naskh leading-relaxed text-muted-foreground">
                  "من يرد الله به خيراً يفقهه في الدين"
                </p>
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">— متفق عليه</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Video Player Portal */}
      {activeVideo && (
        <InternalVideoPlayer
          videoId={activeVideo.id}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
};

export default KnowledgeSessions;
