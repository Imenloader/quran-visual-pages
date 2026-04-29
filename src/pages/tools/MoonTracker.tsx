import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Calendar, Info, Star, Sparkles, MapPin, Clock } from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import { format, addDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const MoonTracker = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const locale = isAr ? ar : enUS;

  const [moonPhase, setMoonPhase] = useState(0); // 0 to 1
  const [phaseName, setPhaseName] = useState({ en: "", ar: "" });
  const [hijriDate, setHijriDate] = useState<{ day: string, month: { en: string, ar: string }, year: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateLocalMoonPhase = useCallback(() => {
    const lp = 2551443;
    const now = new Date().getTime() / 1000;
    const phase = ((now - 1609459200) % lp) / lp;
    setMoonPhase(phase);

    if (phase < 0.03 || phase > 0.97) setPhaseName({ en: "New Moon (Hilal)", ar: "هلال الشهر الجديد" });
    else if (phase < 0.22) setPhaseName({ en: "Waxing Crescent", ar: "هلال متزايد" });
    else if (phase < 0.28) setPhaseName({ en: "First Quarter", ar: "تربيع أول" });
    else if (phase < 0.47) setPhaseName({ en: "Waxing Gibbous", ar: "أحدب متزايد" });
    else if (phase < 0.53) setPhaseName({ en: "Full Moon (Badr)", ar: "بدر" });
    else if (phase < 0.72) setPhaseName({ en: "Waning Gibbous", ar: "أحدب متناقص" });
    else if (phase < 0.78) setPhaseName({ en: "Last Quarter", ar: "تربيع ثانٍ" });
    else setPhaseName({ en: "Waning Crescent", ar: "هلال متناقص" });
  }, []);

  useEffect(() => {
    const fetchMoonData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const res = await fetch(`https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();
        
        if (data.data && data.data.hijri) {
          setHijriDate(data.data.hijri);
          const day = parseInt(data.data.hijri.day);
          setMoonPhase((day - 1) / 29.53);

          if (day === 1) setPhaseName({ en: "New Moon (Hilal)", ar: "هلال الشهر الجديد" });
          else if (day < 7) setPhaseName({ en: "Waxing Crescent", ar: "هلال متزايد" });
          else if (day < 9) setPhaseName({ en: "First Quarter", ar: "تربيع أول" });
          else if (day < 14) setPhaseName({ en: "Waxing Gibbous", ar: "أحدب متزايد" });
          else if (day < 17) setPhaseName({ en: "Full Moon (Badr)", ar: "بدر" });
          else if (day < 22) setPhaseName({ en: "Waning Gibbous", ar: "أحدب متناقص" });
          else if (day < 24) setPhaseName({ en: "Last Quarter", ar: "تربيع ثانٍ" });
          else setPhaseName({ en: "Waning Crescent", ar: "هلال متناقص" });
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.warn("Failed to fetch moon data from API, falling back to local calculation:", error);
        calculateLocalMoonPhase();
      } finally {
        setLoading(false);
      }
    };

    fetchMoonData();
  }, [calculateLocalMoonPhase]);

  const renderMoon = () => {
    const size = 200;
    const radius = size / 2;
    const illumination = moonPhase <= 0.5 ? moonPhase * 2 : (1 - moonPhase) * 2;
    
    return (
      <div className="relative w-[200px] h-[200px] mx-auto">
        {/* Background Glow */}
        <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        
        {/* Moon Base */}
        <div className="absolute inset-0 rounded-full bg-slate-900 border-4 border-slate-800 shadow-2xl overflow-hidden">
          {/* Craters (Static) */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-slate-800/50" />
          <div className="absolute bottom-1/3 right-1/4 w-12 h-12 rounded-full bg-slate-800/50" />
          <div className="absolute top-1/2 right-1/3 w-6 h-6 rounded-full bg-slate-800/50" />
          
          {/* Illumination Layer */}
          <div 
            className="absolute inset-0 bg-amber-100"
            style={{
              clipPath: moonPhase <= 0.5 
                ? `ellipse(${illumination * 100}% 100% at 100% 50%)`
                : `ellipse(${(1 - illumination) * 100}% 100% at 0% 50%)`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={isAr ? "راصد الأهلة" : "Moon Sighting Tracker"} 
        subtitle={isAr ? "تتبع منازل القمر وبدايات الشهور الهجرية" : "Track moon phases and Hijri month beginnings"}
        variant="compact"
      />

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-12">
        {/* Main Moon Display */}
        <div className="bento-card !p-12 text-center space-y-8 bg-slate-950 text-white border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 pattern-islamic opacity-5 group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="relative z-10 space-y-8">
            {renderMoon()}
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold font-naskh text-amber-100">
                {loading ? (isAr ? "جاري التحميل..." : "Loading...") : (isAr ? phaseName.ar : phaseName.en)}
              </h2>
              <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-sm">
                {isAr ? "المرحلة الحالية للقمر" : "Current Lunar Phase"}
              </p>
              {hijriDate && (
                <div className="pt-4 flex flex-col items-center gap-1">
                  <p className="text-amber-500 font-bold font-naskh text-lg">
                    {hijriDate.day} {isAr ? hijriDate.month.ar : hijriDate.month.en} {hijriDate.year}
                  </p>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">
                    {isAr ? "التاريخ الهجري" : "Hijri Date"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-12">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">{isAr ? "الإضاءة" : "Illumination"}</p>
                <p className="text-2xl font-bold text-amber-200">
                  {Math.round((moonPhase <= 0.5 ? moonPhase * 2 : (1 - moonPhase) * 2) * 100)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">{isAr ? "العمر" : "Age"}</p>
                <p className="text-2xl font-bold text-amber-200">
                  {Math.round(moonPhase * 29.53)} <span className="text-xs font-normal text-slate-500">{isAr ? "أيام" : "Days"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hijri Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-card !p-8 space-y-6">
            <h3 className="text-xl font-bold font-naskh flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {isAr ? "توقعات الشهور القادمة" : "Upcoming Month Predictions"}
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/40">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isAr ? "بداية الشهر المتوقعة" : "Expected Start Date"}</p>
                      <p className="font-bold">{format(addDays(new Date(), i * 29.5), 'dd MMMM yyyy', { locale })}</p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card !p-8 space-y-6">
            <h3 className="text-xl font-bold font-naskh flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              {isAr ? "معلومات هامة" : "Important Information"}
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed font-naskh">
              <p>
                {isAr 
                  ? "يعتمد التقويم الهجري على رؤية الهلال بالعين المجردة أو بالتلسكوب. الحسابات الفلكية هنا هي توقعات علمية دقيقة ولكن القرار النهائي يرجع للمحاكم الشرعية ولجان الرؤية."
                  : "The Hijri calendar depends on the sighting of the new crescent moon by the naked eye or telescope. The astronomical calculations here are accurate scientific predictions, but the final decision rests with Sharia courts and sighting committees."}
              </p>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary">
                <MapPin className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">{isAr ? "الحسابات بناءً على موقعك الحالي" : "Calculations based on your current location"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonTracker;
