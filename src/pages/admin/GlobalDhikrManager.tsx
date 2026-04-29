import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { Sparkles, RefreshCw, Save, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

const GlobalDhikrManager = () => {
  const [stats, setStats] = useState({
    total: 0,
    daily: 0,
    goal: 1000000,
    titleAr: "التسبيح العالمي",
    titleEn: "Global Dhikr"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "stats", "dhikr"), (snap) => {
      if (snap.exists()) {
        setStats(prev => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "stats", "dhikr"), stats);
      toast.success("تم حفظ الإعدادات");
    } catch (err) {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const resetDaily = async () => {
    if (!window.confirm("هل تريد تصفير العداد اليومي؟")) return;
    try {
      await updateDoc(doc(db, "stats", "dhikr"), { daily: 0 });
      toast.success("تم تصفير العداد اليومي");
    } catch (err) {
      toast.error("فشل التصفير");
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="text-gold" />
            إدارة التسبيح العالمي
          </h1>
          <p className="text-muted-foreground mt-1">التحكم في العدادات والأهداف العامة للذكر</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats Cards */}
        <div className="bento-card !p-8 bg-primary text-white space-y-4">
          <div className="flex justify-between items-start">
            <TrendingUp size={24} />
            <div className="text-right">
              <p className="text-xs opacity-70 uppercase tracking-widest">الإجمالي الكلي</p>
              <p className="text-4xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/20 flex justify-between">
            <span>اليوم: {stats.daily.toLocaleString()}</span>
            <button onClick={resetDaily} className="text-xs hover:underline flex items-center gap-1">
              <RefreshCw size={12} /> تصفير اليومي
            </button>
          </div>
        </div>

        <div className="bento-card !p-8 space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Target className="text-primary" />
            الهدف الحالي
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">مبلغ الهدف (Target)</label>
              <Input 
                type="number" 
                value={stats.goal} 
                onChange={e => setStats({...stats, goal: parseInt(e.target.value)})}
                className="rounded-xl h-12"
              />
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold transition-all duration-1000" 
                style={{ width: `${Math.min(100, (stats.total / stats.goal) * 100)}%` }}
              />
            </div>
            <p className="text-center text-xs font-bold">
              {Math.floor((stats.total / stats.goal) * 100)}% من الهدف المحقق
            </p>
          </div>
        </div>
      </div>

      <div className="bento-card !p-8 space-y-6">
        <h3 className="font-bold">إعدادات العرض</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">العنوان بالعربية</label>
            <Input value={stats.titleAr} onChange={e => setStats({...stats, titleAr: e.target.value})} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Title in English</label>
            <Input value={stats.titleEn} onChange={e => setStats({...stats, titleEn: e.target.value})} className="rounded-xl" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl gap-2">
          <Save size={18} />
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-600">
        <AlertTriangle className="shrink-0" />
        <p className="text-xs leading-relaxed">
          تنبيه: تغيير الإجمالي الكلي يدوياً قد يؤثر على تجربة المستخدمين. استخدم هذا الخيار فقط في حالات التصحيح الضرورية.
        </p>
      </div>
    </div>
  );
};

export default GlobalDhikrManager;
