import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Sparkles, RefreshCw, Save, Target, TrendingUp, AlertTriangle, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

const GlobalDhikrManager = () => {
  const [stats, setStats] = useState({
    count: 0,
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
        const data = snap.data();
        setStats(prev => ({ 
          ...prev, 
          ...data,
          count: data.count || 0 
        }));
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

  if (loading) return <div className="p-12 text-center animate-pulse font-naskh">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold font-naskh flex items-center gap-3">
            <Sparkles className="text-accent" />
            إدارة التسبيح العالمي
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-naskh">التحكم في العدادات والأهداف العامة للذكر</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Stats Card - Forced Contrast to fix "Invisible" text */}
        <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-soft space-y-6 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <TrendingUp size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">إجمالي التسبيحات</p>
              <p className="text-5xl font-black text-emerald-950 dark:text-emerald-50 tracking-tighter tabular-nums">
                {(stats.count || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users size={16} className="text-emerald-600" />
              </div>
              <div className="text-right">
                <p className="text-[9px] text-muted-foreground font-bold uppercase">اليوم</p>
                <p className="text-sm font-bold font-naskh text-emerald-900 dark:text-emerald-100">{stats.daily.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={resetDaily} 
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-[10px] font-bold rounded-xl transition-all border border-rose-500/20 flex items-center gap-2 group"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              تصفير اليومي
            </button>
          </div>
        </div>

        {/* Target Card */}
        <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-soft space-y-6">
          <h3 className="font-bold font-naskh flex items-center gap-2">
            <Target className="text-primary" />
            الهدف الحالي
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">مبلغ الهدف (Target)</label>
              <Input 
                type="number" 
                value={stats.goal} 
                onChange={e => setStats({...stats, goal: parseInt(e.target.value)})}
                className="rounded-2xl h-12 bg-muted/30 font-bold border-border shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${Math.min(100, ((stats.count || 0) / stats.goal) * 100)}%` }}
                />
              </div>
              <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {Math.floor(((stats.count || 0) / stats.goal) * 100)}% من الهدف المحقق
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-soft space-y-6">
        <h3 className="font-bold font-naskh flex items-center gap-2">
          <Award className="text-accent" size={20} />
          إعدادات العرض
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">العنوان بالعربية</label>
            <Input value={stats.titleAr} onChange={e => setStats({...stats, titleAr: e.target.value})} className="rounded-xl h-12 font-naskh border-border" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Title in English</label>
            <Input value={stats.titleEn} onChange={e => setStats({...stats, titleEn: e.target.value})} className="rounded-xl h-12 border-border" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full h-14 rounded-2xl gap-3 font-bold font-naskh shadow-islamic bg-primary hover:bg-primary/90 text-white">
          <Save size={20} />
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 text-amber-600">
        <AlertTriangle className="shrink-0 w-5 h-5" />
        <p className="text-[10px] leading-relaxed font-naskh">
          تنبيه: تغيير الإجمالي الكلي يدوياً قد يؤثر على تجربة المستخدمين. استخدم هذا الخيار فقط في حالات التصحيح الضرورية.
        </p>
      </div>
    </div>
  );
};

export default GlobalDhikrManager;
