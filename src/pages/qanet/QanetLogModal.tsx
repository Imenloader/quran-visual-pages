import React, { useState, useMemo } from 'react';
import { X, Moon, CalendarDays, Check, Plus, Trash2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQanet } from './QanetContext';
import { getQanetLevel } from './utils';
import { surahData, surahByNumber } from '@/data/quranData';
import { ReadingRange } from './types';
import { toHijri, formatHijriDate, formatHijriDateFull, getHijriMonthDays, getHijriMonthStartDay, toArabicDigits, WEEKDAYS_AR_SHORT } from './hijriUtils';

/**
 * Calculate total ayahs for a single reading range.
 * Handles same-surah and cross-surah ranges.
 */
const calculateRangeAyahs = (range: ReadingRange): number => {
  if (range.startSurah === range.endSurah) {
    return Math.max(0, range.endAyah - range.startAyah + 1);
  }

  let total = 0;
  // Remaining ayahs in start surah
  const startSurahData = surahData.find(s => s.number === range.startSurah);
  if (startSurahData) {
    total += startSurahData.ayahs - range.startAyah + 1;
  }
  // Full surahs in between
  for (let i = range.startSurah + 1; i < range.endSurah; i++) {
    const s = surahData.find(su => su.number === i);
    if (s) total += s.ayahs;
  }
  // Ayahs in end surah
  total += range.endAyah;

  return Math.max(0, total);
};

export default function QanetLogModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { addLog, settings, startTracking } = useQanet();

  const [shafaWitr, setShafaWitr] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ranges, setRanges] = useState<ReadingRange[]>([
    { startSurah: 2, startAyah: 1, endSurah: 2, endAyah: 10 }
  ]);
  const [wholeSurahFlags, setWholeSurahFlags] = useState<boolean[]>([false]);

  const todayHijri = toHijri(selectedDate, settings.hijriOffset);
  const hijriDateStr = formatHijriDate(selectedDate, settings.hijriOffset);
  const hijriDateFull = formatHijriDateFull(selectedDate, settings.hijriOffset);

  const totalAyahs = useMemo(() => {
    return ranges.reduce((sum, range, i) => {
      if (wholeSurahFlags[i]) {
        const s = surahData.find(su => su.number === range.startSurah);
        return sum + (s?.ayahs || 0);
      }
      return sum + calculateRangeAyahs(range);
    }, 0);
  }, [ranges, wholeSurahFlags]);

  const level = getQanetLevel(totalAyahs);

  const getLevelMessage = () => {
    if (level === 'heedless') return "اجتهد في قراءة 10 آيات على الأقل";
    if (level === 'aware') return "بداية جيدة! استمر";
    if (level === 'qanet') return "ما شاء الله، أنت من القانتين";
    return "هنيئاً لك الأجر العظيم";
  };

  const updateRange = (index: number, updates: Partial<ReadingRange>) => {
    setRanges(prev => prev.map((r, i) => i === index ? { ...r, ...updates } : r));
  };

  const addRange = () => {
    setRanges(prev => [...prev, { startSurah: 1, startAyah: 1, endSurah: 1, endAyah: 7 }]);
    setWholeSurahFlags(prev => [...prev, false]);
  };

  const removeRange = (index: number) => {
    if (ranges.length <= 1) return;
    setRanges(prev => prev.filter((_, i) => i !== index));
    setWholeSurahFlags(prev => prev.filter((_, i) => i !== index));
  };

  const toggleWholeSurah = (index: number) => {
    setWholeSurahFlags(prev => prev.map((v, i) => i === index ? !v : v));
  };

  const handleSave = () => {
    const finalRanges = ranges.map((range, i) => {
      if (wholeSurahFlags[i]) {
        const s = surahData.find(su => su.number === range.startSurah);
        return {
          startSurah: range.startSurah,
          startAyah: 1,
          endSurah: range.startSurah,
          endAyah: s?.ayahs || 1,
        };
      }
      return range;
    });

    addLog({
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      hijriDate: hijriDateStr,
      shafaWitr,
      totalAyahs: totalAyahs > 0 ? totalAyahs : 0,
      ranges: finalRanges,
      startSurah: finalRanges[0].startSurah,
      startAyah: finalRanges[0].startAyah,
      endSurah: finalRanges[finalRanges.length - 1].endSurah,
      endAyah: finalRanges[finalRanges.length - 1].endAyah,
    });
    onClose();
  };

  const getAyahCount = (surahNumber: number) => {
    return surahByNumber.get(surahNumber)?.ayahs || 1;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4" dir="rtl">
      <div className="bg-card w-full sm:w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl p-8 relative shadow-islamic border border-border">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="p-2.5 bg-muted rounded-full hover:bg-muted/80 text-foreground/70 transition-colors">
            <X size={20} />
          </button>
          <h2 className="font-bold text-2xl text-primary font-naskh">تسجيل من القانتين</h2>
        </div>

        {/* Level Status Card */}
        <div className="bg-primary/5 border-2 border-primary/10 rounded-[2rem] p-6 mb-8 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <div className="text-right">
              <h3 className="font-bold text-2xl mb-1 text-primary">
                {level === 'heedless' ? 'غافل' : level === 'aware' ? 'غير غافل' : level === 'qanet' ? 'قانت' : 'مقنطر'}
              </h3>
              <p className="text-muted-foreground text-xs font-bold">{getLevelMessage()}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-islamic border-2 border-primary/20 bg-background flex items-center justify-center transition-transform group-hover:scale-110">
              <Moon size={28} className="text-primary" />
            </div>
          </div>

          <div className="text-center pt-6 border-t border-primary/10">
            <div className="text-5xl font-bold mb-2 text-foreground">{totalAyahs > 0 ? totalAyahs : '٠'}</div>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">إجمالي الآيات</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">

          {/* Date Picker */}
          <div className="bg-muted/50 border-2 border-border rounded-2xl overflow-hidden transition-all focus-within:border-primary">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full p-5 flex justify-between items-center hover:bg-muted/80 transition-colors"
            >
              <div className="text-muted-foreground flex items-center gap-3 font-bold text-sm">
                <CalendarDays size={20} className="text-primary" />
                <span>تاريخ الصلاة</span>
              </div>
              <div className="text-sm bg-background px-4 py-2 rounded-xl border border-border font-bold text-foreground">
                {hijriDateFull}
              </div>
            </button>

            {showDatePicker && (
              <div className="border-t border-border p-4 bg-card animate-in fade-in slide-in-from-top-2 duration-300">
                <HijriDatePicker
                  selectedDate={selectedDate}
                  onSelect={(date) => { setSelectedDate(date); setShowDatePicker(false); }}
                  offset={settings.hijriOffset}
                />
              </div>
            )}
          </div>

          {/* Shafa Witr Toggle */}
          <div className="bg-muted/50 border-2 border-border rounded-2xl p-5 flex justify-between items-center">
            <div className="text-foreground font-bold flex items-center gap-3">
              <Moon size={20} className="text-primary" />
              <span>الشفع والوتر</span>
            </div>
            <button
              onClick={() => setShafaWitr(!shafaWitr)}
              className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${shafaWitr ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 ${shafaWitr ? 'left-1' : 'right-1'}`} />
            </button>
          </div>

          {/* Reading Ranges */}
          <div className="space-y-6">
            {ranges.map((range, index) => (
              <RangeSelector
                key={index}
                index={index}
                range={range}
                wholeSurah={wholeSurahFlags[index]}
                onUpdate={(updates) => updateRange(index, updates)}
                onToggleWhole={() => toggleWholeSurah(index)}
                onRemove={() => removeRange(index)}
                canRemove={ranges.length > 1}
                getAyahCount={getAyahCount}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 space-y-4">
          <button
            onClick={() => {
              startTracking(ranges[0].startSurah, 1);
              onClose();
              navigate('/juz/1'); // Start from first juz or resume
            }}
            className="w-full py-5 bg-accent text-accent-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-islamic active:scale-95"
          >
            <BookOpen size={20} />
            سجل قراءتك الآن (تتبع تلقائي)
          </button>

          <button
            onClick={addRange}
            className="w-full py-5 bg-muted border-2 border-dashed border-border rounded-2xl text-foreground font-bold hover:bg-muted/80 hover:border-primary/40 flex items-center justify-center gap-3 transition-all"
          >
            <Plus size={20} className="text-primary" />
            إضافة نطاق آخر
          </button>

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-5 bg-muted rounded-2xl text-foreground font-bold hover:bg-muted/80 transition-all">
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={totalAyahs === 0}
              className="flex-[2] py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-islamic disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={20} />
              حفظ السجل
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const RangeSelector = ({
  index, range, wholeSurah, onUpdate, onToggleWhole, onRemove, canRemove, getAyahCount
}: {
  index: number;
  range: ReadingRange;
  wholeSurah: boolean;
  onUpdate: (updates: Partial<ReadingRange>) => void;
  onToggleWhole: () => void;
  onRemove: () => void;
  canRemove: boolean;
  getAyahCount: (surahNum: number) => number;
}) => {
  const startAyahCount = getAyahCount(range.startSurah);
  const endAyahCount = getAyahCount(range.endSurah);

  return (
    <div className="bg-card border-2 border-border rounded-[2rem] p-6 shadow-soft space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {canRemove && (
            <button onClick={onRemove} className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors">
              <Trash2 size={18} />
            </button>
          )}
          <span className="font-bold text-foreground flex items-center gap-2">
            <BookIcon /> 
            مقطع القراءة {index > 0 ? `(${index + 1})` : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground">السورة كاملة</span>
          <button
            onClick={onToggleWhole}
            className={`w-10 h-5 rounded-full relative transition-colors ${wholeSurah ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all ${wholeSurah ? 'left-0.75' : 'right-0.75'}`} />
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-3 px-1">نقطة البداية</label>
          <div className="flex gap-2">
            <select
              value={range.startSurah}
              onChange={e => {
                const num = Number(e.target.value);
                onUpdate({ startSurah: num, startAyah: 1 });
                if (wholeSurah) onUpdate({ startSurah: num, endSurah: num, startAyah: 1, endAyah: getAyahCount(num) });
              }}
              className="flex-1 bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-sm font-bold appearance-none cursor-pointer"
            >
              {surahData.map(s => (
                <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
              ))}
            </select>
            {!wholeSurah && (
              <select
                value={range.startAyah}
                onChange={e => onUpdate({ startAyah: Number(e.target.value) })}
                className="w-24 bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-center text-sm font-bold appearance-none cursor-pointer"
              >
                {[...Array(startAyahCount)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {!wholeSurah && (
          <div>
            <div className="flex justify-center my-1">
              <ChevronDown className="text-primary/30" />
            </div>
            <label className="text-xs font-bold text-muted-foreground block mb-3 px-1">نقطة النهاية</label>
            <div className="flex gap-2">
              <select
                value={range.endSurah}
                onChange={e => onUpdate({ endSurah: Number(e.target.value), endAyah: Math.min(range.endAyah, getAyahCount(Number(e.target.value))) })}
                className="flex-1 bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-sm font-bold appearance-none cursor-pointer"
              >
                {surahData.map(s => (
                  <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                ))}
              </select>
              <select
                value={range.endAyah}
                onChange={e => onUpdate({ endAyah: Number(e.target.value) })}
                className="w-24 bg-muted border-2 border-border focus:border-primary outline-none rounded-2xl p-4 text-foreground text-center text-sm font-bold appearance-none cursor-pointer"
              >
                {[...Array(endAyahCount)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HijriDatePicker = ({
  selectedDate, onSelect, offset
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  offset: number;
}) => {
  const currentHijri = toHijri(selectedDate, offset);
  const [viewMonth, setViewMonth] = useState(currentHijri.month);
  const [viewYear, setViewYear] = useState(currentHijri.year);
  const daysInMonth = getHijriMonthDays(viewYear, viewMonth);
  const startDay = getHijriMonthStartDay(viewYear, viewMonth);
  const todayHijri = toHijri(new Date(), offset);

  const monthNames = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => {
          let nm = viewMonth - 1; let ny = viewYear;
          if (nm < 1) { nm = 12; ny--; }
          setViewMonth(nm); setViewYear(ny);
        }} className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <ChevronRight size={20} />
        </button>
        <span className="font-bold text-foreground text-lg">
          {monthNames[viewMonth - 1]} {toArabicDigits(viewYear)} هـ
        </span>
        <button onClick={() => {
          let nm = viewMonth + 1; let ny = viewYear;
          if (nm > 12) { nm = 1; ny++; }
          setViewMonth(nm); setViewYear(ny);
        }} className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground mb-2" dir="rtl">
        {WEEKDAYS_AR_SHORT.map((d, i) => <span key={i}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-y-3 text-center" dir="rtl">
        {[...Array(startDay)].map((_, i) => <div key={`e-${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const isToday = todayHijri.day === day && todayHijri.month === viewMonth && todayHijri.year === viewYear;
          const isSelected = currentHijri.day === day && currentHijri.month === viewMonth && currentHijri.year === viewYear;
          return (
            <button
              key={day}
              onClick={() => {
                const approxDate = new Date(selectedDate);
                const diff = day - currentHijri.day;
                approxDate.setDate(approxDate.getDate() + diff);
                for (let j = -3; j <= 3; j++) {
                  const testDate = new Date(approxDate);
                  testDate.setDate(testDate.getDate() + j);
                  const h = toHijri(testDate, offset);
                  if (h.day === day && h.month === viewMonth && h.year === viewYear) {
                    onSelect(testDate); return;
                  }
                }
                onSelect(approxDate);
              }}
              className={`w-9 h-9 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all
                ${isSelected ? 'bg-primary text-primary-foreground shadow-islamic' : ''}
                ${isToday && !isSelected ? 'border-2 border-primary text-primary' : ''}
                ${!isSelected && !isToday ? 'text-foreground/70 hover:bg-muted' : ''}
              `}
            >
              {toArabicDigits(day)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
