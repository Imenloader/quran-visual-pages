import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Banknote, Save, TrendingUp, Info, Coins, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

const ZakatSettingsManager = () => {
  const [settings, setSettings] = useState({
    goldPrice: 3500,
    silverPrice: 45,
    currencyAr: "ج.م",
    currencyEn: "EGP",
    nisabGold: 85,
    nisabSilver: 595
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "zakat"), (snap) => {
      if (snap.exists()) {
        setSettings(prev => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "zakat"), settings);
      toast.success("تم حفظ إعدادات الزكاة");
    } catch (err) {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Banknote className="text-emerald-500" />
            إعدادات الزكاة والعملات
          </h1>
          <p className="text-muted-foreground mt-1">تحديث أسعار الذهب والفضة والعملة الافتراضية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card !p-8 space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" />
            أسعار المعادن (للجرام الواحد)
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">سعر جرام الذهب (عيار 24)</label>
              <div className="relative">
                <Input type="number" value={settings.goldPrice} onChange={e => setSettings({...settings, goldPrice: parseFloat(e.target.value)})} className="rounded-xl h-12 pl-12" />
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">سعر جرام الفضة</label>
              <div className="relative">
                <Input type="number" value={settings.silverPrice} onChange={e => setSettings({...settings, silverPrice: parseFloat(e.target.value)})} className="rounded-xl h-12 pl-12" />
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bento-card !p-8 space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Globe className="text-primary" />
            إعدادات العملة
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">رمز العملة بالعربية</label>
              <Input value={settings.currencyAr} onChange={e => setSettings({...settings, currencyAr: e.target.value})} className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Currency Code (EN)</label>
              <Input value={settings.currencyEn} onChange={e => setSettings({...settings, currencyEn: e.target.value})} className="rounded-xl h-12" />
            </div>
          </div>
        </div>
      </div>

      <div className="bento-card !p-8 space-y-4">
        <h3 className="font-bold">حساب النصاب الحالي</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-2xl border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">نصاب الذهب (85ج)</p>
            <p className="text-xl font-bold text-primary">{(settings.goldPrice * 85).toLocaleString()} {settings.currencyAr}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-2xl border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">نصاب الفضة (595ج)</p>
            <p className="text-xl font-bold text-primary">{(settings.silverPrice * 595).toLocaleString()} {settings.currencyAr}</p>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
        <Save className="mr-2" />
        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </Button>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-3 text-blue-600">
        <Info className="shrink-0" />
        <p className="text-xs leading-relaxed">
          تعتمد حاسبة الزكاة في التطبيق على هذه الأسعار لحساب "النصاب" وتحديد ما إذا كان المستخدم تجب عليه الزكاة أم لا. يرجى تحديثها دورياً حسب أسعار السوق.
        </p>
      </div>
    </div>
  );
};

export default ZakatSettingsManager;
