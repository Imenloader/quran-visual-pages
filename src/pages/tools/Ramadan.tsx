import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Moon, 
  Star, 
  Heart, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Calendar, 
  Utensils, 
  HandHeart,
  ChevronRight,
  Info,
  Loader2
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";
import { toArabicNumber } from "@/data/quranData";

const Ramadan = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRamadan, setIsRamadan] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchRamadanDate = async () => {
      try {
        // 1. Get current Hijri date
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        
        const hijriRes = await fetch(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);
        const hijriData = await hijriRes.json();
        
        if (hijriData.status === "OK") {
          const hMonth = parseInt(hijriData.data.hijri.month.number);
          const hYear = parseInt(hijriData.data.hijri.year);
          
          if (hMonth === 9) {
            setIsRamadan(true);
            setLoading(false);
            return;
          }
          
          // 2. Determine next Ramadan Hijri year
          const nextRamadanYear = hMonth < 9 ? hYear : hYear + 1;
          
          // 3. Get Gregorian date for 1st of Ramadan of that year
          const nextRamadanRes = await fetch(`https://api.aladhan.com/v1/hToG/01-09-${nextRamadanYear}`);
          const nextRamadanData = await nextRamadanRes.json();
          
          if (nextRamadanData.status === "OK") {
            const gDateStr = nextRamadanData.data.gregorian.date; // DD-MM-YYYY
            const [gDay, gMonth, gYear] = gDateStr.split("-").map(Number);
            const ramadanDate = new Date(gYear, gMonth - 1, gDay);
            
            startCountdown(ramadanDate);
          }
        }
      } catch (error) {
        console.error("Failed to fetch Ramadan date:", error);
        // Fallback to approximate date if API fails
        startCountdown(new Date("2026-03-20T00:00:00"));
      } finally {
        setLoading(false);
      }
    };

    const startCountdown = (targetDate: Date) => {
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();
        
        if (difference <= 0) {
          setIsRamadan(true);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setCountdown({ days, hours, minutes, seconds });
        }
      }, 1000);
    };

    fetchRamadanDate();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sections = [
    {
      title: t("ramadan.virtues"),
      description: t("ramadan.virtuesDesc"),
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      color: "bg-rose-500/10",
      path: "/ramadan/virtues"
    },
    {
      title: t("ramadan.fastingRules"),
      description: t("ramadan.fastingRulesDesc"),
      icon: <Utensils className="w-6 h-6 text-amber-500" />,
      color: "bg-amber-500/10",
      path: "/ramadan/fasting-rules"
    },
    {
      title: t("ramadan.duas"),
      description: t("ramadan.duasDesc"),
      icon: <HandHeart className="w-6 h-6 text-emerald-500" />,
      color: "bg-emerald-500/10",
      path: "/ramadan/duas"
    },
    {
      title: t("ramadan.tips"),
      description: t("ramadan.tipsDesc"),
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
      color: "bg-indigo-500/10",
      path: "/ramadan/tips"
    },
    {
      title: t("ramadan.laylatulQadr"),
      description: t("ramadan.laylatulQadrDesc"),
      icon: <Moon className="w-6 h-6 text-purple-500" />,
      color: "bg-purple-500/10",
      path: "/ramadan/laylatul-qadr"
    },
    {
      title: t("ramadan.zakatAlFitr"),
      description: t("ramadan.zakatAlFitrDesc"),
      icon: <HandHeart className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-500/10",
      path: "/ramadan/zakat-al-fitr"
    }
  ];

  return (
    <div className="relative min-h-screen bg-background pb-24 overflow-x-hidden">
      <QuranHeader 
        title={t("ramadan.title")} 
        subtitle={t("ramadan.subtitle")} 
        variant="compact" 
      />

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-12">
        {/* Countdown Section */}
        <ScrollReveal>
          <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-deep to-primary p-8 md:p-12 text-white shadow-2xl border border-white/10">
            <div className="absolute inset-0 pattern-islamic opacity-10" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30"
              >
                <Moon className="w-10 h-10 text-gold fill-gold" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-lg">
                  {loading ? (
                    <span className="flex items-center gap-3 justify-center">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      {t("hub.offline.progress").replace("{{progress}}", "...")}
                    </span>
                  ) : isRamadan ? (
                    t("ramadan.ramadanIsHere")
                  ) : (
                    t("ramadan.countdown")
                  )}
                </h2>
                {!isRamadan && !loading && (
                  <div className="flex gap-4 md:gap-8 justify-center pt-4">
                    {[
                      { label: t("ramadan.days"), value: countdown.days },
                      { label: t("ramadan.hours"), value: countdown.hours },
                      { label: t("ramadan.minutes"), value: countdown.minutes },
                      { label: t("ramadan.seconds"), value: countdown.seconds }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-3xl md:text-5xl font-bold text-gold">
                          {i18n.language === "ar" ? toArabicNumber(item.value) : item.value}
                        </span>
                        <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60 font-bold">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Hadith Section */}
        <ScrollReveal delay={0.2}>
          <section className="bento-card !p-8 bg-card/40 backdrop-blur-xl border border-border/40 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BookOpen size={64} />
            </div>
            <h3 className="text-gold font-bold text-sm uppercase tracking-[0.3em] mb-4">
              {t("ramadan.hadith.title")}
            </h3>
            <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-foreground/90">
              {t("ramadan.hadith.content")}
            </p>
          </section>
        </ScrollReveal>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <ScrollReveal key={idx} delay={0.3 + idx * 0.1}>
              <button 
                onClick={() => navigate(section.path)}
                className="w-full text-right bento-card group hover:shadow-xl transition-all duration-500 border border-border/40 overflow-hidden"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${section.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                    {section.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-serif">{section.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>

        {/* Daily Ramadan Checklist (Placeholder for future expansion) */}
        <ScrollReveal delay={0.8}>
          <section className="rounded-[2.5rem] bg-accent/5 border border-accent/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{t("hub.planning")}</h3>
                <p className="text-muted-foreground text-sm">
                  {t("ramadan.tipsDesc")}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/khatma")}
              className="px-8 py-3 rounded-2xl bg-accent text-white font-bold shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
            >
              {t("hub.khatma")}
            </button>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Ramadan;
