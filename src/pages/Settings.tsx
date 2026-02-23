import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Palette, Type, RotateCcw, HelpCircle, Trash2, Bell, BellOff, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

type ThemeMode = "light" | "dark" | "sepia";

const THEME_KEY = "quran-theme";
const FONT_SIZE_KEY = "quran-font-size";

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: React.ReactNode; preview: string }[] = [
  { id: "light", label: "فاتح", icon: <Sun size={18} />, preview: "bg-[hsl(42,32%,97%)]" },
  { id: "dark", label: "داكن", icon: <Moon size={18} />, preview: "bg-[hsl(200,15%,8%)]" },
  { id: "sepia", label: "بني دافئ", icon: <Palette size={18} />, preview: "bg-[hsl(35,40%,93%)]" },
];

const FONT_SIZES = [
  { id: "small", label: "صغير", value: 14 },
  { id: "medium", label: "متوسط", value: 16 },
  { id: "large", label: "كبير", value: 18 },
  { id: "xlarge", label: "كبير جداً", value: 20 },
];

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.remove("dark", "sepia");
  if (theme !== "light") {
    document.documentElement.classList.add(theme);
  }
  localStorage.setItem(THEME_KEY, theme);
};

const Settings = () => {
  const { settings: notifSettings, updateSettings: updateNotif, permissionState, requestPermission, testNotification, isSupported } = useNotifications();

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (saved === "dark" || saved === "sepia") return saved;
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("sepia")) return "sepia";
    return "light";
  });

  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem(FONT_SIZE_KEY) || "16");
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--base-font-size", `${fontSize}px`);
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
  }, [fontSize]);

  const resetAll = () => {
    setTheme("light");
    setFontSize(16);
    localStorage.removeItem("athkar-counters");
    localStorage.removeItem("quran-bookmark");
  };

  const clearDownloadData = async () => {
    // Clear localStorage download state
    localStorage.removeItem("juz-download-state");
    // Clear cache if available
    try {
      const deleted = await caches.delete("workbox-runtime");
      if (deleted) {
        toast.success("تم حذف جميع بيانات التحميل بنجاح");
      } else {
        toast.success("تم مسح حالة التحميل");
      }
    } catch {
      toast.success("تم مسح حالة التحميل");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-islamic pattern-islamic px-4 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold" />
        <div className="pb-6 pt-4">
          <p className="font-amiri text-gold text-lg mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-primary-foreground">الإعدادات</h1>
          <p className="font-naskh text-primary-foreground/70 text-sm mt-2">تخصيص المظهر وتجربة القراءة</p>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Theme Selection */}
        <section className="bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-islamic flex items-center justify-center">
              <Palette size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-naskh text-base font-bold text-foreground">المظهر</h2>
              <p className="text-xs text-muted-foreground font-naskh">اختر الثيم المناسب لراحة عينيك</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === opt.id
                    ? "border-accent bg-accent/10 shadow-islamic"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${opt.preview} border border-border shadow-sm flex items-center justify-center`}>
                  {opt.icon}
                </div>
                <span className="font-naskh text-sm font-bold text-foreground">{opt.label}</span>
                {theme === opt.id && (
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Font Size */}
        <section className="bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
              <Type size={18} className="text-foreground" />
            </div>
            <div>
              <h2 className="font-naskh text-base font-bold text-foreground">حجم الخط</h2>
              <p className="text-xs text-muted-foreground font-naskh">تحكم في حجم نص الأذكار والأدعية</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map(size => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  fontSize === size.value
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <span className="font-amiri text-foreground" style={{ fontSize: `${size.value}px` }}>أ</span>
                <span className="font-naskh text-[10px] text-muted-foreground">{size.label}</span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
            <p className="font-amiri text-foreground leading-loose" style={{ fontSize: `${fontSize}px` }}>
              سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ
            </p>
            <p className="text-xs text-muted-foreground font-naskh mt-2">معاينة حجم الخط</p>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
              <Bell size={18} className="text-foreground" />
            </div>
            <div>
              <h2 className="font-naskh text-base font-bold text-foreground">التنبيهات</h2>
              <p className="text-xs text-muted-foreground font-naskh">تذكيرات الأذكار وورد القرآن</p>
            </div>
          </div>

          {!isSupported ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <BellOff size={16} className="text-destructive shrink-0" />
              <p className="text-xs font-naskh text-destructive">متصفحك لا يدعم التنبيهات</p>
            </div>
          ) : permissionState === "denied" ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <BellOff size={16} className="text-destructive shrink-0" />
              <p className="text-xs font-naskh text-destructive">تم رفض إذن التنبيهات. يرجى تفعيلها من إعدادات المتصفح</p>
            </div>
          ) : permissionState !== "granted" ? (
            <button
              onClick={async () => {
                const granted = await requestPermission();
                if (granted) toast.success("تم تفعيل التنبيهات بنجاح");
                else toast.error("تم رفض إذن التنبيهات");
              }}
              className="w-full py-3 rounded-xl border-2 border-accent/30 text-accent font-naskh text-sm font-bold hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
            >
              <Bell size={16} />
              تفعيل التنبيهات
            </button>
          ) : (
            <div className="space-y-3">
              {/* Athkar Morning */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="font-naskh text-sm font-bold text-foreground">🌅 أذكار الصباح</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <input
                      type="time"
                      value={notifSettings.athkarMorningTime}
                      onChange={(e) => updateNotif({ athkarMorningTime: e.target.value })}
                      className="text-xs font-naskh text-muted-foreground bg-transparent border-none outline-none"
                      disabled={!notifSettings.athkarMorning}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {notifSettings.athkarMorning && (
                    <button
                      onClick={() => testNotification("athkarMorning")}
                      className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors"
                      title="إرسال تنبيه تجريبي"
                    >
                      <Send size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => updateNotif({ athkarMorning: !notifSettings.athkarMorning })}
                    className={`w-12 h-7 rounded-full transition-all relative ${
                      notifSettings.athkarMorning ? "bg-accent" : "bg-muted border border-border"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-all ${
                      notifSettings.athkarMorning ? "left-0.5" : "left-[calc(100%-1.625rem)]"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Athkar Evening */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="font-naskh text-sm font-bold text-foreground">🌙 أذكار المساء</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <input
                      type="time"
                      value={notifSettings.athkarEveningTime}
                      onChange={(e) => updateNotif({ athkarEveningTime: e.target.value })}
                      className="text-xs font-naskh text-muted-foreground bg-transparent border-none outline-none"
                      disabled={!notifSettings.athkarEvening}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {notifSettings.athkarEvening && (
                    <button
                      onClick={() => testNotification("athkarEvening")}
                      className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors"
                      title="إرسال تنبيه تجريبي"
                    >
                      <Send size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => updateNotif({ athkarEvening: !notifSettings.athkarEvening })}
                    className={`w-12 h-7 rounded-full transition-all relative ${
                      notifSettings.athkarEvening ? "bg-accent" : "bg-muted border border-border"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-all ${
                      notifSettings.athkarEvening ? "left-0.5" : "left-[calc(100%-1.625rem)]"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Quran Reading */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="font-naskh text-sm font-bold text-foreground">📖 ورد القرآن اليومي</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <input
                      type="time"
                      value={notifSettings.quranReadingTime}
                      onChange={(e) => updateNotif({ quranReadingTime: e.target.value })}
                      className="text-xs font-naskh text-muted-foreground bg-transparent border-none outline-none"
                      disabled={!notifSettings.quranReading}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {notifSettings.quranReading && (
                    <button
                      onClick={() => testNotification("quranReading")}
                      className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors"
                      title="إرسال تنبيه تجريبي"
                    >
                      <Send size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => updateNotif({ quranReading: !notifSettings.quranReading })}
                    className={`w-12 h-7 rounded-full transition-all relative ${
                      notifSettings.quranReading ? "bg-accent" : "bg-muted border border-border"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-all ${
                      notifSettings.quranReading ? "left-0.5" : "left-[calc(100%-1.625rem)]"
                    }`} />
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground font-naskh text-center">
                التنبيهات تعمل عندما يكون التطبيق مفتوحاً أو مثبتاً كـ PWA
              </p>
            </div>
          )}
        </section>

        {/* Clear Downloads */}
        <section className="bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: "140ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Trash2 size={18} className="text-gold" />
            </div>
            <div>
              <h2 className="font-naskh text-base font-bold text-foreground">بيانات التحميل</h2>
              <p className="text-xs text-muted-foreground font-naskh">حذف الأجزاء المحمّلة للقراءة أوفلاين</p>
            </div>
          </div>

          <button
            onClick={clearDownloadData}
            className="w-full py-3 rounded-xl border-2 border-gold/30 text-gold font-naskh text-sm font-bold hover:bg-gold/10 transition-all active:scale-[0.98]"
          >
            حذف بيانات التحميل
          </button>
          <p className="text-[10px] text-muted-foreground font-naskh mt-2 text-center">
            سيتم حذف جميع الصفحات المحمّلة وإعادة حالة التحميل
          </p>
        </section>

        {/* App Info & Reset */}
        <section className="bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: "160ms" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <RotateCcw size={18} className="text-destructive" />
            </div>
            <div>
              <h2 className="font-naskh text-base font-bold text-foreground">إعادة ضبط</h2>
              <p className="text-xs text-muted-foreground font-naskh">مسح جميع البيانات المحفوظة محلياً</p>
            </div>
          </div>

          <button
            onClick={resetAll}
            className="w-full py-3 rounded-xl border-2 border-destructive/30 text-destructive font-naskh text-sm font-bold hover:bg-destructive/10 transition-all active:scale-[0.98]"
          >
            إعادة ضبط المصنع
          </button>
          <p className="text-[10px] text-muted-foreground font-naskh mt-2 text-center">
            سيتم حذف العلامات المرجعية وعدادات الأذكار والإعدادات
          </p>
        </section>

        {/* How to use */}
        <Link
          to="/how-to-use"
          className="flex items-center gap-3 bg-card border border-border rounded-2xl p-5 shadow-soft animate-slide-up hover:border-accent/40 transition-all"
          style={{ animationDelay: "200ms" }}
        >
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
            <HelpCircle size={18} className="text-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-naskh text-base font-bold text-foreground">كيفية الاستخدام</h2>
            <p className="text-xs text-muted-foreground font-naskh">دليل سريع لجميع مميزات التطبيق</p>
          </div>
        </Link>

        {/* About */}
        <section className="text-center py-4 animate-slide-up" style={{ animationDelay: "240ms" }}>
          <p className="font-amiri text-gold text-lg">﷽</p>
          <p className="text-xs text-muted-foreground font-naskh mt-2">تطبيق القرآن الكريم • الإصدار ١.٠</p>
          <p className="text-[10px] text-muted-foreground font-naskh mt-1">مصحف المدينة المنورة</p>
        </section>
      </main>
    </div>
  );
};

export default Settings;