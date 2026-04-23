import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Sparkles, Save, Plus, Trash2, Info, CheckSquare, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const FridaySunanManager = () => {
  const [sunan, setSunan] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "friday_sunan"), (snap) => {
      if (snap.exists()) {
        setSunan(snap.data().items || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "friday_sunan"), { items: sunan });
      toast.success("تم حفظ سنن الجمعة");
    } catch (err) {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => setSunan([...sunan, ""]);
  const removeItem = (idx: number) => setSunan(sunan.filter((_, i) => i !== idx));
  const updateItem = (idx: number, val: string) => {
    const updated = [...sunan];
    updated[idx] = val;
    setSunan(updated);
  };

  if (loading) return <div className="p-12 text-center animate-pulse">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="text-indigo-500" />
            إدارة سنن الجمعة
          </h1>
          <p className="text-muted-foreground mt-1">تعديل قائمة الأعمال المستحبة ليوم الجمعة</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 px-8">
          <Save size={18} />
          {saving ? "جاري الحفظ..." : "حفظ الكل"}
        </Button>
      </div>

      <div className="bento-card !p-8 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <List className="text-primary" size={18} />
            قائمة السنن
          </h3>
          <Button variant="ghost" size="sm" onClick={addItem} className="text-xs gap-1">
            <Plus size={14} /> إضافة سُنّة جديدة
          </Button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {sunan.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <Input 
                  value={item} 
                  onChange={e => updateItem(i, e.target.value)}
                  placeholder="مثال: الغسل والتطيب..."
                  className="rounded-xl h-10"
                />
                <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-rose-500 hover:bg-rose-500/10">
                  <Trash2 size={16} />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {sunan.length === 0 && (
            <div className="text-center py-10 opacity-30">
              <CheckSquare size={48} className="mx-auto mb-2" />
              <p>القائمة فارغة</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-muted/50 border border-border/40 rounded-2xl flex gap-3 text-muted-foreground">
        <Info className="shrink-0" />
        <p className="text-xs leading-relaxed">
          تظهر هذه القائمة للمستخدمين في صفحة "سنن الجمعة". التعديلات هنا ستنعكس فوراً لجميع المستخدمين.
        </p>
      </div>
    </div>
  );
};

export default FridaySunanManager;
