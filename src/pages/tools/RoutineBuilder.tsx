import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { syncService } from '@/services/syncService';
import QuranHeader from '@/components/QuranHeader';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  LayoutGrid, 
  BookOpen, 
  Sun, 
  Moon, 
  Zap,
  Save,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { toArabicNumber } from '@/data/quranData';

interface RoutineTask {
  id: string;
  title: string;
  type: 'quran' | 'athkar' | 'prayer' | 'other';
  completed: boolean;
}

interface Routine {
  id: string;
  name: string;
  icon: string;
  tasks: RoutineTask[];
}

const ROUTINES_KEY = "user-spiritual-routines";

const RoutineBuilder: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await syncService.loadData<Routine[]>(ROUTINES_KEY, []);
      if (data.length === 0) {
        // Default routines
        const defaults: Routine[] = [
          {
            id: 'morning',
            name: isArabic ? 'روتين الصباح' : 'Morning Routine',
            icon: 'sun',
            tasks: [
              { id: 'm1', title: isArabic ? 'أذكار الصباح' : 'Morning Adhkar', type: 'athkar', completed: false },
              { id: 'm2', title: isArabic ? 'قراءة صفحتين' : 'Read 2 Pages', type: 'quran', completed: false },
              { id: 'm3', title: isArabic ? 'صلاة الضحى' : 'Duha Prayer', type: 'prayer', completed: false }
            ]
          },
          {
            id: 'evening',
            name: isArabic ? 'روتين المساء' : 'Evening Routine',
            icon: 'moon',
            tasks: [
              { id: 'e1', title: isArabic ? 'أذكار المساء' : 'Evening Adhkar', type: 'athkar', completed: false },
              { id: 'e2', title: isArabic ? 'سورة الملك' : 'Surah Al-Mulk', type: 'quran', completed: false }
            ]
          }
        ];
        setRoutines(defaults);
        setActiveRoutine(defaults[0].id);
      } else {
        setRoutines(data);
        setActiveRoutine(data[0].id);
      }
    };
    load();
  }, [isArabic]);

  const saveRoutines = async (updated: Routine[]) => {
    setRoutines(updated);
    await syncService.saveData(ROUTINES_KEY, updated);
  };

  const toggleTask = (routineId: string, taskId: string) => {
    const updated = routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          tasks: r.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return r;
    });
    saveRoutines(updated);
  };

  const addTask = (routineId: string) => {
    const title = prompt(isArabic ? 'عنوان المهمة:' : 'Task Title:');
    if (!title) return;

    const updated = routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          tasks: [...r.tasks, { id: Date.now().toString(), title, type: 'other', completed: false }]
        };
      }
      return r;
    });
    saveRoutines(updated);
  };

  const addRoutine = () => {
    const name = prompt(isArabic ? 'اسم الروتين الجديد:' : 'New Routine Name:');
    if (!name) return;

    const newRoutine: Routine = {
      id: Date.now().toString(),
      name,
      icon: 'clock',
      tasks: []
    };

    const updated = [...routines, newRoutine];
    saveRoutines(updated);
    setActiveRoutine(newRoutine.id);
  };

  const deleteTask = (routineId: string, taskId: string) => {
    const updated = routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          tasks: r.tasks.filter(t => t.id !== taskId)
        };
      }
      return r;
    });
    saveRoutines(updated);
  };

  const currentRoutine = routines.find(r => r.id === activeRoutine);

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader 
        title={isArabic ? 'باني الروتين الإيماني' : 'Spiritual Routine Builder'} 
        subtitle={isArabic ? 'نظم يومك حول طاعة الله' : 'Organize your day around worship'}
        variant="compact"
        showBack
      />

      <main className="container max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - Routine Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-[2rem] bg-card border border-border/40 shadow-islamic">
              <h3 className="text-xs font-bold text-gold uppercase tracking-[0.2em] mb-6 px-2">
                {isArabic ? 'جداولك' : 'YOUR ROUTINES'}
              </h3>
              <div className="space-y-2">
                {routines.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setActiveRoutine(r.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      activeRoutine === r.id 
                        ? 'bg-accent text-accent-foreground shadow-lg' 
                        : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {r.icon === 'sun' ? <Sun size={18} /> : r.icon === 'moon' ? <Moon size={18} /> : <Clock size={18} />}
                      <span className="font-bold text-sm">{r.name}</span>
                    </div>
                    <div className="text-[10px] font-bold opacity-60">
                      {r.tasks.filter(t => t.completed).length}/{r.tasks.length}
                    </div>
                  </button>
                ))}
              </div>
              <button 
                onClick={addRoutine}
                className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-gold/40 hover:text-gold transition-all flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Plus size={16} />
                {isArabic ? 'إضافة روتين جديد' : 'ADD NEW ROUTINE'}
              </button>
            </div>
          </div>

          {/* Main Content - Task List */}
          <div className="lg:col-span-8">
            {currentRoutine ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                        <Zap size={24} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-serif font-bold text-primary">{currentRoutine.name}</h2>
                        <p className="text-xs text-muted-foreground">{isArabic ? 'قائمة المهام اليومية' : 'Daily checklist'}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => addTask(currentRoutine.id)}
                    className="p-3 rounded-xl bg-gold/10 text-gold hover:bg-gold hover:text-white transition-all shadow-sm"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  {currentRoutine.tasks.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-border/40 rounded-[2.5rem] opacity-40">
                      <LayoutGrid size={48} className="mx-auto mb-4" />
                      <p className="font-serif">{isArabic ? 'لا توجد مهام بعد' : 'No tasks yet'}</p>
                    </div>
                  ) : (
                    currentRoutine.tasks.map(task => (
                      <div 
                        key={task.id}
                        className={`flex items-center justify-between p-6 rounded-[2rem] bg-card border transition-all ${
                          task.completed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/40 hover:border-gold/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => toggleTask(currentRoutine.id, task.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              task.completed ? 'bg-emerald-500 text-white shadow-lg' : 'border-2 border-border/60 hover:border-gold'
                            }`}
                          >
                            {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} className="text-muted-foreground" />}
                          </button>
                          <div>
                            <p className={`font-bold text-lg ${task.completed ? 'text-emerald-600 line-through opacity-60' : 'text-primary'}`}>
                              {task.title}
                            </p>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{task.type}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteTask(currentRoutine.id, task.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center py-20 text-muted-foreground">
                {isArabic ? 'اختر روتيناً للبدء' : 'Select a routine to begin'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoutineBuilder;
