import { useTranslation } from "react-i18next";
import { 
  Sparkles, 
  Target, 
  Zap, 
  Book, 
  Heart,
  Award,
  Lock,
  CheckCircle2
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toArabicNumber } from "@/data/quranData";

const EpicQuests = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { profile } = useUser();

  const quests = [
    {
      id: 'forty_days_fajr',
      title: isAr ? 'رحلة الأربعين صباحاً' : 'Forty Mornings Journey',
      description: isAr ? 'أتمّ ٤٠ يوماً من أذكار الصباح دون انقطاع' : 'Complete 40 days of morning dhikr without interruption',
      points: 5000,
      target: 40,
      current: profile.daysActive || 0, // Placeholder logic
      icon: <Zap className="text-gold" />,
      rarity: 'epic'
    },
    {
      id: 'musabbahat_master',
      title: isAr ? 'سيد المسبحات' : 'Master of Musabbahat',
      description: isAr ? 'اقرأ سور المسبحات السبعة في ليلة واحدة' : 'Read the seven Musabbahat surahs in one night',
      points: 3000,
      target: 7,
      current: 0,
      icon: <Sparkles className="text-purple-500" />,
      rarity: 'rare'
    },
    {
      id: 'juz_amma_hifz',
      title: isAr ? 'حافظ النبأ' : 'Guardian of An-Naba',
      description: isAr ? 'أتمّ حفظ جزء عمّ كاملاً' : 'Complete the memorization of Juz Amma',
      points: 10000,
      target: 1,
      current: profile.totalJuzCompleted > 0 ? 1 : 0,
      icon: <Award className="text-emerald-500" />,
      rarity: 'legendary'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-purple-500/10">
          <Sparkles className="text-purple-500" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-serif font-bold text-primary">{isAr ? 'المهمات الملحمية' : 'Epic Quests'}</h3>
          <p className="text-xs text-muted-foreground">{isAr ? 'تحديات طويلة الأمد بمكافآت استثنائية' : 'Long-term challenges with exceptional rewards'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {quests.map((quest) => {
          const isCompleted = quest.current >= quest.target;
          const progress = Math.min(100, (quest.current / quest.target) * 100);

          return (
            <div 
              key={quest.id} 
              className={`p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group ${
                isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border/40 hover:border-primary/20"
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                {quest.icon}
              </div>

              <div className="flex gap-6 items-start relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/5 text-primary/40"
                }`}>
                  {isCompleted ? <CheckCircle2 size={28} /> : quest.icon}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-primary">{quest.title}</h4>
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        quest.rarity === 'legendary' ? "bg-gold/10 text-gold" : 
                        quest.rarity === 'epic' ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600"
                      }`}>
                        {quest.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{quest.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-primary/60">{isAr ? 'التقدم' : 'Progress'}</span>
                      <span className="text-gold">+{isAr ? toArabicNumber(quest.points) : quest.points.toLocaleString()} {isAr ? 'نقطة' : 'pts'}</span>
                    </div>
                    <div className="h-2 bg-primary/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${isCompleted ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                      <span>{isAr ? toArabicNumber(quest.current) : quest.current} / {isAr ? toArabicNumber(quest.target) : quest.target}</span>
                      {isCompleted && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10} /> {isAr ? 'تم الإنجاز' : 'Completed'}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpicQuests;
