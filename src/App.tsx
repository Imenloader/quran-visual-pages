import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { getRedirectResult } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "sonner";
import NetworkStatus from "./components/NetworkStatus";
import BottomNav from "./components/BottomNav";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { AdhanProvider } from "./contexts/AdhanContext";

import { useTranslation } from "react-i18next";
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useKhatmaNotifications } from "./hooks/useKhatmaNotifications";
import { usePeriodicReminders } from "./hooks/usePeriodicReminders";
import { usePrayerNotifications } from "./hooks/usePrayerNotifications";
import { useGoalNotifications } from "./hooks/useGoalNotifications";
import { AudioUnlockBanner } from "./components/AudioUnlockBanner";
import SplashScreen from "./components/SplashScreen";
import ScrollRestoration from "./components/ScrollRestoration";

// --- التعديل الأساسي هنا ---
// تم تغيير تحميل الصفحات الأساسية ليكون بشكل عادي وليس Lazy لحل مشكلة الـ PWA Caching في الـ APK
import Index from "./pages/Index";
import JuzViewer from "./pages/JuzViewer";
// ----------------------------

// باقي الصفحات زي ما هي Lazy load مفيش مشكلة
const Install = lazy(() => import("./pages/Install"));
const Recitations = lazy(() => import("./pages/Recitations"));
const EmbedView = lazy(() => import("./pages/EmbedView"));
const Athkar = lazy(() => import("./pages/Athkar"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const PrayerTimes = lazy(() => import("./pages/PrayerTimes"));
const Hub = lazy(() => import("./pages/Hub"));
const Tasbih = lazy(() => import("./pages/tools/Tasbih"));
const QiblaFinder = lazy(() => import("./pages/tools/QiblaFinder"));
const NamesOfAllah = lazy(() => import("./pages/tools/NamesOfAllah"));
const ZakatCalculator = lazy(() => import("./pages/tools/ZakatCalculator"));
const PrayerTracker = lazy(() => import("./pages/tools/PrayerTracker"));
const KhatmaPlanner = lazy(() => import("./pages/tools/KhatmaPlanner"));
const HijriCalendar = lazy(() => import("./pages/tools/HijriCalendar"));
const DailyVerse = lazy(() => import("./pages/tools/DailyVerse"));
const MosqueFinder = lazy(() => import("./pages/tools/MosqueFinder"));
const HalalPlaces = lazy(() => import("./pages/tools/HalalPlaces"));
const Tafsir = lazy(() => import("./pages/tools/Tafsir"));
const Search = lazy(() => import("./pages/tools/Search"));
const Offline = lazy(() => import("./pages/tools/Offline"));
const FridaySunan = lazy(() => import("./pages/tools/FridaySunan"));
const Ramadan = lazy(() => import("./pages/tools/Ramadan"));
const Library = lazy(() => import("./pages/Library"));
const HajjGuide = lazy(() => import("./pages/HajjGuide"));
const ProphetStories = lazy(() => import("./pages/ProphetStories"));
const NamesDirectory = lazy(() => import("./pages/NamesDirectory"));
const DailyAdhkar = lazy(() => import("./pages/DailyAdhkar"));
const KhatmaJamaaiya = lazy(() => import("./pages/KhatmaJamaaiya"));
const Hadith = lazy(() => import("./pages/tools/Hadith"));
const SeerahTimeline = lazy(() => import("./pages/tools/SeerahTimeline"));
const IslamicQuiz = lazy(() => import("./pages/tools/IslamicQuiz"));
const InheritanceCalculator = lazy(() => import("./pages/tools/InheritanceCalculator"));
const FastingTracker = lazy(() => import("./pages/tools/FastingTracker"));
const RoutineBuilder = lazy(() => import("./pages/tools/RoutineBuilder"));
const SadaqahLogger = lazy(() => import("./pages/tools/SadaqahLogger"));
const DuaLibrary = lazy(() => import("./pages/tools/DuaLibrary"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const MoonTracker = lazy(() => import("./pages/tools/MoonTracker"));
const Virtues = lazy(() => import("./pages/ramadan/Virtues"));
const FastingRules = lazy(() => import("./pages/ramadan/FastingRules"));
const Duas = lazy(() => import("./pages/ramadan/Duas"));
const Tips = lazy(() => import("./pages/ramadan/Tips"));
const LaylatulQadr = lazy(() => import("./pages/ramadan/LaylatulQadr"));
const ZakatAlFitr = lazy(() => import("./pages/ramadan/ZakatAlFitr"));
const HowToUse = lazy(() => import("./pages/HowToUse"));
const Tajweed = lazy(() => import("./pages/Tajweed"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const ServiceWorkerRegistration = () => {
  useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW Registration error:', error);
    },
  });
  return null;
};

const LanguageHandler = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
    
    document.body.classList.remove("lang-ar", "lang-en");
    document.body.classList.add(`lang-${i18n.language}`);
  }, [i18n.language]);

  return null;
};

const NotificationInitializer = () => {
  useKhatmaNotifications();
  usePeriodicReminders();
  usePrayerNotifications();
  useGoalNotifications();
  return null;
};

const App = () => {
  useEffect(() => {
    // Handle redirect result on mount
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          toast.success(`مرحباً بك، ${result.user.displayName}`);
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
        if (error.code === "auth/unauthorized-domain") {
          toast.error("هذا النطاق غير مصرح به. يرجى إضافة localhost و النطاق الحالي إلى Firebase.");
        }
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <AdhanProvider>
            <TooltipProvider>
              <AudioPlayerProvider>
                <NotificationInitializer />
                <SplashScreen />
                <ServiceWorkerRegistration />
                <LanguageHandler />
                <NetworkStatus />
                <AudioUnlockBanner />
                <div className="page-dimming-overlay" />
                <Toaster />
                <Sonner />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <ScrollRestoration />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/juz/:juzNumber" element={<JuzViewer />} />
                      <Route path="/install" element={<Install />} />
                      <Route path="/recitations" element={<Recitations />} />
                      <Route path="/athkar" element={<Athkar />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/prayer-times" element={<PrayerTimes />} />
                      <Route path="/hub" element={<Hub />} />
                      <Route path="/tasbih" element={<Tasbih />} />
                      <Route path="/qibla" element={<QiblaFinder />} />
                      <Route path="/names-of-allah" element={<NamesOfAllah />} />
                      <Route path="/zakat" element={<ZakatCalculator />} />
                      <Route path="/prayer-tracker" element={<PrayerTracker />} />
                      <Route path="/khatma" element={<KhatmaPlanner />} />
                      <Route path="/hijri" element={<HijriCalendar />} />
                      <Route path="/daily-verse" element={<DailyVerse />} />
                      <Route path="/mosque-finder" element={<MosqueFinder />} />
                      <Route path="/halal-places" element={<HalalPlaces />} />
                      <Route path="/tafsir" element={<Tafsir />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/offline" element={<Offline />} />
                      <Route path="/friday-sunan" element={<FridaySunan />} />
                      <Route path="/ramadan" element={<Ramadan />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/hajj-guide" element={<HajjGuide />} />
                      <Route path="/prophet-stories" element={<ProphetStories />} />
                      <Route path="/names-directory" element={<NamesDirectory />} />
                      <Route path="/daily-adhkar" element={<DailyAdhkar />} />
                      <Route path="/khatma-jamaaiya" element={<KhatmaJamaaiya />} />
                      <Route path="/hadith" element={<Hadith />} />
                      <Route path="/seerah-timeline" element={<SeerahTimeline />} />
                      <Route path="/islamic-quiz" element={<IslamicQuiz />} />
                      <Route path="/inheritance-calculator" element={<InheritanceCalculator />} />
                      <Route path="/fasting-tracker" element={<FastingTracker />} />
                      <Route path="/routine-builder" element={<RoutineBuilder />} />
                      <Route path="/sadaqah-logger" element={<SadaqahLogger />} />
                      <Route path="/dua-library" element={<DuaLibrary />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/moon-tracker" element={<MoonTracker />} />
                      <Route path="/ramadan/virtues" element={<Virtues />} />
                      <Route path="/ramadan/fasting-rules" element={<FastingRules />} />
                      <Route path="/ramadan/duas" element={<Duas />} />
                      <Route path="/ramadan/tips" element={<Tips />} />
                      <Route path="/ramadan/laylatul-qadr" element={<LaylatulQadr />} />
                      <Route path="/ramadan/zakat-al-fitr" element={<ZakatAlFitr />} />
                      <Route path="/how-to-use" element={<HowToUse />} />
                      <Route path="/tajweed" element={<Tajweed />} />
                      <Route path="/embed/:siteId" element={<EmbedView />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <BottomNav />
                </BrowserRouter>
              </AudioPlayerProvider>
            </TooltipProvider>
          </AdhanProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
