import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Moon, Star, Save, Plus, Trash2, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const RamadanManager = () => {
  const [content, setContent] = useState({
    virtues: [] as string[],
    rules: [] as { title: string; content: string }[],
    dailyTasks: [] as string[],
    active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "ramadan"));
      if (snap.exists()) {
        setContent(prev => ({ ...prev, ...snap.data() }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "ramadan"), content);
      toast.success("تم حفظ إعدادات رمضان");
    } catch (err) {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'virtues' | 'dailyTasks') => {
    setContent({ ...content, [type]: [...content[type], ""] });
  };

  const removeItem = (type: 'virtues' | 'dailyTasks', index: number) => {
    const updated = content[type].filter((_, i) => i !== index);
    setContent({ ...content, [type]: updated });
  };

  if (loading) return <div className="p-12 text-center animate-pulse">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Moon className="text-indigo-400" />
            إدارة محتوى رمضان
          </h1>
          <p className="text-muted-foreground mt-1">تحديث الفضائل، الأحكام، والمهام اليومية</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 px-8">
          <Save size={18} />
          {saving ? "جاري الحفظ..." : "حفظ الكل"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Virtues Section */}
        <div className="bento-card !p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Star className="text-amber-500" size={18} />
              فضائل الشهر
            </h3>
            <Button variant="ghost" size="sm" onClick={() => addItem('virtues')} className="text-xs gap-1">
              <Plus size={14} /> إضافة
            </Button>
          </div>
          <div className="space-y-3">
            {content.virtues.map((v, i) => (
              <div key={i} className="flex gap-2">
                <Input 
                  value={v} 
                  onChange={e => {
                    const updated = [...content.virtues];
                    updated[i] = e.target.value;
                    setContent({ ...content, virtues: updated });
                  }}
                  className="rounded-xl"
                  placeholder="مثال: شهر الصبر والمواساة"
                />
                <Button variant="ghost" size="icon" onClick={() => removeItem('virtues', i)} className="text-rose-500 hover:bg-rose-500/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Tasks Section */}
        <div className="bento-card !p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={18} />
              المهام الروحانية اليومية
            </h3>
            <Button variant="ghost" size="sm" onClick={() => addItem('dailyTasks')} className="text-xs gap-1">
              <Plus size={14} /> إضافة
            </Button>
          </div>
          <div className="space-y-3">
            {content.dailyTasks.map((t, i) => (
              <div key={i} className="flex gap-2">
                <Input 
                  value={t} 
                  onChange={e => {
                    const updated = [...content.dailyTasks];
                    updated[i] = e.target.value;
                    setContent({ ...content, dailyTasks: updated });
                  }}
                  className="rounded-xl"
                  placeholder="مثال: قراءة جزء من القرآن"
                />
                <Button variant="ghost" size="icon" onClick={() => removeItem('dailyTasks', i)} className="text-rose-500 hover:bg-rose-500/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-3 text-indigo-600">
        <Info className="shrink-0" />
        <p className="text-xs leading-relaxed">
          نصيحة: تأكد من تحديث المهام اليومية قبل بداية شهر رمضان المبارك لضمان أفضل تجربة للمستخدمين.
        </p>
      </div>
    </div>
  );
};

export default RamadanManager;
