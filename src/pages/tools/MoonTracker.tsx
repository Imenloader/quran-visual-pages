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
        // Offline-safe Hijri date from the Intl Umm al-Qura calendar
        try {
          const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' });
          const parts = fmt.formatToParts(new Date());
          const get = (t: string) => parts.find(p => p.type === t)?.value || '';
          const monthEn = get('month');
          const monthNames: Record<string, { en: string; ar: string }> = {
            'Muharram': { en: 'Muharram', ar: 'محرم' },
            'Safar': { en: 'Safar', ar: 'صفر' },
            "Rabi' al-awwal": { en: "Rabi' al-awwal", ar: 'ربيع الأول' },
            "Rabi' al-thani": { en: "Rabi' al-thani", ar: 'ربيع الثاني' },
            'Jumada al-ula': { en: 'Jumada al-ula', ar: 'جمادى الأولى' },
            'Jumada al-akhira': { en: 'Jumada al-akhira', ar: 'جمادى الآخرة' },
            'Rajab': { en: 'Rajab', ar: 'رجب' },
            "Sha'ban": { en: "Sha'ban", ar: 'شعبان' },
            'Ramadan': { en: 'Ramadan', ar: 'رمضان' },
            'Shawwal': { en: 'Shawwal', ar: 'شوال' },
            "Dhu al-Qi'dah": { en: "Dhu al-Qi'dah", ar: 'ذو القعدة' },
            'Dhu al-Hijjah': { en: 'Dhu al-Hijjah', ar: 'ذو الحجة' },
          };
          const matched = Object.keys(monthNames).find(k => monthEn.includes(k));
          setHijriDate({
            day: get('day'),
            month: matched ? monthNames[matched] : { en: monthEn, ar: monthEn },
            year: get('year').replace(/[^0-9]/g, '')
          });
        } catch { /* Intl calendar unavailable */ }
      } finally {
        setLoading(false);
      }
    };

    fetchMoonData();
  }, [calculateLocalMoonPhase]);

  const renderMoon = () => {
    const size = 220;
    const r = size / 2;
    // Waxing shows lit side on the LEFT in sky-view for southern crescent;
    // standard convention: lit side left when waxing (as seen after sunset)
    const waxing = moonPhase <= 0.5;
    const illumination = waxing ? moonPhase * 2 : (1 - moonPhase) * 2;

    // Terminator ellipse offset: 0 = half moon, near r = thin crescent
    const offset = r * (1 - 2 * Math.abs(0.5 - illumination));

    return (
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full bg-amber-100 shadow-[0_0_80px_-10px_rgba(254,240,138,0.5)]" />
        {/* shadow disc, offset to carve the terminator */}
        <div
          className="absolute inset-0 rounded-full bg-slate-950 transition-all duration-1000"
          style={{
            transform: `translateX(${waxing ? offset : -offset}px)`,
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)"
          }}
        />
        {/* subtle craters */}
        <div className="absolute rounded-full bg-amber-200/40" style={{ width: size*0.18, height: size*0.18, top: size*0.25, left: size*0.3 }} />
        <div className="absolute rounded-full bg-amber-200/30" style={{ width: size*0.12, height: size*0.12, top: size*0.55, left: size*0.55 }} />
        <div className="absolute rounded-full bg-amber-200/25" style={{ width: size*0.09, height: size*0.09, top: size*0.35, left: size*0.62 }} />
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
              {[1, 2, 3].map((i) => {
                // Anchor predictions on the current Hijri day (via API) so the
                // cadence tracks the real lunar month, not a fixed guess
                const currentDay = hijriDate ? parseInt(hijriDate.day) : 1;
                const daysToNextNewMoon = (29.53 - currentDay) + (i - 1) * 29.53;
                const predicted = addDays(new Date(), Math.round(daysToNextNewMoon));
                return (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/40">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isAr ? "بداية الشهر المتوقعة" : "Expected Start Date"}</p>
                      <p className="font-bold">{format(predicted, 'dd MMMM yyyy', { locale })}</p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                );
              })}
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
                <span className="text-xs font-bold uppercase tracking-wider">{isAr ? "حسابات فلكية عامة بتاريخ اليوم" : "General astronomical calculations for today"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonTracker;
