import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Save, 
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Download
} from "lucide-react";
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";

const SettingsManager = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    globalNotifications: true,
    apiVersion: "1.2.0",
    supportEmail: "support@quraaniat.com",
    appDirectDownloadUrl: "",
    appPlayStoreUrl: ""
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "global"));
        if (snap.exists()) {
          setConfig(snap.data() as any);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), config);
      toast.success("تم حفظ إعدادات النظام");
    } catch (err) {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold font-naskh">إعدادات النظام</h1>
              <p className="text-xs text-muted-foreground">
                التحكم في الخصائص العامة للمنصة
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ الإعدادات
          </button>
        </header>

        <div className="space-y-6">
          {/* Access Control */}
          <section className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
            <h2 className="text-lg font-bold font-naskh flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              التحكم في الوصول
            </h2>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
              <div className="flex-1">
                <p className="font-bold text-sm">وضع الصيانة</p>
                <p className="text-[10px] text-muted-foreground">
                  عند تفعيله، لن يتمكن المستخدمون من استخدام التطبيق
                </p>
              </div>

              <button
                onClick={() =>
                  setConfig({
                    ...config,
                    maintenanceMode: !config.maintenanceMode,
                  })
                }
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  config.maintenanceMode
                    ? "bg-rose-500"
                    : "bg-muted-foreground/30"
                }`}
              >
                <motion.div
                  animate={{
                    x: config.maintenanceMode ? (isAr ? -24 : 24) : 0,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            {config.maintenanceMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-2"
              >
                <textarea
                  value={(config as any).maintenanceMessageAr || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maintenanceMessageAr: e.target.value,
                    } as any)
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-naskh"
                />
              </motion.div>
            )}
          </section>

          {/* Download Links */}
          <section className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
            <h2 className="text-lg font-bold font-naskh flex items-center gap-2">
              <Download className="w-5 h-5 text-accent" />
              روابط تحميل التطبيق
            </h2>

            <input
              type="url"
              value={config.appDirectDownloadUrl}
              onChange={(e) =>
                setConfig({
                  ...config,
                  appDirectDownloadUrl: e.target.value,
                })
              }
              className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm"
              placeholder="APK URL"
            />
          </section>

          {/* ✅ FIXED EMPTY SECTION */}
          <section className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
            <h2 className="text-lg font-bold">إعدادات إضافية</h2>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;