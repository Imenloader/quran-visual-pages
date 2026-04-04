import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Map, 
  CheckCircle2, 
  BookOpen, 
  Backpack, 
  Compass,
  Play,
  Info,
  ChevronRight
} from "lucide-react";
import QuranHeader from "@/components/QuranHeader";
import ScrollReveal from "@/components/ScrollReveal";
import BackButton from "@/components/BackButton";
import { hajjSteps, packingChecklist, HajjStep } from "@/data/hajjData";

const HajjGuide = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"rituals" | "checklist" | "tour">("rituals");
  const [selectedStep, setSelectedStep] = useState<HajjStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem("hajj-completed-steps");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("hajj-completed-steps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const progress = Math.round((completedSteps.length / hajjSteps.length) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      <QuranHeader 
        title={i18n.language === 'ar' ? "دليل الحج والعمرة" : "Hajj & Umrah Guide"} 
        subtitle={i18n.language === 'ar' ? "رفيقك خطوة بخطوة في رحلة العمر" : "Your step-by-step companion for the journey of a lifetime"} 
        variant="compact" 
      />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="mb-8">
          <BackButton variant="outline" />
        </div>

        {/* Progress Bar */}
        <ScrollReveal>
          <div className="bg-card border border-border rounded-3xl p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{i18n.language === 'ar' ? "تقدمك في المناسك" : "Ritual Progress"}</h3>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Tabs */}
        <div className="flex p-1 bg-muted/50 rounded-2xl mb-8">
          {[
            { id: "rituals", label: i18n.language === 'ar' ? "المناسك" : "Rituals", icon: <Map className="w-4 h-4" /> },
            { id: "checklist", label: i18n.language === 'ar' ? "الحقيبة" : "Checklist", icon: <Backpack className="w-4 h-4" /> },
            { id: "tour", label: i18n.language === 'ar' ? "جولة افتراضية" : "Virtual Tour", icon: <Compass className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "rituals" | "checklist" | "tour")}
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
          {activeTab === "rituals" && (
            <motion.div 
              key="rituals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {hajjSteps.map((step, idx) => (
                <div 
                  key={step.id}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                    selectedStep?.id === step.id ? "bg-primary/5 border-primary shadow-lg" : "bg-card border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        completedSteps.includes(step.id) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {completedSteps.includes(step.id) ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{i18n.language === 'ar' ? step.title : step.titleEn}</h4>
                        <p className="text-sm text-muted-foreground">{step.type === 'both' ? (i18n.language === 'ar' ? "حج وعمرة" : "Hajj & Umrah") : (i18n.language === 'ar' ? "حج فقط" : "Hajj Only")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStep(step.id);
                      }}
                      className={`p-2 rounded-xl transition-colors ${
                        completedSteps.includes(step.id) ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {selectedStep?.id === step.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-6 pt-6 border-t border-border space-y-4"
                    >
                      <div className="space-y-2">
                        <h5 className="font-bold flex items-center gap-2 text-primary">
                          <Info className="w-4 h-4" />
                          {i18n.language === 'ar' ? "الوصف" : "Description"}
                        </h5>
                        <p className="text-muted-foreground leading-relaxed">
                          {i18n.language === 'ar' ? step.description : step.descriptionEn}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-2xl space-y-2">
                        <h5 className="font-bold flex items-center gap-2 text-amber-600">
                          <BookOpen className="w-4 h-4" />
                          {i18n.language === 'ar' ? "الدعاء" : "Dua"}
                        </h5>
                        <p className="font-serif text-lg leading-relaxed text-center italic">
                          {i18n.language === 'ar' ? step.dua : step.duaEn}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "checklist" && (
            <motion.div 
              key="checklist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {packingChecklist.map((item, idx) => (
                <div key={idx} className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <span className="font-bold">{i18n.language === 'ar' ? item.item : item.itemEn}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-2 py-1 bg-muted rounded-md">
                    {item.category}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "tour" && (
            <motion.div 
              key="tour"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="relative aspect-video rounded-3xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1000&auto=format&fit=crop" 
                  alt="Makkah"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button 
                    onClick={() => navigate("/embed/makkah")}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </button>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <h4 className="text-white font-bold text-lg">{i18n.language === 'ar' ? "المسجد الحرام - مكة المكرمة" : "Masjid al-Haram - Makkah"}</h4>
                  <p className="text-white/70 text-sm">{i18n.language === 'ar' ? "جولة 360 درجة في أطهر بقاع الأرض" : "360° tour of the purest place on Earth"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-card border border-border rounded-3xl space-y-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primary" />
                    {i18n.language === 'ar' ? "المسجد النبوي" : "Masjid an-Nabawi"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {i18n.language === 'ar' ? "استكشف الروضة الشريفة والمسجد النبوي في المدينة المنورة." : "Explore the Rawdah and the Prophet's Mosque in Madinah."}
                  </p>
                  <button 
                    onClick={() => navigate("/embed/madinah")}
                    className="w-full py-3 rounded-xl bg-muted font-bold text-sm hover:bg-primary hover:text-white transition-all"
                  >
                    {i18n.language === 'ar' ? "بدء الجولة" : "Start Tour"}
                  </button>
                </div>
                <div className="p-6 bg-card border border-border rounded-3xl space-y-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" />
                    {i18n.language === 'ar' ? "المشاعر المقدسة" : "Holy Sites"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {i18n.language === 'ar' ? "جولة في منى وعرفة ومزدلفة للتعرف على أماكن المناسك." : "A tour of Mina, Arafat, and Muzdalifah to learn about the ritual sites."}
                  </p>
                  <button 
                    onClick={() => navigate("/embed/holysites")}
                    className="w-full py-3 rounded-xl bg-muted font-bold text-sm hover:bg-primary hover:text-white transition-all"
                  >
                    {i18n.language === 'ar' ? "بدء الجولة" : "Start Tour"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HajjGuide;
