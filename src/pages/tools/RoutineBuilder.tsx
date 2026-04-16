import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Zap, 
  Flame, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Moon,
  Sun,
  LayoutGrid
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { storage } from "@/lib/storage";

interface Habit {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  isCompleted: boolean;
}

const defaultHabits: Habit[] = [
  { id: "1", nameEn: "Read 1 Page of Quran", nameAr: "قراءة صفحة من القرآن", icon: "book", isCompleted: false },
  { id: "2", nameEn: "Morning Athkar", nameAr: "أذكار الصباح", icon: "sun", isCompleted: false },
  { id: "3", nameEn: "Evening Athkar", nameAr: "أذكار المساء", icon: "moon", isCompleted: false },
  { id: "4", nameEn: "Give Sadaqah", nameAr: "التصدق بصدقة", icon: "heart", isCompleted: false },
  { id: "5", nameEn: "Pray Tahajjud", nameAr: "صلاة التهجد", icon: "sparkles", isCompleted: false },
];

const RoutineBuilder = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const todayKey = format(new Date(), 'yyyy-MM-dd');

  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [streak, setStreak] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedHabits = await storage.get(`habits-${todayKey}`);
      const userHabits = await storage.get('user-habits-list');
      
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      } else if (userHabits) {
        const list = JSON.parse(userHabits) as Habit[];
        setHabits(list.map((h: Habit) => ({ ...h, isCompleted: false })));
      } else {
        setHabits(defaultHabits);
        await storage.set('user-habits-list', JSON.stringify(defaultHabits));
      }

      const savedStreak = await storage.get('routine-streak');
      setStreak(savedStreak ? parseInt(savedStreak) : 5);
      setIsLoaded(true);
    };
    loadData();
  }, [todayKey]);

  const toggleHabit = async (id: string) => {
    const updated = habits.map(h => 
      h.id === id ? { ...h, isCompleted: !h.isCompleted } : h
    );
    setHabits(updated);
    await storage.set(`habits-${todayKey}`, JSON.stringify(updated));
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      nameEn: newHabitName,
      nameAr: newHabitName,
      icon: "zap",
      isCompleted: false
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    await storage.set('user-habits-list', JSON.stringify(updated.map(h => ({ ...h, isCompleted: false }))));
    await storage.set(`habits-${todayKey}`, JSON.stringify(updated));
    setNewHabitName("");
  };

  const removeHabit = async (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    await storage.set('user-habits-list', JSON.stringify(updated.map(h => ({ ...h, isCompleted: false }))));
    await storage.set(`habits-${todayKey}`, JSON.stringify(updated));
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "book": return <BookOpen className="w-5 h-5" />;
      case "sun": return <Sun className="w-5 h-5" />;
      case "moon": return <Moon className="w-5 h-5" />;
      case "heart": return <Heart className="w-5 h-5" />;
      case "sparkles": return <Sparkles className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const progress = habits.length > 0 
    ? Math.round((habits.filter(h => h.isCompleted).length / habits.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "مخطط الروتين الروحاني" : "Spiritual Routine Builder"} 
        subtitle={isAr ? "ابنِ عاداتك اليومية وداوم على الطاعات" : "Build your daily habits and maintain acts of worship"}
        variant="compact"
      />

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-8">
        {/* Streak & Progress Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 bento-card !p-8 bg-orange-500 text-white flex flex-col items-center justify-center text-center overflow-hidden relative group">
            <div className="absolute inset-0 pattern-islamic opacity-10 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Flame className="w-10 h-10 fill-current" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">{isAr ? "سلسلة الإنجاز" : "Current Streak"}</p>
              <p className="text-5xl font-bold">{streak} {isAr ? "أيام" : "Days"}</p>
            </div>
          </div>

          <div className="md:col-span-8 bento-card !p-8 flex flex-col justify-center space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-naskh">{isAr ? "إنجاز اليوم" : "Today's Progress"}</h3>
                <p className="text-muted-foreground text-sm">
                  {isAr 
                    ? `لقد أتممت ${habits.filter(h => h.isCompleted).length} من أصل ${habits.length} عادات` 
                    : `You completed ${habits.filter(h => h.isCompleted).length} out of ${habits.length} habits`}
                </p>
              </div>
              <span className="text-4xl font-bold text-primary">{progress}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden p-1 border border-border/40">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* Add Habit Section */}
        <div className="flex gap-4">
          <Input 
            placeholder={isAr ? "أضف عادة جديدة..." : "Add a new habit..."} 
            className="h-14 rounded-2xl px-6 text-lg border-border/60 focus-visible:ring-primary"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
          />
          <Button className="h-14 w-14 rounded-2xl shrink-0" onClick={addHabit}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {habits.map((habit, idx) => (
              <motion.div 
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bento-card !p-6 flex items-center justify-between group transition-all duration-300 ${habit.isCompleted ? "bg-primary/5 border-primary/30" : "hover:border-primary/20"}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${habit.isCompleted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {getIcon(habit.icon)}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold font-naskh transition-colors ${habit.isCompleted ? "text-primary line-through opacity-60" : "text-foreground"}`}>
                      {isAr ? habit.nameAr : habit.nameEn}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isAr ? "عادة يومية" : "Daily Habit"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeHabit(habit.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant={habit.isCompleted ? "default" : "outline"}
                    className={`h-12 w-12 rounded-xl p-0 ${habit.isCompleted ? "bg-primary hover:bg-primary/90" : "hover:border-primary hover:bg-primary/5"}`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <CheckCircle2 className={`w-6 h-6 ${habit.isCompleted ? "text-white" : "text-muted-foreground"}`} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Motivation Quote */}
        <div className="text-center p-12 space-y-4">
          <Sparkles className="w-12 h-12 text-primary/20 mx-auto" />
          <p className="text-xl font-naskh text-muted-foreground italic leading-relaxed max-w-2xl mx-auto">
            {isAr 
              ? "«أحب الأعمال إلى الله أدومها وإن قل» — حديث شريف" 
              : "“The most beloved of deeds to Allah are those that are most consistent, even if they are small.” — Prophetic Hadith"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoutineBuilder;
