import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Fingerprint, ChevronLeft, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CIRCUMFERENCE = 2 * Math.PI * 120;

const Tasbih = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem("tasbih_count");
    return saved ? parseInt(saved) : 0;
  });
  const [target, setTarget] = useState(33);
  const [total, setTotal] = useState(() => {
    const saved = localStorage.getItem("tasbih_total");
    return saved ? parseInt(saved) : 0;
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem("tasbih_count", count.toString());
    localStorage.setItem("tasbih_total", total.toString());
  }, [count, total]);

  const triggerHaptic = useCallback(() => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  }, []);

  const handleIncrement = () => {
    setCount(prev => {
      const next = prev + 1;
      if (next === target) {
        if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);
      }
      return next;
    });
    setTotal(prev => prev + 1);
    triggerHaptic();
  };

  const handleReset = () => {
    setCount(0);
    triggerHaptic();
    setShowResetConfirm(false);
  };

  const handleSetTarget = (newTarget: number) => {
    setTarget(newTarget);
    setCount(0);
    setShowSettings(false);
    triggerHaptic();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between py-12 px-6">
      <header className="w-full flex items-center justify-between max-w-md">
        <button 
          onClick={() => navigate("/hub")}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
        >
          <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
        </button>
        <h1 className="text-xl font-bold font-naskh">{t("hub.tasbih")}</h1>
        <button 
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted/20"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - (count % target) / target) }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="text-emerald-deep"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold font-mono text-foreground"
              >
                {count}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-muted-foreground font-naskh mt-2">{t("tasbih.target")}: {target}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground font-naskh">{t("tasbih.total")}</p>
          <p className="text-2xl font-bold font-mono text-foreground">{total}</p>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          className="w-32 h-32 rounded-full bg-emerald-deep text-white shadow-islamic flex items-center justify-center active:bg-emerald-700 transition-colors"
        >
          <Fingerprint className="w-16 h-16" />
        </motion.button>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors font-naskh"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t("tasbih.reset")}</span>
        </button>
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("tasbih.reset")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("tasbih.confirmReset")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.themes.light") === "Light" ? "Cancel" : "إلغاء"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("tasbih.reset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSettings} onOpenChange={setShowSettings}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("tasbih.target")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.themes.light") === "Light" ? "Select your target count" : "اختر العدد المستهدف للتسبيح"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {[33, 99, 100, 1000, 5000, 10000].map(val => (
              <button
                key={val}
                onClick={() => handleSetTarget(val)}
                className={`py-3 rounded-xl border font-bold transition-all ${
                  target === val 
                    ? "bg-emerald-deep text-white border-emerald-deep" 
                    : "bg-muted border-border text-foreground hover:border-emerald-deep/50"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.themes.light") === "Light" ? "Close" : "إغلاق"}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasbih;
