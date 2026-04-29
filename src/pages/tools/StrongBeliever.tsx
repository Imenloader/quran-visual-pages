import { FITNESS_CATEGORIES, FITNESS_PLAYLISTS, EXERCISES, NUTRITION_TIPS, SET_DHIKR } from "@/data/videoData";
import InternalVideoPlayer from "@/components/InternalVideoPlayer";
import ActivityPlanner from "@/components/ActivityPlanner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
          <p className="text-sm text-muted-foreground font-naskh">تطبيق اللياقة الإسلامي</p>
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
                    <span className="text-[10px] font-bold uppercase tracking-wider">نِيّة اليوم</span>
                  </div>
                  <h2 className="text-3xl font-bold font-naskh">ابتدئ تمرينك بـ "بسم الله"</h2>
                  <p className="text-white/80 max-w-md text-sm leading-relaxed font-naskh">
                    اجعل تمرينك عبادة باستحضار النية لتقوية بدنك على طاعة الله.
                  </p>
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
                        onClick={() => {
                          toast.info('قل "بسم الله" وابدأ!');
                          setActiveVideo({ id: exercise.videoId, title: exercise.name });
                        }}
                        className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                    </div>
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
            </div>

            {/* Set Dhikr Integration */}
            <ScrollReveal>
              <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h3 className="font-bold text-xl font-naskh">أذكار بين المجموعات (بين الجلسات)</h3>
                </div>
                <p className="text-sm text-muted-foreground font-naskh italic">استغل وقت الراحة في ذكر الله لتنال أجر القوة وأجر الذكر.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SET_DHIKR.map((dhikr, idx) => (
                    <div key={idx} className="bg-card p-4 rounded-2xl border border-border/40 flex items-center justify-between group hover:border-primary/30 transition-all">
                      <div>
                        <p className="font-bold text-sm font-naskh text-primary">{dhikr.text}</p>
                        <p className="text-[10px] text-muted-foreground font-naskh mt-1">{dhikr.benefit}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {dhikr.count}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
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
