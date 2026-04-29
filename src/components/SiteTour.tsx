import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS, ACTIONS, EVENTS } from "react-joyride";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const TOUR_STORAGE_KEY = "quraaniat-tour-completed";

export const SiteTour = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const isCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!isCompleted && location.pathname === "/") {
      setRun(true);
    }
  }, [location.pathname]);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-serif font-bold text-primary">
            {i18n.language === "ar" ? "أهلاً بك في قرآنيات" : "Welcome to Quraaniat"}
          </h3>
          <p className="text-sm font-naskh leading-relaxed text-muted-foreground">
            {i18n.language === "ar" 
              ? "دعنا نأخذك في جولة سريعة لاكتشاف كافة مميزات المنصة." 
              : "Let's take a quick tour to discover all the platform's features."}
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#tour-search",
      content: i18n.language === "ar" 
        ? "ابحث عن السور، الأجزاء، أو الآيات بسرعة فائقة." 
        : "Search for Surahs, Juz, or Ayahs with lightning speed.",
      title: i18n.language === "ar" ? "البحث الذكي" : "Smart Search",
    },
    {
      target: "#tour-start",
      content: i18n.language === "ar" 
        ? "هنا تجد فهرس القرآن الكريم لبدء القراءة أو المتابعة من حيث توقفت." 
        : "Here you'll find the Quran index to start reading or resume where you left off.",
      title: i18n.language === "ar" ? "المصحف الشريف" : "Holy Quran",
    },
    {
      target: "#tour-prayer",
      content: i18n.language === "ar" 
        ? "مواقيت دقيقة، اتجاه القبلة، وتنبيهات الأذان حسب موقعك." 
        : "Accurate timings, Qibla direction, and Athan alerts based on your location.",
      title: i18n.language === "ar" ? "المواقيت والقبلة" : "Timings & Qibla",
    },
    {
      target: "#tour-athkar",
      content: i18n.language === "ar" 
        ? "مجموعة متكاملة من الأذكار النبوية اليومية مع عداد إلكتروني." 
        : "A complete collection of daily prophetic Athkar with an electronic counter.",
      title: i18n.language === "ar" ? "الأذكار والتحصين" : "Athkar & Protection",
    },
    {
      target: "#tour-hub",
      content: i18n.language === "ar" 
        ? "انتقل إلى مركز الأدوات لاستكشاف مكتبة القصص، موسوعة الصحابة، دليل الصلاة والمزيد." 
        : "Go to the Tools Hub to explore the Stories Library, Sahaba Encyclopedia, Salah Guide, and more.",
      title: i18n.language === "ar" ? "مركز الأدوات الإسلامية" : "Islamic Tools Hub",
    },
    {
      target: "#tour-tool-sahaba",
      content: i18n.language === "ar" 
        ? "استكشف سير الصحابة الكرام، المهاجرين، والأنصار في هذه الموسوعة الشاملة." 
        : "Explore the biographies of the honorable Sahaba, Muhajirun, and Ansar in this comprehensive encyclopedia.",
      title: i18n.language === "ar" ? "موسوعة الصحابة" : "Sahaba Encyclopedia",
    },
    {
      target: "#tour-profile",
      content: i18n.language === "ar" 
        ? "أهم خطوة: قم بتسجيل الدخول من هنا لحفظ تقدمك ونقاطك الروحية ومزامنتها عبر أجهزتك." 
        : "Most important: Sign in from here to save your progress and spiritual points and sync them across devices.",
      title: i18n.language === "ar" ? "حسابك الشخصي" : "Your Account",
    },
    {
      target: "body",
      content: (
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-xl font-serif font-bold text-primary">
            {i18n.language === "ar" ? "جاهز للانطلاق!" : "Ready to Go!"}
          </h3>
          <p className="text-sm font-naskh leading-relaxed text-muted-foreground">
            {i18n.language === "ar" 
              ? "استمتع بتجربة إيمانية فريدة. يمكنك دائماً إعادة الجولة من الإعدادات." 
              : "Enjoy a unique spiritual experience. You can always replay the tour from settings."}
          </p>
        </div>
      ),
      placement: "center",
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action, index } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      if (status === STATUS.FINISHED) {
        toast.success(i18n.language === "ar" ? "انتهت الجولة، استمتع بالتطبيق!" : "Tour completed, enjoy the app!");
      }
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      // Auto-navigate to Hub for the Sahaba step
      if (steps[nextIndex]?.target === "#tour-tool-sahaba" && location.pathname !== "/hub") {
        navigate("/hub");
        // Wait for navigation
        setTimeout(() => setStepIndex(nextIndex), 500);
        return;
      }

      // Auto-navigate back to home or profile if needed
      if (steps[nextIndex]?.target === "#tour-profile" && location.pathname !== "/profile") {
        // We can stay on current page as profile is in bottom nav, but let's navigate to profile to show sign in
        navigate("/profile");
        setTimeout(() => setStepIndex(nextIndex), 500);
        return;
      }

      if (action === ACTIONS.NEXT) {
        setStepIndex(index + 1);
      } else if (action === ACTIONS.PREV) {
        setStepIndex(index - 1);
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      callback={handleJoyrideCallback}
      locale={{
        back: i18n.language === "ar" ? "السابق" : "Back",
        close: i18n.language === "ar" ? "إغلاق" : "Close",
        last: i18n.language === "ar" ? "فهمت" : "Got it",
        next: i18n.language === "ar" ? "التالي" : "Next",
        skip: i18n.language === "ar" ? "تخطي الجولة" : "Skip Tour",
      }}
      styles={{
        options: {
          primaryColor: "var(--accent)",
          backgroundColor: theme === "dark" || theme === "amoled" ? "#1a1a1a" : "#fff",
          textColor: theme === "dark" || theme === "amoled" ? "#fff" : "#333",
          arrowColor: theme === "dark" || theme === "amoled" ? "#1a1a1a" : "#fff",
          overlayColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: i18n.language === "ar" ? "right" : "left",
          borderRadius: "1.5rem",
          padding: "1rem",
        },
        buttonNext: {
          backgroundColor: "var(--accent)",
          color: "white",
          borderRadius: "0.75rem",
          fontWeight: "bold",
          padding: "0.5rem 1rem",
        },
        buttonBack: {
          color: "var(--primary)",
          fontWeight: "bold",
        },
        buttonSkip: {
          color: "var(--muted-foreground)",
          fontSize: "0.8rem",
        },
      }}
    />
  );
};
