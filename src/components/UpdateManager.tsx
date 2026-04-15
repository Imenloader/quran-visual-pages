import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, Download, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from "sonner";
import { motion } from "motion/react";
import { toArabicNumber } from "@/data/quranData";

const UpdateManager: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW Registration error:', error);
    },
  });

  const checkUpdates = async () => {
    if (!navigator.serviceWorker) return;
    
    setIsChecking(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        setLastCheck(new Date());
        
        // If no update found after a short delay, inform the user
        setTimeout(() => {
          if (!needRefresh) {
            toast.info(t("settings.update.upToDate") || "التطبيق محدث بالفعل");
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Update check failed:", error);
      toast.error(t("settings.update.checkFailed") || "فشل التحقق من التحديثات");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (needRefresh) {
      toast.info(t("settings.update.available") || "يتوفر تحديث جديد!", {
        action: {
          label: t("settings.update.install") || "تثبيت الآن",
          onClick: () => updateServiceWorker(true),
        },
        duration: 10000,
      });
    }
  }, [needRefresh, updateServiceWorker, t]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Info size={20} />
            </div>
            <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h4 className="font-serif font-bold text-primary text-sm">{t("settings.update.version") || "إصدار التطبيق"}</h4>
              <p className="text-[10px] text-primary/60 font-mono">v1.2.5-stable</p>
            </div>
          </div>
          
          {needRefresh && (
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">
              {t("settings.update.newAvailable") || "تحديث متاح"}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={checkUpdates}
            disabled={isChecking}
            className="w-full h-12 rounded-xl bg-emerald-deep text-gold font-serif font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-deep/20 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isChecking ? "animate-spin" : ""} />
            {isChecking ? (t("settings.update.checking") || "جاري التحقق...") : (t("settings.update.check") || "التحقق من وجود تحديثات")}
          </motion.button>

          {needRefresh && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateServiceWorker(true)}
              className="w-full h-12 rounded-xl bg-gold text-emerald-deep font-serif font-bold flex items-center justify-center gap-3 shadow-lg shadow-gold/20"
            >
              <Download size={18} />
              {t("settings.update.installNow") || "تثبيت التحديث الجديد"}
            </motion.button>
          )}
        </div>

        {lastCheck && (
          <p className="text-[9px] text-center text-primary/40 font-serif italic">
            {t("settings.update.lastCheck") || "آخر فحص"}: {lastCheck.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 flex items-start gap-3">
        <AlertCircle size={18} className="text-gold shrink-0 mt-0.5" />
        <p className={`text-[11px] text-primary/80 font-serif leading-relaxed italic ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
          {t("settings.update.info") || "يتم تحديث التطبيق تلقائياً عند توفر اتصال بالإنترنت. يمكنك التحقق يدوياً من هنا للتأكد من حصولك على أحدث الميزات والإصلاحات."}
        </p>
      </div>
    </div>
  );
};

export default UpdateManager;
