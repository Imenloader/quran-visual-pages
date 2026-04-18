import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Calendar as CalendarIcon, Info, ChevronRight, Loader2, X, Star, Target, Check, Trash2, Plus, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, addMonths, subMonths, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";
import BackButton from "@/components/BackButton";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";

const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhira",
  "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

const HOLIDAY_TRANSLATIONS: Record<string, string> = {
  "Ashura": "عاشوراء",
  "Tasua": "تاسوعاء",
  "Eid-ul-Fitr": "عيد الفطر",
  "Eid-ul-Adha": "عيد الأضحى",
  "Islamic New Year": "رأس السنة الهجرية",
  "Isra and Mi'raj": "الإسراء والمعراج",
  "Arafa": "يوم عرفة",
  "Laylat al-Qadr": "ليلة القدر",
  "1st Day of Ramadan": "أول أيام رمضان",
  "Ayyam al-Bidh": "الأيام البيض",
};

const translateHoliday = (holiday: string): string => {
  return HOLIDAY_TRANSLATIONS[holiday] || holiday;
};

interface HijriDay {
  date: {
    gregorian: { date: string; day: string; month: { number: number; en: string }; year: string };
    hijri: { date: string; day: string; month: { number: number; en: string; ar: string }; year: string; holidays: string[] };
  };
}

const getEnhancedHolidays = (day: HijriDay, lang: string) => {
  const hijriDay = parseInt(day.date.hijri.day);
  const hijriMonth = day.date.hijri.month.number;
  
  // Whitelist of known major Islamic events
  const knownEvents = Object.keys(HOLIDAY_TRANSLATIONS);
  
  // Filter API holidays to only include known ones from our whitelist
  const holidays = (day.date.hijri.holidays || []).filter(h => knownEvents.includes(h));
  
  let isAyyamBidh = false;
  if (hijriMonth === 12) {
    if ([14, 15, 16].includes(hijriDay)) isAyyamBidh = true;
  } else {
    if ([13, 14, 15].includes(hijriDay)) isAyyamBidh = true;
  }

  if (isAyyamBidh && !holidays.includes("Ayyam al-Bidh")) {
    holidays.push("Ayyam al-Bidh");
  }
  
  if (lang === 'ar') {
    return holidays.map(h => translateHoliday(h));
  } else {
    return holidays.map(h => h === "Ayyam al-Bidh" ? "White Days (Ayyam al-Bidh)" : h);
  }
};

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  notifyTime?: string;
  notified?: boolean;
}

const HijriCalendar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<HijriDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHijri, setCurrentHijri] = useState<{ day: string; month: string; year: string } | null>(null);
  
  const [selectedDay, setSelectedDay] = useState<HijriDay | null>(null);
  const [goals, setGoals] = useState<Record<string, Goal[]>>(() => {
    const saved = localStorage.getItem("hijri_goals");
    return saved ? JSON.parse(saved) : {};
  });
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalTime, setNewGoalTime] = useState("");

  useEffect(() => {
    localStorage.setItem("hijri_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("hijri_goals");
      if (saved) setGoals(JSON.parse(saved));
    };
    window.addEventListener('hijri_goals_updated', handleStorageChange);
    return () => window.removeEventListener('hijri_goals_updated', handleStorageChange);
  }, []);

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

  const handleAddGoal = async () => {
    if (!newGoalText.trim() || !selectedDay) return;
    
    if (newGoalTime) {
      if (Capacitor.isNativePlatform()) {
        const check = await LocalNotifications.checkPermissions();
        if (check.display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          if (request.display !== 'granted') {
            toast.error(i18n.language === 'ar' ? "يرجى تفعيل إذن التنبيهات من إعدادات الجهاز" : "Please enable notification permissions in device settings");
            return;
          }
        }
      } else {
        const winNotif = (window as unknown as { Notification: typeof Notification }).Notification;
        if (!winNotif) {
          toast.error(i18n.language === 'ar' ? "متصفحك لا يدعم التنبيهات" : "Your browser doesn't support notifications");
          return;
        }
        if (winNotif.permission !== 'granted') {
          const res = await winNotif.requestPermission();
          if (res !== 'granted') {
            toast.error(i18n.language === 'ar' ? "يرجى تفعيل إذن التنبيهات" : "Please enable notification permissions");
            return;
          }
        }
      }
    }

    const dateStr = selectedDay.date.gregorian.date;
    setGoals(prev => ({
      ...prev,
      [dateStr]: [
        ...(prev[dateStr] || []),
        { 
          id: Date.now().toString(), 
          text: newGoalText.trim(), 
          completed: false,
          notifyTime: newGoalTime || undefined,
          notified: false
        }
      ]
    }));
    setNewGoalText("");
    setNewGoalTime("");
  };

  const toggleGoal = (dateStr: string, id: string) => {
    setGoals(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    }));
  };

  const deleteGoal = (dateStr: string, id: string) => {
    setGoals(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter(g => g.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-8">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh">{t("hub.hijri")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {currentHijri && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-primary text-primary-foreground rounded-[2.5rem] shadow-islamic text-center space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <CalendarIcon className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <p className="text-sm font-naskh opacity-80 mb-2">{t("hijri.today", "اليوم")}</p>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-5xl font-bold font-mono">{toArabicDigits(currentHijri.day)}</span>
                    <div className="text-right">
                      <p className="text-xl font-bold font-naskh">{currentHijri.month}</p>
                      <p className="text-sm font-mono opacity-80">{toArabicDigits(currentHijri.year)} {i18n.language === 'ar' ? 'هـ' : 'AH'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-primary-foreground/20">
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
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
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
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center">
                {(t("hijri.weekDays", { returnObjects: true, defaultValue: ["ح", "ن", "ث", "ر", "خ", "ج", "س"] }) as string[]).map((d, idx) => (
                  <div key={`${d}-${idx}`} className="text-[10px] font-bold text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: getStartDayOfWeek() }).map((_, i) => (
                  <div key={`empty-${i}`} className="py-3" />
                ))}
                {calendarData.map((day) => {
                  const enhancedHolidays = getEnhancedHolidays(day, i18n.language);
                  const hasHolidays = enhancedHolidays.length > 0;
                  const hasGoals = goals[day.date.gregorian.date] && goals[day.date.gregorian.date].length > 0;
                  const isSelected = selectedDay?.date.gregorian.date === day.date.gregorian.date;
                  const today = isToday(day.date.gregorian.day);

                  return (
                    <button 
                      key={day.date.gregorian.date} 
                      onClick={() => setSelectedDay(day)}
                      className={`relative py-3 text-sm font-mono rounded-xl transition-all flex flex-col items-center justify-center group ${
                        today ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""
                      } ${
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span className="font-bold">{toArabicDigits(day.date.hijri.day)}</span>
                      <span className={`text-[8px] ${isSelected ? 'opacity-80' : 'opacity-50'}`}>
                        {toArabicDigits(day.date.gregorian.day)}
                      </span>
                      
                      {/* Indicators */}
                      <div className="absolute bottom-1 flex gap-0.5">
                        {hasHolidays && (
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-gold-light' : 'bg-gold'}`} />
                        )}
                        {hasGoals && (
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-naskh leading-relaxed">
              {t("hijri.info", "يمكنك الضغط على أي يوم لإضافة أهدافك أو رؤية المناسبات الإسلامية.")}
            </p>
          </div>
        </div>
      </div>

      {/* Day Details & Goals Modal */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-card border-t border-border rounded-t-[2.5rem] p-6 sm:p-8 z-50 shadow-2xl"
            >
              <div className="max-w-md mx-auto">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold font-naskh text-primary">
                      {toArabicDigits(selectedDay.date.hijri.day)} {i18n.language === 'ar' ? selectedDay.date.hijri.month.ar : selectedDay.date.hijri.month.en} {toArabicDigits(selectedDay.date.hijri.year)}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedDay.date.gregorian.date}
                    </p>
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Islamic Events */}
                {selectedDay && getEnhancedHolidays(selectedDay, i18n.language).length > 0 && (
                  <div className="mb-8 space-y-3">
                    <h4 className="text-sm font-bold font-naskh text-gold flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      {t("hijri.events", "المناسبات الإسلامية")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getEnhancedHolidays(selectedDay, i18n.language).map((holiday, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gold/10 border border-gold/20 text-gold-dark dark:text-gold-light text-sm rounded-2xl font-naskh">
                          {holiday}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goals Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold font-naskh text-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    {t("hijri.goals", "أهداف اليوم")}
                  </h4>
                  
                  <div className="space-y-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                    {(goals[selectedDay.date.gregorian.date] || []).map(goal => (
                      <div key={goal.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl border border-border/50 group">
                        <button 
                          onClick={() => toggleGoal(selectedDay.date.gregorian.date, goal.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${goal.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 hover:border-primary/50'}`}
                        >
                          {goal.completed && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="flex flex-col flex-1">
                          <span className={`text-sm font-naskh transition-all ${goal.completed ? 'line-through text-muted-foreground opacity-70' : 'text-foreground'}`}>
                            {goal.text}
                          </span>
                          {goal.notifyTime && (
                            <span className={`text-[10px] flex items-center gap-1 mt-1 ${goal.completed ? 'text-muted-foreground opacity-50' : 'text-primary/80'}`}>
                              <Bell className="w-3 h-3" /> {goal.notifyTime}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => deleteGoal(selectedDay.date.gregorian.date, goal.id)}
                          className="p-2 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {(!goals[selectedDay.date.gregorian.date] || goals[selectedDay.date.gregorian.date].length === 0) && (
                      <div className="text-center py-8 bg-muted/20 rounded-2xl border border-border/30 border-dashed">
                        <p className="text-sm text-muted-foreground font-naskh">
                          {t("hijri.noGoals", "لا توجد أهداف لهذا اليوم. أضف هدفاً جديداً!")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <input 
                      type="text"
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                      placeholder={t("hijri.addGoalPlaceholder", "أضف هدفاً جديداً...")}
                      className="flex-1 bg-muted/50 border border-border rounded-2xl px-4 py-3 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <input
                      type="time"
                      value={newGoalTime}
                      onChange={(e) => setNewGoalTime(e.target.value)}
                      className="w-[110px] bg-muted/50 border border-border rounded-2xl px-3 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button 
                      onClick={handleAddGoal}
                      disabled={!newGoalText.trim()}
                      className="px-4 bg-primary text-primary-foreground rounded-2xl disabled:opacity-50 transition-all flex items-center justify-center hover:bg-primary/90 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HijriCalendar;
