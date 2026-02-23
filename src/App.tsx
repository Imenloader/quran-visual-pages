import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import NetworkStatus from "./components/NetworkStatus";
import BottomNav from "./components/BottomNav";

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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const ThemeInit = () => {
  useEffect(() => {
    const saved = localStorage.getItem("quran-theme");
    document.documentElement.classList.remove("dark", "sepia", "night-reading");
    if (saved === "dark" || saved === "night") {
      document.documentElement.classList.add("dark");
      // Migrate old "night" to "dark"
      if (saved === "night") localStorage.setItem("quran-theme", "dark");
      const dimming = localStorage.getItem("quran-page-dimming") || "80";
      document.documentElement.style.setProperty("--page-brightness", `${parseInt(dimming) / 100}`);
    } else if (saved === "sepia") {
      document.documentElement.classList.add("sepia");
    }
  }, []);
  return null;
};

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <NetworkStatus />
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
            <Route path="/embed/:siteId" element={<EmbedView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
