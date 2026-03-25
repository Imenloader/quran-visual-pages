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

import Index from "./pages/Index";
import JuzViewer from "./pages/JuzViewer";
import Install from "./pages/Install";
import Recitations from "./pages/Recitations";
import EmbedView from "./pages/EmbedView";
import Athkar from "./pages/Athkar";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import PrayerTimes from "./pages/PrayerTimes";
import HowToUse from "./pages/HowToUse";
import Tajweed from "./pages/Tajweed";
import NotFound from "./pages/NotFound";

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
