import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";

const GrowthTree = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { profile, level } = useUser();

  // Determine tree stage based on level
  const stage = useMemo(() => {
    if (level <= 2) return 'seed';
    if (level <= 7) return 'sprout';
    if (level <= 15) return 'sapling';
    if (level <= 25) return 'tree';
    return 'mighty_tree';
  }, [level]);

  // Leaf color based on gender/vibe (can be customized)
  const leafColor = profile?.gender === 'female' ? '#10b981' : '#059669';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card/70 backdrop-blur-xl rounded-[2.5rem] border border-border/60 shadow-xl group relative overflow-hidden h-full">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/15 via-emerald-400/5 to-transparent pointer-events-none" />
      
      <div className="relative w-full aspect-[4/5] flex items-center justify-center">
        <svg 
          viewBox="0 0 200 250" 
          className="w-full h-full drop-shadow-[0_15px_25px_rgba(16,185,129,0.15)] transition-all duration-1000 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Ground with better depth */}
          <ellipse cx="100" cy="230" rx="70" ry="12" fill="url(#trunkGradient)" fillOpacity="0.14" />
          <ellipse cx="100" cy="230" rx="40" ry="6" fill="url(#trunkGradient)" fillOpacity="0.2" />
          
          {/* Trunk & Branches (Organic Paths) */}
          <g className="transition-all duration-1000">
            {stage === 'seed' && (
              <circle cx="100" cy="225" r="4" fill="#92400e" className="animate-bounce" />
            )}
            
            {(stage !== 'seed') && (
              <path 
                d={
                  stage === 'sprout' ? "M100,230 Q100,210 105,190" :
                  stage === 'sapling' ? "M100,230 Q100,200 100,160 M100,200 Q80,180 75,165 M100,190 Q120,175 125,160" :
                  stage === 'tree' ? "M100,230 Q100,180 100,100 M100,190 Q70,160 65,130 M100,170 Q130,140 135,110 M100,130 Q85,110 80,90" :
                  "M100,230 Q100,160 100,70 M100,200 Q60,160 55,110 M100,180 Q140,140 145,90 M100,140 Q75,110 70,60 M100,110 Q125,80 130,40"
                }
                stroke="url(#trunkGradient)" 
                strokeWidth={level > 15 ? "10" : level > 7 ? "7" : "4"} 
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 drop-shadow-[0_2px_6px_rgba(120,53,15,0.35)]"
              />
            )}
          </g>

          {/* Leaves with more organic look */}
          {level >= 3 && (
            <g>
               {[...Array(Math.min(40, level * 2))].map((_, i) => {
                 const angle = (i * 137.5) % 360;
                 const radius = Math.sqrt(i) * (level > 15 ? 18 : 12);
                 const cx = 100 + radius * Math.cos(angle * Math.PI / 180);
                 const cy = (stage === 'sprout' ? 190 : stage === 'sapling' ? 160 : stage === 'tree' ? 110 : 70) - radius * Math.sin(angle * Math.PI / 180);
                 
                 return (
                   <path 
                     key={i}
                     d="M0,0 Q5,-10 10,0 Q5,10 0,0"
                     transform={`translate(${cx}, ${cy}) rotate(${angle}) scale(${0.55 + ((i % 5) * 0.08)})`}
                     fill="url(#leafGradient)"
                     className="transition-all duration-1000 opacity-95 hover:opacity-100"
                     style={{ 
                       transitionDelay: `${i * 30}ms`,
                       animation: `float ${2 + (i % 4) * 0.5}s ease-in-out infinite alternate`,
                       animationDelay: `${i * 100}ms`
                     }}
                   />
                 );
               })}
            </g>
          )}

          {/* Achievement Fruits (Glowy) */}
          {profile.totalJuzCompleted > 0 && (
            <circle 
              cx="100" cy={stage === 'mighty_tree' ? 50 : 90} 
              r="6" 
              fill="#fbbf24" 
              filter="url(#glow)"
              className="animate-pulse"
            />
          )}
          {level > 10 && (
             <circle 
              cx="70" cy="120" 
              r="4" 
              fill="#fbbf24" 
              filter="url(#glow)"
              className="animate-pulse"
              style={{ animationDelay: '500ms' }}
            />
          )}
        </svg>

        {/* Level Indicator (Modern Glassmorphism) */}
        <div className="absolute top-4 right-4 flex flex-col items-center">
           <div className="w-14 h-14 rounded-2xl bg-emerald-900/90 border border-emerald-200/40 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform duration-500">
             <div className="text-center">
               <span className="block text-[8px] uppercase tracking-tighter text-emerald-100 font-extrabold">Lvl</span>
               <span className="text-xl font-black text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">{level}</span>
             </div>
           </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-emerald-500/50 rounded-full animate-ping"
              style={{
                top: `${20 + ((i * 13) % 60)}%`,
                left: `${20 + ((i * 17) % 60)}%`,
                animationDelay: `${i * 800}ms`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 text-center relative z-10">
        <h4 className="text-lg font-serif font-bold text-primary tracking-tight">
          {isAr ? 'شجرة النمو الروحاني' : 'Spiritual Growth Tree'}
        </h4>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="h-1 w-8 rounded-full bg-emerald-500/20">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(level % 10) * 10}%` }} />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
            {level < 5 ? (isAr ? 'بذرة صالحة' : 'Good Seed') : 
             level < 15 ? (isAr ? 'نبتة يافعة' : 'Young Sprout') :
             level < 25 ? (isAr ? 'شجرة مثمرة' : 'Fruitful Tree') :
             (isAr ? 'شجرة طيبة' : 'Mighty Tree')}
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to { transform: translateY(-3px) rotate(5deg); }
        }
      `}} />
    </div>
  );
};

export default GrowthTree;
