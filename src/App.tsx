import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, Suspense } from "react";
import NetworkStatus from "./components/NetworkStatus";
import BottomNav from "./components/BottomNav";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";

import Index from "./pages/Index";
import JuzViewer from "./pages/JuzViewer";
import Install from "./pages/Install";
import Recitations from "./pages/Recitations";
import EmbedView from "./pages/EmbedView";
import Athkar from "./pages/Athkar";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import PrayerTimes from "./pages/PrayerTimes";
import Hub from "./pages/Hub";
import Tasbih from "./pages/tools/Tasbih";
import QiblaFinder from "./pages/tools/QiblaFinder";
import NamesOfAllah from "./pages/tools/NamesOfAllah";
import ZakatCalculator from "./pages/tools/ZakatCalculator";
import PrayerTracker from "./pages/tools/PrayerTracker";
import KhatmaPlanner from "./pages/tools/KhatmaPlanner";
import HijriCalendar from "./pages/tools/HijriCalendar";
import DailyVerse from "./pages/tools/DailyVerse";
import MosqueFinder from "./pages/tools/MosqueFinder";
import HalalPlaces from "./pages/tools/HalalPlaces";
import Tafsir from "./pages/tools/Tafsir";
import Search from "./pages/tools/Search";
import Offline from "./pages/tools/Offline";
import FridaySunan from "./pages/tools/FridaySunan";
import Ramadan from "./pages/tools/Ramadan";
import HowToUse from "./pages/HowToUse";
import Tajweed from "./pages/Tajweed";
import NotFound from "./pages/NotFound";

import { useTranslation } from "react-i18next";
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useKhatmaNotifications } from "./hooks/useKhatmaNotifications";

import SplashScreen from "./components/SplashScreen";
import ScrollRestoration from "./components/ScrollRestoration";

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
    
    // Add language-specific class to body for font styling
    document.body.classList.remove("lang-ar", "lang-en");
    document.body.classList.add(`lang-${i18n.language}`);
  }, [i18n.language]);

  return null;
};

import { usePeriodicReminders } from "./hooks/usePeriodicReminders";

const App = () => {
  // Initialize Khatma Notifications
  useKhatmaNotifications();
  // Initialize Periodic Reminders
  usePeriodicReminders();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <SplashScreen />
          <TooltipProvider>
            <AudioPlayerProvider>
              <ServiceWorkerRegistration />
              <LanguageHandler />
              <NetworkStatus />
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
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
