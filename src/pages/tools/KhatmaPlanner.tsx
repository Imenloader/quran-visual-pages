import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, BookOpen, Clock, Info, Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const KhatmaPlanner = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [pagesPerDay, setPagesPerDay] = useState(20);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");

  useEffect(() => {
    const saved = localStorage.getItem("khatma-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setDays(parsed.days || 30);
      setNotificationsEnabled(parsed.notificationsEnabled || false);
      setReminderTime(parsed.reminderTime || "20:00");
    }
  }, []);

  useEffect(() => {
    setPagesPerDay(Math.ceil(604 / days));
  }, [days]);

  const saveSettings = () => {
    localStorage.setItem("khatma-settings", JSON.stringify({
      days,
      notificationsEnabled,
      reminderTime
    }));
    toast.success(i18n.language === 'ar' ? "تم حفظ إعدادات الختمة" : "Khatma settings saved");
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error(i18n.language === 'ar' ? "متصفحك لا يدعم التنبيهات" : "Your browser doesn't support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(!notificationsEnabled);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      toast.success(i18n.language === 'ar' ? "تم تفعيل التنبيهات بنجاح" : "Notifications enabled successfully");
    } else {
      toast.error(i18n.language === 'ar' ? "تم رفض إذن التنبيهات" : "Notification permission denied");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/hub")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </button>
          <h1 className="text-xl font-bold font-naskh text-foreground">{t("hub.khatma")}</h1>
          <div className="w-10 h-10" />
        </header>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-islamic space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-naskh text-foreground">
                {i18n.language === 'ar' ? "مدة الختمة (بالأيام)" : "Khatma Duration (Days)"}
              </label>
              <span className="text-2xl font-bold text-primary font-mono">{days}</span>
            </div>
            <input 
              type="range" 
              min="7" 
              max="60" 
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
              <span>{i18n.language === 'ar' ? "7 أيام" : "7 Days"}</span>
              <span>{i18n.language === 'ar' ? "60 يوم" : "60 Days"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 text-center space-y-2">
              <BookOpen className="w-6 h-6 text-primary mx-auto" />
              <p className="text-2xl font-bold text-foreground font-mono">{pagesPerDay}</p>
              <p className="text-[10px] text-muted-foreground font-naskh uppercase tracking-wider">
                {i18n.language === 'ar' ? "صفحة يومياً" : "Pages Daily"}
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 text-center space-y-2">
              <Clock className="w-6 h-6 text-primary mx-auto" />
              <p className="text-2xl font-bold text-foreground font-mono">{Math.ceil(pagesPerDay * 2)}</p>
              <p className="text-[10px] text-muted-foreground font-naskh uppercase tracking-wider">
                {i18n.language === 'ar' ? "دقيقة تقريباً" : "Est. Minutes"}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${notificationsEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold font-naskh text-foreground">
                    {i18n.language === 'ar' ? "تنبيهات الختمة" : "Khatma Notifications"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-naskh">
                    {i18n.language === 'ar' ? "تذكير يومي بوردك" : "Daily reminder for your wird"}
                  </p>
                </div>
              </div>
              <button 
                onClick={requestNotificationPermission}
                className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notificationsEnabled ? "right-7" : "right-1"}`} />
              </button>
            </div>

            {notificationsEnabled && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-3 overflow-hidden"
              >
                <label className="text-[10px] font-bold font-naskh text-muted-foreground uppercase tracking-widest">
                  {i18n.language === 'ar' ? "وقت التذكير" : "Reminder Time"}
                </label>
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full p-4 bg-muted/50 rounded-2xl border border-border/50 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </motion.div>
            )}

            <button 
              onClick={saveSettings}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold font-naskh shadow-islamic active:scale-95 transition-transform"
            >
              {i18n.language === 'ar' ? "حفظ الإعدادات" : "Save Settings"}
            </button>
          </div>
        </div>

        <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 flex gap-3 items-start">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground font-naskh leading-relaxed">
            {i18n.language === 'ar' 
              ? "يعتمد التقدير الزمني على متوسط سرعة القراءة (دقيقتان لكل صفحة). يمكنك تعديل الخطة في أي وقت حسب ظروفك."
              : "Estimated time is based on average reading speed (2 mins per page). You can adjust your plan anytime."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KhatmaPlanner;
