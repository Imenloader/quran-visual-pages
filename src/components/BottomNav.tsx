import { useState, useCallback, memo, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, Shield, User, Home, ChevronUp, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { useSystem } from "@/contexts/SystemContext";

import GlobalAudioPlayer from "./GlobalAudioPlayer";

// Pre-load components for smoother navigation
const preloadPage = (path: string) => {
  switch (path) {
    case "/": import("../pages/Index"); break;
    case "/prayer-times": import("../pages/PrayerTimes"); break;
    case "/athkar": import("../pages/Athkar"); break;
    case "/hub": import("../pages/Hub"); break;
    case "/profile": import("../pages/Profile"); break;
  }
};

const BottomNav = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isFullscreen } = useTheme();
  const { profile, isAdmin } = useUser();
  const { settings, loading: systemLoading } = useSystem();
  const [isHidden, setIsHidden] = useState(false);
  const [isAudioVisible, setIsAudioVisible] = useState(true);
  const lastScrollY = useRef(0);
  // Ignore very small scroll changes to prevent flicker/jitter.
  const SCROLL_DELTA_TOLERANCE = 8;
  // Wait until user has moved away from top content before auto-hiding player.
  const SCROLL_HIDE_START = 80;

  const NAV_ITEMS = [
    { 
      path: "/profile", 
      label: t("nav.profile") === "nav.profile" ? (i18n.language === 'ar' ? "الملف" : "Profile") : t("nav.profile"), 
      icon: User, 
      isProfile: true 
    },
    { path: "/prayer-times", label: t("nav.prayer"), icon: Clock },
    { path: "/", label: t("nav.home"), icon: Home, isCenter: true },
    { path: "/athkar", label: t("nav.athkar"), icon: Shield },
    { path: "/hub", label: t("nav.hub"), icon: LayoutGrid },
  ];

  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  }, []);

  const handleNavClick = (path: string) => {
    triggerHaptic();
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    lastScrollY.current = window.scrollY;
    setIsAudioVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (Math.abs(delta) < SCROLL_DELTA_TOLERANCE) {
        lastScrollY.current = currentY;
        return;
      }

      // Keep the player visible near top so header/intro remains uncluttered.
      if (currentY < SCROLL_HIDE_START) {
        setIsAudioVisible(true);
      } else if (delta > 0) {
        // Scrolling down: slide player out of view.
        setIsAudioVisible(false);
      } else {
        // Scrolling up: bring player back into view.
        setIsAudioVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isFullscreen) return null;
  
  // Hide in maintenance mode for non-admins
  if (settings.maintenanceMode && !isAdmin && !systemLoading) return null;

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 flex flex-col items-center pointer-events-none pb-4 md:pb-6">
      <div className="relative w-full max-w-xl flex flex-col items-center">
        {/* Collapsing Toggle Button */}
        <div className="pointer-events-auto mb-1 relative z-[120]">
          <motion.button
          initial={false}
          animate={{ 
            y: isHidden ? 0 : 0,
            opacity: 1
          }}
          onClick={() => {
            setIsHidden(!isHidden);
            triggerHaptic();
          }}
          className="w-12 h-7 rounded-t-2xl bg-card/95 backdrop-blur-xl border border-border/60 border-b-0 flex items-center justify-center text-primary hover:text-accent transition-all shadow-xl shadow-black/10 group"
          aria-label={isHidden ? t("nav.showMenu") : t("nav.hideMenu")}
        >
          <motion.div
            animate={{ rotate: isHidden ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ChevronUp size={18} className="group-hover:scale-110 transition-transform drop-shadow-sm" />
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {!isHidden && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-xl px-4 md:px-6 pb-4 md:pb-6 pointer-events-auto relative z-[100]"
          >
            <div className="bg-card/95 backdrop-blur-2xl border border-border/40 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-1.5 md:p-2 flex items-center justify-around relative overflow-hidden">
              <div className="absolute inset-0 pattern-islamic opacity-[0.03] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden pointer-events-none" />
              
              {NAV_ITEMS.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                if (item.isCenter) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onMouseEnter={() => preloadPage(item.path)}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-islamic relative group z-20 ${
                        isActive 
                          ? "bg-accent text-accent-foreground scale-110 shadow-accent/20" 
                          : "bg-muted text-muted-foreground hover:text-accent hover:bg-muted/80"
                      }`}
                    >
                      <Icon className="size-[20px] md:size-[24px]" strokeWidth={isActive ? 2.5 : 2} />
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator-home"
                          className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-accent-foreground"
                        />
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onMouseEnter={() => preloadPage(item.path)}
                    onClick={() => handleNavClick(item.path)}
                    className="flex flex-col items-center py-1.5 md:py-2 px-0.5 md:px-1 min-w-[56px] md:min-w-[64px] group relative z-10"
                  >
                    <motion.div 
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 overflow-hidden ${
                        isActive
                          ? "bg-accent/15 text-accent shadow-sm"
                          : "text-muted-foreground group-hover:text-primary group-hover:bg-muted"
                      }`}
                    >
                      {item.isProfile && profile.avatar ? (
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="size-[18px] md:size-[20px]" strokeWidth={1.5} />
                      )}
                    </motion.div>
                    <span className={`font-serif text-[8px] md:text-[9px] mt-1 md:mt-1.5 font-medium tracking-wider transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent shadow-gold-glow" 
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      </div>

      {/* Global Audio Player integrated with Nav Bar */}
      {!location.pathname.startsWith("/juz/") && (
        <div className="pointer-events-auto z-[150]">
          <GlobalAudioPlayer
            isVisible={isAudioVisible && !isHidden}
            // Keep center-x aligned with collapse/expand arrow center across breakpoints.
            // Bottom offset tuned so compact player stacks immediately above the chevron toggle.
            containerClassName="left-1/2 right-auto -translate-x-1/2 px-0 bottom-[4.2rem] md:bottom-[4.85rem]"
          />
        </div>
      )}
    </div>
  );
};

export default memo(BottomNav);
