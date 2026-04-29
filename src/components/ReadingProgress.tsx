import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { toArabicNumber } from '@/data/quranData';
import { TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface ReadingDay {
  date: string;
  pages: number;
}

const ReadingProgress: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { profile } = useUser();
  
  const data = useMemo(() => {
    const history = profile.dailyReadingHistory || [];
    
    // Get last 7 days
    const last7Days: ReadingDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = history.find((h: ReadingDay) => h.date === dateStr);
      
      last7Days.push({
        date: dateStr,
        pages: dayData ? dayData.pages : 0
      });
    }
    return last7Days;
  }, [profile.dailyReadingHistory]);

  const totalPagesThisWeek = data.reduce((acc, d) => acc + d.pages, 0);
  const averagePages = Math.round(totalPagesThisWeek / 7);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    const { t: tt, i18n: ii } = useTranslation();
    
    if (active && payload && payload.length) {
      const date = new Date(label || "");
      const formattedDate = date.toLocaleDateString(ii.language === 'ar' ? 'ar-EG' : 'en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
      
      return (
        <div className="bg-card/90 backdrop-blur-md border border-border/40 p-3 rounded-xl shadow-xl text-right">
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">{formattedDate}</p>
          <p className="text-sm font-serif text-primary">
            {ii.language === "ar" ? toArabicNumber(payload[0].value) : payload[0].value} {tt("hub.readingActivity.read")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <TrendingUp size={20} />
          </div>
          <div className="text-right">
            <h3 className="font-serif text-lg text-primary leading-tight">{t("hub.readingActivity.title")}</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("hub.readingActivity.last7Days")}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-serif font-bold text-primary">
            {i18n.language === "ar" ? toArabicNumber(totalPagesThisWeek) : totalPagesThisWeek}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("hub.readingActivity.pagesThisWeek")}</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--accent) / 0.1)" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
              tickFormatter={(str) => {
                const d = new Date(str);
                return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
              tickFormatter={(val) => i18n.language === 'ar' ? toArabicNumber(val) : val}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.05)', radius: 8 }} />
            <Bar 
              dataKey="pages" 
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? 'hsl(var(--accent))' : 'hsl(var(--accent) / 0.3)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-center gap-3 justify-end">
          <div className="text-right">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("hub.readingActivity.dailyAverage")}</p>
            <p className="text-sm font-serif font-bold text-primary">
              {i18n.language === "ar" ? toArabicNumber(averagePages) : averagePages} {t("hub.readingActivity.pages")}
            </p>
          </div>
          <Calendar size={18} className="text-accent" />
        </div>
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-center gap-3 justify-end">
          <div className="text-right">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("hub.readingActivity.mostReadDay")}</p>
            <p className="text-sm font-serif font-bold text-primary">
              {i18n.language === "ar" ? toArabicNumber(Math.max(...data.map(d => d.pages))) : Math.max(...data.map(d => d.pages))} {t("hub.readingActivity.pages")}
            </p>
          </div>
          <BookOpen size={18} className="text-accent" />
        </div>
      </div>
    </div>
  );
};

export default ReadingProgress;
