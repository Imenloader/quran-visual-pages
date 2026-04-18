import React from "react";
import { Sparkles } from "lucide-react";

const TajweedLegend: React.FC = () => {
  return (
    <div className="mb-8 flex flex-col items-center gap-3 w-full max-w-2xl mx-auto px-4">
      <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <Sparkles size={14} />
        <span className="text-[10px] font-bold font-naskh uppercase tracking-wider">التجويد الملون مفعل</span>
      </div>
      
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4 py-2 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-sm">
        {[
          { label: "غنة", color: "#22c55e" },
          { label: "قلقلة", color: "#3b82f6" },
          { label: "مد", color: "#ef4444" },
          { label: "إخفاء", color: "#f59e0b" },
          { label: "إدغام", color: "#94a3b8" },
          { label: "إقلاب", color: "#06b6d4" },
          { label: "إخفاء شفوي", color: "#a855f7" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-naskh text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TajweedLegend;
