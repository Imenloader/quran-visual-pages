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
          { label: "غنة / إدغام بغنة", color: "#00A86B" },
          { label: "قلقلة", color: "#1E90FF" },
          { label: "مد", color: "#FF0000" },
          { label: "إخفاء", color: "#FF8C00" },
          { label: "إدغام بدون غنة", color: "#A9A9A9" },
          { label: "حروف صغيرة / سجدة", color: "#FF4500" },
          { label: "وقف لازم", color: "#E11D48" },
          { label: "وقف معانقة", color: "#D97706" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full shadow-sm ring-1 ring-border/20" style={{ backgroundColor: item.color }} />
            <span className="text-[9px] font-naskh text-muted-foreground/90">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TajweedLegend;
