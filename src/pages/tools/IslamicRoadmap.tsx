import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { islamicEvents, IslamicEvent } from '@/data/islamicEventsData';
import QuranHeader from '@/components/QuranHeader';
import { Calendar, ChevronLeft, ChevronRight, Info, Sparkles, Clock } from 'lucide-react';
import { toArabicNumber } from '@/data/quranData';

const IslamicRoadmap: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Get current Hijri date using Intl
  const currentHijri = useMemo(() => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(today);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1447');
    return { day, month, year };
  }, []);

  const calculateDaysRemaining = (event: IslamicEvent) => {
    // Very simplified calculation for Hijri countdown
    // In a real app, this would need complex moon-sighting/calculation logic
    // For now, we estimate based on 29.5 days per month
    const currentTotalDays = (currentHijri.month - 1) * 29.5 + currentHijri.day;
    const eventTotalDays = (event.hijriDate.month - 1) * 29.5 + event.hijriDate.day;
    
    let diff = eventTotalDays - currentTotalDays;
    if (diff < 0) diff += 354; // Next year
    return Math.round(diff);
  };

  const sortedEvents = useMemo(() => {
    return [...islamicEvents].sort((a, b) => {
      const daysA = calculateDaysRemaining(a);
      const daysB = calculateDaysRemaining(b);
      return daysA - daysB;
    });
  }, [currentHijri]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <QuranHeader 
        title={isArabic ? 'خارطة الطريق الإيمانية' : 'Islamic Roadmap'} 
        subtitle={isArabic ? 'خطتك السنوية للمواسم والعبادات' : 'Your annual plan for sacred seasons'}
        variant="compact"
        showBack
      />

      <main className="container max-w-2xl mx-auto px-4 -mt-10 relative z-20">
        <div className="space-y-12 relative">
          {/* Roadmap Line */}
          <div className="absolute top-0 bottom-0 left-6 md:left-1/2 w-0.5 bg-gradient-to-b from-gold/50 via-emerald-500/30 to-transparent -translate-x-1/2" />

          {sortedEvents.map((event, index) => {
            const daysLeft = calculateDaysRemaining(event);
            const isSoon = daysLeft < 30;

            return (
              <div key={event.id} className="relative flex items-start gap-8 md:gap-0 group">
                {/* Connector Dot */}
                <div className={`absolute left-6 md:left-1/2 w-4 h-4 rounded-full border-4 border-background z-10 -translate-x-1/2 mt-6 transition-all group-hover:scale-125 ${isSoon ? 'bg-gold animate-pulse' : 'bg-muted'}`} />

                {/* Content Card */}
                <div className={`flex-1 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12 md:ml-auto'}`}>
                  <div className={`p-6 rounded-[2rem] bg-card border border-border/40 shadow-islamic transition-all hover:border-gold/30 hover:shadow-gold/5 ${isSoon ? 'ring-2 ring-gold/10' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full ${event.color} text-white text-[10px] font-bold uppercase tracking-wider`}>
                        {isArabic ? (daysLeft === 0 ? 'اليوم' : `باقي ${toArabicNumber(daysLeft)} يوم`) : (daysLeft === 0 ? 'Today' : `${daysLeft} days left`)}
                      </div>
                      <Clock size={16} className={isSoon ? 'text-gold' : 'text-muted-foreground'} />
                    </div>

                    <h3 className="text-xl font-naskh font-bold text-primary mb-2">
                      {isArabic ? event.nameAr : event.nameEn}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      {isArabic ? event.descriptionAr : event.descriptionEn}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gold uppercase tracking-widest">
                        <Sparkles size={12} />
                        {isArabic ? 'نصائح للاستعداد' : 'PREPARATION TIPS'}
                      </div>
                      <ul className="space-y-2">
                        {(isArabic ? event.tipsAr : event.tipsEn).map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold/40 mt-1.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default IslamicRoadmap;
