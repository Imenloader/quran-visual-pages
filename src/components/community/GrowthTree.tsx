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
    <div className="flex flex-col md:flex-row items-center gap-4 p-5 bg-card/80 backdrop-blur-xl rounded-[2.5rem] border border-border/60 shadow-xl group relative overflow-hidden h-full">
      <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-[1.8rem] overflow-hidden border border-emerald-900/10 shadow-inner bg-emerald-500/5">
        <img
          src={stageImage}
          alt={isAr ? "شجرة النمو الروحاني" : "Spiritual Growth Tree"}
          className="w-full h-full object-contain p-2 transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="flex-1 text-center md:text-right space-y-2 relative z-10">
        <div>
          <h4 className="text-sm font-serif font-bold text-primary tracking-tight">
            {isAr ? "شجرة النمو الروحاني" : "Spiritual Growth Tree"}
          </h4>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
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
        
        <div className="flex items-center justify-center md:justify-end gap-3">
          <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-emerald-500/20 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(level % 10) * 10}%` }} />
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-900 text-white text-[10px] font-black shadow-lg">
            LVL {level}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthTree;
