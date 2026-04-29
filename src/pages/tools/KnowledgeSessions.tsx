import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, GraduationCap, Play, Users, MessageSquare, ChevronRight, Book, Sparkles } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";
import { SCHOLARS_DATA, KNOWLEDGE_CATEGORIES, ZAD_ACADEMY_LEVELS, SET_DHIKR } from "@/data/videoData";
import InternalVideoPlayer from "@/components/InternalVideoPlayer";
import ActivityPlanner from "@/components/ActivityPlanner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
            <div className="space-y-6">
              <ScrollReveal>
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-lg font-naskh">أكاديمية زاد - جميع المستويات</h3>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ZAD_ACADEMY_LEVELS.map((level, idx) => (
                  <ScrollReveal key={level.id} delay={idx * 100}>
                    <div className="bg-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-24 h-24" />
                      </div>
                      <div className="relative z-10 space-y-3">
                        <h4 className="text-xl font-bold font-naskh">{level.title}</h4>
                        <p className="text-white/80 text-xs font-naskh leading-relaxed h-8 line-clamp-2">
                          {level.description}
                        </p>
                        <Button 
                          onClick={() => setActiveVideo({ id: level.playlistId, title: `أكاديمية زاد - ${level.title}` })}
                          className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl text-xs font-bold font-naskh mt-2"
                        >
                          عرض المنهج
                        </Button>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            </div>
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
