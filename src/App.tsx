import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, Suspense } from "react";
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
import { OfflineProvider } from "./contexts/OfflineContext";

import { useTranslation } from "react-i18next";
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useKhatmaNotifications } from "./hooks/useKhatmaNotifications";
import { usePeriodicReminders } from "./hooks/usePeriodicReminders";
import { usePrayerNotifications } from "./hooks/usePrayerNotifications";
import { useGoalNotifications } from "./hooks/useGoalNotifications";
import { AudioUnlockBanner } from "./components/AudioUnlockBanner";
import SplashScreen from "./components/SplashScreen";
import ScrollRestoration from "./components/ScrollRestoration";
import CommandPalette from "./components/CommandPalette";
import AdminRoute from "./components/AdminRoute";
import { lazyWithRetry } from "./lib/lazyRetry";
import { checkNetworkReliability } from "./lib/networkCheck";

// --- التعديل هنا: تحميل الصفحات الأساسية بشكل LazyRetry لمحاولة حل مشكلة الـ ReferenceError و Chunk errors ---
const Index = lazyWithRetry(() => import("./pages/Index"));
const JuzViewer = lazyWithRetry(() => import("./pages/JuzViewer"));
// ------------------------------------------------------------------------------------------

// باقي الصفحات زي ما هي Lazy load مفيش مشكلة
const Install = lazyWithRetry(() => import("./pages/Install"));
const Recitations = lazyWithRetry(() => import("./pages/Recitations"));
const EmbedView = lazyWithRetry(() => import("./pages/EmbedView"));
const Athkar = lazyWithRetry(() => import("./pages/Athkar"));
const Favorites = lazyWithRetry(() => import("./pages/Favorites"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const PrayerTimes = lazyWithRetry(() => import("./pages/PrayerTimes"));
const Hub = lazyWithRetry(() => import("./pages/Hub"));
const Tasbih = lazyWithRetry(() => import("./pages/tools/Tasbih"));
const QiblaFinder = lazyWithRetry(() => import("./pages/tools/QiblaFinder"));
const NamesOfAllah = lazyWithRetry(() => import("./pages/tools/NamesOfAllah"));
const ZakatCalculator = lazyWithRetry(() => import("./pages/tools/ZakatCalculator"));
const PrayerTracker = lazyWithRetry(() => import("./pages/tools/PrayerTracker"));
const KhatmaPlanner = lazyWithRetry(() => import("./pages/tools/KhatmaPlanner"));
const HijriCalendar = lazyWithRetry(() => import("./pages/tools/HijriCalendar"));
const DailyVerse = lazyWithRetry(() => import("./pages/tools/DailyVerse"));
const MosqueFinder = lazyWithRetry(() => import("./pages/tools/MosqueFinder"));
const HalalPlaces = lazyWithRetry(() => import("./pages/tools/HalalPlaces"));
const Tafsir = lazyWithRetry(() => import("./pages/tools/Tafsir"));
const Search = lazyWithRetry(() => import("./pages/tools/Search"));
const Offline = lazyWithRetry(() => import("./pages/tools/Offline"));
const FridaySunan = lazyWithRetry(() => import("./pages/tools/FridaySunan"));
const Ramadan = lazyWithRetry(() => import("./pages/tools/Ramadan"));
const Library = lazyWithRetry(() => import("./pages/Library"));
const HajjGuide = lazyWithRetry(() => import("./pages/HajjGuide"));
const ProphetStories = lazyWithRetry(() => import("./pages/ProphetStories"));
const NamesDirectory = lazyWithRetry(() => import("./pages/NamesDirectory"));
const DailyAdhkar = lazyWithRetry(() => import("./pages/DailyAdhkar"));
const KhatmaJamaaiya = lazyWithRetry(() => import("./pages/KhatmaJamaaiya"));
const Hadith = lazyWithRetry(() => import("./pages/tools/Hadith"));
const SeerahTimeline = lazyWithRetry(() => import("./pages/tools/SeerahTimeline"));
const IslamicQuiz = lazyWithRetry(() => import("./pages/tools/IslamicQuiz"));
const InheritanceCalculator = lazyWithRetry(() => import("./pages/tools/InheritanceCalculator"));
const FastingTracker = lazyWithRetry(() => import("./pages/tools/FastingTracker"));
const RoutineBuilder = lazyWithRetry(() => import("./pages/tools/RoutineBuilder"));
const SadaqahLogger = lazyWithRetry(() => import("./pages/tools/SadaqahLogger"));
const DuaLibrary = lazyWithRetry(() => import("./pages/tools/DuaLibrary"));
const GlobalDhikr = lazyWithRetry(() => import("./pages/tools/GlobalDhikr"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const MoonTracker = lazyWithRetry(() => import("./pages/tools/MoonTracker"));
const Memorization = lazyWithRetry(() => import("./pages/tools/Memorization"));
const Leaderboard = lazyWithRetry(() => import("./pages/tools/Leaderboard"));
const AthkarCircles = lazyWithRetry(() => import("./pages/tools/AthkarCircles"));
const Virtues = lazyWithRetry(() => import("./pages/ramadan/Virtues"));
const FastingRules = lazyWithRetry(() => import("./pages/ramadan/FastingRules"));
const Duas = lazyWithRetry(() => import("./pages/ramadan/Duas"));
const Tips = lazyWithRetry(() => import("./pages/ramadan/Tips"));
const LaylatulQadr = lazyWithRetry(() => import("./pages/ramadan/LaylatulQadr"));
const ZakatAlFitr = lazyWithRetry(() => import("./pages/ramadan/ZakatAlFitr"));
const HowToUse = lazyWithRetry(() => import("./pages/HowToUse"));
const Tajweed = lazyWithRetry(() => import("./pages/Tajweed"));
const HifzTester = lazyWithRetry(() => import("./pages/tools/HifzTester"));
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"));
const SettingsManager = lazyWithRetry(() => import("./pages/admin/SettingsManager"));
const DuaManager = lazyWithRetry(() => import("./pages/admin/DuaManager"));
const AthkarManager = lazyWithRetry(() => import("./pages/admin/AthkarManager"));
const HubManager = lazyWithRetry(() => import("./pages/admin/HubManager"));
const QuizManager = lazyWithRetry(() => import("./pages/admin/QuizManager"));
const NamesOfAllahManager = lazyWithRetry(() => import("./pages/admin/NamesOfAllahManager"));
const ProphetStoriesManager = lazyWithRetry(() => import("./pages/admin/ProphetStoriesManager"));
const KhatmaModeration = lazyWithRetry(() => import("./pages/admin/KhatmaModeration"));
const GlobalDhikrManager = lazyWithRetry(() => import("./pages/admin/GlobalDhikrManager"));
const RamadanManager = lazyWithRetry(() => import("./pages/admin/RamadanManager"));
const ZakatSettingsManager = lazyWithRetry(() => import("./pages/admin/ZakatSettingsManager"));
const FridaySunanManager = lazyWithRetry(() => import("./pages/admin/FridaySunanManager"));
const HadithManager = lazyWithRetry(() => import("./pages/admin/HadithManager"));
const SeerahManager = lazyWithRetry(() => import("./pages/admin/SeerahManager"));
const UserManagement = lazyWithRetry(() => import("./pages/admin/UserManagement"));
const RoutineManager = lazyWithRetry(() => import("./pages/admin/RoutineManager"));
const LibraryManager = lazyWithRetry(() => import("./pages/admin/LibraryManager"));
const AnalyticsPage = lazyWithRetry(() => import("./pages/admin/AnalyticsPage"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

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
    // Initialize Google Auth once on mount (for Native)
    const initGoogleAuth = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
          GoogleAuth.initialize({
            clientId: "130128331336-jsf2phje1obt9ln0lj5f5nlfsgl6rssn.apps.googleusercontent.com",
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
        }
      } catch (e) {
        console.warn("Google Auth initialization skipped or failed:", e);
      }
    };
    initGoogleAuth();

    // Check clock and network reliability
    const checkEnvironment = async () => {
      const reliability = await checkNetworkReliability();
      if (!reliability.ok) {
        if (reliability.reason === "certificate_or_network") {
          console.warn("SSL/Network reliability issue detected:", reliability.details);
        }
      }
    };
    checkEnvironment();

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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
          <UserProvider>
            <AdhanProvider>
              <OfflineProvider>
                <TooltipProvider>
                  <AudioPlayerProvider>
                    <NotificationInitializer />
                    <SplashScreen />
                    <ServiceWorkerRegistration />
                    <LanguageHandler />
                    <NetworkStatus />
                    <AudioUnlockBanner />
                    <CommandPalette />
                    <div className="page-dimming-overlay" />
                    <Toaster />
                    <Sonner />
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
                        <Route path="/global-dhikr" element={<GlobalDhikr />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/moon-tracker" element={<MoonTracker />} />
                        <Route path="/memorization" element={<Memorization />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/athkar-circles" element={<AthkarCircles />} />
                        <Route path="/ramadan/virtues" element={<Virtues />} />
                        <Route path="/ramadan/fasting-rules" element={<FastingRules />} />
                        <Route path="/ramadan/duas" element={<Duas />} />
                        <Route path="/ramadan/tips" element={<Tips />} />
                        <Route path="/ramadan/laylatul-qadr" element={<LaylatulQadr />} />
                        <Route path="/ramadan/zakat-al-fitr" element={<ZakatAlFitr />} />
                        <Route path="/how-to-use" element={<HowToUse />} />
                        <Route path="/tajweed" element={<Tajweed />} />
                        <Route path="/tools/hifz-tester" element={<HifzTester />} />
                        <Route path="/embed/:siteId" element={<EmbedView />} />
                        
                        {/* Admin Routes */}
                        <Route element={<AdminRoute />}>
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/admin/settings" element={<SettingsManager />} />
                          <Route path="/admin/content" element={<DuaManager />} />
                          <Route path="/admin/athkar" element={<AthkarManager />} />
                          <Route path="/admin/hub" element={<HubManager />} />
                          <Route path="/admin/quiz" element={<QuizManager />} />
                          <Route path="/admin/names" element={<NamesOfAllahManager />} />
                          <Route path="/admin/stories" element={<ProphetStoriesManager />} />
                          <Route path="/admin/khatmas" element={<KhatmaModeration />} />
                          <Route path="/admin/dhikr" element={<GlobalDhikrManager />} />
                          <Route path="/admin/ramadan" element={<RamadanManager />} />
                          <Route path="/admin/zakat" element={<ZakatSettingsManager />} />
                          <Route path="/admin/sunan" element={<FridaySunanManager />} />
                          <Route path="/admin/hadith" element={<HadithManager />} />
                          <Route path="/admin/seerah" element={<SeerahManager />} />
                          <Route path="/admin/users" element={<UserManagement />} />
                          <Route path="/admin/routine" element={<RoutineManager />} />
                          <Route path="/admin/library" element={<LibraryManager />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
                          {/* Future admin modules will be added here */}
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    <BottomNav />
                  </AudioPlayerProvider>
                </TooltipProvider>
              </OfflineProvider>
            </AdhanProvider>
          </UserProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
