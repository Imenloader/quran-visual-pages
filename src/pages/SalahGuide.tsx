import React, { useState } from 'react';
import { salahSteps, PrayerStep } from '@/data/salahGuideData';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  Info,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import QuranHeader from '@/components/QuranHeader';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const SalahGuide: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = salahSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / salahSteps.length) * 100;
  const isAr = i18n.language === 'ar';

  const nextStep = () => {
    if (currentStepIndex < salahSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      toast.success(isAr ? "ما شاء الله! لقد أتممت دليل الصلاة." : "Masha'Allah! You've completed the 2-Rak'ah guide.");
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const resetGuide = () => {
    setCurrentStepIndex(0);
    toast.info(isAr ? "تم إعادة تعيين الدليل إلى البداية." : "Guide reset to the beginning.");
  };

  const playAudio = () => {
    toast.info(isAr ? "التسجيل الصوتي قريباً إن شاء الله!" : "Audio recitation coming soon!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <QuranHeader 
        title={isAr ? "دليل الصلاة التفاعلي" : "Interactive Salah Guide"} 
        subtitle={isAr ? "خطوات الصلاة ركعتين خطوة بخطوة" : "Step-by-step 2-Rak'ah Prayer"}
        variant="compact"
        showBack
      />

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar Section */}
        <div className="mb-8 bg-card border border-border/40 rounded-3xl p-6 shadow-soft">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {isAr ? `الخطوة ${currentStepIndex + 1} من ${salahSteps.length}` : `Step ${currentStepIndex + 1} of ${salahSteps.length}`}
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(progress)}% {isAr ? 'اكتمل' : 'Complete'}
            </span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-muted shadow-inner" />
        </div>

        {/* Main Content Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Posture Image Column */}
          <div className="relative aspect-square md:aspect-[4/5] bg-card rounded-[3rem] overflow-hidden shadow-2xl border border-border/20">
            <img 
              src={currentStep.postureImageUrl} 
              alt={currentStep.stepName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-6 left-6">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white/20">
                {currentStep.id}
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col h-full space-y-6">
            <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-soft flex-1">
              <h2 className="text-3xl font-bold mb-2 text-foreground">{isAr ? currentStep.stepNameAr : currentStep.stepName}</h2>
              <p className="text-muted-foreground mb-8">{isAr ? currentStep.descriptionAr : currentStep.description}</p>

              <div className="space-y-6">
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{isAr ? 'النص الأصلي' : 'Arabic Recitation'}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={playAudio}
                      className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      <Volume2 size={18} />
                    </Button>
                  </div>
                  <p className="text-4xl md:text-5xl font-quran text-center leading-[1.8] text-foreground">
                    {currentStep.arabicRecitation}
                  </p>
                </div>

                <div className="space-y-4 px-2">
                  {!isAr && (
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-1">Transliteration</span>
                      <p className="italic text-foreground font-serif text-lg">{currentStep.transliteration}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-border/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-1">{isAr ? 'الترجمة' : 'Translation'}</span>
                    <p className="text-muted-foreground leading-relaxed">{isAr ? currentStep.translationAr : currentStep.translation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                variant="outline"
                className="h-16 rounded-2xl gap-2 font-bold shadow-soft active:scale-95 transition-all"
              >
                <ChevronLeft size={20} /> {isAr ? 'السابق' : 'Previous'}
              </Button>
              <Button 
                onClick={nextStep}
                className="h-16 rounded-2xl gap-2 font-bold shadow-soft gradient-islamic text-white active:scale-95 transition-all"
              >
                {currentStepIndex === salahSteps.length - 1 ? (
                  <>{isAr ? 'إنهاء' : 'Finish'} <CheckCircle2 size={20} /></>
                ) : (
                  <>{isAr ? 'التالي' : 'Next'} <ChevronRight size={20} /></>
                )}
              </Button>
            </div>
            
            {currentStepIndex > 0 && (
              <Button 
                variant="ghost" 
                onClick={resetGuide}
                className="text-muted-foreground hover:text-primary gap-2"
              >
                <RotateCcw size={14} /> {isAr ? 'إعادة البدء' : 'Restart Guide'}
              </Button>
            )}
          </div>
        </div>

        {/* Tip Section */}
        <section className="mt-12 p-6 bg-gold/5 border border-gold/20 rounded-[2.5rem] flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/20 text-gold flex items-center justify-center shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gold-foreground mb-1">{isAr ? 'الخشوع والطمأنينة' : 'Focus & Tranquility (Khushu)'}</h4>
            <p className="text-sm text-gold-foreground/80 leading-relaxed">
              {isAr ? 'خذ وقتك في كل وضعية. علمنا النبي ﷺ أن أهم جزء في الصلاة هو السكون وحضور القلب بين يدي الله.' : 'Take your time with each posture. The Prophet (PBUH) taught us that the most important part of prayer is stillness and presence of heart before Allah.'}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SalahGuide;
