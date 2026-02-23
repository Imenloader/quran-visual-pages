import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import JuzViewer from "./pages/JuzViewer";
import Install from "./pages/Install";
import Recitations from "./pages/Recitations";
import EmbedView from "./pages/EmbedView";
import Athkar from "./pages/Athkar";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import HowToUse from "./pages/HowToUse";
import NotFound from "./pages/NotFound";
import NetworkStatus from "./components/NetworkStatus";
import BottomNav from "./components/BottomNav";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <NetworkStatus />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/juz/:juzNumber" element={<JuzViewer />} />
          <Route path="/install" element={<Install />} />
          <Route path="/recitations" element={<Recitations />} />
          <Route path="/athkar" element={<Athkar />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/embed/:siteId" element={<EmbedView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
