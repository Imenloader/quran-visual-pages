import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { User, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const GenderGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile, isAuthReady } = useUser();
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);

  // Only show guard if user is logged in and gender is unspecified
  const showGuard = isAuthReady && profile?.uid && profile?.gender === 'unspecified';

  if (!showGuard) return <>{children}</>;

  const handleConfirm = () => {
    if (selected) {
      updateProfile({ gender: selected });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-emerald-deep/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative Ornaments */}
      <div className="absolute inset-0 pattern-islamic opacity-10 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-card rounded-[3rem] border border-gold/20 shadow-2xl p-8 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        
        <div className="space-y-3 relative z-10">
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gold/20 shadow-gold-glow">
            <User size={40} className="text-gold" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            {isAr ? "خطوة أخيرة للبدء" : "One Last Step"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isAr 
              ? "يرجى تحديد الجنس لتخصيص تجربتك في المجتمع وضمان الخصوصية في غرف الدردشة." 
              : "Please select your gender to personalize your community experience and ensure privacy in chat rooms."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <button
            onClick={() => setSelected('male')}
            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all group ${
              selected === 'male'
                ? "border-blue-500 bg-blue-500/10 shadow-lg"
                : "border-primary/5 bg-primary/5 hover:border-blue-500/30"
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${selected === 'male' ? "bg-blue-500 text-white scale-110" : "bg-blue-500/10 text-blue-500 group-hover:scale-110"}`}>
              <User size={24} />
            </div>
            <span className={`font-serif font-bold text-base ${selected === 'male' ? "text-blue-700 dark:text-blue-300" : "text-primary/60"}`}>
              {isAr ? "ذكر" : "Male"}
            </span>
          </button>

          <button
            onClick={() => setSelected('female')}
            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all group ${
              selected === 'female'
                ? "border-rose-500 bg-rose-500/10 shadow-lg"
                : "border-primary/5 bg-primary/5 hover:border-rose-500/30"
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${selected === 'female' ? "bg-rose-500 text-white scale-110" : "bg-rose-500/10 text-rose-500 group-hover:scale-110"}`}>
              <User size={24} />
            </div>
            <span className={`font-serif font-bold text-base ${selected === 'female' ? "text-rose-700 dark:text-rose-300" : "text-primary/60"}`}>
              {isAr ? "أنثى" : "Female"}
            </span>
          </button>
        </div>

        <div className="space-y-4 pt-4 relative z-10">
          <Button
            disabled={!selected}
            onClick={handleConfirm}
            className="w-full h-14 rounded-2xl bg-emerald-deep text-gold font-serif font-bold text-lg shadow-xl shadow-emerald-deep/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Sparkles size={20} className="mr-2" />
            {isAr ? "تأكيد المتابعة" : "Confirm & Continue"}
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            <ShieldCheck size={12} className="text-emerald-500" />
            {isAr ? "اختيار نهائي غير قابل للتغيير" : "Permanent Selection"}
          </div>
        </div>

        {/* Ornament */}
        <div className="absolute -bottom-12 -left-12 w-48 h-48 ornament-border opacity-10 rotate-45 pointer-events-none" />
      </div>
    </div>
  );
};

export default GenderGuard;
