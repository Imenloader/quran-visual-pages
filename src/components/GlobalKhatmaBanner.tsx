import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { auth } from '@/firebase';
import { Users, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toArabicNumber } from '@/data/quranData';
import { toast } from 'sonner';

const GlobalKhatmaBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [stats, setStats] = useState({ currentJuz: 0, targetJuz: 1000, participants: 0 });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'global_stats', 'khatma'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats({
          currentJuz: data.currentJuz || 0,
          targetJuz: data.targetJuz || 1000,
          participants: data.participants || 0
        });
      }
    });
    return () => unsub();
  }, []);

  const handleRecord = async () => {
    if (!auth.currentUser) {
      toast.error(isArabic ? "يرجى تسجيل الدخول أولاً" : "Please login first");
      return;
    }

    const input = prompt(isArabic ? "كم جزءاً قرأت اليوم؟" : "How many Juz did you read today?");
    if (!input) return;

    const juzCount = parseInt(input);
    if (isNaN(juzCount) || juzCount <= 0) {
      toast.error(isArabic ? "يرجى إدخال رقم صحيح" : "Please enter a valid number");
      return;
    }

    try {
      const statsRef = doc(db, 'global_stats', 'khatma');
      await updateDoc(statsRef, {
        currentJuz: increment(juzCount),
        participants: increment(1) // Simple increment, can be refined later
      });
      toast.success(isArabic ? "تم تسجيل قراءتك بنجاح، جزاك الله خيراً" : "Reading recorded successfully, Jazak Allah Khayran");
    } catch (error) {
      console.error("Error updating global khatma:", error);
      toast.error(isArabic ? "فشل تسجيل القراءة، تأكد من الاتصال أو الصلاحيات" : "Failed to record reading, check connection or permissions");
    }
  };

  const progress = Math.min(100, (stats.currentJuz / stats.targetJuz) * 100);

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-deep p-6 md:p-10 shadow-2xl group border border-white/5">
      {/* Background Islamic Pattern */}
      <div className="absolute inset-0 pattern-islamic scale-[3] opacity-5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-light/10 rounded-full blur-[80px]" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-right flex-1">
          <div className="flex items-center justify-center md:justify-end gap-3">
             <div className="px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={12} />
               تحدي مباشر
             </div>
             <div className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
               <Users size={12} />
               {isArabic ? toArabicNumber(stats.participants) : stats.participants} متطوع
             </div>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
            تحدي الختمة الجماعية لشهر {new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'long' })}
          </h2>
          <p className="text-emerald-light/70 text-sm md:text-base font-naskh max-w-xl">
            نقرأ القرآن سوياً، هدفنا الوصول إلى {isArabic ? toArabicNumber(stats.targetJuz) : stats.targetJuz} جزء بحلول نهاية الشهر. كن جزءاً من الخير!
          </p>
        </div>

        <div className="w-full md:w-80 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div className="text-right">
               <span className="text-4xl md:text-5xl font-serif font-bold text-gold">
                 {isArabic ? toArabicNumber(Math.floor(progress)) : Math.floor(progress)}%
               </span>
            </div>
            <div className="text-left text-white/60 text-xs font-bold uppercase tracking-widest pb-2">
               {isArabic ? toArabicNumber(stats.currentJuz) : stats.currentJuz} / {isArabic ? toArabicNumber(stats.targetJuz) : stats.targetJuz} جزء
            </div>
          </div>

          <div className="h-4 bg-black/20 rounded-full p-1 border border-white/5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute top-0 right-0 h-full w-4 bg-white/20 skew-x-12 animate-pulse" />
            </div>
          </div>
          
          <button 
            onClick={handleRecord}
            className="w-full py-3 rounded-2xl bg-gold text-emerald-deep font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <BookOpen size={18} />
            سجل قراءتك الآن
          </button>
        </div>
      </div>
    </section>
  );
};

export default GlobalKhatmaBanner;
