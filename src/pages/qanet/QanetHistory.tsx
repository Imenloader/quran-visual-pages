import React, { useMemo, useState } from 'react';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQanet } from './QanetContext';
import { calculateStats, getQanetLevel, getLevelLabel } from './utils';
import { surahData } from '@/data/quranData';
import { toHijri, getHijriMonthDays, getHijriMonthStartDay, toArabicDigits, WEEKDAYS_AR_SHORT } from './hijriUtils';
import { startOfDay, subDays, format, parseISO, isValid } from 'date-fns';

export default function QanetHistory() {
  const { logs, deleteLog, settings } = useQanet();
  const stats = useMemo(() => calculateStats(logs), [logs]);

  const todayHijri = toHijri(new Date(), settings.hijriOffset);
  const [viewMonth, setViewMonth] = useState(todayHijri.month);
  const [viewYear, setViewYear] = useState(todayHijri.year);

  // --- Last 7 days chart data ---
  const last7Days = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];
    const dayNames = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = startOfDay(date).toISOString();
      const ayahs = (stats.dailyTotals as Map<string, number>)?.get(dateKey) || 0;
      days.push({
        label: dayNames[date.getDay()],
        ayahs,
        date,
      });
    }
    return days;
  }, [logs, stats]);

  const maxChartValue = Math.max(...last7Days.map(d => d.ayahs), 1);

  // --- Level distribution ---
  const levelDistribution = useMemo(() => {
    const dist = { heedless: 0, aware: 0, qanet: 0, muqantar: 0 };
    if (!stats.dailyTotals) return dist;

    (stats.dailyTotals as Map<string, number>).forEach((ayahs) => {
      const level = getQanetLevel(ayahs);
      dist[level]++;
    });
    return dist;
  }, [stats]);

  const totalNightsForDist = Object.values(levelDistribution).reduce((a, b) => a + b, 0);

  // --- Calendar: days with logs ---
  const logDayMap = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach(log => {
      try {
        const d = parseISO(log.date);
        if (isValid(d)) {
          const h = toHijri(d, settings.hijriOffset);
          const key = `${h.year}-${h.month}-${h.day}`;
          const current = map.get(key) || 0;
          map.set(key, current + log.totalAyahs);
        }
      } catch {}
    });
    return map;
  }, [logs, settings.hijriOffset]);

  const daysInMonth = getHijriMonthDays(viewYear, viewMonth);
  const startDay = getHijriMonthStartDay(viewYear, viewMonth);

  const navigateMonth = (direction: number) => {
    let newMonth = viewMonth + direction;
    let newYear = viewYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const monthNames = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  const getDayColor = (ayahs: number) => {
    if (ayahs === 0) return '';
    const level = getQanetLevel(ayahs);
    if (level === 'muqantar') return 'bg-purple-500/30 text-purple-600';
    if (level === 'qanet') return 'bg-emerald-500/30 text-emerald-600';
    if (level === 'aware') return 'bg-blue-500/30 text-blue-600';
    return 'bg-red-500/20 text-red-600';
  };

  // Recent logs sorted
  const recentLogs = useMemo(() =>
    [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
  , [logs]);

  const handleDeleteLog = (id: string) => {
    if (window.confirm('هل تريد حذف هذا السجل؟')) {
      deleteLog(id);
    }
  };

  return (
    <div className="p-6 pt-4 pb-24 max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-primary font-naskh">سجل الصلوات</h1>
        <p className="text-muted-foreground text-sm font-medium">تتبع تقدمك واستمراريتك</p>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-[2rem] p-6 text-right shadow-soft">
          <p className="text-muted-foreground text-[10px] font-bold mb-4">أطول سلسلة استمرارية كقانت</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-3xl font-bold text-foreground">{stats.maxQanetStreak}</span>
            <span className="text-orange-500 text-2xl">🔥</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-[2rem] p-6 text-right shadow-soft">
          <p className="text-muted-foreground text-[10px] font-bold mb-4">أطول سلسلة عدم غفلة</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-3xl font-bold text-foreground">{stats.maxNonHeedlessStreak}</span>
            <span className="text-blue-500 text-2xl">🔥</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-6 text-right shadow-soft">
          <div className="flex items-center justify-end gap-2 text-muted-foreground mb-4 text-[10px] font-bold">
            <span>إجمالي الآيات</span>
            <span className="text-yellow-500">📖</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalAyahs.toLocaleString('ar-SA')}</div>
        </div>
        <div className="bg-card border border-border rounded-[2rem] p-6 text-right shadow-soft">
          <div className="flex items-center justify-end gap-2 text-muted-foreground mb-4 text-[10px] font-bold">
            <span>إجمالي الليالي</span>
            <span className="text-blue-400">🌙</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalNights}</div>
        </div>
      </div>

      {/* Last 7 Days Chart */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft">
        <div className="flex justify-between items-center mb-8">
          <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">آخر ٧ ليالٍ</span>
          <span className="font-bold text-primary text-sm">معدل القراءة</span>
        </div>

        <div className="h-32 border-b border-border relative mb-6">
          <div className="absolute inset-0 flex items-end justify-between px-2">
            {last7Days.map((day, i) => {
              const height = maxChartValue > 0 ? (day.ayahs / maxChartValue) * 100 : 0;
              const level = getQanetLevel(day.ayahs);
              const barColor = day.ayahs === 0 ? 'bg-muted'
                : level === 'muqantar' ? 'bg-purple-500'
                : level === 'qanet' ? 'bg-emerald-500'
                : level === 'aware' ? 'bg-blue-500'
                : 'bg-red-400';

              return (
                <div key={i} className="flex flex-col items-center w-8 group relative">
                  {day.ayahs > 0 && (
                    <div className="absolute -top-8 bg-foreground text-background px-2 py-1 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.ayahs}
                    </div>
                  )}
                  <div
                    className={`w-6 ${barColor} rounded-t-lg transition-all group-hover:brightness-110`}
                    style={{ height: `${Math.max(height, day.ayahs > 0 ? 8 : 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between px-2 text-[10px] text-muted-foreground font-bold" dir="rtl">
          {last7Days.map((d, i) => <span key={i}>{d.label}</span>)}
        </div>
      </div>

      {/* Level Distribution */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft text-center">
        <h3 className="font-bold text-lg mb-6 text-right text-primary px-2">تصنيف القراءة</h3>
        <div className="h-4 bg-muted rounded-full w-full mb-6 overflow-hidden flex shadow-inner">
          {totalNightsForDist > 0 ? (
            <>
              <div className="h-full bg-red-400" style={{ width: `${(levelDistribution.heedless / totalNightsForDist) * 100}%` }} />
              <div className="h-full bg-blue-400" style={{ width: `${(levelDistribution.aware / totalNightsForDist) * 100}%` }} />
              <div className="h-full bg-emerald-400" style={{ width: `${(levelDistribution.qanet / totalNightsForDist) * 100}%` }} />
              <div className="h-full bg-purple-400" style={{ width: `${(levelDistribution.muqantar / totalNightsForDist) * 100}%` }} />
            </>
          ) : (
            <div className="h-full bg-muted/50 w-full" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] text-muted-foreground font-bold" dir="rtl">
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-400 rounded-sm" />غافل ({levelDistribution.heedless})</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-blue-400 rounded-sm" />غير غافل ({levelDistribution.aware})</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm" />قانت ({levelDistribution.qanet})</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-purple-400 rounded-sm" />مقنطر ({levelDistribution.muqantar})</span>
        </div>
      </div>

      {/* Hijri Calendar */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigateMonth(1)} className="text-muted-foreground hover:text-primary p-2 bg-muted rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-primary text-lg">
            {monthNames[viewMonth - 1]} {toArabicDigits(viewYear)} هـ
          </span>
          <button onClick={() => navigateMonth(-1)} className="text-muted-foreground hover:text-primary p-2 bg-muted rounded-full transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-muted-foreground mb-4" dir="rtl">
          {WEEKDAYS_AR_SHORT.map((d, i) => <span key={i}>{d}</span>)}
        </div>

        <div className="grid grid-cols-7 gap-y-4 text-center text-sm" dir="rtl">
          {[...Array(startDay)].map((_, i) => <div key={`e-${i}`} />)}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const key = `${viewYear}-${viewMonth}-${day}`;
            const ayahs = logDayMap.get(key) || 0;
            const isToday = todayHijri.day === day && todayHijri.month === viewMonth && todayHijri.year === viewYear;
            const colorClass = getDayColor(ayahs);

            return (
              <div
                key={day}
                className={`w-9 h-9 mx-auto flex items-center justify-center rounded-2xl text-xs font-bold transition-all
                  ${colorClass}
                  ${isToday && !colorClass ? 'border-2 border-primary text-primary' : ''}
                  ${isToday && colorClass ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${!colorClass && !isToday ? 'text-foreground/70 hover:bg-muted' : ''}
                `}
                title={ayahs > 0 ? `${ayahs} آية` : ''}
              >
                {toArabicDigits(day)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-xl text-primary px-2">آخر السجلات</h3>
          <div className="space-y-3">
            {recentLogs.map((log) => {
              const level = getQanetLevel(log.totalAyahs);
              const levelLabel = getLevelLabel(level);
              const startSurahName = surahData.find(s => s.number === log.startSurah)?.name || '';
              const endSurahName = surahData.find(s => s.number === log.endSurah)?.name || '';

              return (
                <div key={log.id} className="flex items-center justify-between bg-card border border-border rounded-3xl p-5 shadow-soft hover:shadow-islamic transition-all">
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex-1 text-right mr-4">
                    <div className="flex items-center justify-end gap-3 mb-1">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                        level === 'muqantar' ? 'bg-purple-500/10 text-purple-600' :
                        level === 'qanet' ? 'bg-emerald-500/10 text-emerald-600' :
                        level === 'aware' ? 'bg-blue-500/10 text-blue-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {levelLabel}
                      </span>
                      <span className="font-bold text-foreground text-lg">{log.totalAyahs} آية</span>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium">
                      {startSurahName} ← {endSurahName} | {log.hijriDate}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
