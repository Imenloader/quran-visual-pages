import React from "react";
import { Trophy, Star, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MasteryBadgeProps {
  level: number;
  className?: string;
}

const MasteryBadge: React.FC<MasteryBadgeProps> = ({ level, className }) => {
  if (level === 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter",
      level === 1 && "bg-blue-500/10 text-blue-500",
      level === 2 && "bg-purple-500/10 text-purple-500",
      level === 3 && "bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(255,215,0,0.2)]",
      className
    )}>
      {level === 3 ? <Trophy size={10} /> : level === 2 ? <Star size={10} /> : <CheckCircle2 size={10} />}
      <span>
        {level === 3 ? "Mastered" : level === 2 ? "Solid" : "Learning"}
      </span>
    </div>
  );
};

export default MasteryBadge;
