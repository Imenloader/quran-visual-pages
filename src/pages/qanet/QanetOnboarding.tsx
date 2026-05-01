import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Moon, Bell, AlertTriangle, Medal, Trophy } from 'lucide-react';
import { useQanet } from './QanetContext';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const moonImage = "/assets/images/qanet_moon.png"; 
// Using a placeholder moon image for the onboarding until custom assets are added.
// The user provided screenshots, but we don't have the actual assets, so we use a good unsplash moon.

export default function QanetOnboarding() {
  const [step, setStep] = useState(0);
  const { language, updateState } = useQanet();
  
  const isArabic = language === 'ar';
  const direction = isArabic ? -1 : 1;

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));
  
  const finishOnboarding = () => {
    updateState({ hasCompletedOnboarding: true });
  };



  return (
    <div className="fixed inset-0 z-[100] bg-[#0B132B] text-white flex flex-col font-naskh overflow-y-auto" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top section with Moon */}
      <div className="pt-12 pb-6 flex flex-col items-center justify-center relative z-10">
        <div 
          className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden mb-4 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative"
        >
          <img src={moonImage} alt="Moon" className="w-full h-full object-cover" />
        </div>
        <h1 
          className="text-3xl font-bold text-center !text-white font-naskh"
        >
          قانت
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 w-full max-w-md mx-auto px-6 flex flex-col">
          <div
            className="flex-1 flex flex-col"
          >
            {step === 0 && <StepLanguage nextStep={nextStep} />}
            {step === 1 && <StepQuote />}
            {step === 2 && <StepGender nextStep={nextStep} />}
            {step === 3 && <StepTarget nextStep={nextStep} />}
            {step === 4 && <StepLevels />}
            {step === 5 && <StepNotifications finish={finishOnboarding} />}
          </div>
      </div>

      {/* Bottom Navigation */}
      {step !== 0 && step !== 5 && (
        <div className="p-6 flex items-center justify-between z-10 w-full max-w-md mx-auto">
          <button 
            onClick={prevStep}
            className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {isArabic ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-white' : 'w-2 bg-white/20'}`} 
              />
            ))}
          </div>

          <button 
            onClick={nextStep}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            {isArabic ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Steps ---

const StepLanguage = ({ nextStep }: { nextStep: () => void }) => {
  const { language, updateState } = useQanet();
  
  return (
    <div className="flex-1 flex flex-col justify-center gap-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold !text-white">اختر اللغة</h2>
        <p className="text-white/60">اختر لغتك المفضلة للبدء</p>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={() => { updateState({ language: 'en' }); nextStep(); }}
          className={`w-full p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${language === 'en' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
        >
          <span className="font-sans text-lg">English</span>
          {language === 'en' && <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"><Check size={14} /></div>}
        </button>
        <button 
          onClick={() => { updateState({ language: 'ar' }); nextStep(); }}
          className={`w-full p-5 rounded-2xl border text-right flex justify-between items-center transition-all ${language === 'ar' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
        >
          {language === 'ar' && <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"><Check size={14} /></div>}
          <span className="text-lg">العربية</span>
        </button>
      </div>
    </div>
  );
};

const StepQuote = () => {
  return (
    <div className="flex-1 flex flex-col justify-center gap-10">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center shadow-lg">
        <p className="text-xl leading-relaxed text-white/90">
          قال النبي ﷺ: "من قام بعشر آيات لم يُكتب من الغافلين، ومن قام بمائة آية كُتب من القانتين، ومن قام بألف آية كُتب من المقنطرين"
        </p>
      </div>
      
      <div className="text-center space-y-4">
        <p className="text-lg text-white/80">حوالي 15 دقيقة فقط كل ليلة لتُكتب من القانتين</p>
        <p className="text-white/50 text-sm">ليلة بليلة.. خطوة بخطوة</p>
      </div>
    </div>
  );
};

const StepGender = ({ nextStep }: { nextStep: () => void }) => {
  const { gender, updateState } = useQanet();
  
  return (
    <div className="flex-1 flex flex-col justify-center gap-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold !text-white">اختر الجنس</h2>
        <p className="text-white/60">هذا يساعدنا في تخصيص تجربتك</p>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={() => { updateState({ gender: 'male' }); nextStep(); }}
          className={`w-full p-5 rounded-2xl border text-center transition-all ${gender === 'male' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
        >
          <span className="text-lg">ذكر</span>
        </button>
        <button 
          onClick={() => { updateState({ gender: 'female' }); nextStep(); }}
          className={`w-full p-5 rounded-2xl border text-center transition-all ${gender === 'female' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
        >
          <span className="text-lg">أنثى</span>
        </button>
      </div>
    </div>
  );
};

const StepTarget = ({ nextStep }: { nextStep: () => void }) => {
  const { dailyTarget, updateState } = useQanet();
  
  const options = [
    { label: "أقل من 10 آيات", value: 5 },
    { label: "10-100 آية", value: 50 },
    { label: "100-1000 آية", value: 100 },
    { label: "+1000 آية", value: 1000 },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center gap-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold !text-white">أخبرنا عن قراءتك</h2>
        <p className="text-white/60">كم آية تقرأ عادة في ليلتك؟</p>
      </div>
      
      <div className="space-y-4">
        {options.map(opt => (
          <button 
            key={opt.value}
            onClick={() => { updateState({ dailyTarget: opt.value }); nextStep(); }}
            className={`w-full p-5 rounded-2xl border text-right transition-all ${dailyTarget === opt.value ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
          >
            <span className="text-lg">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const StepLevels = () => {
  return (
    <div className="flex-1 flex flex-col justify-center gap-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold !text-white">تتبع رحلتك</h2>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20 text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-red-400">غافل</h3>
            <p className="text-white/50 text-sm">أقل من 10 آيات</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400">
            <Moon size={20} />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-blue-400">غير غافل</h3>
            <p className="text-white/50 text-sm">10-99 آية</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Medal size={20} />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-emerald-400">قانت</h3>
            <p className="text-white/50 text-sm">100-999 آية</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400">
            <Trophy size={20} />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-purple-400">مقنطر</h3>
            <p className="text-white/50 text-sm">+1000 آية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepNotifications = ({ finish }: { finish: () => void }) => {
  const { updateState, language } = useQanet();
  const isAr = language === 'ar';

  const handleEnable = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          if (request.display !== 'granted') {
            toast.error(isAr ? "يرجى تفعيل التنبيهات من إعدادات الجهاز" : "Please enable notifications from device settings");
            return;
          }
        }
      } else if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          toast.error(isAr ? "تم رفض إذن التنبيهات" : "Notification permission denied");
          return;
        }
      }
      
      updateState({ notificationsEnabled: true });
      toast.success(isAr ? "تم تفعيل التنبيهات بنجاح" : "Notifications enabled successfully");
      finish();
    } catch (err) {
      console.error("Notification permission error:", err);
      toast.error(isAr ? "حدث خطأ أثناء تفعيل التنبيهات" : "Error enabling notifications");
    }
  };
  
  return (
    <div className="flex-1 flex flex-col justify-center gap-10">
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <Bell size={40} className="text-white" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold !text-white">حافظ على حماسك</h2>
        <p className="text-white/60 text-lg">تلقّ تذكيرات يومية لتسجيل قيام الليل</p>
      </div>
      
      <div className="space-y-4 mt-8">
        <button 
          onClick={handleEnable}
          className="w-full py-4 rounded-full bg-white text-[#0B132B] font-bold text-lg hover:bg-white/90 transition-all active:scale-95"
        >
          تفعيل الإشعارات
        </button>
        <button 
          onClick={() => { updateState({ notificationsEnabled: false }); finish(); }}
          className="w-full py-4 rounded-full bg-transparent text-white/50 font-medium text-lg hover:text-white transition-all"
        >
          تفعيل لاحقاً
        </button>
      </div>

      <div className="flex justify-center mt-auto pb-8">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === 5 ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
