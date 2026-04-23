import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  Megaphone, 
  Power,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

interface AppSettings {
  maintenanceMode: boolean;
  announcement: {
    enabled: boolean;
    textAr: string;
    textEn: string;
    type: "info" | "warning" | "success";
  };
  features: {
    aiAdvisor: boolean;
    leaderboard: boolean;
    socialKhatma: boolean;
  };
}

const SettingsManager = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as AppSettings);
      } else {
        // Initialize default settings if not exists
        const defaults: AppSettings = {
          maintenanceMode: false,
          announcement: {
            enabled: false,
            textAr: "",
            textEn: "",
            type: "info"
          },
          features: {
            aiAdvisor: true,
            leaderboard: true,
            socialKhatma: true
          }
        };
        setDoc(doc(db, "settings", "global"), defaults);
        setSettings(defaults);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "global"), settings);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      toast.error("فشل في حفظ الإعدادات");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl font-bold font-naskh">إعدادات النظام</h1>
              <p className="text-[10px] text-muted-foreground">التحكم في وظائف التطبيق الكلية</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
        </header>

        <div className="space-y-6">
          {/* Critical Actions */}
          <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-4 h-4" />
              منطقة الخطر
            </h2>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
              <div>
                <p className="text-sm font-bold font-naskh">وضع الصيانة</p>
                <p className="text-[10px] text-muted-foreground">إغلاق التطبيق مؤقتاً لجميع المستخدمين</p>
              </div>
              <button
                onClick={() => setSettings(s => s ? { ...s, maintenanceMode: !s.maintenanceMode } : null)}
                className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${
                  settings?.maintenanceMode ? "bg-destructive justify-end" : "bg-muted justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </section>

          {/* Announcements */}
          <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-accent" />
              الإعلانات والتنبيهات
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">تفعيل الإعلان العالمي</span>
                <button
                  onClick={() => setSettings(s => s ? { ...s, announcement: { ...s.announcement, enabled: !s.announcement.enabled } } : null)}
                  className={`w-10 h-5 rounded-full transition-all flex items-center px-1 ${
                    settings?.announcement.enabled ? "bg-accent justify-end" : "bg-muted justify-start"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-white" />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">نص الإعلان (عربي)</label>
                <input 
                  type="text"
                  value={settings?.announcement.textAr}
                  onChange={(e) => setSettings(s => s ? { ...s, announcement: { ...s.announcement, textAr: e.target.value } } : null)}
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm font-naskh"
                  placeholder="مثال: رمضان مبارك للجميع..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Announcement Text (English)</label>
                <input 
                  type="text"
                  value={settings?.announcement.textEn}
                  onChange={(e) => setSettings(s => s ? { ...s, announcement: { ...s.announcement, textEn: e.target.value } } : null)}
                  className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm"
                  placeholder="Example: Ramadan Mubarak to everyone..."
                />
              </div>
            </div>
          </section>

          {/* Feature Toggles */}
          <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Power className="w-4 h-4 text-blue-500" />
              التحكم في الميزات
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <FeatureToggle 
                label="المستشار الذكي (AI)" 
                enabled={settings?.features.aiAdvisor} 
                onToggle={() => setSettings(s => s ? { ...s, features: { ...s.features, aiAdvisor: !s.features.aiAdvisor } } : null)}
              />
              <FeatureToggle 
                label="لوحة المتصدرين" 
                enabled={settings?.features.leaderboard} 
                onToggle={() => setSettings(s => s ? { ...s, features: { ...s.features, leaderboard: !s.features.leaderboard } } : null)}
              />
              <FeatureToggle 
                label="الختمات الجماعية" 
                enabled={settings?.features.socialKhatma} 
                onToggle={() => setSettings(s => s ? { ...s, features: { ...s.features, socialKhatma: !s.features.socialKhatma } } : null)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const FeatureToggle = ({ label, enabled, onToggle }: any) => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/10">
    <span className="text-xs font-bold font-naskh">{label}</span>
    <button
      onClick={onToggle}
      className={`w-9 h-5 rounded-full transition-all flex items-center px-1 ${
        enabled ? "bg-emerald-500 justify-end" : "bg-muted-foreground/20 justify-start"
      }`}
    >
      <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
    </button>
  </div>
);

export default SettingsManager;
