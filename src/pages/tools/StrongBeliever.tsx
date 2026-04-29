import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dumbbell, Play, Heart, Flame, Timer, ChevronRight } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";
import { FITNESS_CATEGORIES, FITNESS_PLAYLISTS, EXERCISES, NUTRITION_TIPS } from "@/data/videoData";
import InternalVideoPlayer from "@/components/InternalVideoPlayer";
import ActivityPlanner from "@/components/ActivityPlanner";

const StrongBeliever = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

  const filteredPlaylists = FITNESS_PLAYLISTS.filter(p => p.categoryId === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title="المؤمن القوي" 
        subtitle="المؤمن القوي خيرٌ وأحبُّ إلى الله من المؤمن الضعيف" 
        variant="compact" 
      />
      
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <header className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="h-10 w-[1px] bg-border/40" />
          <p className="text-sm text-muted-foreground font-naskh">اللياقة البدنية والتدريب</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Quick Stats/Hero */}
            <ScrollReveal>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-accent p-8 text-white shadow-xl shadow-accent/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Dumbbell className="w-40 h-40" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full w-fit backdrop-blur-sm">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">تحدي اليوم</span>
                  </div>
                  <h2 className="text-3xl font-bold font-naskh">استعد لنشاطك اليومي</h2>
                  <p className="text-white/80 max-w-md text-sm leading-relaxed font-naskh">
                    اختر برنامجك التدريبي المفضل وابدأ رحلة بناء جسم قوي يعينك على طاعة الله.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <div className="flex flex-col items-center p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 min-w-[80px]">
                      <Timer className="w-5 h-5 mb-1" />
                      <span className="text-xs font-bold">٢٠ د</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 min-w-[80px]">
                      <Flame className="w-5 h-5 mb-1" />
                      <span className="text-xs font-bold">٣٠٠ س</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Categories */}
            <ScrollReveal>
              <div className="flex flex-wrap gap-3">
                {FITNESS_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold font-naskh transition-all border ${
                      selectedCategory === cat.id
                        ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                        : "bg-card text-muted-foreground border-border/40 hover:border-accent/30"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* List Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Individual Exercises for Home/Gym */}
              {(selectedCategory === 'home' || selectedCategory === 'gym') && EXERCISES.map((exercise, idx) => (
                <ScrollReveal key={exercise.id} delay={idx * 100}>
                  <div className="bg-card border border-border/40 rounded-[2rem] p-6 hover:border-accent/30 transition-all shadow-sm flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-accent bg-accent/5 px-2 py-1 rounded-lg uppercase tracking-wider mb-2 inline-block">
                          {exercise.difficulty}
                        </span>
                        <h3 className="font-bold font-naskh text-lg">{exercise.name}</h3>
                        <p className="text-xs text-muted-foreground font-naskh">{exercise.target}</p>
                      </div>
                      <button 
                        onClick={() => setActiveVideo({ id: exercise.videoId, title: exercise.name })}
                        className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground font-naskh line-clamp-2 italic">
                      "{exercise.description}"
                    </p>
                  </div>
                </ScrollReveal>
              ))}

              {/* Nutrition/Health Advice */}
              {selectedCategory === 'nutrition' && NUTRITION_TIPS.map((tip, idx) => (
                <ScrollReveal key={tip.id} delay={idx * 100}>
                  <div className="bg-card border border-border/40 rounded-[2rem] p-6 hover:border-emerald-500/30 transition-all shadow-sm flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                          <Heart className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="font-bold font-naskh text-base mb-1">{tip.title}</h3>
                        <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
                          {tip.content}
                        </p>
                      </div>
                    </div>
                    {tip.videoId && (
                      <button 
                        onClick={() => setActiveVideo({ id: tip.videoId, title: tip.title })}
                        className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs font-naskh flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        مشاهدة الشرح / الوصفة
                      </button>
                    )}
                  </div>
                </ScrollReveal>
              ))}

              {/* Playlists (if no specific exercises) */}
              {selectedCategory === 'home' && filteredPlaylists.length > 0 && (
                <div className="col-span-full pt-8">
                  <h3 className="font-bold text-lg font-naskh mb-6 px-2">برامج تدريبية كاملة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPlaylists.map((playlist, idx) => (
                      <ScrollReveal key={playlist.id} delay={idx * 100}>
                        <div 
                          className="group relative bg-card border border-border/40 rounded-[2rem] overflow-hidden hover:border-accent/30 transition-all shadow-sm h-full flex flex-col"
                        >
                          <div className="aspect-video bg-muted relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            <button 
                              onClick={() => setActiveVideo({ id: playlist.id, title: playlist.title })}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 fill-current" />
                              </div>
                            </button>
                          </div>
                          <div className="p-6 space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-2 py-1 rounded-lg">
                                {playlist.channelTitle}
                              </span>
                            </div>
                            <h3 className="font-bold font-naskh text-lg group-hover:text-accent transition-colors">
                              {playlist.title}
                            </h3>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Planner */}
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal>
              <ActivityPlanner 
                storageKey="strong_believer_planner"
                type="workout"
                title="جدول التمارين"
              />
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-4">
                <Heart className="w-8 h-8 text-primary" />
                <h4 className="font-bold text-lg font-naskh">نصيحة نبوية</h4>
                <p className="text-sm font-naskh leading-relaxed text-muted-foreground">
                  "احرص على ما ينفعك، واستعن بالله ولا تعجز"
                </p>
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">— صحيح مسلم</p>
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

export default StrongBeliever;
