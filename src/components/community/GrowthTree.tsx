import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";

const GrowthTree = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { profile, level } = useUser();

  const stage = useMemo(() => {
    if (level <= 2) return "seed";
    if (level <= 7) return "sprout";
    if (level <= 15) return "sapling";
    if (level <= 25) return "tree";
    return "mighty_tree";
  }, [level]);

  const stageImage = useMemo(() => {
    switch (stage) {
      case "seed":
        return "/assets/growth-tree/seed.svg";
      case "sprout":
        return "/assets/growth-tree/sprout.svg";
      case "sapling":
        return "/assets/growth-tree/sapling.svg";
      case "tree":
        return "/assets/growth-tree/tree.svg";
      default:
        return "/assets/growth-tree/mighty-tree.svg";
    }
  }, [stage]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-card/80 backdrop-blur-xl rounded-[2.5rem] border border-border/60 shadow-xl group relative overflow-hidden h-full">
      <div className="relative w-full aspect-[4/5] rounded-[1.8rem] overflow-hidden border border-emerald-900/10 shadow-inner">
        <img
          src={stageImage}
          alt={isAr ? "شجرة النمو الروحاني" : "Spiritual Growth Tree"}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-4 right-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-900/92 border border-emerald-200/50 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform duration-500">
            <div className="text-center">
              <span className="block text-[8px] uppercase tracking-tighter text-emerald-100 font-extrabold">Lvl</span>
              <span className="text-xl font-black text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">{level}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center relative z-10">
        <h4 className="text-lg font-serif font-bold text-primary tracking-tight">
          {isAr ? "شجرة النمو الروحاني" : "Spiritual Growth Tree"}
        </h4>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="h-1 w-8 rounded-full bg-emerald-500/20">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(level % 10) * 10}%` }} />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-widest">
            {level < 5
              ? isAr
                ? "بذرة صالحة"
                : "Good Seed"
              : level < 15
                ? isAr
                  ? "نبتة يافعة"
                  : "Young Sprout"
                : level < 25
                  ? isAr
                    ? "شجرة مثمرة"
                    : "Fruitful Tree"
                  : isAr
                    ? "شجرة طيبة"
                    : "Mighty Tree"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrowthTree;
