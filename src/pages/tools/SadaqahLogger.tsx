import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { 
  Heart, 
  Plus, 
  History, 
  TrendingUp, 
  Banknote, 
  Calendar, 
  Trash2, 
  Gift, 
  HandHeart,
  Info,
  Target,
  CheckCircle2
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { syncService } from "@/services/syncService";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface SadaqahEntry {
  id: string;
  amount: number;
  date: string;
  categoryEn: string;
  categoryAr: string;
  note?: string;
}

const categories = [
  { en: "General", ar: "عامة" },
  { en: "Poor & Needy", ar: "فقراء ومساكين" },
  { en: "Mosque", ar: "مسجد" },
  { en: "Education", ar: "تعليم" },
  { en: "Family", ar: "الأهل والأقارب" },
  { en: "Water", ar: "سقيا ماء" },
];

const SadaqahLogger = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const locale = isAr ? ar : enUS;

  const [entries, setEntries] = useState<SadaqahEntry[]>([]);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [note, setNote] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [goalInput, setGoalInput] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      const savedEntries = await syncService.loadCollection<SadaqahEntry>('sadaqah-entries');
      setEntries(savedEntries);
      const savedGoal = await syncService.loadData<number>("sadaqah-monthly-goal", 0);
      setMonthlyGoal(savedGoal);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadInitialData();
      }
    });

    loadInitialData();
    return () => unsubscribe();
  }, []);

  const addEntry = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const newEntry: SadaqahEntry = {
      id: Date.now().toString(),
      amount: val,
      date: new Date().toISOString(),
      categoryEn: selectedCategory.en,
      categoryAr: selectedCategory.ar,
      note: note.trim() || undefined
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    syncService.saveCollectionItem('sadaqah-entries', newEntry);
    setAmount("");
    setNote("");
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    syncService.deleteCollectionItem('sadaqah-entries', id);
  };

  const saveGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val >= 0) {
      setMonthlyGoal(val);
      syncService.saveData("sadaqah-monthly-goal", val);
    }
    setShowGoalInput(false);
    setGoalInput("");
  };

  const totalAmount = entries.reduce((acc, curr) => acc + curr.amount, 0);

  // This month's total
  const thisMonth = new Date().toISOString().slice(0, 7); // "2026-04"
  const monthlyTotal = entries
    .filter(e => e.date.startsWith(thisMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const goalPercent = monthlyGoal > 0 ? Math.min(100, (monthlyTotal / monthlyGoal) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "سجل الصدقات" : "Sadaqah Logger"} 
        subtitle={isAr ? "تتبع عطاءك وصدقاتك الخفية" : "Track your giving and hidden charities"}
        variant="compact"
      />

      <div className="max-w-5xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stats & Form Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Total Stats */}
          <div className="bento-card !p-8 bg-rose-500 text-white overflow-hidden relative group">
            <div className="absolute inset-0 pattern-islamic opacity-10 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-end">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">{isAr ? "إجمالي العطاء" : "Total Giving"}</p>
                  <p className="text-4xl font-bold">{totalAmount.toLocaleString()} <span className="text-sm font-normal">{isAr ? "ج.م" : "EGP"}</span></p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/20 flex justify-between text-sm">
                <span>{isAr ? "عدد المرات" : "Total Entries"}</span>
                <span className="font-bold">{entries.length}</span>
              </div>
            </div>
          </div>

          {/* Monthly Goal Card */}
          <div className="bento-card !p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-naskh flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {isAr ? "هدف الشهر" : "Monthly Goal"}
              </h3>
              <button
                onClick={() => { setShowGoalInput(v => !v); setGoalInput(monthlyGoal > 0 ? String(monthlyGoal) : ""); }}
                className="text-xs text-primary font-bold hover:underline"
              >
                {isAr ? "تعديل" : "Edit"}
              </button>
            </div>

            {showGoalInput && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={isAr ? "المبلغ المستهدف" : "Target amount"}
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  className="h-10 rounded-xl flex-1"
                  onKeyDown={e => e.key === "Enter" && saveGoal()}
                />
                <Button size="sm" className="rounded-xl" onClick={saveGoal}>
                  {isAr ? "حفظ" : "Save"}
                </Button>
              </div>
            )}

            {monthlyGoal > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-bold">
                  <span>{isAr ? "هذا الشهر" : "This month"}: {monthlyTotal.toLocaleString()} {isAr ? "ج.م" : "EGP"}</span>
                  <span>{isAr ? "الهدف" : "Goal"}: {monthlyGoal.toLocaleString()} {isAr ? "ج.م" : "EGP"}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      goalPercent >= 100 ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {goalPercent >= 100
                      ? (isAr ? "🎉 تجاوزت هدفك هذا الشهر!" : "🎉 Goal achieved this month!")
                      : (isAr ? `تبقّى ${(monthlyGoal - monthlyTotal).toLocaleString()} ج.م` : `${(monthlyGoal - monthlyTotal).toLocaleString()} EGP remaining`)}
                  </p>
                  {goalPercent >= 100 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-naskh">
                {isAr ? "حدّد هدفاً شهرياً لتتابع تقدمك." : "Set a monthly goal to track your giving progress."}
              </p>
            )}
          </div>

          {/* Add Entry Form */}
          <div className="bento-card !p-8 space-y-6">
            <h3 className="text-xl font-bold font-naskh flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              {isAr ? "إضافة صدقة جديدة" : "Log New Sadaqah"}
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isAr ? "المبلغ" : "Amount"}</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-12 pl-10 rounded-xl"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isAr ? "الفئة" : "Category"}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Button 
                      key={cat.en}
                      variant={selectedCategory.en === cat.en ? "default" : "outline"}
                      className="h-10 rounded-xl text-xs font-naskh"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {isAr ? cat.ar : cat.en}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isAr ? "ملاحظة (اختياري)" : "Note (Optional)"}</Label>
                <Input 
                  placeholder={isAr ? "مثلاً: صدقة جارية..." : "e.g. Ongoing charity..."} 
                  className="h-12 rounded-xl"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Button className="w-full h-12 rounded-xl gap-2" onClick={addEntry}>
                <HandHeart className="w-5 h-5" />
                {isAr ? "تسجيل الصدقة" : "Log Sadaqah"}
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/50 border border-border/40 flex gap-4">
            <Info className="w-6 h-6 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed font-naskh">
              {isAr 
                ? "قال النبي صلى الله عليه وسلم: 'سبعة يظلهم الله في ظله يوم لا ظل إلا ظله... ورجل تصدق بصدقة فأخفاها حتى لا تعلم شماله ما تنفق يمينه'."
                : "The Prophet (PBUH) said: 'There are seven whom Allah will shade in His Shade on the Day when there is no shade except His Shade... and a man who gives in charity and hides it, such that his left hand does not know what his right hand gives.'"}
            </p>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold font-naskh flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              {isAr ? "سجل العمليات" : "Transaction History"}
            </h3>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              {entries.length} {isAr ? "عمليات" : "Entries"}
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <motion.div 
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bento-card !p-6 flex items-center justify-between group hover:border-rose-500/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold font-naskh">{isAr ? entry.categoryAr : entry.categoryEn}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                            {format(new Date(entry.date), 'dd MMM yyyy', { locale })}
                          </span>
                        </div>
                        {entry.note && <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-xl font-bold text-rose-500">+{entry.amount.toLocaleString()} {isAr ? "ج.م" : "EGP"}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeEntry(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <HandHeart className="w-16 h-16" />
                  <p className="font-medium">{isAr ? "لا يوجد سجل للصدقات بعد" : "No charity history yet"}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SadaqahLogger;
