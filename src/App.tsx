import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import NetworkStatus from "./components/NetworkStatus";
import BottomNav from "./components/BottomNav";
import PageTransition from "./components/PageTransition";

// Lazy load all pages
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
    document.documentElement.classList.remove("dark", "sepia");
    if (saved === "dark" || saved === "sepia") {
      document.documentElement.classList.add(saved);
    }
  }, []);
  return null;
};

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />} key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/juz/:juzNumber" element={<PageTransition><JuzViewer /></PageTransition>} />
          <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
          <Route path="/recitations" element={<PageTransition><Recitations /></PageTransition>} />
          <Route path="/athkar" element={<PageTransition><Athkar /></PageTransition>} />
          <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/prayer-times" element={<PageTransition><PrayerTimes /></PageTransition>} />
          <Route path="/how-to-use" element={<PageTransition><HowToUse /></PageTransition>} />
          <Route path="/embed/:siteId" element={<PageTransition><EmbedView /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <NetworkStatus />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
