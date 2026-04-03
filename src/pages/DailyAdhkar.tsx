import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Sun, 
  Moon, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";
import { morningAdhkar, eveningAdhkar, dailySunnan, AdhkarItem } from "@/data/dailyAdhkarData";

const Adhkar = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"morning" | "evening" | "sunnan">("morning");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const increment = (id: string, max: number) => {
    setCounts(prev => ({
      ...prev,
      [id]: Math.min((prev[id] || 0) + 1, max)
    }));
  };

  const reset = (id: string) => {
    setCounts(prev => ({ ...prev, [id]: 0 }));
  };

  const renderAdhkar = (list: AdhkarItem[]) => (
    <div className="space-y-6">
      {list.map((item, idx) => (
        <ScrollReveal key={item.id} delay={idx * 0.1}>
          <div className="p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/40 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen size={80} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                  {i18n.language === 'ar' ? `التكرار: ${item.count}` : `Repeat: ${item.count}`}
                </div>
                <button onClick={() => reset(item.id)} className="text-muted-foreground hover:text-primary transition-colors">
                  <RotateCcw size={16} />
                </button>
              </div>
              
              <p className="text-2xl font-serif text-center leading-loose text-foreground">
                {item.text}
              </p>
              
              <p className="text-sm text-muted-foreground text-center italic">
                {item.translation}
              </p>

              <div className="pt-6 flex flex-col items-center gap-4">
                <button 
                  onClick={() => increment(item.id, item.count)}
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative ${
                    (counts[item.id] || 0) >= item.count 
                      ? "bg-primary text-white shadow-lg shadow-primary/30" 
                      : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary border-4 border-transparent hover:border-primary/20"
                  }`}
                >
                  <span className="text-3xl font-bold">{counts[item.id] || 0}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{i18n.language === 'ar' ? "تم" : "Done"}</span>
                  {(counts[item.id] || 0) >= item.count && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-white text-primary rounded-full p-1 shadow-md">
                      <CheckCircle2 size={24} />
                    </motion.div>
                  )}
                </button>
                <p className="text-xs text-muted-foreground font-medium text-center px-4">
                  {i18n.language === 'ar' ? item.benefit : item.benefitEn}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={i18n.language === 'ar' ? "الأذكار والسنن" : "Adhkar & Sunnan"} 
        subtitle={i18n.language === 'ar' ? "حصن المسلم وروتينه الروحي اليومي" : "Fortress of the Muslim and daily spiritual routine"} 
        variant="compact" 
      />

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <button onClick={() => navigate("/hub")} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold mb-8">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          {i18n.language === 'ar' ? "العودة للمركز" : "Back to Hub"}
        </button>

        <div className="flex p-1 bg-muted/50 rounded-2xl mb-12">
          {[
            { id: "morning", label: i18n.language === 'ar' ? "أذكار الصباح" : "Morning", icon: <Sun className="w-4 h-4" /> },
            { id: "evening", label: i18n.language === 'ar' ? "أذكار المساء" : "Evening", icon: <Moon className="w-4 h-4" /> },
            { id: "sunnan", label: i18n.language === 'ar' ? "سنن يومية" : "Daily Sunnan", icon: <Sparkles className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "morning" | "evening" | "sunnan")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "morning" && (
            <motion.div key="morning" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {renderAdhkar(morningAdhkar)}
            </motion.div>
          )}
          {activeTab === "evening" && (
            <motion.div key="evening" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {renderAdhkar(eveningAdhkar)}
            </motion.div>
          )}
          {activeTab === "sunnan" && (
            <motion.div key="sunnan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dailySunnan.map((sunnah, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.1}>
                  <div className="p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/40 transition-all duration-500 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Sparkles size={24} />
                      </div>
                      <h3 className="text-xl font-bold">{i18n.language === 'ar' ? sunnah.title : sunnah.titleEn}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {i18n.language === 'ar' ? sunnah.description : sunnah.descriptionEn}
                      </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border flex justify-end">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                        {i18n.language === 'ar' ? "سنة نبوية" : "Prophetic Sunnah"}
                        <CheckCircle2 size={14} />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Adhkar;
