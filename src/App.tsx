import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import NetworkStatus from "./components/NetworkStatus";
import BottomNav from "./components/BottomNav";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const Index = lazy(() => import("./pages/Index"));
const JuzViewer = lazy(() => import("./pages/JuzViewer"));
const Install = lazy(() => import("./pages/Install"));
const Recitations = lazy(() => import("./pages/Recitations"));
const EmbedView = lazy(() => import("./pages/EmbedView"));
const Athkar = lazy(() => import("./pages/Athkar"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Settings = lazy(() => import("./pages/Settings"));
const PrayerTimes = lazy(() => import("./pages/PrayerTimes"));
const HowToUse = lazy(() => import("./pages/HowToUse"));
const Tajweed = lazy(() => import("./pages/Tajweed"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AudioPlayerProvider>
            <NetworkStatus />
            <div className="page-dimming-overlay" />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/juz/:juzNumber" element={<JuzViewer />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/recitations" element={<Recitations />} />
                  <Route path="/athkar" element={<Athkar />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/prayer-times" element={<PrayerTimes />} />
                  <Route path="/how-to-use" element={<HowToUse />} />
                  <Route path="/tajweed" element={<Tajweed />} />
                  <Route path="/embed/:siteId" element={<EmbedView />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <GlobalAudioPlayer />
              <BottomNav />
            </BrowserRouter>
          </AudioPlayerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
