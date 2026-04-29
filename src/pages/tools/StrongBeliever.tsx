import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dumbbell, Play, Heart, Flame, Timer, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import BackButton from "@/components/BackButton";
import ScrollReveal from "@/components/ScrollReveal";
import { FITNESS_CATEGORIES, SET_DHIKR } from "@/data/videoData";
import { EXERCISES, NUTRITION_RECIPES, Exercise, Recipe } from "@/data/fitnessData";
import ExerciseModal from "@/components/ExerciseModal";
import ActivityPlanner from "@/components/ActivityPlanner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const StrongBeliever = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [activeItem, setActiveItem] = useState<Exercise | Recipe | null>(null);

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
              {/* Individual Exercises for Home */}
              {selectedCategory === 'home' && EXERCISES.map((exercise, idx) => (
                <ScrollReveal key={exercise.id} delay={idx * 100}>
                  <div className="bg-card border border-border/40 rounded-[2.5rem] p-6 hover:border-accent/30 transition-all shadow-sm flex flex-col gap-5 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-accent/10 transition-colors" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 overflow-hidden flex items-center justify-center p-2 border border-border/40 group-hover:border-accent/30 transition-all shrink-0 shadow-inner">
                          <img 
                            src={exercise.image} 
                            alt={exercise.name} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-widest mb-2 inline-block">
                            {exercise.difficulty}
                          </span>
                          <h3 className="font-bold font-naskh text-lg truncate text-foreground">{exercise.name}</h3>
                          <p className="text-xs text-muted-foreground font-naskh truncate">{exercise.target}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          toast.info('قل "بسم الله" وابدأ!');
                          setActiveItem(exercise);
                        }}
                        className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-110 transition-transform shrink-0"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}

              {/* Nutrition/Health Advice */}
              {selectedCategory === 'nutrition' && NUTRITION_RECIPES.map((recipe, idx) => (
                <ScrollReveal key={recipe.id} delay={idx * 100}>
                  <div className="bg-card border border-border/40 rounded-[2rem] p-6 hover:border-emerald-500/30 transition-all shadow-sm flex flex-col gap-4 h-full">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                          <Heart className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="font-bold font-naskh text-base mb-1">{recipe.title}</h3>
                        <p className="text-xs text-muted-foreground font-naskh leading-relaxed line-clamp-2">
                          {recipe.content}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveItem(recipe)}
                      className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs font-naskh flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all mt-auto"
                    >
                      <BookOpen className="w-4 h-4" />
                      قراءة الوصفة / النصيحة
                    </button>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Set Dhikr Integration */}
            <ScrollReveal>
              <div className="bg-emerald-900 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-950/20">
                <div className="absolute inset-0 pattern-islamic opacity-[0.05] scale-150" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-gold" />
                      <h3 className="font-bold text-2xl font-naskh">أذكار بين المجموعات</h3>
                    </div>
                    <p className="text-emerald-100/70 text-sm font-naskh leading-relaxed max-w-lg">
                      استغل وقت الراحة في ذكر الله لتنال أجر القوة وأجر الذكر معاً.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SET_DHIKR.map((dhikr, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-[2rem] flex items-center justify-between group hover:bg-white/20 transition-all">
                        <div className="min-w-0">
                          <p className="font-bold text-base font-naskh text-white mb-1 truncate">{dhikr.text}</p>
                          <p className="text-[10px] text-emerald-100/60 font-naskh truncate">{dhikr.benefit}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gold/20 text-gold flex flex-col items-center justify-center shrink-0 border border-gold/20 shadow-lg">
                          <span className="text-xs font-bold leading-none">{dhikr.count}</span>
                          <span className="text-[8px] uppercase tracking-tighter mt-1 opacity-60">مرة</span>
                        </div>
                      </div>
                    ))}
                  </div>
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

      {/* Details Modal */}
      {activeItem && (
        <ExerciseModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      )}
    </div>
  );
};

export default StrongBeliever;
