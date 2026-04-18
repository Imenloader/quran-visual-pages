import React, { useState, useEffect } from "react";
import { 
  Bell, 
  BookOpen, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  Calendar,
  ChevronLeft,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import QuranHeader from "@/components/QuranHeader";
import { Link } from "react-router-dom";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

interface SunnahItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const FridaySunan = () => {
  const [isFriday, setIsFriday] = useState(false);
  const [sunan, setSunan] = useState<SunnahItem[]>([
    {
      id: "kahf",
      title: "قراءة سورة الكهف",
      description: "تضيء لك ما بين الجمعتين",
      icon: <BookOpen className="text-primary" />,
      completed: false
    },
    {
      id: "ghusl",
      title: "الاغتسال والتطيب",
      description: "من سنن يوم الجمعة المؤكدة",
      icon: <Sparkles className="text-blue-500" />,
      completed: false
    },
    {
      id: "duaa",
      title: "تحري ساعة الاستجابة",
      description: "بين العصر والمغرب",
      icon: <Clock className="text-amber-500" />,
      completed: false
    },
    {
      id: "salat",
      title: "الصلاة على النبي ﷺ",
      description: "أكثروا من الصلاة عليه في هذا اليوم",
      icon: <Heart className="text-rose-500" />,
      completed: false
    },
    {
      id: "early",
      title: "التبكير لصلاة الجمعة",
      description: "والدنو من الإمام",
      icon: <Calendar className="text-indigo-500" />,
      completed: false
    }
  ]);

  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem("friday-reminder-enabled") === "true";
  });

  useEffect(() => {
    const checkFriday = () => {
      const today = new Date().getDay();
      setIsFriday(today === 5); // 5 is Friday
    };
    checkFriday();
    
    // Load completion status
    const savedStatus = localStorage.getItem("friday-sunan-status");
    if (savedStatus) {
      const status = JSON.parse(savedStatus);
      const today = new Date().toDateString();
      if (status.date === today) {
        setSunan(prev => prev.map(item => ({
          ...item,
          completed: status.completedIds.includes(item.id)
        })));
      }
    }
  }, []);

  const toggleSunnah = (id: string) => {
    const newSunan = sunan.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setSunan(newSunan);
    
    // Save status
    const completedIds = newSunan.filter(i => i.completed).map(i => i.id);
    localStorage.setItem("friday-sunan-status", JSON.stringify({
      date: new Date().toDateString(),
      completedIds
    }));

    const item = sunan.find(i => i.id === id);
    if (!item?.completed) {
      toast.success(`تم إتمام: ${item?.title}`, {
        icon: <CheckCircle2 className="text-emerald-500" />
      });
    }
  };

  const toggleReminder = async () => {
    if (!reminderEnabled) {
      if (Capacitor.isNativePlatform()) {
        const check = await LocalNotifications.checkPermissions();
        if (check.display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          if (request.display !== 'granted') {
            toast.error("يرجى تفعيل إذن التنبيهات من إعدادات الجهاز");
            return;
          }
        }
      } else if ("Notification" in window) {
        const title = "التنبيهات";
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("يرجى تفعيل إذن التنبيهات");
          return;
        }
      } else {
        toast.error("متصفحك لا يدعم التنبيهات");
        return;
      }
    }
    
    const newState = !reminderEnabled;
    setReminderEnabled(newState);
    localStorage.setItem("friday-reminder-enabled", String(newState));
    toast.success(newState ? "تم تفعيل تنبيهات يوم الجمعة" : "تم إيقاف تنبيهات يوم الجمعة");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader title="سنن يوم الجمعة" showBack />
      
      <main className="container max-w-2xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 mb-8 shadow-islamic">
          <div className="absolute inset-0 pattern-islamic opacity-10" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 backdrop-blur-md flex items-center justify-center mb-6 border border-primary/20">
              <Sparkles className="text-gold" size={40} />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-3">يوم الجمعة</h1>
            <p className="text-primary-foreground/80 font-serif italic text-sm max-w-xs">
              "خير يوم طلعت عليه الشمس يوم الجمعة"
            </p>
            
            {isFriday ? (
              <div className="mt-6 px-6 py-2 rounded-full bg-gold text-primary font-bold text-sm animate-pulse">
                اليوم هو الجمعة المباركة
              </div>
            ) : (
              <div className="mt-6 px-6 py-2 rounded-full bg-primary/10 text-white/80 text-xs font-serif">
                بانتظار الجمعة القادمة...
              </div>
            )}
          </div>
        </section>

        {/* Reminder Toggle */}
        <section className="bg-card border border-border rounded-3xl p-6 mb-8 shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${reminderEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Bell size={24} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-foreground">تنبيهات الجمعة</h2>
              <p className="text-xs text-muted-foreground font-serif italic">تذكير بسورة الكهف والسنن</p>
            </div>
          </div>
          <button
            onClick={toggleReminder}
            className={`w-14 h-8 rounded-full transition-all relative ${reminderEnabled ? "bg-primary" : "bg-muted border border-border"}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${reminderEnabled ? "left-1" : "left-[calc(100%-1.75rem)]"}`} />
          </button>
        </section>

        {/* Sunan Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-serif text-xl font-bold text-primary">قائمة السنن</h2>
            <span className="text-xs font-serif text-muted-foreground italic">
              {sunan.filter(s => s.completed).length} من {sunan.length} مكتمل
            </span>
          </div>
          
          {sunan.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleSunnah(item.id)}
              className={`group relative overflow-hidden rounded-3xl border-2 p-5 transition-all cursor-pointer ${
                item.completed 
                  ? "border-primary bg-primary/5" 
                  : "border-border/40 bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  item.completed ? "bg-primary text-white shadow-lg" : "bg-muted/50 text-muted-foreground"
                }`}>
                  {item.completed ? <CheckCircle2 size={28} /> : item.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-serif text-lg font-bold transition-colors ${
                    item.completed ? "text-primary" : "text-foreground"
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-serif italic">{item.description}</p>
                </div>

                {item.id === "kahf" && (
                  <Link
                    to="/juz/15#page-293"
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all"
                    title="اقرأ الآن"
                  >
                    <BookOpen size={18} />
                  </Link>
                )}
              </div>
              
              {item.completed && (
                <motion.div
                  layoutId="check-overlay"
                  className="absolute inset-0 bg-primary/5 pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <section className="mt-12 p-6 rounded-3xl bg-accent/5 border border-accent/10 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-accent mb-1">لماذا سورة الكهف؟</h4>
            <p className="text-xs text-muted-foreground font-serif leading-relaxed italic">
              عن أبي سعيد الخدري رضي الله عنه أن النبي ﷺ قال: "من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين". رواه الحاكم والبيهقي.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FridaySunan;
