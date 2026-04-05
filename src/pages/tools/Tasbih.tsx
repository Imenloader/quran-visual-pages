import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Fingerprint, Settings2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";

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
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem("tasbih_count", count.toString());
    localStorage.setItem("tasbih_total", total.toString());
  }, [count, total]);

  const triggerHaptic = useCallback((pattern: number | number[] = 20) => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  }, []);

  const handleIncrement = () => {
    setCount(prev => {
      const next = prev + 1;
      if (next >= target) {
        triggerHaptic([50, 30, 50]);
        return 0;
      }
      return next;
    });
    setTotal(prev => prev + 1);
    triggerHaptic(30);
  };

  const handleReset = () => {
    setCount(0);
    triggerHaptic(50);
  };

  const handleResetTotal = () => {
    setTotal(0);
    setCount(0);
    localStorage.setItem("tasbih_total", "0");
    localStorage.setItem("tasbih_count", "0");
    setShowSettings(false);
    triggerHaptic([100, 50, 100]);
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center overflow-y-auto overflow-x-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-background to-background" />
        <div className="absolute top-0 left-0 w-full h-full pattern-islamic opacity-[0.02] scale-150" />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.15, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" 
        />
      </div>

      <header className="relative z-10 w-full flex items-center justify-between max-w-md px-6 py-8">
        <BackButton variant="outline" />
        <h1 className="text-2xl font-bold font-naskh text-foreground tracking-tight">{t("hub.tasbih")}</h1>
        <button 
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-2xl bg-card/50 backdrop-blur-md border border-border/40 flex items-center justify-center text-foreground shadow-sm hover:bg-card transition-all"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md px-4 sm:px-6 gap-4 sm:gap-8 py-4">
        {/* Progress Ring */}
        <div className="relative w-[60vw] max-w-[240px] aspect-square flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 288 288">
            <circle
              cx="144"
              cy="144"
              r="130"
              className="stroke-muted/20 fill-none"
              strokeWidth="12"
            />
            <motion.circle
              cx="144"
              cy="144"
              r="130"
              className="stroke-gold fill-none"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ strokeDasharray: "816.8", strokeDashoffset: "816.8" }}
              animate={{ strokeDashoffset: 816.8 - (816.8 * count) / target }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </svg>

          <div className="text-center space-y-1">
            <motion.span 
              key={count}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl sm:text-8xl font-bold font-mono text-foreground block"
            >
              {count}
            </motion.span>
            <span className="text-lg sm:text-xl font-medium text-muted-foreground font-naskh opacity-60">
              / {target}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          <div className="p-4 sm:p-6 bg-card/50 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2rem] border border-border/40 text-center shadow-sm">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-naskh mb-1 opacity-70">{t("tasbih.total")}</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-gold">{total}</p>
          </div>
          <button 
            onClick={handleReset}
            className="p-4 sm:p-6 bg-card/50 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2rem] border border-border/40 text-center shadow-sm hover:bg-card transition-all group"
          >
            <p className="text-[10px] sm:text-xs text-muted-foreground font-naskh mb-1 opacity-70">{t("tasbih.reset")}</p>
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-foreground mx-auto group-active:rotate-[-180deg] transition-transform duration-500" />
          </button>
        </div>

        {/* Main Button */}
        <button
          onClick={handleIncrement}
          className="w-[70vw] max-w-[240px] aspect-square rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-[8px] sm:border-[12px] border-card shadow-islamic flex items-center justify-center relative group active:scale-95 transition-all duration-200"
        >
          <div className="absolute inset-2 sm:inset-4 rounded-full border border-gold/20" />
          <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-active:scale-110 transition-transform">
              <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-gold" />
            </div>
            <span className="text-sm sm:text-lg font-bold font-naskh text-foreground tracking-wide">اضغط للتسبيح</span>
          </div>
        </button>
      </div>

      {/* Settings Dialog */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-[3rem] p-8 z-50 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8" />
              <h2 className="text-2xl font-bold font-naskh mb-8 text-center">{t("tasbih.target")}</h2>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-sm font-medium font-naskh px-2">اختر العدد المستهدف</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[33, 99, 100, 1000, 5000, 10000].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setTarget(val);
                          setCount(0);
                        }}
                        className={`py-4 rounded-2xl border transition-all font-mono font-bold ${
                          target === val 
                            ? "bg-gold border-gold text-white shadow-lg shadow-gold/20" 
                            : "bg-muted/50 border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleResetTotal}
                  className="w-full py-5 rounded-[1.5rem] bg-destructive/10 text-destructive font-bold font-naskh hover:bg-destructive/20 transition-all flex items-center justify-center gap-3"
                >
                  <RotateCcw className="w-5 h-5" />
                  تصفير العداد الإجمالي
                </button>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-primary text-primary-foreground font-bold font-naskh shadow-lg shadow-primary/20"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="relative z-10 w-full max-w-md p-6 pb-12">
        <p className="text-center text-xs text-muted-foreground font-naskh opacity-60">
          سيتم اهتزاز الهاتف عند كل تسبيحة وعند الوصول للهدف
        </p>
      </footer>
    </div>
  );
};

export default Tasbih;
