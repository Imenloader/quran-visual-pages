import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Calendar as CalendarIcon, Info, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, addMonths, subMonths, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";

const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhira",
  "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

interface HijriDay {
  date: {
    gregorian: { date: string; day: string; month: { number: number; en: string }; year: string };
    hijri: { date: string; day: string; month: { number: number; en: string; ar: string }; year: string };
  };
}

const HijriCalendar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<HijriDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHijri, setCurrentHijri] = useState<{ day: string; month: string; year: string } | null>(null);

  const fetchCalendar = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      // Using Maadi coordinates (29.9602, 31.2569) and Egyptian method (5)
      const res = await fetch(`https://api.aladhan.com/v1/calendar?latitude=29.9602&longitude=31.2569&method=5&month=${month}&year=${year}`);
      const data = await res.json();
      if (data.status === "OK") {
        setCalendarData(data.data);
        
        // Find today's Hijri date if it's the current month
        const today = new Date();
        if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
          const todayData = data.data.find((d: HijriDay) => parseInt(d.date.gregorian.day) === today.getDate());
          if (todayData) {
            setCurrentHijri({
              day: todayData.date.hijri.day,
              month: i18n.language === 'ar' ? todayData.date.hijri.month.ar : todayData.date.hijri.month.en,
              year: todayData.date.hijri.year
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch Hijri calendar:", err);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    fetchCalendar(viewDate);
  }, [viewDate, fetchCalendar]);

  const handlePrevMonth = () => setViewDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setViewDate(prev => addMonths(prev, 1));

  const toArabicDigits = (num: string | number) => {
    const n = num.toString();
    if (i18n.language !== "ar") return n;
    return n.replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
  };

  const getStartDayOfWeek = () => {
    if (calendarData.length === 0) return 0;
    // Aladhan returns days starting from 1st of Gregorian month
    // We need to know which day of week the 1st is
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    return firstDay.getDay();
  };

  const isToday = (gregorianDay: string) => {
    const today = new Date();
    return isSameDay(today, new Date(viewDate.getFullYear(), viewDate.getMonth(), parseInt(gregorianDay)));
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/hub")}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
          >
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </button>
          <h1 className="text-xl font-bold font-naskh">{t("hub.hijri")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {currentHijri && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-emerald-deep text-white rounded-[2.5rem] shadow-islamic text-center space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <CalendarIcon className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <p className="text-sm font-naskh opacity-80 mb-2">{t("hijri.today")}</p>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-5xl font-bold font-mono">{toArabicDigits(currentHijri.day)}</span>
                    <div className="text-right">
                      <p className="text-xl font-bold font-naskh">{currentHijri.month}</p>
                      <p className="text-sm font-mono opacity-80">{toArabicDigits(currentHijri.year)} {i18n.language === 'ar' ? 'هـ' : 'AH'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm font-naskh opacity-80">{format(new Date(), "EEEE d MMMM yyyy", { locale: i18n.language === 'ar' ? ar : undefined })}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-soft">
            <div className="flex items-center justify-between">
              <button 
                onClick={handlePrevMonth}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <div className="text-center">
                <h2 className="font-bold font-naskh text-foreground text-lg">
                  {calendarData.length > 0 
                    ? (i18n.language === 'ar' ? calendarData[0].date.hijri.month.ar : calendarData[0].date.hijri.month.en)
                    : format(viewDate, "MMMM", { locale: i18n.language === 'ar' ? ar : undefined })
                  } {calendarData.length > 0 ? toArabicDigits(calendarData[0].date.hijri.year) : format(viewDate, "yyyy")}
                </h2>
                <p className="text-[10px] text-muted-foreground font-naskh uppercase tracking-widest">
                  {format(viewDate, "MMMM yyyy", { locale: i18n.language === 'ar' ? ar : undefined })}
                </p>
              </div>
              <button 
                onClick={handleNextMonth}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-deep animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center">
                {(t("hijri.weekDays", { returnObjects: true }) as string[]).map(d => (
                  <div key={d} className="text-[10px] font-bold text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: getStartDayOfWeek() }).map((_, i) => (
                  <div key={`empty-${i}`} className="py-3" />
                ))}
                {calendarData.map((day) => (
                  <div 
                    key={day.date.gregorian.date} 
                    className={`relative py-3 text-sm font-mono rounded-xl transition-colors flex flex-col items-center justify-center ${
                      isToday(day.date.gregorian.day) ? "ring-2 ring-accent ring-offset-2" : ""
                    } hover:bg-muted text-foreground`}
                  >
                    <span className="font-bold">{toArabicDigits(day.date.hijri.day)}</span>
                    <span className="text-[8px] opacity-50">{toArabicDigits(day.date.gregorian.day)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
              {t("hijri.info")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HijriCalendar;
