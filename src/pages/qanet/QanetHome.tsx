import React, { useState, useMemo } from 'react';
import { Plus, Flame, FlameKindling, BookOpen } from 'lucide-react';
import { useQanet } from './QanetContext';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { calculateStats, getQanetLevel, getLevelLabel } from './utils';
import QanetLogModal from './QanetLogModal';

const moonImage = "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=600&auto=format&fit=crop";

export default function QanetHome() {
  const { logs, language } = useQanet();
  const isArabic = language === 'ar';
  const { profile } = useUser();
  const navigate = useNavigate();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const stats = useMemo(() => calculateStats(logs), [logs]);

  // Last night logic
  const lastLog = logs.length > 0 ? [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const lastNightAyahs = lastLog ? lastLog.totalAyahs : 0;

  // Averages
  const avgAyahs = stats.totalNights > 0 ? Math.round(stats.totalAyahs / stats.totalNights) : 0;
  const avgLevel = getQanetLevel(avgAyahs);

  // Best Night
  const bestNight = logs.length > 0 ? Math.max(...logs.map(l => l.totalAyahs)) : 0;

  return (
    <div className="p-6 pt-4 pb-24 max-w-md mx-auto space-y-8">
      {/* User Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/juz/1')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[11px] font-bold"
          >
            <BookOpen size={14} />
            {isArabic ? 'اقرأ القرآن' : 'Read Quran'}
          </button>
          <button
            onClick={() => navigate('/qiyam')}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-[11px] font-bold"
          >
            <Flame size={14} />
            {isArabic ? '١٠٠ آية' : '100 Aya'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-muted-foreground text-[10px]">مرحباً</p>
            <p className="font-bold text-foreground text-sm">{profile.name}</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-muted">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">👤</div>
            )}
          </div>
        </div>
      </div>

      {/* Moon & Title */}
      <div className="flex flex-col items-center py-4">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-6 shadow-islamic border-4 border-primary/10 bg-black relative">
          <img 
            src={moonImage} 
            alt="Moon" 
            className="w-full h-full object-cover opacity-90 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-primary font-naskh">{isArabic ? 'من القانتين' : 'Min Al-Qaniteen'}</h1>
        <p className="text-muted-foreground text-sm font-medium">{isArabic ? 'رفيقك في قيام الليل' : 'Your Qiyam Al-Layl Companion'}</p>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {/* Top Streak Card */}
        <div className="bg-card rounded-[2.5rem] p-8 border border-border flex shadow-soft group">
          <div className="flex-1 flex flex-col justify-center gap-1 border-l border-border pl-6">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Flame size={24} className="text-orange-500" />
              <span className="text-4xl font-bold text-foreground">{stats.qanetStreak}</span>
            </div>
            <p className="text-muted-foreground text-sm font-bold">سلسلة الاستمرارية</p>
            <p className="text-primary text-[11px] font-bold">كقانت</p>
          </div>
          <div className="flex-1 flex flex-col justify-center items-end pr-6 gap-1">
            <div className="text-4xl font-bold text-foreground mb-1">{lastNightAyahs > 0 ? lastNightAyahs : '-'}</div>
            <p className="text-muted-foreground text-sm font-bold">الليلة الماضية</p>
          </div>
        </div>

        {/* Bottom Two Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-[2rem] p-6 border border-border flex flex-col items-center justify-center gap-3 text-center shadow-soft">
            <div className={`text-xl font-bold ${
              avgLevel === 'muqantar' ? 'text-purple-500' :
              avgLevel === 'qanet' ? 'text-emerald-500' :
              avgLevel === 'aware' ? 'text-blue-500' :
              'text-red-500'
            }`}>
              {getLevelLabel(avgLevel)}
            </div>
            <p className="text-muted-foreground text-xs font-bold">متوسط الحالة</p>
          </div>

          <div className="bg-card rounded-[2rem] p-6 border border-border flex flex-col justify-center shadow-soft">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1">
                <FlameKindling size={18} className="text-blue-500" />
                <span className="font-bold text-xl text-foreground">{stats.nonHeedlessStreak}</span>
              </div>
              <span className="font-bold text-xl text-foreground">{bestNight > 0 ? bestNight : '-'}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold">
              <span>سلسلة عدم الغفلة</span>
              <span>أفضل ليلة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 text-primary px-2">أحدث السجلات</h2>
        <div className="bg-card rounded-[2rem] p-6 border border-border shadow-soft">
          {logs.length > 0 ? (
            <div className="space-y-4">
              {[...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((log, i) => (
                <div key={log.id || i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                    getQanetLevel(log.totalAyahs) === 'muqantar' ? 'bg-purple-500/10 text-purple-600' :
                    getQanetLevel(log.totalAyahs) === 'qanet' ? 'bg-emerald-500/10 text-emerald-600' :
                    getQanetLevel(log.totalAyahs) === 'aware' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {getLevelLabel(getQanetLevel(log.totalAyahs))}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{log.totalAyahs} آية</div>
                    <div className="text-muted-foreground text-[10px]">{log.hijriDate}</div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/qanet/history')}
                className="w-full py-2 text-primary text-xs font-bold"
              >
                عرض الكل
              </button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6 text-sm">لا توجد سجلات بعد</p>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsLogModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-islamic z-50"
      >
        <Plus size={28} />
      </button>

      {/* Modal */}
      {isLogModalOpen && <QanetLogModal onClose={() => setIsLogModalOpen(false)} />}
    </div>
  );
}
