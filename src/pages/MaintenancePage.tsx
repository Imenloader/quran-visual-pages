import React from "react";
import { Wrench, Clock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSystem } from "@/contexts/SystemContext";

const MaintenancePage = () => {
  const { i18n } = useTranslation();
  const { settings } = useSystem();
  const isAr = i18n.language.startsWith("ar");

  const message = isAr ? settings.maintenanceMessageAr : settings.maintenanceMessageEn;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute inset-0 pattern-islamic opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div 
        className="max-w-md w-full space-y-8 relative z-10 opacity-100 translate-y-0 transition-all duration-1000"
      >
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 relative overflow-hidden">
             <div
               className="animate-pulse"
               style={{ animationDuration: '4s' }}
             >
               <Wrench size={48} strokeWidth={1.5} />
             </div>
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
          <div 
            className="absolute -top-2 -right-2 animate-bounce"
          >
            <AlertCircle className="text-rose-500 w-8 h-8 fill-rose-500/10" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold font-naskh tracking-tight text-foreground">
            {isAr ? "وضع الصيانة" : "Maintenance Mode"}
          </h1>
          <p className="text-lg text-muted-foreground font-naskh leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 glass-card hover:-translate-y-1 rounded-3xl space-y-4 shadow-xl shadow-black/5">
          <div className="flex items-center gap-4 text-right rtl:text-right ltr:text-left">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                {isAr ? "الوقت المتوقع" : "Expected Time"}
              </p>
              <p className="font-bold text-foreground">
                {isAr ? "سنعود خلال ساعات قليلة" : "Back within a few hours"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col gap-4">
           <p className="text-xs text-muted-foreground italic font-serif">
             {isAr ? "نشكركم على صبركم وتفهمكم" : "Thank you for your patience and understanding"}
           </p>
           <div className="flex justify-center gap-2">
             {[1, 2, 3].map(i => (
               <div 
                 key={i}
                 className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                 style={{ animationDelay: `${i * 0.3}s` }}
               />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
