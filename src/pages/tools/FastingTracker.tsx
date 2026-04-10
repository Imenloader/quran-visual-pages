import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Calendar, CheckCircle2, Moon, Star, Bell, Info, ChevronRight, Clock, RotateCcw } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfWeek, isSameDay, isMonday, isThursday } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface FastingDay {
  date: Date;
  type: "monday" | "thursday" | "white_day" | "ashura" | "arafah" | "other";
  titleEn: string;
  titleAr: string;
  isCompleted: boolean;
}

const FastingTracker = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const locale = isAr ? ar : enUS;

  const [fastingDays, setFastingDays] = useState<FastingDay[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateLocalFastingDays = useCallback(() => {
    const today = new Date();
    const days: FastingDay[] = [];
    
    // Calculate for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      let type: FastingDay["type"] | null = null;
      let titleEn = "";
      let titleAr = "";

      // Mondays and Thursdays
      if (isMonday(date)) {
        type = "monday";
        titleEn = "Monday Sunnah Fast";
        titleAr = "صيام يوم الاثنين";
      } else if (isThursday(date)) {
        type = "thursday";
        titleEn = "Thursday Sunnah Fast";
        titleAr = "صيام يوم الخميس";
      }

      // Simple Hijri approximation for White Days (13, 14, 15)
      const jd = Math.floor(date.getTime() / 86400000) + 2440588;
      const l = jd - 1948440 + 10632;
      const n = Math.floor((l - 1) / 10631);
      const l2 = l - 10631 * n + 354;
      const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
      const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
      const m = Math.floor((24 * l3) / 709);
      const d = l3 - Math.floor((709 * m) / 24);

      if (d === 13 || d === 14 || d === 15) {
        type = "white_day";
        const monthNames = ["Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani", "Jumada al-ula", "Jumada al-akhira", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
        const monthNamesAr = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
        titleEn = `White Day (${d} ${monthNames[m-1]})`;
        titleAr = `الأيام البيض (${d} ${monthNamesAr[m-1]})`;
      }

      if (type) {
        const dateKey = format(date, 'yyyy-MM-dd');
        const saved = localStorage.getItem(`fasting-${dateKey}`);
        days.push({
          date,
          type,
          titleEn,
          titleAr,
          isCompleted: saved === "true"
        });
      }
    }
    setFastingDays(days);
  }, []);

  const fetchFastingDays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      
      const fetchMonth = async (m: number, y: number) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        try {
          const res = await fetch(`https://api.aladhan.com/v1/gregorianCalendar/${m}/${y}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error(`Failed to fetch calendar for ${m}/${y}`);
          return res.json();
        } catch (e) {
          clearTimeout(timeoutId);
          throw e;
        }
      };

      const data1 = await fetchMonth(month, year);
      const nextMonthDate = addDays(today, 30);
      const nextMonth = nextMonthDate.getMonth() + 1;
      const nextYear = nextMonthDate.getFullYear();
      
      let allDays = [...data1.data];
      if (nextMonth !== month || nextYear !== year) {
        const data2 = await fetchMonth(nextMonth, nextYear);
        allDays = [...allDays, ...data2.data];
      }
      
      const days: FastingDay[] = [];
      const thirtyDaysAhead = addDays(today, 30);

      allDays.forEach((day: { gregorian: { date: string }, hijri: { day: string, month: { en: string, ar: string } } }) => {
        const parts = day.gregorian.date.split('-');
        const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        const compareToday = new Date(today);
        compareToday.setHours(0, 0, 0, 0);
        const compareEnd = new Date(thirtyDaysAhead);
        compareEnd.setHours(23, 59, 59, 999);

        if (compareDate >= compareToday && compareDate <= compareEnd) {
          let type: FastingDay["type"] | null = null;
          let titleEn = "";
          let titleAr = "";

          const hijriDay = parseInt(day.hijri.day);
          const hijriMonth = day.hijri.month.en;

          if (isMonday(date)) {
            type = "monday";
            titleEn = "Monday Sunnah Fast";
            titleAr = "صيام يوم الاثنين";
          } else if (isThursday(date)) {
            type = "thursday";
            titleEn = "Thursday Sunnah Fast";
            titleAr = "صيام يوم الخميس";
          }

          if (hijriDay === 13 || hijriDay === 14 || hijriDay === 15) {
            type = "white_day";
            titleEn = `White Day (${hijriDay} ${hijriMonth})`;
            titleAr = `الأيام البيض (${hijriDay} ${day.hijri.month.ar})`;
          }
          
          if (hijriMonth === "Muharram" && hijriDay === 10) {
            type = "ashura";
            titleEn = "Day of Ashura";
            titleAr = "يوم عاشوراء";
          } else if (hijriMonth === "Dhu al-Hijjah" && hijriDay === 9) {
            type = "arafah";
            titleEn = "Day of Arafah";
            titleAr = "يوم عرفة";
          }

          if (type) {
            const dateKey = format(date, 'yyyy-MM-dd');
            const saved = localStorage.getItem(`fasting-${dateKey}`);
            days.push({
              date,
              type,
              titleEn,
              titleAr,
              isCompleted: saved === "true"
            });
          }
        }
      });

      const uniqueDays = Array.from(new Map(days.map(d => [format(d.date, 'yyyy-MM-dd'), d])).values())
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      setFastingDays(uniqueDays);
    } catch (err) {
      console.warn("Failed to fetch online Hijri calendar, falling back to local calculation:", err);
      calculateLocalFastingDays();
    } finally {
      setLoading(false);
    }
  }, [calculateLocalFastingDays]);

  useEffect(() => {
    fetchFastingDays();
  }, [fetchFastingDays]);

  useEffect(() => {
    const completed = fastingDays.filter(d => d.isCompleted).length;
    setStats({ total: fastingDays.length, completed });
  }, [fastingDays]);

  const toggleFast = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const newDays = fastingDays.map(d => {
      if (isSameDay(d.date, date)) {
        const newState = !d.isCompleted;
        localStorage.setItem(`fasting-${dateKey}`, newState.toString());
        return { ...d, isCompleted: newState };
      }
      return d;
    });
    setFastingDays(newDays);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "متتبع صيام السنة" : "Sunnah Fasting Tracker"} 
        subtitle={isAr ? "داوم على صيام التطوع والتقرب إلى الله" : "Maintain voluntary fasts and draw closer to Allah"}
        variant="compact"
      />

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bento-card !p-6 bg-primary/5 border-primary/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Star className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{isAr ? "أيام الصيام القادمة" : "Upcoming Fasting Days"}</p>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="bento-card !p-6 bg-emerald-500/5 border-emerald-500/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{isAr ? "تم الصيام" : "Completed Fasts"}</p>
            <p className="text-3xl font-bold text-emerald-500">{stats.completed}</p>
          </div>
          <div className="bento-card !p-6 bg-amber-500/5 border-amber-500/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{isAr ? "الالتزام" : "Consistency"}</p>
            <p className="text-3xl font-bold text-amber-500">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-6 rounded-3xl bg-muted/50 border border-border/40 flex gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold font-naskh">{isAr ? "فضل صيام التطوع" : "Virtues of Voluntary Fasting"}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed font-naskh">
              {isAr 
                ? "قال النبي صلى الله عليه وسلم: 'من صام يوماً في سبيل الله، باعد الله وجهه عن النار سبعين خريفاً'. وصيام الاثنين والخميس تُعرض فيهما الأعمال على الله، وصيام الأيام البيض كصيام الدهر."
                : "The Prophet (PBUH) said: 'Whoever fasts one day for the sake of Allah, Allah will keep his face away from the Fire for seventy years.' Fasting on Mondays and Thursdays is when deeds are presented to Allah, and fasting the White Days is like fasting for a lifetime."}
            </p>
          </div>
        </div>

        {/* Fasting List */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-naskh px-2">{isAr ? "جدول الصيام القادم" : "Upcoming Fasting Schedule"}</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-naskh">{isAr ? "جاري تحميل التقويم الهجري..." : "Loading Hijri calendar..."}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 bento-card">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <Info className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-bold font-naskh text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">{isAr ? "تأكد من اتصالك بالإنترنت وحاول مرة أخرى" : "Check your internet connection and try again"}</p>
              </div>
              <Button onClick={fetchFastingDays} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                {isAr ? "إعادة المحاولة" : "Retry"}
              </Button>
            </div>
          ) : fastingDays.length === 0 ? (
            <div className="text-center py-20 bento-card">
              <p className="text-muted-foreground">{isAr ? "لا توجد أيام صيام قادمة في الـ 30 يوماً القادمة" : "No upcoming fasting days in the next 30 days"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fastingDays.map((day, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bento-card !p-6 flex items-center justify-between group transition-all ${day.isCompleted ? "bg-emerald-500/5 border-emerald-500/30" : "hover:border-primary/30"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${day.isCompleted ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      <span className="text-[10px] font-bold uppercase">{format(day.date, 'MMM', { locale })}</span>
                      <span className="text-xl font-bold leading-none">{format(day.date, 'dd')}</span>
                    </div>
                    <div>
                      <h4 className={`font-bold font-naskh ${day.isCompleted ? "text-emerald-600" : "text-foreground"}`}>
                        {isAr ? day.titleAr : day.titleEn}
                      </h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {format(day.date, 'EEEE', { locale })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant={day.isCompleted ? "default" : "outline"}
                    size="icon"
                    className={`rounded-xl shrink-0 ${day.isCompleted ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                    onClick={() => toggleFast(day.date)}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FastingTracker;
