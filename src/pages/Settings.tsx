import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Palette, Type, RotateCcw, HelpCircle, Trash2, Bell, BellOff, Clock, Send, ChevronLeft, X, BookOpen, Wand2, LayoutGrid, DownloadCloud, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "motion/react";
import ScrollReveal from "@/components/ScrollReveal";
import { toArabicNumber } from "@/data/quranData";
import { useTheme } from "@/contexts/ThemeContext";
import JuzImporter from "@/components/JuzImporter";
import OfflineManager from "@/components/OfflineManager";
import { useTranslation } from "react-i18next";

type ThemeMode = "light" | "dark" | "sepia";

const THEME_KEY = "quran-theme";
const FONT_SIZE_KEY = "quran-font-size";
const DIMMING_KEY = "quran-page-dimming";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, dimming, setDimming, tajweedMode, setTajweedMode } = useTheme();
  const { settings: notifSettings, updateSettings: updateNotif, permissionState, requestPermission, testNotification, isSupported } = useNotifications();

  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem(FONT_SIZE_KEY) || "16");
  });

  const THEME_OPTIONS: { id: ThemeMode; label: string; icon: React.ReactNode; preview: string }[] = [
    { id: "light", label: t("settings.themes.light"), icon: <Sun size={18} />, preview: "bg-[hsl(45,30%,98%)]" },
    { id: "dark", label: "داكن / ليلي (OLED)", icon: <Moon size={18} />, preview: "bg-black" },
    { id: "sepia", label: t("settings.themes.sepia"), icon: <Palette size={18} />, preview: "bg-[hsl(35,45%,85%)]" },
  ];

  const FONT_SIZES = [
    { id: "small", label: t("settings.fontSize.small"), value: 14 },
    { id: "medium", label: t("settings.fontSize.medium"), value: 16 },
    { id: "large", label: t("settings.fontSize.large"), value: 18 },
    { id: "xlarge", label: t("settings.fontSize.xlarge"), value: 20 },
  ];

  useEffect(() => {
    document.documentElement.style.setProperty("--base-font-size", `${fontSize}px`);
    localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
  }, [fontSize]);

  const resetAll = () => {
    setTheme("light");
    setFontSize(16);
    localStorage.removeItem("athkar-counters");
    localStorage.removeItem("quran-bookmark");
    toast.success("تم إعادة ضبط جميع الإعدادات");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background pb-32 selection:bg-accent/20">
      {/* Immersive Header */}
      <header className="relative overflow-hidden pt-8 md:pt-12 pb-16 md:pb-20 px-4 md:px-6 text-center">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-emerald-deep z-0" />
        <div className="absolute inset-0 pattern-islamic opacity-10 z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-deep z-0" />
        
        {/* Decorative Ornament */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-24 md:h-32 opacity-20 pointer-events-none z-0">
          <div className="w-full h-full ornament-border opacity-30" />
        </div>

        <div className="relative z-10 container max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <Link 
              to="/" 
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
            >
              <X className="size-[18px] md:size-[20px]" strokeWidth={1.5} />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-gold/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6 md:mb-8 border border-gold/30 shadow-gold-glow">
              <RotateCcw className="size-[28px] md:size-[32px] text-gold" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white mb-4 md:mb-6 tracking-tight">
              {t("settings.title")}
            </h1>
            
            <p className="text-white/80 font-serif italic text-base md:text-lg max-w-xl mx-auto leading-relaxed px-4">
              {t("settings.subtitle")}
            </p>
          </motion.div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20 space-y-6 md:space-y-8">
        {/* Language Selection */}
        <ScrollReveal index={0}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-islamic border border-border/20">
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] md:rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shadow-lg shrink-0">
                <LayoutGrid className="size-[20px] md:size-[24px]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-primary">{t("settings.language.title")}</h2>
                <p className="text-xs md:text-sm text-primary/70 font-serif italic">{t("settings.language.subtitle")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { id: "ar", label: "العربية" },
                { id: "en", label: "English" },
              ].map(lang => (
                <motion.button
                  key={lang.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => i18n.changeLanguage(lang.id)}
                  className={`flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all ${
                    i18n.language === lang.id
                      ? "border-accent bg-accent/5 shadow-lg"
                      : "border-primary/5 hover:border-accent/30 bg-primary/5"
                  }`}
                >
                  <span className="font-serif text-base md:text-lg font-bold text-primary">{lang.label}</span>
                </motion.button>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Reading Settings */}
        <ScrollReveal index={1}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-islamic border border-border/20">
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] md:rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shadow-lg shrink-0">
                <Sparkles className="size-[20px] md:size-[24px]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-primary">إعدادات القراءة</h2>
                <p className="text-xs md:text-sm text-primary/70 font-serif italic">تخصيص تجربة عرض المصحف الشريف</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-border/5 bg-card/5 hover:bg-card hover:shadow-lg transition-all group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <Sparkles className="size-[20px] md:size-[24px]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-base md:text-lg font-bold text-primary">التجويد الملون</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-naskh mt-0.5 md:mt-1">تلوين أحرف المصحف بناءً على أحكام التجويد</p>
                </div>
                <button
                  onClick={() => setTajweedMode(!tajweedMode)}
                  className={`w-14 md:w-16 h-8 md:h-9 rounded-full transition-all flex items-center p-1 shrink-0 ${
                    tajweedMode ? "bg-emerald-deep shadow-lg justify-end" : "bg-primary/10 justify-start"
                  }`}
                  dir="ltr"
                >
                  <motion.div 
                    layout
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white shadow-md" 
                  />
                </button>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Theme Selection */}
        <ScrollReveal index={1}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-islamic border border-border/20 overflow-hidden relative">
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] md:rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shadow-lg shrink-0">
                <Palette className="size-[20px] md:size-[24px]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-primary">{t("settings.theme.title")}</h2>
                <p className="text-xs md:text-sm text-primary/70 font-serif italic">{t("settings.theme.subtitle")}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {THEME_OPTIONS.map(opt => (
                <motion.button
                  key={opt.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(opt.id)}
                  className={`relative flex flex-col items-center gap-2 md:gap-4 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all ${
                    theme === opt.id
                      ? "border-accent bg-accent/5 shadow-lg"
                      : "border-primary/5 hover:border-accent/30 bg-primary/5"
                  }`}
                >
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${opt.preview} border-2 md:border-4 border-card shadow-xl flex items-center justify-center`}>
                    <motion.div
                      animate={{ rotate: theme === opt.id ? 360 : 0 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={theme === opt.id ? "text-accent" : "text-primary/20"}
                    >
                      {opt.icon}
                    </motion.div>
                  </div>
                  <span className="font-serif text-[10px] md:text-sm font-bold text-primary">{opt.label}</span>
                  {theme === opt.id && (
                    <motion.div 
                      layoutId="activeTheme"
                      className="absolute top-3 left-3 md:top-4 md:left-4 w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent shadow-sm" 
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Dimming slider - dark & sepia modes */}
            <AnimatePresence>
              {(theme === "dark" || theme === "sepia") && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-10 p-8 bg-primary/5 rounded-[2rem] border border-primary/5 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-primary flex items-center gap-3">
                      <Moon size={20} className="text-gold" strokeWidth={1.5} />
                      شدة إعتام الصفحات
                    </span>
                    <span className="font-serif text-sm font-bold text-gold bg-gold/10 px-4 py-1 rounded-full">
                      {i18n.language === "ar" ? toArabicNumber(dimming) : dimming}%
                    </span>
                  </div>
                  <Slider
                    value={[dimming]}
                    min={0}
                    max={90}
                    step={5}
                    onValueChange={(val) => setDimming(val[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-primary/50 uppercase tracking-widest">
                    <span>معتم جداً</span>
                    <span>عادي</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </ScrollReveal>

        {/* Font Size */}
        <ScrollReveal index={1}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-islamic border border-border/20">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shadow-lg">
                <Type size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary">{t("settings.fontSize.title")}</h2>
                <p className="text-sm text-primary/70 font-serif italic">{t("settings.fontSize.subtitle")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {FONT_SIZES.map(size => (
                <motion.button
                  key={size.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFontSize(size.value)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${
                    fontSize === size.value
                      ? "border-accent bg-accent/5 shadow-lg"
                      : "border-primary/5 hover:border-accent/30 bg-primary/5"
                  }`}
                >
                  <span className="font-amiri text-primary font-bold" style={{ fontSize: `${size.value}px` }}>أ</span>
                  <span className="font-serif text-[10px] font-bold text-primary/70 uppercase tracking-widest">{size.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Preview */}
            <div className="mt-10 p-10 bg-primary/5 rounded-[2.5rem] border border-primary/5 relative group overflow-hidden">
              <div className="absolute top-4 right-6 text-[10px] font-bold text-primary/50 uppercase tracking-widest">معاينة النص</div>
              <p className="font-amiri text-primary leading-[2] text-center" style={{ fontSize: `${fontSize}px` }}>
                سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* Notifications */}
        <ScrollReveal index={2}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-islamic border border-border/20">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shadow-lg">
                <Bell size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary">التنبيهات الإيمانية</h2>
                <p className="text-sm text-primary/70 font-serif italic">تذكيرات ذكية للأذكار وورد القرآن اليومي</p>
              </div>
            </div>

            {!isSupported ? (
              <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-red-50 border border-red-100">
                <BellOff size={24} className="text-red-500 shrink-0" strokeWidth={1.5} />
                <p className="text-sm font-serif italic text-red-500">متصفحك الحالي لا يدعم ميزة التنبيهات التلقائية</p>
              </div>
            ) : permissionState === "denied" ? (
              <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-red-50 border border-red-100">
                <BellOff size={24} className="text-red-500 shrink-0" strokeWidth={1.5} />
                <p className="text-sm font-serif italic text-red-500">تم حظر التنبيهات. يرجى تفعيلها من إعدادات المتصفح للمتابعة</p>
              </div>
            ) : permissionState !== "granted" ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  const granted = await requestPermission();
                  if (granted) toast.success("تم تفعيل التنبيهات بنجاح");
                  else toast.error("تم رفض إذن التنبيهات");
                }}
                className="w-full h-16 rounded-[2rem] bg-emerald-deep text-gold font-serif text-lg font-bold shadow-xl hover:shadow-emerald-deep/20 transition-all flex items-center justify-center gap-4"
              >
                <Bell size={20} strokeWidth={1.5} />
                تفعيل التنبيهات الآن
              </motion.button>
            ) : (
              <div className="space-y-4">
                {[
                  { id: "athkarMorning", label: "أذكار الصباح المباركة", timeKey: "athkarMorningTime" as const, icon: "🌅" },
                  { id: "athkarEvening", label: "أذكار المساء الهادئة", timeKey: "athkarEveningTime" as const, icon: "🌙" },
                  { id: "quranReading", label: "ورد القرآن اليومي", timeKey: "quranReadingTime" as const, icon: "📖" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-6 p-6 rounded-[2rem] border border-border/5 bg-card/5 hover:bg-card hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-2xl shadow-sm">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-lg font-bold text-primary">{item.label}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Clock size={14} className="text-primary/20" strokeWidth={1.5} />
                        <input
                          type="time"
                          value={notifSettings[item.timeKey]}
                          onChange={(e) => updateNotif({ [item.timeKey]: e.target.value })}
                          className="text-xs font-serif font-bold text-primary/70 bg-transparent border-none outline-none focus:text-accent transition-colors cursor-pointer"
                          disabled={!notifSettings[item.id as keyof typeof notifSettings]}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {notifSettings[item.id as keyof typeof notifSettings] && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => testNotification(item.id as "athkarMorning" | "athkarEvening" | "quranReading")}
                          className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent hover:bg-accent/20 transition-all"
                          title="إرسال تنبيه تجريبي"
                        >
                          <Send size={16} strokeWidth={1.5} />
                        </motion.button>
                      )}
                      <button
                        onClick={() => updateNotif({ [item.id]: !notifSettings[item.id as keyof typeof notifSettings] })}
                        className={`w-16 h-9 rounded-full transition-all flex items-center p-1 ${
                          notifSettings[item.id as keyof typeof notifSettings] ? "bg-emerald-deep shadow-lg justify-end" : "bg-primary/10 justify-start"
                        }`}
                        dir="ltr"
                      >
                        <motion.div 
                          layout
                          className="w-7 h-7 rounded-full bg-white shadow-md" 
                        />
                      </button>
                    </div>
                  </div>
                ))}

                <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest text-center mt-6">
                  التنبيهات تعمل بكفاءة عند تثبيت التطبيق كـ PWA
                </p>
              </div>
            )}
          </section>
        </ScrollReveal>

        {/* Offline Management */}
        <ScrollReveal index={3}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-islamic border border-border/20 overflow-hidden relative">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shadow-lg">
                <DownloadCloud size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary">الاستخدام دون اتصال (Offline)</h2>
                <p className="text-sm text-primary/70 font-serif italic">تحميل صفحات المصحف للقراءة في أي وقت وأي مكان</p>
              </div>
            </div>

            <OfflineManager />
          </section>
        </ScrollReveal>

        {/* Advanced Tools */}
        <ScrollReveal index={4}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-islamic border border-border/20 overflow-hidden relative">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-deep text-gold flex items-center justify-center shadow-lg">
                <Wand2 size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary">أدوات متقدمة</h2>
                <p className="text-sm text-primary/70 font-serif italic">إدارة وتحديث نصوص القرآن الكريم يدوياً</p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/5 space-y-4">
                <p className="text-sm text-primary/70 font-serif italic leading-relaxed">
                  استخدم "المستورد السحري" لتحديث نصوص الأجزاء يدوياً مع الحفاظ الكامل على علامات التجويد والتشكيل.
                </p>
                <JuzImporter />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Reset App */}
        <ScrollReveal index={5}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-islamic border border-border/20 h-full flex flex-col">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-14 h-14 rounded-[1.2rem] bg-red-50 text-red-500 flex items-center justify-center shadow-lg">
                <RotateCcw size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-primary">إعادة الضبط</h2>
                <p className="text-sm text-primary/70 font-serif italic leading-relaxed">مسح شامل لجميع تفضيلاتك، علاماتك المرجعية، وعدادات الأذكار (ضبط المصنع)</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetAll}
              className="w-full h-14 rounded-2xl border-2 border-red-200 text-red-500 font-serif text-lg font-bold hover:bg-red-50 transition-all"
            >
              إعادة ضبط شاملة
            </motion.button>
          </section>
        </ScrollReveal>

        {/* Support Links */}
        <ScrollReveal index={5}>
          <Link
            to="/how-to-use"
            className="flex items-center gap-8 bg-emerald-deep rounded-[2.5rem] p-8 shadow-xl hover:shadow-emerald-deep/20 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 pattern-islamic opacity-5 pointer-events-none" />
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-gold shadow-lg group-hover:scale-110 transition-all border border-white/10">
              <HelpCircle size={32} strokeWidth={1.5} />
            </div>
            <div className="flex-1 relative z-10">
              <h2 className="font-serif text-2xl font-bold text-gold mb-1">دليل الاستخدام</h2>
              <p className="text-sm text-white/70 font-serif italic">تعرف على أسرار ومميزات التطبيق في جولة سريعة</p>
            </div>
            <ChevronLeft size={24} className="text-gold/70 group-hover:text-gold transition-all" strokeWidth={2} />
          </Link>
        </ScrollReveal>

        {/* Footer Info */}
        <section className="text-center py-12 space-y-6">
          <motion.p 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="font-amiri text-gold text-4xl"
          >
            ﷽
          </motion.p>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-primary/50 uppercase tracking-[0.3em]">تطبيق القرآن الكريم • الإصدار ١.٠</p>
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.1em]">مصحف المدينة المنورة برواية حفص عن عاصم</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
