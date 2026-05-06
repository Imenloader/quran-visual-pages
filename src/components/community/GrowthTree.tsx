import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";

const GrowthTree = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { profile, level } = useUser();

  // Determine tree stage based on level
  const stage = useMemo(() => {
    if (level <= 1) return 'seed';
    if (level <= 5) return 'sprout';
    if (level <= 10) return 'sapling';
    if (level <= 20) return 'tree';
    return 'mighty_tree';
  }, [level]);

  // SVG dimensions
  const width = 200;
  const height = 240;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card/30 backdrop-blur-md rounded-[2.5rem] border border-border/20 shadow-inner group">
      <div className="relative w-[200px] h-[240px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full drop-shadow-[0_10px_15px_rgba(16,185,129,0.2)] transition-all duration-1000 group-hover:scale-105"
        >
          {/* Ground */}
          <ellipse cx="100" cy="220" rx="60" ry="10" fill="currentColor" className="text-primary/5" />
          
          {/* Trunk & Branches (Simplified SVG shapes) */}
          <path 
            d={
              stage === 'seed' ? "M100,220 L100,210" :
              stage === 'sprout' ? "M100,220 L100,180" :
              stage === 'sapling' ? "M100,220 L100,140 M100,180 L80,160 M100,170 L120,150" :
              stage === 'tree' ? "M100,220 L100,100 M100,180 L70,140 M100,150 L130,120 M100,120 L80,90" :
              "M100,220 L100,80 M100,180 L60,130 M100,150 L140,110 M100,120 L70,70 M100,90 L130,60"
            }
            stroke="currentColor" 
            strokeWidth={level > 10 ? "8" : "4"} 
            strokeLinecap="round"
            className="text-amber-900/40 transition-all duration-1000"
          />

          {/* Leaves */}
          {level >= 2 && (
            <g className="transition-opacity duration-1000">
               {/* Growing leaves based on progress */}
               {[...Array(Math.min(20, level * 2))].map((_, i) => {
                 const angle = (i * 137.5) % 360;
                 const radius = Math.sqrt(i) * (level > 10 ? 15 : 10);
                 const cx = 100 + radius * Math.cos(angle * Math.PI / 180);
                 const cy = (height - 60) - radius * Math.sin(angle * Math.PI / 180) - (level * 2);
                 
                 return (
                   <circle 
                     key={i}
                     cx={cx} 
                     cy={cy} 
                     r={Math.random() * 5 + 3} 
                     className="fill-emerald-500/60 transition-all duration-1000"
                     style={{ transitionDelay: `${i * 50}ms` }}
                   />
                 );
               })}
            </g>
          )}

          {/* Special Fruits for Achievements */}
          {profile.totalJuzCompleted > 0 && (
            <circle cx="100" cy="90" r="6" className="fill-gold animate-pulse" />
          )}
        </svg>

        {/* Level Badge Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
           <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-2 border-emerald-500 flex items-center justify-center shadow-lg">
             <span className="text-xs font-bold text-emerald-600">{level}</span>
           </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h4 className="text-sm font-serif font-bold text-primary">{isAr ? 'شجرة النمو الروحاني' : 'Spiritual Growth Tree'}</h4>
        <p className="text-[10px] text-muted-foreground italic">
          {level < 5 ? (isAr ? 'تعهدها بالريّ (الأذكار)' : 'Keep watering it (Dhikr)') : 
           level < 15 ? (isAr ? 'بدأت تؤتي أكلها' : 'Starting to bear fruit') :
           (isAr ? 'شجرة طيبة أصلها ثابت' : 'A good tree with firm roots')}
        </p>
      </div>
    </div>
  );
};

export default GrowthTree;
