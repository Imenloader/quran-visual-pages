import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, Shield, Settings, Home, ChevronUp, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isFullscreen } = useTheme();
  const [isHidden, setIsHidden] = useState(false);

  const NAV_ITEMS = [
    { path: "/settings", label: t("nav.settings"), icon: Settings },
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

  if (isFullscreen) return null;

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 flex flex-col items-center pointer-events-none">
      {/* Collapsing Toggle Button */}
      <div className="pointer-events-auto mb-[-1px]">
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
          className="w-12 h-7 rounded-t-2xl bg-card/95 backdrop-blur-xl border border-border/40 border-b-0 flex items-center justify-center text-muted-foreground hover:text-accent transition-all shadow-lg group"
          aria-label={isHidden ? t("nav.showMenu") : t("nav.hideMenu")}
        >
          <motion.div
            animate={{ rotate: isHidden ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ChevronUp size={18} className="group-hover:scale-110 transition-transform" />
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
            className="w-full max-w-xl px-6 pb-6 pointer-events-auto"
          >
            <div className="bg-card/95 backdrop-blur-2xl border border-border/40 rounded-[2.5rem] shadow-2xl p-2 flex items-center justify-around relative overflow-hidden">
              <div className="absolute inset-0 pattern-islamic opacity-[0.03] rounded-[2.5rem] overflow-hidden pointer-events-none" />
              
              {NAV_ITEMS.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                if (item.isCenter) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={triggerHaptic}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-islamic relative group z-20 ${
                        isActive 
                          ? "bg-accent text-accent-foreground scale-110 shadow-accent/20" 
                          : "bg-muted text-muted-foreground hover:text-accent hover:bg-muted/80"
                      }`}
                    >
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
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
                    onClick={triggerHaptic}
                    className="flex flex-col items-center py-2 px-1 min-w-[64px] group relative z-10"
                  >
                    <motion.div 
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-accent/15 text-accent shadow-sm"
                          : "text-muted-foreground group-hover:text-primary group-hover:bg-muted"
                      }`}
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </motion.div>
                    <span className={`font-serif text-[9px] mt-1.5 font-medium tracking-wider transition-colors ${
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
  );
};

export default BottomNav;
