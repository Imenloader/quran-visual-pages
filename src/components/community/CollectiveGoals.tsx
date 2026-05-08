import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { communityService, GlobalMilestone } from '@/services/communityService';
import { Trophy, BookOpen, Heart, Zap, Loader2 } from 'lucide-react';
import { toArabicNumber } from '@/data/quranData';

const CollectiveGoals = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [milestones, setMilestones] = useState<GlobalMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = communityService.subscribeToGlobalMilestones((data) => {
      setMilestones(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const formatValue = (val: number) => isAr ? toArabicNumber(val) : val.toLocaleString();

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map((m) => {
          const progress = Math.min(100, (m.currentCount / m.targetCount) * 100);
          const icon = m.type === 'quran_pages' ? <BookOpen /> : m.type === 'dhikr_total' ? <Zap /> : <Heart />;
          
          return (
            <div key={m.id} className="p-5 bg-card border rounded-[2rem] shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  {icon}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm">{isAr ? m.titleAr : m.titleEn}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    {isAr ? "هدف جماعي" : "Community Goal"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>{formatValue(m.currentCount)}</span>
                  <span className="text-muted-foreground">{formatValue(m.targetCount)}</span>
                </div>
                <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <p className="text-[9px] text-center text-muted-foreground font-medium italic">
                  {isAr ? `اكتمل بنسبة ${toArabicNumber(Math.floor(progress))}%` : `${Math.floor(progress)}% Completed`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {milestones.length === 0 && (
        <div className="p-12 text-center bg-muted/20 rounded-[2rem] border border-dashed">
          <Trophy className="mx-auto text-muted-foreground mb-4 opacity-20" size={48} />
          <p className="text-xs text-muted-foreground">
            {isAr ? "لا توجد أهداف جماعية نشطة حالياً." : "No active community goals at the moment."}
          </p>
        </div>
      )}
    </div>
  );
};

export default CollectiveGoals;
