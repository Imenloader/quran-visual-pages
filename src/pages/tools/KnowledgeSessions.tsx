import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap, Play, Users, ChevronRight, Book, Sparkles } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";
import { SCHOLARS_DATA, ZAD_ACADEMY_LEVELS } from "@/data/videoData";
import ActivityPlanner from "@/components/ActivityPlanner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const KnowledgeSessions = () => {
  const { t } = useTranslation();
  const openYouTubeLink = (url: string) => {
    window.open(url, "_blank");
    toast.success("يتم الآن الانتقال إلى يوتيوب");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background pb-24">
      <QuranHeader 
        title="جلسات علمية" 
        subtitle="مَن سلك طريقًا يلتمس فيه علمًا سهَّل الله له طريقًا إلى الجنة" 
        variant="compact" 
      />
      
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <header className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="h-10 w-[1px] bg-border/40" />
          <p className="text-sm text-muted-foreground font-naskh">دليل القنوات الإسلامية</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCHOLARS_DATA.map((scholar, idx) => (
                  <div
                    key={scholar.id}
                    onClick={() => openYouTubeLink(scholar.channelUrl)}
                    className="group relative p-6 bg-card border border-border/40 rounded-[2.5rem] hover:border-accent/30 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
                    
                    <div className="flex flex-col gap-5 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 overflow-hidden border border-border/40 group-hover:border-accent/30 transition-all shadow-inner shrink-0 flex items-center justify-center">
                          {scholar.thumbnail ? (
                            <img src={scholar.thumbnail} alt={scholar.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-accent bg-accent/5">
                              {scholar.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-accent/5 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-xl font-naskh mb-2 text-foreground group-hover:text-accent transition-colors">{scholar.name}</h4>
                        <p className="text-xs text-muted-foreground font-naskh leading-relaxed line-clamp-2">
                          {scholar.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                        <span>زيارة القناة</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Academy Section */}
            <div className="space-y-6">
              <ScrollReveal>
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-lg font-naskh">أكاديمية زاد</h3>
                </div>
              </ScrollReveal>

              {ZAD_ACADEMY_LEVELS.map((level) => (
                <ScrollReveal key={level.id}>
                  <div 
                    onClick={() => openYouTubeLink(level.url)}
                    className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg group cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold font-naskh">{level.title}</h4>
                        <p className="text-white/80 text-sm font-naskh max-w-md">
                          {level.description}
                        </p>
                      </div>
                      <Button 
                        className="bg-white text-indigo-600 hover:bg-white/90 rounded-2xl px-8 font-bold font-naskh"
                      >
                        عرض القناة
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
...

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
    </div>
  );
};

export default KnowledgeSessions;
