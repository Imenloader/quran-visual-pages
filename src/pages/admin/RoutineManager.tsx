import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Zap, Save, Plus, Trash2, Info, ListTodo, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import BackButton from "@/components/BackButton";

interface RoutineTask {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'morning' | 'evening' | 'general';
}

const RoutineManager = () => {
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "spiritual_routine"), (snap) => {
      if (snap.exists()) {
        setTasks(snap.data().tasks || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "spiritual_routine"), { tasks });
      toast.success("تم حفظ الروتين الروحاني");
    } catch (err) {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const addTask = () => {
    const newTask: RoutineTask = {
      id: Date.now().toString(),
      titleAr: "",
      titleEn: "",
      category: 'general'
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const updateTask = (id: string, field: keyof RoutineTask, val: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: val } : t));
  };

  if (loading) return <div className="p-12 text-center animate-pulse">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="text-amber-500" />
              إدارة الروتين الروحاني
            </h1>
            <p className="text-muted-foreground mt-1">تحديد المهام اليومية الصباحية والمسائية</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 px-8">
          <Save size={18} />
          {saving ? "جاري الحفظ..." : "حفظ الروتين"}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <ListTodo className="text-primary" size={18} />
            قائمة المهام
          </h3>
          <Button variant="ghost" size="sm" onClick={addTask} className="text-xs gap-1">
            <Plus size={14} /> إضافة مهمة
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div 
                key={task.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento-card !p-4 flex flex-wrap md:flex-nowrap gap-4 items-center"
              >
                <select 
                  value={task.category} 
                  onChange={e => updateTask(task.id, 'category', e.target.value as any)}
                  className="rounded-xl bg-muted/50 border-none text-xs font-bold px-3 h-10"
                >
                  <option value="morning">🌅 صباحي</option>
                  <option value="evening">🌃 مسائي</option>
                  <option value="general">✨ عام</option>
                </select>
                <Input 
                  value={task.titleAr} 
                  onChange={e => updateTask(task.id, 'titleAr', e.target.value)}
                  placeholder="المهمة بالعربية..."
                  className="rounded-xl h-10 flex-1 min-w-[200px]"
                />
                <Input 
                  value={task.titleEn} 
                  onChange={e => updateTask(task.id, 'titleEn', e.target.value)}
                  placeholder="Task in English..."
                  className="rounded-xl h-10 flex-1 min-w-[200px]"
                />
                <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)} className="text-rose-500 hover:bg-rose-500/10">
                  <Trash2 size={16} />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
            <p className="text-muted-foreground">لا توجد مهام حالياً. ابدأ بإضافة مهام للروتين.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-600">
        <Info className="shrink-0" />
        <p className="text-xs leading-relaxed">
          تظهر هذه المهام للمستخدمين كقائمة مرجعية يومية. يمكنك تقسيمها إلى صباحية ومسائية لتسهيل التنظيم عليهم.
        </p>
      </div>
    </div>
  );
};

export default RoutineManager;
