import React, { useState, useMemo } from 'react';
import { Plus, Flame, FlameKindling, BookOpen, BarChart2, Calendar, Trophy } from 'lucide-react';
import { useQanet } from './QanetContext';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { calculateStats, getQanetLevel, getLevelLabel } from './utils';
import QanetLogModal from './QanetLogModal';
import { StatCard } from './components/StatCard';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const moonImage = "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=600&auto=format&fit=crop";

export default function QanetHome() {
  const { logs, language, isLogModalOpen, setIsLogModalOpen } = useQanet();
  const isArabic = language === 'ar';
  const { profile } = useUser();
  const navigate = useNavigate();

  const stats = useMemo(() => calculateStats(logs), [logs]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const log = logs.find(l => l.date === date);
      return {
        date: date.split('-').slice(1).reverse().join('/'),
        ayahs: log ? log.totalAyahs : 0,
      };
    });
  }, [logs]);

  // Last night logic
  const lastLog = logs.length > 0 ? [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastNightAyahs = lastLog ? lastLog.totalAyahs : 0;

  // Averages
  const avgAyahs = stats.totalNights > 0 ? Math.round(stats.totalAyahs / stats.totalNights) : 0;
  const avgLevel = getQanetLevel(avgAyahs);

  // Best Night
  const bestNight = logs.length > 0 ? Math.max(...logs.map(l => l.totalAyahs)) : 0;

  return (
    <div className="p-6 pt-4 pb-32 max-w-2xl mx-auto space-y-10">
      {/* User Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/juz/1')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-[11px] font-bold hover:bg-primary/20 transition-all"
          >
            <BookOpen size={14} />
            {isArabic ? 'اقرأ القرآن' : 'Read Quran'}
          </button>
          <button
            onClick={() => navigate('/qiyam')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-[11px] font-bold hover:bg-accent/20 transition-all"
          >
            <Flame size={14} />
            {isArabic ? '١٠٠ آية' : '100 Aya'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">مرحباً</p>
            <p className="font-bold text-foreground text-sm">{profile.name}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-border bg-muted shadow-soft">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">👤</div>
            )}
          </div>
        </div>
      </div>

      {/* Moon & Title Section - More Premium */}
      <div className="flex flex-col items-center text-center relative py-10 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-150" />
        <div className="relative z-10">
          <div 
            onClick={() => setIsLogModalOpen(true)}
            className="w-40 h-40 rounded-full mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] border-[6px] border-primary/10 bg-black relative mx-auto group cursor-pointer active:scale-95 transition-all overflow-hidden"
          >
            <img 
              src="/assets/images/qanet_moon.png" 
              alt="Moon" 
              className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-primary font-naskh tracking-tight">{isArabic ? 'من القانتين' : 'Min Al-Qaniteen'}</h1>
          <p className="text-muted-foreground text-base font-medium max-w-[250px] mx-auto leading-relaxed">
            {isArabic ? 'رفيقك في رحلة قيام الليل والتقرب إلى الله' : 'Your Qiyam Al-Layl companion on the journey to Allah'}
          </p>
        </div>
      </div>

      {/* Main Stats Graph */}
      <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-soft space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold font-naskh flex items-center gap-2">
            <BarChart2 className="text-primary w-5 h-5" />
            {isArabic ? 'مستوى النشاط (٣٠ يوم)' : 'Activity Level (30 Days)'}
          </h2>
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold">
            {isArabic ? 'مباشر' : 'Live'}
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAyahs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}
                itemStyle={{ color: 'hsl(var(--primary))', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="ayahs" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorAyahs)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard 
          title={isArabic ? 'سلسلة الاستمرارية' : 'Current Streak'}
          value={stats.qanetStreak}
          subtitle={isArabic ? 'كقانت' : 'As Qanet'}
          icon={<Flame className="text-orange-500 w-6 h-6" />}
          variant="highlight"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title={isArabic ? 'متوسط الحالة' : 'Avg Level'}
            value={getLevelLabel(avgLevel)}
            variant="status"
            status={avgLevel}
            icon={<Trophy className="text-amber-500 w-5 h-5" />}
          />
          <StatCard 
            title={isArabic ? 'أفضل ليلة' : 'Personal Best'}
            value={bestNight > 0 ? bestNight : '-'}
            subtitle={isArabic ? 'آية' : 'Ayahs'}
            icon={<Calendar className="text-blue-500 w-5 h-5" />}
          />
        </div>
      </div>

      {/* Recent Logs - More Detailed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-primary font-naskh">{isArabic ? 'أحدث السجلات' : 'Recent Logs'}</h2>
          <button 
            onClick={() => navigate('/qanet/history')}
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            {isArabic ? 'عرض الكل' : 'View All'}
          </button>
        </div>
        <div className="bg-card rounded-[2.5rem] p-6 border border-border shadow-soft divide-y divide-border/50">
          {logs.length > 0 ? (
            [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4).map((log, i) => (
              <div key={log.id || i} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold ${
                    getQanetLevel(log.totalAyahs) === 'muqantar' ? 'bg-purple-500/10 text-purple-600' :
                    getQanetLevel(log.totalAyahs) === 'qanet' ? 'bg-emerald-500/10 text-emerald-600' :
                    getQanetLevel(log.totalAyahs) === 'aware' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {getLevelLabel(getQanetLevel(log.totalAyahs)).charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{log.totalAyahs} {isArabic ? 'آية' : 'Ayahs'}</div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{log.hijriDate}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] px-3 py-1 rounded-full font-bold inline-block ${
                    getQanetLevel(log.totalAyahs) === 'muqantar' ? 'bg-purple-500/10 text-purple-600' :
                    getQanetLevel(log.totalAyahs) === 'qanet' ? 'bg-emerald-500/10 text-emerald-600' :
                    getQanetLevel(log.totalAyahs) === 'aware' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {getLevelLabel(getQanetLevel(log.totalAyahs))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-10 text-sm font-naskh">لا توجد سجلات بعد. ابدأ اليوم!</p>
          )}
        </div>
      </div>

    </div>
  );
}

const MoonStars = ({ className }: { className?: string }) => (
  <div className={className}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
      <path d="M12 1v2" />
      <path d="M12 21v2" />
      <path d="M22 12h-2" />
      <path d="M4 12H2" />
    </svg>
  </div>
);
