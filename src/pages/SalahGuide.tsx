import React, { useState, useMemo } from 'react';
import { 
  allSalahSteps, 
  wuduSteps, 
  GuideStep, 
  prayerDefinitions 
} from '@/data/salahGuideData';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2,
  Volume2,
  Droplets,
  BookOpen,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import QuranHeader from '@/components/QuranHeader';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const SalahGuide: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [activeTab, setActiveTab] = useState<'wudu' | 'salah'>('wudu');
  const [selectedPrayer, setSelectedPrayer] = useState<keyof typeof prayerDefinitions>('fajr');
  const [wuduStepIndex, setWuduStepIndex] = useState(0);
  const [salahStepIndex, setSalahStepIndex] = useState(0);

  // Derived data based on selection
  const currentSteps = useMemo(() => {
    if (activeTab === 'wudu') return wuduSteps;
    const def = prayerDefinitions[selectedPrayer];
    return def.sequence.map(key => allSalahSteps[key]);
  }, [activeTab, selectedPrayer]);

  const currentIndex = activeTab === 'wudu' ? wuduStepIndex : salahStepIndex;
  const setIndex = activeTab === 'wudu' ? setWuduStepIndex : setSalahStepIndex;
  
  const currentStep = currentSteps[currentIndex];
  const progress = ((currentIndex + 1) / currentSteps.length) * 100;

  const nextStep = () => {
    if (currentIndex < currentSteps.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      toast.success(isAr ? "ما شاء الله! لقد أتممت الدليل." : "Masha'Allah! You've completed the guide.");
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
      setIndex(prev => prev - 1);
    }
  };

  const resetGuide = () => {
    setIndex(0);
    toast.info(isAr ? "تم إعادة تعيين الدليل." : "Guide reset.");
  };

  const playAudio = () => {
    toast.info(isAr ? "التسجيل الصوتي قريباً إن شاء الله!" : "Audio recitation coming soon!");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader 
        title={isAr ? "دليل العبادات الشامل" : "Comprehensive Worship Guide"} 
        subtitle={isAr ? "دليل مصور للوضوء والصلوات الخمس" : "Visual guide for Wudu and 5 Prayers"}
        variant="compact"
        showBack
      />

      <main className="container max-w-5xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as any);
          setIndex(0);
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-card/50 backdrop-blur-xl p-1 rounded-2xl border border-border/40 h-14">
            <TabsTrigger value="wudu" className="rounded-xl flex gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Droplets size={18} /> {isAr ? "الوضوء" : "Wudu"}
            </TabsTrigger>
            <TabsTrigger value="salah" className="rounded-xl flex gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <BookOpen size={18} /> {isAr ? "الصلاة" : "Salah"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 space-y-6">
            {activeTab === 'salah' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/30 backdrop-blur-md p-4 rounded-[2rem] border border-border/20 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Sparkles size={20} />
                  </div>
                  <span className="font-bold text-sm text-foreground">{isAr ? 'اختر الصلاة:' : 'Choose Prayer:'}</span>
                </div>
                <Select value={selectedPrayer} onValueChange={(v) => {
                  setSelectedPrayer(v as any);
                  setSalahStepIndex(0);
                }}>
                  <SelectTrigger className="w-full md:w-[240px] h-12 rounded-xl bg-card border-border/40 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl">
                    {Object.entries(prayerDefinitions).map(([key, def]) => (
                      <SelectItem key={key} value={key} className="font-bold">
                        {isAr ? def.nameAr : def.name} ({def.rakahs} {isAr ? 'ركعات' : 'Rakahs'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Progress Section */}
            <div className="bg-card/40 backdrop-blur-xl border border-border/20 rounded-[2rem] p-6 shadow-soft">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {currentIndex + 1}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {isAr ? `الخطوة ${currentIndex + 1} من ${currentSteps.length}` : `Step ${currentIndex + 1} of ${currentSteps.length}`}
                  </span>
                </div>
                <span className="text-xs font-bold text-primary">
                  {Math.round(progress)}% {isAr ? 'اكتمل' : 'Complete'}
                </span>
              </div>
              <Progress value={progress} className="h-2 rounded-full bg-muted/50 overflow-hidden" />
            </div>

            {/* Interactive Card Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Image Side */}
              <div className="lg:col-span-4 xl:col-span-3 relative group">
                <div className="relative aspect-square bg-card rounded-[2.5rem] overflow-hidden shadow-xl border border-border/10 ring-1 ring-black/5 max-h-[320px] mx-auto">
                  <img 
                    src={currentStep.postureImageUrl} 
                    alt={currentStep.stepName}
                    className="w-full h-full object-contain p-4 transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Details Side */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                <div className="bg-card/60 backdrop-blur-2xl border border-border/20 rounded-[2.5rem] p-8 md:p-10 shadow-soft flex-1 flex flex-col justify-center">
                  <div className={isAr ? "text-right" : "text-left"}>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-foreground ${isAr ? "font-naskh" : "font-serif"}`}>
                      {isAr ? currentStep.stepNameAr : currentStep.stepName}
                    </h2>
                    <p className={`text-muted-foreground leading-relaxed mb-10 text-lg ${isAr ? "font-naskh" : ""}`}>
                      {isAr ? currentStep.descriptionAr : currentStep.description}
                    </p>
                  </div>

                  {currentStep.arabicRecitation && (
                    <div className="space-y-6">
                      <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] relative group/audio">
                        <div className={`flex justify-between items-center mb-6 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                            {isAr ? 'الذكر' : 'Recitation'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={playAudio}
                            className="w-12 h-12 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-inner"
                          >
                            <Volume2 size={20} />
                          </Button>
                        </div>
                        <p className={`text-3xl md:text-4xl font-quran text-center leading-[1.8] text-foreground ${isAr ? 'rtl' : 'ltr'}`}>
                          {currentStep.arabicRecitation}
                        </p>
                      </div>

                      <div className={`space-y-4 px-4 ${isAr ? 'text-right' : 'text-left'}`}>
                        {!isAr && currentStep.transliteration && (
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-1">Transliteration</span>
                            <p className="italic text-foreground font-serif text-lg">{currentStep.transliteration}</p>
                          </div>
                        )}
                        <div className="pt-6 border-t border-border/40">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-1">{isAr ? 'المعنى' : 'Meaning'}</span>
                          <p className="text-muted-foreground text-lg leading-relaxed">{isAr ? currentStep.translationAr : currentStep.translation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  <Button 
                    onClick={prevStep}
                    disabled={currentIndex === 0}
                    variant="outline"
                    className="flex-1 h-20 rounded-2xl gap-3 font-bold shadow-soft hover:bg-muted transition-all text-lg"
                  >
                    <ChevronLeft size={24} /> {isAr ? 'السابق' : 'Previous'}
                  </Button>
                  <Button 
                    onClick={nextStep}
                    className="flex-2 h-20 rounded-2xl gap-3 font-bold shadow-xl gradient-islamic text-white active:scale-[0.98] transition-all text-lg min-w-[150px] md:min-w-[200px]"
                  >
                    {currentIndex === currentSteps.length - 1 ? (
                      <>{isAr ? 'تم بنجاح' : 'Done'} <CheckCircle2 size={24} /></>
                    ) : (
                      <>{isAr ? 'التالي' : 'Next'} <ChevronRight size={24} /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tip Section */}
        <div className="mt-12 p-8 bg-amber-500/5 border border-amber-500/10 rounded-[3rem] flex items-start gap-6 shadow-inner">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Info size={32} />
          </div>
          <div>
            <h4 className="font-bold text-amber-700 text-xl mb-2">
              {isAr ? 'ملاحظة تعليمية' : 'Educational Tip'}
            </h4>
            <p className="text-amber-700/80 leading-relaxed text-lg">
              {activeTab === 'wudu' 
                ? (isAr ? 'هذا الدليل يوضح الصفة المجزئة والمستحبة للوضوء.' : 'This guide shows the recommended steps for a perfect Wudu.')
                : (isAr ? `لقد اخترت صلاة ${prayerDefinitions[selectedPrayer].nameAr} وهي تتكون من ${prayerDefinitions[selectedPrayer].rakahs} ركعات.` : `You have selected ${prayerDefinitions[selectedPrayer].name} prayer, which consists of ${prayerDefinitions[selectedPrayer].rakahs} Rakahs.`)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalahGuide;
