import React, { useMemo, useState } from 'react';
import { Trash2, ChevronLeft, ChevronRight, BarChart3, PieChart as PieIcon, ListFilter, History } from 'lucide-react';
import { useQanet } from './QanetContext';
import { calculateStats, getQanetLevel, getLevelLabel } from './utils';
import { surahData } from '@/data/quranData';
import { toHijri, getHijriMonthDays, getHijriMonthStartDay, toArabicDigits, WEEKDAYS_AR_SHORT } from './hijriUtils';
import { startOfDay, subDays, parseISO, isValid } from 'date-fns';
import { StatCard } from './components/StatCard';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function QanetHistory() {
  const { logs, deleteLog, settings, language } = useQanet();
  const isArabic = language === 'ar';
  const stats = useMemo(() => calculateStats(logs), [logs]);

  const todayHijri = toHijri(new Date(), settings.hijriOffset);
  const [viewMonth, setViewMonth] = useState(todayHijri.month);
  const [viewYear, setViewYear] = useState(todayHijri.year);

  // --- Last 7 days Area Chart ---
  const last7DaysData = useMemo(() => {
    const today = startOfDay(new Date());
    const dayNames = isArabic ? ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return [...Array(7)].map((_, i) => {
      const date = subDays(today, 6 - i);
      const dateKey = startOfDay(date).toISOString();
      const ayahs = (stats.dailyTotals as Map<string, number>)?.get(dateKey) || 0;
      return {
        label: dayNames[date.getDay()],
        ayahs,
        date: format(date, 'MMM dd')
      };
    });
  }, [logs, stats, isArabic]);

  // --- Level distribution Pie Chart ---
  const levelDistributionData = useMemo(() => {
    const dist = { heedless: 0, aware: 0, qanet: 0, muqantar: 0 };
    if (!stats.dailyTotals) return [];

    (stats.dailyTotals as Map<string, number>).forEach((ayahs) => {
      const level = getQanetLevel(ayahs);
      dist[level]++;
    });

    return [
      { name: isArabic ? 'غافل' : 'Heedless', value: dist.heedless, color: '#f87171' },
      { name: isArabic ? 'غير غافل' : 'Aware', value: dist.aware, color: '#60a5fa' },
      { name: isArabic ? 'قانت' : 'Qanet', value: dist.qanet, color: '#34d399' },
      { name: isArabic ? 'مقنطر' : 'Muqantar', value: dist.muqantar, color: '#c084fc' }
    ].filter(d => d.value > 0);
  }, [stats, isArabic]);

  // --- Calendar Logic ---
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

  const handleDeleteLog = (id: string) => {
    if (window.confirm(isArabic ? 'هل تريد حذف هذا السجل؟' : 'Delete this log?')) {
      deleteLog(id);
    }
  };

  return (
    <div className="p-6 pt-4 pb-32 max-w-2xl mx-auto space-y-10" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-primary font-naskh">{isArabic ? 'سجل العبادة' : 'Worship Log'}</h1>
        <p className="text-muted-foreground text-sm font-medium">{isArabic ? 'تتبع مسيرة تقربك واستمراريتك' : 'Track your journey and consistency'}</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard title={isArabic ? 'إجمالي الآيات' : 'Total Ayahs'} value={stats.totalAyahs.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} />
          <StatCard title={isArabic ? 'إجمالي الليالي' : 'Total Nights'} value={stats.totalNights} />
        </div>
        <StatCard 
          title={isArabic ? 'أطول سلسلة قانت' : 'Max Qanet Streak'} 
          value={stats.maxQanetStreak} 
          variant="highlight"
          subtitle={isArabic ? 'يوم متواصل' : 'days streak'}
        />
      </div>

      {/* Activity Area Chart */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg font-naskh flex items-center gap-2">
            <BarChart3 className="text-primary w-5 h-5" />
            {isArabic ? 'نشاط الأسبوع الأخير' : 'Last Week Activity'}
          </h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis dataKey="label" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}
                itemStyle={{ color: 'hsl(var(--primary))', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="ayahs" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.1}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution & Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Distribution */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft space-y-6">
          <h3 className="font-bold text-lg font-naskh flex items-center gap-2">
            <PieIcon className="text-primary w-5 h-5" />
            {isArabic ? 'توزيع الحالات' : 'Level Distribution'}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {levelDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hijri Calendar */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft space-y-6">
          <div className="flex justify-between items-center">
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-muted rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-primary text-lg font-naskh">
              {monthNames[viewMonth - 1]} {toArabicDigits(viewYear)} هـ
            </span>
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest" dir="rtl">
            {WEEKDAYS_AR_SHORT.map((d, i) => <span key={i}>{d}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-y-3 text-center" dir="rtl">
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
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all relative
                    ${colorClass}
                    ${isToday && !colorClass ? 'border border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : ''}
                    ${isToday && colorClass ? 'ring-2 ring-primary ring-offset-1' : ''}
                    ${!colorClass && !isToday ? 'text-foreground/40 hover:bg-muted hover:text-foreground' : ''}
                  `}
                >
                  {toArabicDigits(day)}
                  {ayahs > 0 && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-xl text-primary font-naskh flex items-center gap-2">
            <History className="w-6 h-6" />
            {isArabic ? 'سجلات الماضي' : 'Past Logs'}
          </h3>
          <button className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ListFilter size={18} className="text-muted-foreground" />
          </button>
        </div>
        
        <div className="space-y-4">
          {logs.slice(0, 15).map((log) => {
            const level = getQanetLevel(log.totalAyahs);
            const startSurahName = surahData.find(s => s.number === log.startSurah)?.name || '';
            const endSurahName = surahData.find(s => s.number === log.endSurah)?.name || '';

            return (
              <div key={log.id} className="group flex items-center justify-between bg-card border border-border rounded-[2rem] p-6 shadow-soft hover:shadow-islamic hover:border-primary/20 transition-all">
                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className="p-3 text-destructive/20 hover:text-destructive hover:bg-destructive/5 rounded-2xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="flex-1 text-right mr-6">
                  <div className="flex items-center justify-end gap-3 mb-1">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${
                      level === 'muqantar' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600' :
                      level === 'qanet' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                      level === 'aware' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                      'bg-red-500/10 border-red-500/20 text-red-600'
                    }`}>
                      {getLevelLabel(level)}
                    </span>
                    <span className="font-black text-foreground text-2xl tabular-nums">{log.totalAyahs}</span>
                    <span className="text-xs font-bold text-muted-foreground">{isArabic ? 'آية' : 'Ayahs'}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-tighter">
                    <span className="font-naskh text-sm opacity-80">{startSurahName}</span>
                    <ChevronRight size={10} className={isArabic ? 'rotate-180' : ''} />
                    <span className="font-naskh text-sm opacity-80">{endSurahName}</span>
                    <span className="mx-2 opacity-30">|</span>
                    <span>{log.hijriDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
