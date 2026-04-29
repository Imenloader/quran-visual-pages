import React, { useState, useMemo, useEffect } from 'react';
import { Moon, Edit2, ArrowLeft, MapPin, Clock, Loader2 } from 'lucide-react';
import { surahData } from '@/data/quranData';
import { useQanet } from './QanetContext';

interface LastThirdInfo {
  loading: boolean;
  error: string | null;
  time: string | null;
  fajr: string | null;
  maghrib: string | null;
  cityName: string | null;
}

export default function QanetCalculator() {
  const { language } = useQanet();
  const isArabic = language === 'ar';
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
    
    const startSurahInfo = surahData.find(s => s.number === currentSurah);
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
      const surah = surahData.find(s => s.number === currentSurah);
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
    const startInfo = surahData.find(s => s.number === startSurah);
    if (startInfo) total += startInfo.ayahs - startAyah + 1;
    
    for (let i = startSurah + 1; i < endSurah; i++) {
      const s = surahData.find(su => su.number === i);
      if (s) total += s.ayahs;
    }
    
    total += endAyah;
    return Math.max(0, total);
  }, [mode, startSurah, startAyah, endSurah, endAyah]);

  const displayTotal = mode === 'target' ? target : rangeTotal;
  
  // Estimation logic:
  // Average reading speed: ~15 seconds per ayah (varies by length)
  // 1 Rub' (Quarter Hizb) is roughly 25-26 ayahs on average (6236 ayahs / 240 Rubs)
  const estimatedTime = Math.round((displayTotal * 15) / 60);
  const estimatedRub = (displayTotal / 26).toFixed(1);

  const startSurahInfo = surahData.find(s => s.number === startSurah);
  const endSurahInfo = mode === 'target' && targetResult
    ? surahData.find(s => s.number === targetResult.endSurah)
    : surahData.find(s => s.number === endSurah);

  const calculateLastThird = async () => {
    setLastThird({ loading: true, error: null, time: null, fajr: null, maghrib: null, cityName: null });
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      const { latitude, longitude } = position.coords;
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=4`);
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
      const ltFormatted = `${String(ltHours).padStart(2, '0')}:${String(ltMinutes).padStart(2, '0')}`;
      setLastThird({
        loading: false, error: null, time: ltFormatted, fajr: timings.Fajr, maghrib: timings.Maghrib,
        cityName: data.data.meta?.timezone || null
      });
    } catch (err: any) {
      setLastThird({ loading: false, error: 'فشل في الحساب', time: null, fajr: null, maghrib: null, cityName: null });
    }
  };

  return (
    <div className="p-6 pt-4 pb-24 max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-primary font-naskh">{isArabic ? 'حاسبة الآيات' : 'Ayah Calculator'}</h1>
        <p className="text-muted-foreground text-sm font-medium">{isArabic ? 'خطط لقيامك الليلة بدقة' : 'Plan your night prayer accurately'}</p>
      </div>

      <div className="space-y-6">
        {/* Last Third Banner */}
        <button
          onClick={calculateLastThird}
          disabled={lastThird.loading}
          className="w-full bg-card border border-border rounded-[2rem] p-6 flex items-center justify-between text-right shadow-soft group"
        >
          <div className="flex-1">
            {lastThird.time ? (
              <div>
                <h3 className="font-bold mb-1 text-foreground flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  بداية الثلث الأخير: {lastThird.time}
                </h3>
                <p className="text-muted-foreground text-[10px] font-bold">
                  المغرب: {lastThird.maghrib} | الفجر: {lastThird.fajr}
                </p>
              </div>
            ) : lastThird.error ? (
              <div>
                <h3 className="font-bold mb-1 text-destructive">{lastThird.error}</h3>
                <p className="text-muted-foreground text-[10px]">اضغط للمحاولة مرة أخرى</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold mb-1 text-foreground">بداية الثلث الأخير</h3>
                <p className="text-muted-foreground text-[10px]">اسمح بالموقع لحساب الوقت بدقة</p>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            {lastThird.loading ? (
              <Loader2 size={20} className="text-primary" />
            ) : (
              <Moon size={20} className="text-primary" />
            )}
          </div>
        </button>

        {/* Calculator Card */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft space-y-8">
          {/* Mode Tabs */}
          <div className="flex bg-muted rounded-2xl p-1.5">
            <button
              onClick={() => setMode('target')}
              className={`flex-1 py-3 rounded-xl font-bold text-[11px] ${mode === 'target' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              الآيات المستهدفة
            </button>
            <button
              onClick={() => setMode('range')}
              className={`flex-1 py-3 rounded-xl font-bold text-[11px] ${mode === 'range' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              نطاق مخصص
            </button>
          </div>

          {mode === 'target' && (
            <div className="space-y-3">
              <label className="block text-right text-muted-foreground text-xs font-bold px-1">الآيات المستهدفة</label>
              <div className="flex gap-2" dir="rtl">
                {[10, 100, 1000].map(val => (
                  <button
                    key={val}
                    onClick={() => setTarget(val)}
                    className={`flex-1 py-3 rounded-2xl border-2 font-bold ${target === val ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/50 border-transparent text-muted-foreground'}`}
                  >
                    {val}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className={`w-14 rounded-2xl flex items-center justify-center border-2 ${showCustomInput ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted/50 border-transparent text-muted-foreground'}`}
                >
                  <Edit2 size={18} />
                </button>
              </div>
              {showCustomInput && (
                <div className="relative mt-4" dir="rtl">
                  <input
                    type="number"
                    min="0"
                    value={customTarget}
                    onChange={e => setCustomTarget(Math.max(0, Number(e.target.value)).toString())}
                    placeholder={isArabic ? "أدخل عدد الآيات" : "Enter ayah count"}
                    className="w-full bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl py-4 pr-4 pl-24 text-foreground text-right font-bold"
                  />
                  <button 
                    onClick={() => { setTarget(Math.max(0, Number(customTarget)) || 10); setShowCustomInput(false); }} 
                    className="absolute left-2 top-2 bottom-2 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-xs shadow-sm"
                  >
                    {isArabic ? "تأكيد" : "Confirm"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Start Point */}
          <div className="space-y-3">
            <label className="block text-right text-muted-foreground text-xs font-bold px-1">نقطة البداية</label>
            <div className="flex gap-2" dir="rtl">
              <select
                value={startSurah}
                onChange={e => { setStartSurah(Number(e.target.value)); setStartAyah(1); }}
                className="flex-1 bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-sm font-bold appearance-none cursor-pointer"
              >
                {surahData.map(s => (
                  <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                ))}
              </select>
              <select
                value={startAyah}
                onChange={e => setStartAyah(Number(e.target.value))}
                className="w-24 bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-center text-sm font-bold appearance-none cursor-pointer"
              >
                {[...Array(startSurahInfo?.ayahs || 1)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          {mode === 'range' && (
            <div className="space-y-3">
              <label className="block text-right text-muted-foreground text-xs font-bold px-1">نقطة النهاية</label>
              <div className="flex gap-2" dir="rtl">
                <select
                  value={endSurah}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setEndSurah(val);
                    if (val === startSurah) setEndAyah(Math.max(startAyah, endAyah));
                  }}
                  className="flex-1 bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-sm font-bold appearance-none cursor-pointer"
                >
                  {surahData.filter(s => s.number >= startSurah).map(s => (
                    <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                  ))}
                </select>
                <select
                  value={endAyah}
                  onChange={e => setEndAyah(Number(e.target.value))}
                  className="w-24 bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-center text-sm font-bold appearance-none cursor-pointer"
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
          )}
        </div>

        {/* Results Card */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-islamic space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 pointer-events-none" />
          
          <div className="flex items-center justify-between text-center relative z-10">
            <div className="flex-1">
              <h4 className="font-bold mb-1 text-primary text-xl font-naskh">{startSurahInfo?.name || ''}</h4>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">الآية {startAyah}</p>
            </div>
            <div className="px-4">
              <ArrowLeft className="text-primary/30 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold mb-1 text-primary text-xl font-naskh">
                {mode === 'target' ? targetResult?.endSurahName || '' : endSurahInfo?.name || ''}
              </h4>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                الآية {mode === 'target' ? targetResult?.endAyah || 0 : endAyah}
              </p>
            </div>
          </div>

          <div className="text-center py-4 relative z-10">
            <div className="text-6xl font-bold text-foreground flex items-center justify-center gap-3">
              {displayTotal} <span className="text-2xl text-muted-foreground font-medium">آية</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border relative z-10">
            <div className="text-center space-y-1">
              <div className="font-bold text-2xl text-foreground">{estimatedTime} <span className="text-xs font-medium">دقيقة</span></div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">وقت القراءة المقدر</p>
            </div>
            <div className="text-center space-y-1 border-r border-border">
              <div className="font-bold text-2xl text-foreground">{estimatedRub}</div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">أرباع الأحزاب (تقريباً)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
