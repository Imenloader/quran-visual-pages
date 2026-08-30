import React, { useState, useMemo, useEffect } from 'react';
import { Moon, Edit2, ArrowLeft, MapPin, Clock, Loader2, Sparkles, BookOpen, Timer, ChevronRight } from 'lucide-react';
import { surahData, surahByNumber } from '@/data/quranData';
import { useQanet } from './QanetContext';
import { StatCard } from './components/StatCard';
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { storage } from "@/lib/storage";
import { PRAYER_SETTINGS_KEY, DEFAULT_SETTINGS } from '@/hooks/usePrayerTimes';

interface LastThirdInfo {
  loading: boolean;
  error: string | null;
  time: string | null;
  fajr: string | null;
  maghrib: string | null;
  cityName: string | null;
}

const PRESET_PLANS = [
  { id: 'heedless', label: 'عدم الغفلة', ayahs: 10, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'qanet', label: 'القنوت', ayahs: 100, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'muqantar', label: 'القنطرة', ayahs: 1000, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export default function QanetCalculator() {
  const { language } = useQanet();
  const [prayerMethod, setPrayerMethod] = useState(4);
  const isArabic = language === 'ar';

  useEffect(() => {
    const loadMethod = async () => {
      const stored = await storage.get(PRAYER_SETTINGS_KEY);
      if (stored) {
        try {
          const s = JSON.parse(stored);
          if (s.method) setPrayerMethod(s.method);
        } catch {}
      }
    };
    loadMethod();
  }, []);
  const [mode, setMode] = useState<'target' | 'range'>('target');
  const [target, setTarget] = useState(100);
  const [customTarget, setCustomTarget] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [startSurah, setStartSurah] = useState(2);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(2);
  const [endAyah, setEndAyah] = useState(10);
  const [lastThird, setLastThird] = useState<LastThirdInfo>({
    loading: false, error: null, time: null, fajr: null, maghrib: null, cityName: null
  });

  // Ensure end point is always after start point in range mode
  useEffect(() => {
    if (mode === 'range') {
      if (endSurah < startSurah) {
        setEndSurah(startSurah);
        setEndAyah(startAyah);
      } else if (endSurah === startSurah && endAyah < startAyah) {
        setEndAyah(startAyah);
      }
    }
  }, [startSurah, startAyah, endSurah, endAyah, mode]);

  // --- Target Mode Logic ---
  const targetResult = useMemo(() => {
    if (mode !== 'target') return null;
    let remaining = target;
    let currentSurah = startSurah;
    let currentAyah = startAyah;
    
    const startSurahInfo = surahByNumber.get(currentSurah);
    if (!startSurahInfo) return null;
    
    const availableInStart = startSurahInfo.ayahs - currentAyah + 1;
    if (remaining <= availableInStart) {
      return {
        endSurah: currentSurah,
        endAyah: currentAyah + remaining - 1,
        endSurahName: startSurahInfo.name,
      };
    }
    
    remaining -= availableInStart;
    currentSurah++;
    
    while (remaining > 0 && currentSurah <= 114) {
      const surah = surahByNumber.get(currentSurah);
      if (!surah) break;
      if (remaining <= surah.ayahs) {
        return { endSurah: currentSurah, endAyah: remaining, endSurahName: surah.name };
      }
      remaining -= surah.ayahs;
      currentSurah++;
    }
    
    const lastSurah = surahData[113];
    return { endSurah: 114, endAyah: lastSurah.ayahs, endSurahName: lastSurah.name };
  }, [mode, target, startSurah, startAyah]);

  const rangeTotal = useMemo(() => {
    if (mode !== 'range') return 0;
    if (startSurah === endSurah) return Math.max(0, endAyah - startAyah + 1);
    
    let total = 0;
    const startInfo = surahByNumber.get(startSurah);
    if (startInfo) total += startInfo.ayahs - startAyah + 1;
    
    for (let i = startSurah + 1; i < endSurah; i++) {
      const s = surahByNumber.get(i);
      if (s) total += s.ayahs;
    }
    
    total += endAyah;
    return Math.max(0, total);
  }, [mode, startSurah, startAyah, endSurah, endAyah]);

  const displayTotal = mode === 'target' ? target : rangeTotal;
  
  const estimatedTime = Math.round((displayTotal * 15) / 60);
  const estimatedRub = (displayTotal / 26).toFixed(1);

  const startSurahInfo = surahByNumber.get(startSurah);
  const endSurahInfo = mode === 'target' && targetResult
    ? surahByNumber.get(targetResult.endSurah)
    : surahByNumber.get(endSurah);

  const calculateLastThird = async () => {
    setLastThird({ loading: true, error: null, time: null, fajr: null, maghrib: null, cityName: null });
    try {
      let latitude: number, longitude: number;
      
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') await Geolocation.requestPermissions();
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      
      // Use user's preferred method if available, default to 4
      const method = prayerMethod;
      const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=${method}`);
      
      if (!res.ok) throw new Error('فشل في جلب المواقيت');
      const data = await res.json();
      const timings = data.data.timings;
      const [mH, mM] = timings.Maghrib.split(':').map(Number);
      const [fH, fM] = timings.Fajr.split(':').map(Number);
      const maghribMinutes = mH * 60 + mM;
      let fajrMinutes = fH * 60 + fM;
      if (fajrMinutes < maghribMinutes) fajrMinutes += 24 * 60;
      const nightDuration = fajrMinutes - maghribMinutes;
      const lastThirdStart = maghribMinutes + Math.floor(nightDuration * 2 / 3);
      const ltHours = Math.floor(lastThirdStart / 60) % 24;
      const ltMinutes = lastThirdStart % 60;
      
      // Convert to 12h format for display
      const period = ltHours >= 12 ? 'م' : 'ص';
      const h12 = ltHours % 12 || 12;
      const ltFormatted = `${h12}:${String(ltMinutes).padStart(2, '0')} ${period}`;
      
      setLastThird({
        loading: false, error: null, time: ltFormatted, fajr: timings.Fajr, maghrib: timings.Maghrib,
        cityName: data.data.meta?.timezone || null
      });
    } catch (err: any) {
      setLastThird({ loading: false, error: 'فشل في الحساب', time: null, fajr: null, maghrib: null, cityName: null });
    }
  };

  return (
    <div className="p-6 pt-4 pb-32 max-w-2xl mx-auto space-y-10" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-primary font-naskh">{isArabic ? 'مخطط القنوت' : 'Qanoot Planner'}</h1>
        <p className="text-muted-foreground text-sm font-medium">{isArabic ? 'دليلك لحساب وردك الليلة بدقة' : 'Your guide to calculating your night word accurately'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Last Third Banner - Premium */}
          <button
            onClick={calculateLastThird}
            disabled={lastThird.loading}
            className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-[2rem] p-6 flex items-center justify-between shadow-soft group hover:border-primary/50 transition-all"
          >
            <div className="flex-1 text-right">
              {lastThird.time ? (
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground flex items-center gap-2 justify-end">
                    <Clock size={16} className="text-primary" />
                    بداية الثلث الأخير: {lastThird.time}
                  </h3>
                  <div className="flex items-center justify-end gap-2 opacity-60 text-[10px] font-bold">
                    <span>المغرب: {lastThird.maghrib}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span>الفجر: {lastThird.fajr}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground">{isArabic ? 'بداية الثلث الأخير' : 'Last Third Start'}</h3>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{isArabic ? 'اضغط للحساب تلقائياً' : 'Click to calculate'}</p>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
              {lastThird.loading ? (
                <Loader2 size={24} className="text-primary animate-spin" />
              ) : (
                <Moon size={24} className="text-primary group-hover:scale-110 transition-transform" />
              )}
            </div>
          </button>

          {/* Preset Selection Grid */}
          <div className="glass-card hover:-translate-y-1 rounded-[2.5rem] p-8 shadow-soft space-y-6">
            <h3 className="font-bold text-lg font-naskh flex items-center gap-2">
              <Sparkles className="text-primary w-5 h-5" />
              {isArabic ? 'خطط مقترحة' : 'Suggested Plans'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {PRESET_PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => { 
                    setTarget(plan.ayahs); 
                    setMode('range');
                    // Find end point for this target starting from current start
                    let remaining = plan.ayahs;
                    let currSurah = startSurah;
                    let currAyah = startAyah;
                    let found = false;

                    const startS = surahByNumber.get(currSurah);
                    if (startS) {
                      const avail = startS.ayahs - currAyah + 1;
                      if (remaining <= avail) {
                        setEndSurah(currSurah);
                        setEndAyah(currAyah + remaining - 1);
                        found = true;
                      } else {
                        remaining -= avail;
                        currSurah++;
                      }
                    }

                    if (!found) {
                      while (currSurah <= 114) {
                        const s = surahByNumber.get(currSurah);
                        if (!s) break;
                        if (remaining <= s.ayahs) {
                          setEndSurah(currSurah);
                          setEndAyah(remaining);
                          found = true;
                          break;
                        }
                        remaining -= s.ayahs;
                        currSurah++;
                      }
                    }

                    if (!found) {
                      setEndSurah(114);
                      setEndAyah(6);
                    }
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    target === plan.ayahs && mode === 'range' 
                      ? `${plan.bg} border-${plan.id === 'muqantar' ? 'purple' : plan.id === 'qanet' ? 'emerald' : 'red'}-500/50`
                      : 'bg-muted/30 border-transparent hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${plan.color} ${plan.bg}`}>
                      {plan.ayahs}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{plan.label}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{plan.ayahs} آيات</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className={`text-muted-foreground ${isArabic ? 'rotate-180' : ''}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculator Main Section */}
        <div className="glass-card hover:-translate-y-1 rounded-[2.5rem] p-8 shadow-soft space-y-8">
          {/* Mode Switcher */}
          <div className="flex bg-muted rounded-[1.5rem] p-1.5">
            <button
              onClick={() => setMode('target')}
              className={`flex-1 py-3 rounded-xl font-bold text-[11px] transition-all ${mode === 'target' ? 'bg-background text-foreground shadow-islamic' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {isArabic ? 'الآيات المستهدفة' : 'Target Count'}
            </button>
            <button
              onClick={() => setMode('range')}
              className={`flex-1 py-3 rounded-xl font-bold text-[11px] transition-all ${mode === 'range' ? 'bg-background text-foreground shadow-islamic' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {isArabic ? 'نطاق مخصص' : 'Custom Range'}
            </button>
          </div>

          {mode === 'target' && (
            <div className="space-y-4">
              <label className="block text-right text-muted-foreground text-[10px] font-bold uppercase tracking-widest px-1">العدد المستهدف</label>
              <div className="relative" dir="rtl">
                <input
                  type="number"
                  min="0"
                  value={target}
                  onChange={e => setTarget(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-muted/50 border-2 border-border focus:border-primary outline-none rounded-2xl py-5 px-6 text-foreground text-center font-black text-3xl tabular-nums shadow-inner transition-all"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">آية</div>
              </div>
            </div>
          )}

          {/* Start Point Selection */}
          <div className="space-y-4">
            <label className="block text-right text-muted-foreground text-[10px] font-bold uppercase tracking-widest px-1">نقطة البداية</label>
            <div className="flex gap-3" dir="rtl">
              <div className="flex-1 relative">
                <select
                  value={startSurah}
                  onChange={e => { setStartSurah(Number(e.target.value)); setStartAyah(1); }}
                  className="w-full bg-muted/50 border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-sm font-bold appearance-none cursor-pointer pr-10"
                >
                  {surahData.map(s => (
                    <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                  ))}
                </select>
                <BookOpen size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
              </div>
              <div className="w-24 relative">
                <select
                  value={startAyah}
                  onChange={e => setStartAyah(Number(e.target.value))}
                  className="w-full bg-muted/50 border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-center text-sm font-bold appearance-none cursor-pointer"
                >
                  {[...Array(startSurahInfo?.ayahs || 1)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {mode === 'range' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-right text-muted-foreground text-[10px] font-bold uppercase tracking-widest px-1">نقطة النهاية</label>
              <div className="flex gap-3" dir="rtl">
                <div className="flex-1 relative">
                  <select
                    value={endSurah}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setEndSurah(val);
                      if (val === startSurah) setEndAyah(Math.max(startAyah, endAyah));
                    }}
                    className="w-full bg-muted/50 border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-sm font-bold appearance-none cursor-pointer pr-10"
                  >
                    {surahData.filter(s => s.number >= startSurah).map(s => (
                      <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                    ))}
                  </select>
                  <BookOpen size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
                </div>
                <div className="w-24 relative">
                  <select
                    value={endAyah}
                    onChange={e => setEndAyah(Number(e.target.value))}
                    className="w-full bg-muted/50 border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-center text-sm font-bold appearance-none cursor-pointer"
                  >
                    {[...Array(endSurahInfo?.ayahs || 1)].map((_, i) => {
                      const ayahNum = i + 1;
                      const isDisabled = endSurah === startSurah && ayahNum < startAyah;
                      return (
                        <option key={ayahNum} value={ayahNum} disabled={isDisabled}>
                          {ayahNum}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Summary Results - Premium Design */}
          <div className="pt-8 border-t border-border space-y-6">
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{isArabic ? 'من' : 'From'}</p>
                <h4 className="font-bold text-primary text-xl font-naskh">{startSurahInfo?.name || ''}</h4>
                <p className="text-foreground text-[10px] font-bold">الآية {startAyah}</p>
              </div>
              <div className="px-4">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                  <ArrowLeft className={`text-primary/30 w-5 h-5 ${isArabic ? '' : 'rotate-180'}`} />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{isArabic ? 'إلى' : 'To'}</p>
                <h4 className="font-bold text-primary text-xl font-naskh">
                  {mode === 'target' ? targetResult?.endSurahName || '' : endSurahInfo?.name || ''}
                </h4>
                <p className="text-foreground text-[10px] font-bold">
                  الآية {mode === 'target' ? targetResult?.endAyah || 0 : endAyah}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-[1.5rem] p-4 text-center space-y-1 border border-primary/10">
                <Timer size={18} className="text-primary mx-auto mb-1" />
                <div className="font-black text-xl text-foreground tabular-nums">{estimatedTime} <span className="text-[10px] font-bold uppercase">دقيقة</span></div>
                <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-widest">{isArabic ? 'وقت تقديري' : 'Est. Time'}</p>
              </div>
              <div className="bg-accent/5 rounded-[1.5rem] p-4 text-center space-y-1 border border-accent/10">
                <BookOpen size={18} className="text-accent mx-auto mb-1" />
                <div className="font-black text-xl text-foreground tabular-nums">{estimatedRub}</div>
                <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-widest">{isArabic ? 'أرباع أحزاب' : 'Ruba Hizb'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
