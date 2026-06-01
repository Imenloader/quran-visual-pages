import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Palette, Type, RotateCcw, HelpCircle, Trash2, Bell, BellOff, Clock, Send, ChevronLeft, X, BookOpen, Wand2, LayoutGrid, DownloadCloud, Sparkles, User, Trophy, Calendar, RefreshCw, Check, Shield, ShieldCheck, AlertCircle, Flame, GraduationCap, Heart, Upload, Image as ImageIcon, Music, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { usePeriodicReminders } from "@/hooks/usePeriodicReminders";
import { Slider } from "@/components/ui/slider";
import ScrollReveal from "@/components/ScrollReveal";
import { toArabicNumber, juzData } from "@/data/quranData";
import { useTheme } from "@/contexts/ThemeContext";
import JuzImporter from "@/components/JuzImporter";
import OfflineManager from "@/components/OfflineManager";
import UpdateManager from "@/components/UpdateManager";
import AudioDownloadManager from "@/components/AudioDownloadManager";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { usePersistentState } from "@/hooks/usePersistentState";

import { useUser } from "@/contexts/UserContext";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import AuthModal from "@/components/AuthModal";

type ThemeMode = "light" | "dark" | "sepia";

const THEME_KEY = "quran-theme";
const FONT_SIZE_KEY = "quran-font-size";
const DIMMING_KEY = "quran-page-dimming";

const formatDate = (date: any, isArabic: boolean) => {
  if (!date) return '';
  let d: Date;
  try {
    if (typeof date.toDate === 'function') {
      d = date.toDate();
    } else {
      d = new Date(date);
    }
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return '';
  }
};

const Profile = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const { theme, setTheme, dimming, setDimming, tajweedMode, setTajweedMode } = useTheme();
  const { profile, updateProfile, level, levelName, levelProgress, nextLevelPoints, prevLevelPoints, completeQuest, isAdmin } = useUser();
  const { testPrayerNotification } = usePrayerTimes();
  const { unlockAudio } = useAudioUnlock();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpGuideOpen, setIsExpGuideOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [newName, setNewName] = useState(profile.name);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    setNewName(profile.name);
  }, [profile.name]);

  const [isPersistent, setIsPersistent] = useState(false);
  useEffect(() => {
    const initPersistence = async () => {
      if (navigator.storage && navigator.storage.persisted) {
        const persisted = await navigator.storage.persisted();
        if (persisted) {
          setIsPersistent(true);
        } else if (navigator.storage.persist) {
          try {
            const granted = await navigator.storage.persist();
            setIsPersistent(granted);
          } catch (e) {
            console.warn("Storage persistence request failed:", e);
          }
        }
      }
    };
    initPersistence();
  }, []);

  const togglePersistence = async () => {
    if (!navigator.storage || !navigator.storage.persist) {
      toast.error(isAr ? "متصفحك لا يدعم هذه الخاصية" : "Your browser doesn't support this feature");
      return;
    }
    const granted = await navigator.storage.persist();
    setIsPersistent(granted);
    if (granted) {
      toast.success(isAr ? "تم تمكين التخزين الدائم بنجاح" : "Persistent storage enabled successfully");
    } else {
      toast.error(isAr ? "تعذر تفعيل التخزين الدائم. قد يكون المتصفح يرفض الطلب" : "Could not enable persistent storage. Browser may have rejected the request");
    }
  };

  const handleUpdateProfile = () => {
    updateProfile({ name: newName });
    setIsEditingProfile(false);
    toast.success(t("profile.successUpdate"));
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t("profile.invalidFileType") || "Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.fileTooLarge") || "File size must be less than 5MB");
      return;
    }

    if (!auth.currentUser) {
      toast.error(t("profile.mustBeLoggedIn") || "You must be logged in to upload a profile picture");
      setShowAuthModal(true);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      const base64String = await base64Promise;
      await updateProfile({ avatar: base64String });
      toast.success(t("profile.avatarUploaded") || "Profile picture updated successfully!");
    } catch (error) {
      console.error("Avatar processing error:", error);
      toast.error(t("profile.uploadFailed") || "Failed to process profile picture");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const { settings: notifSettings, updateSettings: updateNotif, permissionState, requestPermission, testNotification, isSupported } = useNotifications();
  const { getSettings: getPeriodicSettings, updateSettings: updatePeriodicSettings } = usePeriodicReminders();
  const [periodicSettings, setPeriodicSettings] = useState(getPeriodicSettings());

  const handleUpdatePeriodic = (newSettings: Partial<typeof periodicSettings>) => {
    const updated = { ...periodicSettings, ...newSettings };
    setPeriodicSettings(updated);
    updatePeriodicSettings(newSettings);
  };

  const [communityNotifsEnabled, setCommunityNotifsEnabled] = usePersistentState("community_notifications_enabled", false);

  const toggleCommunityNotifs = () => {
    setCommunityNotifsEnabled(!communityNotifsEnabled);
  };

  const [fontSize, setFontSize] = usePersistentState(FONT_SIZE_KEY, 16);

  const THEME_OPTIONS: { id: ThemeMode | "amoled"; label: string; icon: LucideIcon; preview: string }[] = [
    { id: "light", label: t("settings.themes.light"), icon: Sun, preview: "bg-[hsl(45,30%,98%)]" },
    { id: "dark", label: t("settings.themes.dark"), icon: Moon, preview: "bg-black" },
    { id: "amoled", label: t("settings.themes.amoled", "AMOLED"), icon: Moon, preview: "bg-black" },
    { id: "sepia", label: t("settings.themes.sepia"), icon: Palette, preview: "bg-[hsl(35,45%,85%)]" },
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
    if (window.confirm(t("profile.confirmReset"))) {
      setTheme("light");
      setFontSize(16);
      localStorage.removeItem("athkar-counters");
      localStorage.removeItem("quran-bookmark");
      toast.success(t("profile.successUpdate"));
      window.location.reload();
    }
  };

  const [activeCategory, setActiveCategory] = useState<"appearance" | "notifications" | "language" | "account" | "offline" | "update">("appearance");

  const SETTINGS_CATEGORIES = [
    { id: "appearance", label: t("profile.theme"), icon: Palette },
    { id: "notifications", label: t("profile.notifications"), icon: Bell },
    { id: "language", label: t("profile.language"), icon: LayoutGrid },
    { id: "offline", label: t("hub.offline.title"), icon: DownloadCloud },
    { id: "update", label: t("settings.update.title"), icon: RefreshCw },
    { id: "account", label: t("profile.account"), icon: User },
  ];

  const resetPagesRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.warning(t("tasbih.confirmReset"), {
      action: {
        label: t("common.confirm"),
        onClick: () => {
          updateProfile({ totalPagesRead: 0 });
          toast.success(t("profile.successUpdate"));
        }
      }
    });
  };

  const [juzProgressData, setJuzProgressData] = useState<Record<number, { completed: boolean; progress: number }>>({});

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("quran-reading-history") || "{}");
      const data: Record<number, { completed: boolean; progress: number }> = {};
      
      for (let i = 1; i <= 30; i++) {
        const juz = juzData.find(j => j.number === i);
        if (!juz) continue;
        
        const totalPages = juz.endPage - juz.startPage + 1;
        const juzHistory = history[i] || { pagesRead: 0, completed: false, visitedPages: [] };
        
        const pagesRead = juzHistory.visitedPages?.length || juzHistory.pagesRead || 0;
        const progress = Math.min(100, (pagesRead / totalPages) * 100);
        
        data[i] = {
          completed: juzHistory.completed || progress >= 100,
          progress: progress
        };
      }
      setJuzProgressData(data);
    } catch (e) {
      console.error("Failed to load juz progress", e);
    }
  }, []);

  const completedJuzList = useMemo(() => {
    return Object.keys(juzProgressData)
      .filter(key => juzProgressData[Number(key)].completed)
      .map(Number);
  }, [juzProgressData]);

  const resetJuzProgress = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.warning("هل أنت متأكد من رغبتك في إعادة تعيين تقدم جميع الأجزاء؟", {
      action: {
        label: "تأكيد",
        onClick: () => {
          localStorage.removeItem("quran-reading-history");
          toast.success("تم إعادة تعيين تقدم الأجزاء بنجاح");
          setTimeout(() => window.location.reload(), 500);
        }
      }
    });
  };

  const getBadgeDescAr = (id: string) => {
    const descs: Record<string, string> = {
      "early-bird": "تحية لكل من يبدأ يومه بذكر الله والقرآن الكريم.",
      "quran-lover": "قراءة أكثر من ٥٠٠ آية كريمة من كتاب الله.",
      "tasbih-master": "التسبيح والذكر لأكثر من ١,٠٠٠ مرة.",
      "streak-7": "المحافظة على الورد اليومي لمدة ٧ أيام متتالية.",
      "khatma-1": "إكمال قراءة جزء كامل من القرآن الكريم.",
      "consistent": "الاستمرار في الطاعات والذكر لمدة شهر كامل.",
      "scholar": "قراءة أكثر من ٥,٠٠٠ آية (رحلة في أعماق كتاب الله).",
      "juz-master": "إنجاز عظيم بإكمال ١٥ جزءاً من القرآن الكريم.",
      "juz-expert": "ختم القرآن الكريم كاملاً (٣٠ جزءاً) - مبارك لك هذا الفوز.",
      "tasbih-pro": "ذكر الله لأكثر من ١٠,٠٠٠ مرة (بذكر الله تطمئن القلوب).",
      "spiritualLegend": "الوصول إلى مستوى روحي رفيع (المستوى ١٥).",
      "pure-heart": "ذكر الله لأكثر من ٢٠,٠٠٠ مرة - جعل الله قلبك عامراً بذكره.",
      "night-owl": "المحافظة على ورد الليل والذكر والقرآن في وقت السحر.",
      "devout": "الوصول للمستوى ٢٠ - من المخلصين في عبادة الله."
    };
    return descs[id] || "وسام تقديري لمجهوداتك الروحية.";
  };

  const getBadgeDescEn = (id: string) => {
    const descs: Record<string, string> = {
      "early-bird": "A tribute to those who start their day with Quran and Dhikr.",
      "quran-lover": "Read over 500 verses from the Holy Quran.",
      "tasbih-master": "Recited Dhikr and Tasbih over 1,000 times.",
      "streak-7": "Maintained a daily spiritual routine for 7 consecutive days.",
      "khatma-1": "Completed the reading of one full Juz.",
      "consistent": "Stayed dedicated to spiritual goals for a full month.",
      "scholar": "Read over 5,000 verses (A deep journey through the Quran).",
      "juz-master": "A great achievement: 15 Juz completed.",
      "juz-expert": "Completed the entire Quran (30 Juz) - MashaAllah!",
      "tasbih-pro": "Recited Dhikr over 10,000 times.",
      "spiritualLegend": "Reached a high spiritual level (Level 15).",
      "pure-heart": "Recited Dhikr over 20,000 times - May your heart be filled with light.",
      "night-owl": "Maintained spiritual devotion during the late night hours.",
      "devout": "Reached Level 20 - A dedicated servant of Allah."
    };
    return descs[id] || "An honorary badge for your spiritual efforts.";
  };

  return (
    <div className="relative min-h-screen bg-background pb-32 selection:bg-accent/20 overflow-x-hidden">
      {/* Immersive Profile Header */}
      <header className="relative overflow-hidden pt-12 pb-24 px-6 text-center">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-emerald-deep z-0" />
        <div className="absolute inset-0 pattern-islamic opacity-10 z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-emerald-deep z-0" />
        
        {/* Decorative Ornament */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 opacity-20 pointer-events-none z-0">
          <div className="w-full h-full ornament-border opacity-30" />
        </div>

        <div className="relative z-10 container max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <BackButton variant="ghost" />
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 rounded-full bg-gold/20 backdrop-blur-md flex items-center gap-2 text-gold hover:bg-gold/30 transition-all border border-gold/20 shadow-gold-glow"
            >
              <Wand2 size={16} strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("profile.settings")}</span>
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative mb-8 group">
              {/* Level Ring */}
              <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] -rotate-90 pointer-events-none">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-white/5"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(212,175,55,0.5)] transition-all duration-1000"
                  style={{ strokeDasharray: "301.59", strokeDashoffset: `${301.59 * (1 - levelProgress / 100)}` }}
                />
              </svg>

              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[3rem] bg-primary flex items-center justify-center text-primary-foreground shadow-2xl border-4 border-primary/10 overflow-hidden relative z-10">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="size-16 md:size-20" strokeWidth={1.5} />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="p-3 rounded-full bg-gold text-emerald-deep shadow-lg"
                  >
                    <Palette size={20} />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gold flex items-center justify-center text-emerald-deep shadow-xl border-4 border-emerald-deep z-20">
                <Trophy size={20} />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 tracking-tight">
              {profile.name}
            </h1>
            
            <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/20 backdrop-blur-md">
                {t("profile.level")} {toArabicNumber(level)}: {levelName}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/20 text-white/90 text-[10px] font-bold uppercase tracking-widest border border-primary/10 backdrop-blur-md">
                {toArabicNumber(profile.points)} {t("profile.points")}
              </span>
              {profile.gender && profile.gender !== 'unspecified' && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${
                  profile.gender === 'male' 
                    ? "bg-blue-500/20 text-blue-200 border-blue-500/30" 
                    : "bg-rose-500/20 text-rose-200 border-rose-500/30"
                }`}>
                  {profile.gender === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 md:px-6 -mt-12 relative z-20 space-y-8">
        {auth.currentUser?.email === "3wdkyarb@gmail.com" && profile.role !== 'admin' && (
          <ScrollReveal>
            <button
              onClick={async () => {
                try {
                  await updateProfile({ role: 'admin' });
                  toast.success("تم تفعيل صلاحيات الأدمن بنجاح");
                  setTimeout(() => window.location.reload(), 1000);
                } catch (e) {
                  console.error("Emergency Admin Error:", e);
                  toast.error("فشل التفعيل: تأكد من تحديث قواعد Firestore أولاً");
                }
              }}
              className="w-full py-5 bg-amber-500 text-white rounded-[2rem] border-2 border-amber-600 flex items-center justify-center gap-4 group hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 animate-pulse mb-4"
            >
              <AlertCircle className="w-7 h-7" />
              <div className="text-right">
                <h3 className="text-xl font-bold font-naskh">تفعيل صلاحيات الإدارة</h3>
                <p className="text-[10px] opacity-90 font-naskh">نقرة واحدة لتصبح مشرفاً في قاعدة البيانات</p>
              </div>
            </button>
          </ScrollReveal>
        )}

        {isAdmin && (
          <ScrollReveal>
            <button
              onClick={() => navigate("/admin")}
              className="w-full py-5 bg-accent/10 backdrop-blur-2xl text-accent rounded-[2rem] border-2 border-accent/30 flex items-center justify-center gap-4 group hover:bg-accent/20 transition-all shadow-xl shadow-accent/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold font-naskh">{isAr ? "لوحة التحكم الإدارية" : "Admin Control Panel"}</h3>
                <p className="text-[10px] opacity-70 font-naskh">{isAr ? "إدارة المحتوى والإعدادات المتقدمة" : "Manage content and advanced settings"}</p>
              </div>
            </button>
          </ScrollReveal>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ScrollReveal index={0}>
            <div className="bg-card/80 backdrop-blur-2xl rounded-2xl p-4 border border-border/20 text-center space-y-1 group hover:bg-card transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <BookOpen size={16} />
              </div>
              <p className="text-xl font-serif font-bold text-primary">{toArabicNumber(profile.totalAyahsRead)}</p>
              <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest">{t("profile.ayahsRead")}</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal index={1}>
            <div className="bg-card/80 backdrop-blur-2xl rounded-2xl p-4 border border-border/20 text-center space-y-1 group hover:bg-card transition-all relative overflow-hidden">
              <button 
                onClick={resetPagesRead}
                title={t("tasbih.reset")}
                className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto hover:bg-blue-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
              >
                <RotateCcw size={16} />
              </button>
              <p className="text-xl font-serif font-bold text-primary">{toArabicNumber(profile.totalPagesRead)}</p>
              <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest">{t("profile.pagesRead")}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal index={2}>
            <div className="bg-card/80 backdrop-blur-2xl rounded-2xl p-4 border border-border/20 text-center space-y-1 group hover:bg-card transition-all">
              <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Trophy size={16} />
              </div>
              <p className="text-xl font-serif font-bold text-primary">{toArabicNumber(profile.totalJuzCompleted)}</p>
              <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest">{t("profile.juzCompleted")}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal index={3}>
            <div className="bg-card/80 backdrop-blur-2xl rounded-2xl p-4 border border-border/20 text-center space-y-1 group hover:bg-card transition-all">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Sparkles size={16} />
              </div>
              <p className="text-xl font-serif font-bold text-primary">{toArabicNumber(profile.totalAthkarRecited)}</p>
              <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest">{t("profile.athkarRecited")}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal index={4}>
            <div className="bg-card/80 backdrop-blur-2xl rounded-2xl p-4 border border-border/20 text-center space-y-1 group hover:bg-card transition-all">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Flame size={16} />
              </div>
              <p className="text-xl font-serif font-bold text-orange-500">{toArabicNumber(profile.daysActive)}</p>
              <p className="text-[9px] font-bold text-orange-500/80 uppercase tracking-widest">{t("profile.dayStreak")}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal index={5}>
            <div className="bg-card/80 backdrop-blur-2xl rounded-2xl p-4 border border-border/20 text-center space-y-1 group hover:bg-card transition-all">
              <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Wand2 size={16} />
              </div>
              <p className="text-xl font-serif font-bold text-primary">{toArabicNumber(nextLevelPoints - profile.points)}</p>
              <p className="text-[9px] font-bold text-primary/70 uppercase tracking-widest">{t("profile.pointsToNext")}</p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal index={3}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-3xl p-6 shadow-islamic border border-border/20 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">{t("profile.spiritualProgress")}</h3>
                <p className="text-[10px] text-primary/70 font-serif italic mt-0.5">{t("profile.keepReading")}</p>
              </div>
              <div className="text-left">
                <p className="text-xl font-serif font-bold text-gold">{toArabicNumber(Math.round(levelProgress))}%</p>
              </div>
            </div>
            
            <div className="h-3 w-full bg-primary/5 rounded-full overflow-hidden border border-primary/5 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-gold to-emerald-500 bg-[length:200%_100%] animate-shimmer rounded-full shadow-gold-glow transition-all duration-1000"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-[9px] font-bold text-primary/70 uppercase tracking-widest">
              <span>{t("profile.level")} {toArabicNumber(level)}</span>
              <span>{t("profile.level")} {toArabicNumber(level + 1)}</span>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal index={4}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-3xl p-6 shadow-islamic border border-border/20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">{t("profile.badgesTitle")}</h3>
                <p className="text-[10px] text-primary/70 font-serif italic mt-0.5">{t("profile.badgesDesc")}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <Trophy size={20} />
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {[
                { id: "early-bird", icon: <Sun className="w-6 h-6" />, label: t("profile.badges.earlyBird"), earned: true, color: "text-amber-500", bg: "bg-amber-500/10" },
                { id: "quran-lover", icon: <BookOpen className="w-6 h-6" />, label: t("profile.badges.quranLover"), earned: profile.totalAyahsRead >= 500, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { id: "tasbih-master", icon: <Sparkles className="w-6 h-6" />, label: t("profile.badges.tasbihMaster"), earned: profile.totalAthkarRecited >= 1000, color: "text-blue-500", bg: "bg-blue-500/10" },
                { id: "streak-7", icon: <Calendar className="w-6 h-6" />, label: t("profile.badges.sevenDayStreak"), earned: profile.daysActive >= 7, color: "text-rose-500", bg: "bg-rose-500/10" },
                { id: "khatma-1", icon: <Trophy className="w-6 h-6" />, label: t("profile.badges.firstKhatma"), earned: profile.totalJuzCompleted >= 1, color: "text-gold", bg: "bg-gold/10" },
                { id: "consistent", icon: <Shield className="w-6 h-6" />, label: t("profile.badges.consistent"), earned: profile.daysActive >= 30, color: "text-emerald-600", bg: "bg-emerald-600/10" },
                { id: "scholar", icon: <GraduationCap className="w-6 h-6" />, label: t("profile.badges.scholar"), earned: profile.totalAyahsRead >= 5000, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                { id: "juz-master", icon: <LayoutGrid className="w-6 h-6" />, label: t("profile.badges.juzMaster"), earned: profile.totalJuzCompleted >= 15, color: "text-primary", bg: "bg-primary/10" },
                { id: "juz-expert", icon: <Sparkles className="w-6 h-6" />, label: isAr ? "خاتم الأجزاء" : "Juz Expert", earned: profile.totalJuzCompleted >= 30, color: "text-purple-500", bg: "bg-purple-500/10" },
                { id: "tasbih-pro", icon: <RotateCcw className="w-6 h-6" />, label: t("profile.badges.tasbihPro"), earned: profile.totalAthkarRecited >= 10000, color: "text-cyan-500", bg: "bg-cyan-500/10" },
                { id: "legend", icon: <Sparkles className="w-6 h-6" />, label: t("profile.badges.spiritualLegend"), earned: level >= 15, color: "text-gold", bg: "bg-gold/15" },
                { id: "pure-heart", icon: <Heart className="w-6 h-6" />, label: t("profile.badges.pureHeart"), earned: profile.totalAthkarRecited >= 20000, color: "text-rose-600", bg: "bg-rose-600/10" },
                { id: "night-owl", icon: <Moon className="w-6 h-6" />, label: t("profile.badges.nightOwl"), earned: profile.totalAthkarRecited >= 500 && profile.totalAyahsRead >= 500, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                { id: "devout", icon: <Flame className="w-6 h-6" />, label: isAr ? "عابد مخلص" : "Devout", earned: level >= 20, color: "text-orange-500", bg: "bg-orange-500/10" },
              ].map((badge) => (
                <button 
                  key={badge.id} 
                  onClick={() => setSelectedBadge({
                    ...badge,
                    desc: isAr ? getBadgeDescAr(badge.id) : getBadgeDescEn(badge.id)
                  })}
                  className="flex flex-col items-center gap-2 group outline-none"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all relative ${
                    badge.earned 
                      ? `${badge.bg} ${badge.color.replace('text-', 'border-').replace('500', '500/30')} shadow-lg hover:scale-110` 
                      : "bg-muted/50 border-border/20 grayscale opacity-40 hover:opacity-60"
                  }`}>
                    {badge.icon}
                    {badge.earned && (
                      <div 
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-emerald-deep rounded-full flex items-center justify-center border-2 border-white dark:border-black"
                      >
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-widest text-center ${badge.earned ? "text-primary" : "text-muted-foreground"}`}>
                    {badge.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Badge Detail Modal */}
        {selectedBadge && (
          <div
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card rounded-[2.5rem] border border-border/20 shadow-2xl p-8 text-center space-y-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 pattern-islamic opacity-[0.03] pointer-events-none" />
              
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border-2 shadow-xl ${
                selectedBadge.earned ? `${selectedBadge.bg} ${selectedBadge.color.replace('text-', 'border-').replace('500', '500/30')}` : "bg-muted/50 border-border/20 grayscale"
              }`}>
                {selectedBadge.icon && React.cloneElement(selectedBadge.icon as React.ReactElement, { size: 40 })}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-primary">{selectedBadge.label}</h3>
                <div className="inline-flex px-3 py-1 rounded-full bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                  {selectedBadge.earned ? (isAr ? "مكتمل" : "EARNED") : (isAr ? "قيد التقدم" : "IN PROGRESS")}
                </div>
              </div>

              <p className="text-sm text-primary/70 font-serif italic leading-relaxed">
                {selectedBadge.desc}
              </p>

              <button 
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-serif font-bold hover:opacity-90 transition-opacity"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        )}

        <ScrollReveal index={5}>
          <section className="bg-card/80 backdrop-blur-2xl rounded-3xl p-6 shadow-islamic border border-border/20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">{t("profile.dailyQuestsTitle")}</h3>
                <p className="text-[10px] text-primary/70 font-serif italic mt-0.5">{t("profile.dailyQuestsDesc")}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: "read-page", label: t("profile.quests.readPage"), points: 150, completed: profile.totalPagesRead > 0 || (profile.lastQuestDate === new Date().toISOString().split("T")[0] && profile.completedQuests?.includes("read-page")) },
                { id: "tasbih-100", label: t("profile.quests.tasbih100"), points: 200, completed: profile.totalAthkarRecited > 100 || (profile.lastQuestDate === new Date().toISOString().split("T")[0] && profile.completedQuests?.includes("tasbih-100")) },
                { id: "check-prayer", label: t("profile.quests.checkPrayer"), points: 500, completed: profile.lastQuestDate === new Date().toISOString().split("T")[0] && profile.completedQuests?.includes("check-prayer") },
              ].map((quest) => (
                <div key={quest.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  quest.completed 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-primary/5 border-primary/5 hover:border-primary/20"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      quest.completed ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {quest.completed ? <Check size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div className={`${isAr ? 'text-right' : 'text-left'}`}>
                      <p className={`text-sm font-serif font-bold ${quest.completed ? "text-primary/60 line-through" : "text-primary"}`}>
                        {quest.label}
                      </p>
                      <p className="text-[9px] font-bold text-gold uppercase tracking-widest">+{toArabicNumber(quest.points)} XP</p>
                    </div>
                  </div>
                  
                  {!quest.completed && quest.id === "check-prayer" && (
                    <button 
                      onClick={() => {
                        completeQuest(quest.id, quest.points);
                        toast.success(isAr ? "تم إكمال المهمة! +500 XP" : "Quest completed! +500 XP");
                      }}
                      className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-500/20 transition-colors"
                    >
                      {isAr ? "تأكيد" : "Confirm"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-3">
          <ScrollReveal index={6}>
            <button
              onClick={() => setIsExpGuideOpen(true)}
              className="w-full p-6 rounded-3xl bg-card/80 backdrop-blur-2xl border border-border/20 shadow-islamic hover:bg-card transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold/60 group-hover:scale-110 transition-transform">
                  <Trophy size={20} />
                </div>
                <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <h3 className="font-serif text-lg font-bold text-primary">{t("profile.expGuide.title")}</h3>
                  <p className="text-[10px] text-primary/70 font-serif italic">{t("profile.expGuide.subtitle")}</p>
                </div>
              </div>
              <ChevronLeft size={20} className={`text-primary/20 group-hover:-translate-x-2 transition-transform ${i18n.language === 'en' ? 'rotate-180' : ''}`} />
            </button>
          </ScrollReveal>

          <ScrollReveal index={7}>
            <Link
              to="/how-to-use"
              className="w-full p-6 rounded-3xl bg-card/80 backdrop-blur-2xl border border-border/20 shadow-islamic hover:bg-card transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 group-hover:scale-110 transition-transform">
                  <HelpCircle size={20} />
                </div>
                <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <h3 className="font-serif text-lg font-bold text-primary">{t("profile.help")}</h3>
                  <p className="text-[10px] text-primary/70 font-serif italic">{t("profile.learnHowToUse")}</p>
                </div>
              </div>
              <ChevronLeft size={20} className={`text-primary/20 group-hover:-translate-x-2 transition-transform ${i18n.language === 'en' ? 'rotate-180' : ''}`} />
            </Link>
          </ScrollReveal>
        </div>
      </main>

      {/* Experience Guide Modal */}
      {isExpGuideOpen && (
        <div
          className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            className="w-full max-w-lg bg-card rounded-[2.5rem] border border-border/20 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 pattern-islamic opacity-[0.03] pointer-events-none" />
            
            <div className="flex justify-between items-center relative z-10">
              <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                <h3 className="text-2xl font-serif font-bold text-primary">{t("profile.expGuide.title")}</h3>
                <p className="text-xs text-primary/60 font-serif italic">{t("profile.expGuide.subtitle")}</p>
              </div>
              <button onClick={() => setIsExpGuideOpen(false)} className="p-2 rounded-xl hover:bg-primary/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 relative z-10 custom-scrollbar max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-3">
                <h4 className={`text-sm font-serif font-bold text-gold ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t("profile.expGuide.howToEarn")}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: t("profile.expGuide.dailyLogin"), points: 100, icon: <Calendar size={16} /> },
                    { label: t("profile.expGuide.juzRead"), points: 3000, icon: <Trophy size={16} /> },
                    { label: t("profile.expGuide.pageRead"), points: 150, icon: <BookOpen size={16} /> },
                    { label: t("profile.expGuide.ayahRead"), points: 10, icon: <Sparkles size={16} /> },
                    { label: t("profile.expGuide.athkarCount"), points: 2, icon: <RotateCcw size={16} /> },
                    { label: isAr ? "إكمال المهام اليومية" : "Daily Quest Completion", points: 500, icon: <Check size={16} /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="text-primary/40">{item.icon}</div>
                        <span className="text-sm font-serif text-primary">{item.label}</span>
                      </div>
                      <span className="text-sm font-serif font-bold text-gold">+{toArabicNumber(item.points)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className={`text-sm font-serif font-bold text-gold ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t("profile.expGuide.levels")}</h4>
                <p className={`text-xs text-primary/70 leading-relaxed font-serif italic ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t("profile.expGuide.levelsDesc")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className={`p-2 rounded-xl border flex items-center gap-2 ${level === i + 1 ? "bg-gold/10 border-gold/30" : "bg-primary/5 border-primary/5 opacity-60"}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${level === i + 1 ? "bg-gold text-emerald-deep" : "bg-primary/10 text-primary"}`}>
                        {toArabicNumber(i + 1)}
                      </div>
                      <span className="text-[10px] font-serif font-bold text-primary truncate">{t(`profile.levels.${i + 1}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={() => setIsExpGuideOpen(false)}
                className="w-full py-3 rounded-xl bg-emerald-deep text-gold font-serif font-bold text-base shadow-lg shadow-emerald-deep/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t("profile.exit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Overlay - Game Style */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
        >
          <div className="w-full max-w-3xl h-[75vh] bg-card rounded-3xl border border-border/20 shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            <div className="absolute inset-0 pattern-islamic opacity-[0.02] pointer-events-none" />
            
            {/* Sidebar Categories */}
            <div className={`w-full md:w-48 bg-primary/5 border-b md:border-b-0 ${i18n.language === 'ar' ? 'md:border-l' : 'md:border-r'} border-border/20 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar relative z-10`}>
              <div className={`hidden md:block mb-4 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-lg font-serif font-bold text-primary">{t("profile.settings")}</h2>
                <p className="text-[8px] font-bold text-primary/70 uppercase tracking-widest mt-0.5">{t("profile.controlMenu")}</p>
              </div>
              
              {SETTINGS_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as "appearance" | "notifications" | "language" | "account" | "offline" | "update")}
                    className={`flex items-center gap-2 px-2 py-2 rounded-xl transition-all whitespace-nowrap md:w-full ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-primary/60 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="font-serif font-bold text-[11px]">{cat.label}</span>
                  </button>
                );
              })}

              <div className="mt-auto hidden md:block">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/5 transition-all w-full ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse justify-end'}`}
                >
                  <X size={16} />
                  <span className="font-serif font-bold text-xs">{t("profile.exit")}</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 relative z-10 custom-scrollbar">
              <div className="md:hidden flex justify-between items-center mb-3">
                <h2 className="text-sm font-serif font-bold text-primary">
                  {SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.label}
                </h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-lg bg-primary/5 text-primary">
                  <X size={12} />
                </button>
              </div>

              <div className="space-y-5">
                {activeCategory === "language" && (
                  <section className="space-y-2">
                    <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h3 className="text-sm font-serif font-bold text-primary">{t("profile.appLanguage")}</h3>
                      <p className="text-[8px] text-primary/70">{t("profile.chooseLanguage")}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        { id: "ar", label: "العربية", sub: "اللغة الأم" },
                        { id: "en", label: "English", sub: "International" },
                      ].map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => i18n.changeLanguage(lang.id)}
                          className={`p-2 rounded-xl border-2 transition-all group ${i18n.language === 'ar' ? 'text-right' : 'text-left'} ${
                            i18n.language === lang.id
                              ? "border-accent bg-accent/5 text-primary shadow-lg"
                              : "border-primary/5 bg-primary/5 text-primary/40 hover:border-accent/30"
                          }`}
                        >
                          <p className="text-xs font-serif font-bold mb-0.5">{lang.label}</p>
                          <p className="text-[6px] font-bold uppercase tracking-widest opacity-50">{lang.sub}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {activeCategory === "offline" && (
                  <section className="space-y-4">
                    <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h3 className="text-sm font-serif font-bold text-primary">{t("profile.offlineManagement") || (isAr ? "إدارة المحتوى" : "Content Management")}</h3>
                      <p className="text-[8px] text-primary/70">{t("hub.offline.manageDesc") || (isAr ? "إدارة المحتوى والمساحة التخزينية" : "Manage offline content and storage")}</p>
                    </div>
                    <OfflineManager />

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h4 className="text-xs font-bold font-serif text-primary">
                            {isAr ? "التخزين الدائم (في ذاكرة الهاتف)" : "Persistent Storage (Phone Memory)"}
                          </h4>
                          <p className="text-[9px] text-primary/60 font-serif">
                            {isAr 
                              ? "منع النظام من حذف الصفحات والأصوات المحملة تلقائياً" 
                              : "Prevent system from auto-deleting downloaded pages and audio"}
                          </p>
                        </div>
                        <button
                          onClick={togglePersistence}
                          className={`w-11 h-6 rounded-full transition-all flex items-center p-1 shadow-inner ${
                            isPersistent ? "bg-emerald-deep justify-end" : "bg-primary/10 justify-start"
                          }`}
                        >
                          <div 
                            className={`w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-300 ${isPersistent ? "" : ""}`} 
                          />
                        </button>
                      </div>
                      <div className={`p-2 rounded-lg bg-gold/10 border border-gold/20 flex gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                        <AlertCircle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                        <p className="text-[8px] text-primary/80 font-serif leading-relaxed">
                          {isAr 
                            ? "هذه الخاصية تطلب من المتصفح والاندرويد اعتبار بيانات التطبيق أساسية وعدم حذفها لتوفير المساحة. سيتم تخزين البيانات في مجلد التطبيق الخاص بجهازك."
                            : "This feature asks the browser and Android to treat app data as essential. Data is stored in the app's private folder on your device."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border/40">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                          <Music className="w-5 h-5" />
                        </div>
                        <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h3 className="text-sm font-bold font-serif text-foreground">{t("recitations.audioLibrary") || "مكتبة التلاوات"}</h3>
                          <p className="text-[10px] text-muted-foreground font-serif">{t("hub.offline.audioDesc") || "إدارة تحميل التلاوات للاستماع بدون اتصال"}</p>
                        </div>
                      </div>
                      <AudioDownloadManager />
                    </div>
                  </section>
                )}

                {activeCategory === "update" && (
                  <section className="space-y-3">
                    <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h3 className="text-sm font-serif font-bold text-primary">{t("settings.update.system") || (isAr ? "تحديثات النظام" : "App Updates")}</h3>
                      <p className="text-[8px] text-primary/70">{t("settings.update.info")}</p>
                    </div>
                    <UpdateManager />
                  </section>
                )}

                {activeCategory === "appearance" && (
                  <section className="space-y-4">
                    <div className="space-y-2">
                      <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h3 className="text-sm font-serif font-bold text-primary">{t("profile.appTheme")}</h3>
                        <p className="text-[8px] text-primary/70">{t("profile.chooseTheme")}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {THEME_OPTIONS.map(opt => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setTheme(opt.id)}
                              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                                theme === opt.id
                                  ? "border-accent bg-accent/5 shadow-lg"
                                  : "border-primary/5 bg-primary/5 hover:border-accent/30"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-full ${opt.preview} border-2 border-card shadow-md flex items-center justify-center text-primary`}>
                                <Icon size={14} />
                              </div>
                              <span className="font-serif font-bold text-[9px] text-primary">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h3 className="text-sm font-serif font-bold text-primary">{t("profile.fontSize")}</h3>
                        <p className="text-[8px] text-primary/70">{t("profile.adjustFontSize")}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {FONT_SIZES.map(size => (
                          <button
                            key={size.id}
                            onClick={() => setFontSize(size.value)}
                            className={`p-2 rounded-xl border-2 transition-all font-serif font-bold text-[9px] ${
                              fontSize === size.value
                                ? "border-accent bg-accent/5 text-primary shadow-lg"
                                : "border-primary/5 bg-primary/5 text-primary/40 hover:border-accent/30"
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {activeCategory === "notifications" && (
                  <section className="space-y-4">
                    <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h3 className="text-sm font-serif font-bold text-primary">{t("profile.notifReminders")}</h3>
                      <p className="text-[8px] text-primary/70">{t("profile.manageReminders")}</p>
                    </div>
                    
                    {!isSupported ? (
                      <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-center">
                        <p className="font-serif font-bold text-[10px]">{t("profile.notifNotSupported")}</p>
                      </div>
                    ) : (
                      <>
                        {permissionState !== "granted" && (
                          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                            <BellOff size={20} className="text-destructive shrink-0" />
                            <div className="flex-1">
                              <p className="text-[11px] text-destructive font-serif font-bold">{t("profile.notifPermissionRequired")}</p>
                              <p className="text-[10px] text-destructive/80 font-serif">{t("profile.notifPermissionDesc")}</p>
                            </div>
                            <button 
                              onClick={() => requestPermission()}
                              className="px-3 py-1.5 bg-destructive text-white text-[10px] font-serif rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-destructive/20"
                            >
                              {t("profile.enableNotif")}
                            </button>
                          </div>
                        )}

                        <div className="space-y-2">
                          {[
                            { id: "athkarMorning", label: t("profile.athkarMorning"), timeKey: "athkarMorningTime" as const },
                            { id: "athkarEvening", label: t("profile.athkarEvening"), timeKey: "athkarEveningTime" as const },
                            { id: "quranReading", label: t("profile.quranReading"), timeKey: "quranReadingTime" as const },
                            { id: "dailyVerse", label: t("profile.dailyVerse", "Daily Verse"), timeKey: "dailyVerseTime" as const },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/5 group hover:bg-primary/10 transition-all border-b-primary/10">
                              <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                <p className="font-serif text-[12px] font-bold text-primary">{item.label}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock size={10} className="text-primary/40" />
                                  <input
                                    type="time"
                                    value={notifSettings[item.timeKey]}
                                    onChange={(e) => updateNotif({ [item.timeKey]: e.target.value })}
                                    className="text-[9px] font-bold font-serif text-primary/70 bg-transparent outline-none cursor-pointer hover:text-gold transition-colors"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => updateNotif({ [item.id]: !notifSettings[item.id as keyof typeof notifSettings] })}
                                className={`w-11 h-6 rounded-full transition-all flex items-center p-1 shadow-inner ${
                                  notifSettings[item.id as keyof typeof notifSettings] ? "bg-emerald-deep justify-end" : "bg-primary/10 justify-start"
                                }`}
                              >
                                <div 
                                  className={`w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-300`} 
                                />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-primary/5">
                          <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <h4 className="text-[11px] font-serif font-bold text-primary">{t("profile.periodicReminders")}</h4>
                            <p className="text-[8px] text-primary/70">{t("profile.periodicRemindersDesc")}</p>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-xl bg-primary/5 border border-primary/5">
                            <span className="font-serif text-[11px] font-bold text-primary">{t("profile.periodicReminders")}</span>
                            <button
                              onClick={() => handleUpdatePeriodic({ enabled: !periodicSettings.enabled })}
                              className={`w-9 h-5 rounded-full transition-all flex items-center p-1 ${
                                periodicSettings.enabled ? "bg-emerald-deep justify-end" : "bg-primary/10 justify-start"
                              }`}
                            >
                              <div 
                                className="w-3 h-3 rounded-full bg-white shadow-lg transition-all duration-300" 
                              />
                            </button>
                          </div>

                          {periodicSettings.enabled && (
                            <div className="space-y-3 p-3 rounded-xl bg-primary/5 border border-primary/5">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-serif font-bold text-primary">{t("profile.reminderInterval")}</span>
                                <span className="text-[10px] font-bold text-gold">{toArabicNumber(periodicSettings.interval)}</span>
                              </div>
                              <Slider
                                value={[periodicSettings.interval]}
                                min={5}
                                max={120}
                                step={5}
                                onValueChange={([val]) => handleUpdatePeriodic({ interval: val })}
                                className="py-2"
                              />
                              <div className="flex justify-between text-[8px] text-primary/40 font-bold">
                                <span>{toArabicNumber(5)}</span>
                                <span>{toArabicNumber(120)}</span>
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t border-primary/5 space-y-3">
                            <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <h4 className="text-[11px] font-serif font-bold text-primary">{t("profile.communityNudges")}</h4>
                              <p className="text-[8px] text-primary/70">{t("profile.communityNudgesDesc")}</p>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl bg-primary/5 border border-primary/5">
                              <span className="font-serif text-[11px] font-bold text-primary">{t("profile.enableCommunityNudges")}</span>
                              <button
                                onClick={toggleCommunityNotifs}
                                className={`w-9 h-5 rounded-full transition-all flex items-center p-1 ${
                                  communityNotifsEnabled ? "bg-emerald-deep justify-end" : "bg-primary/10 justify-start"
                                }`}
                              >
                                <div 
                                  className="w-3 h-3 rounded-full bg-white shadow-lg transition-all duration-300" 
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-1.5 space-y-2">
                          <button
                            onClick={() => {
                              unlockAudio();
                              testPrayerNotification("Asr");
                              toast.info(t("profile.testNotifSent"));
                            }}
                            className="w-full h-10 rounded-xl bg-accent/10 text-accent border border-accent/20 font-serif font-bold text-[11px] hover:bg-accent/20 transition-all flex items-center justify-center gap-2"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            {t("profile.testNotification")}
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                testNotification("athkarMorning");
                                toast.info(t("profile.testNotifSent"));
                              }}
                              className="h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 font-serif font-bold text-[9px] hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                            >
                              <Sun className="w-3 h-3" />
                              {t("profile.testMorningNotif")}
                            </button>
                            <button
                              onClick={() => {
                                testNotification("athkarEvening");
                                toast.info(t("profile.testNotifSent"));
                              }}
                              className="h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 font-serif font-bold text-[9px] hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                            >
                              <Moon className="w-3 h-3" />
                              {t("profile.testEveningNotif")}
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              testNotification("dailyVerse");
                              toast.info(t("profile.testNotifSent"));
                            }}
                            className="w-full h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 font-serif font-bold text-[10px] hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {t("profile.testQuranNotif") || (isAr ? "تجربة آية اليوم" : "Test Daily Verse")}
                          </button>

                          <button
                            onClick={() => {
                              testNotification("quranReading");
                              toast.info(t("profile.testNotifSent"));
                            }}
                            className="w-full h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 font-serif font-bold text-[10px] hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {isAr ? "تجربة ورد القراءة" : "Test Reading Reminder"}
                          </button>
                        </div>
                      </>
                    )}
                  </section>
                )}

                {activeCategory === "account" && (
                  <section className="space-y-4">
                    <div className={`space-y-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h3 className="text-sm font-serif font-bold text-primary">{t("profile.accountManagement") || (isAr ? "إدارة الحساب" : "Account Management")}</h3>
                      <p className="text-[8px] text-primary/70">{t("profile.syncDesc") || "Sync your progress across devices"}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/5 space-y-4">
                      {auth.currentUser ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <img src={auth.currentUser.photoURL || "/avatar-man-1.svg"} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                            <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <p className="text-xs font-bold font-serif text-primary/90">{auth.currentUser.displayName}</p>
                              <p className="text-[10px] text-primary/60 font-serif">{auth.currentUser.email}</p>
                            </div>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => navigate("/admin")}
                              className="w-full py-2 bg-accent/10 text-accent rounded-xl text-xs font-bold font-serif hover:bg-accent/20 transition-all flex items-center justify-center gap-2"
                            >
                              <ShieldCheck size={14} />
                              {isAr ? "لوحة التحكم" : "Admin Panel"}
                            </button>
                          )}
                          <button
                            onClick={() => signOut(auth)}
                            className="w-full py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold font-serif hover:bg-red-500/20 transition-all"
                          >
                            {i18n.language === 'ar' ? "تسجيل الخروج" : (t("profile.logout") || "Sign Out")}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 text-center">
                          <p className="text-xs text-primary/70 font-serif leading-relaxed">
                            {t("profile.loginPrompt")}
                          </p>
                          <button
                            onClick={() => setShowAuthModal(true)}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold font-serif shadow-lg shadow-primary/10 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                          >
                            <Sparkles size={14} />
                            {isAr ? "تسجيل الدخول / إنشاء حساب" : "Sign In / Register"}
                          </button>
                          <AuthModal
                            isOpen={showAuthModal}
                            onClose={() => setShowAuthModal(false)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link 
                        to="/privacy" 
                        onClick={() => setIsSettingsOpen(false)}
                        className="flex items-center gap-2 text-[10px] text-primary/40 hover:text-primary transition-colors justify-center"
                      >
                        <Shield size={10} />
                        <span className="font-serif">
                          {i18n.language === 'ar' ? "سياسة الخصوصية والأمان" : "Privacy & Security Policy"}
                        </span>
                      </Link>
                    </div>

                    <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary to-emerald-deep text-white overflow-hidden group">
                      <div className="absolute inset-0 pattern-islamic opacity-10" />
                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 backdrop-blur-md border border-primary/20 flex items-center justify-center overflow-hidden">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-serif font-bold text-white">{profile.name}</h4>
                          <p className="text-[7px] text-white/60 uppercase tracking-widest mt-0.5">{levelName}</p>
                        </div>
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="px-2.5 py-1 rounded-full bg-gold text-primary font-bold text-[7px] uppercase tracking-widest hover:bg-gold/90 transition-all"
                        >
                          {t("profile.editProfile")}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        onClick={resetAll}
                        className="p-2.5 rounded-xl border-2 border-red-500/20 text-red-500 font-serif font-bold hover:bg-red-500/5 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Trash2 size={12} />
                          </div>
                          <span className="text-xs">{t("profile.factoryReset")}</span>
                        </div>
                        <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-700" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/5 space-y-1.5">
                      <h4 className="font-serif font-bold text-primary text-[9px] uppercase tracking-widest opacity-80">{t("profile.advancedStats")}</h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-1.5 rounded-lg bg-card border border-border/20">
                          <p className="text-[6px] font-bold text-primary/70 uppercase tracking-widest">{t("profile.joinedDate")}</p>
                          <p className="font-serif font-bold text-primary mt-0.5 text-[9px]">{formatDate(profile.joinedDate, isAr)}</p>
                        </div>
                        <div className="p-1.5 rounded-lg bg-card border border-border/20">
                          <p className="text-[6px] font-bold text-primary/70 uppercase tracking-widest">{t("profile.totalPoints")}</p>
                          <p className="font-serif font-bold text-primary mt-0.5 text-[9px]">{i18n.language === 'ar' ? toArabicNumber(profile.points) : profile.points}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal - Game Style */}
      {isEditingProfile && (
        <div
          className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            className="w-full max-w-md bg-card rounded-[2.5rem] border border-border/20 shadow-2xl p-6 space-y-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 pattern-islamic opacity-[0.03] pointer-events-none" />
            
            <div className="flex justify-between items-center relative z-10">
              <h3 className="text-xl font-serif font-bold text-primary">{t("profile.editProfile")}</h3>
              <button onClick={() => setIsEditingProfile(false)} className="p-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold text-primary/70 uppercase tracking-widest px-2 block ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t("profile.name")}</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full p-3 rounded-xl bg-primary/5 border border-primary/10 focus:border-accent outline-none font-serif text-base transition-all ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}
                  placeholder="..."
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold text-primary/70 uppercase tracking-widest px-2 block ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{isAr ? "الجنس" : "Gender"}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'male' as const, label: isAr ? 'ذكر' : 'Male', icon: <User size={16} className="text-blue-500" /> },
                    { id: 'female' as const, label: isAr ? 'أنثى' : 'Female', icon: <User size={16} className="text-rose-500" /> }
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => profile.gender === 'unspecified' && updateProfile({ gender: g.id })}
                      disabled={profile.gender !== 'unspecified'}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        profile.gender === g.id
                          ? "border-accent bg-accent/5 text-primary shadow-lg"
                          : "border-primary/5 bg-primary/5 text-primary/40 hover:border-accent/30"
                      } ${profile.gender !== 'unspecified' ? "cursor-not-allowed opacity-80" : ""}`}
                    >
                      {g.icon}
                      <span className="font-serif font-bold text-xs">{g.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[8px] text-muted-foreground px-2 mt-1">
                  {isAr 
                    ? "يتم استخدام الجنس لتحديد غرفة الدردشة المناسبة لك." 
                    : "Gender is used to determine the appropriate chat room for you."}
                </p>
              </div>

              <div className="space-y-3">
                <label className={`text-[9px] font-bold text-primary/70 uppercase tracking-widest px-2 block ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t("profile.chooseAvatar")}</label>
                
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="relative">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-accent" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                        <User size={32} className="text-primary/50" />
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-deep text-gold font-serif font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      <Upload size={16} />
                      <span>{isUploadingAvatar ? (t("profile.uploading") || "Uploading...") : (t("profile.uploadPicture") || "Upload Picture")}</span>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    "/avatar-man-1.svg",
                    "/avatar-woman-1.svg",
                    "/avatar-man-2.svg",
                    "/avatar-woman-2.svg",
                  ].map((url, i) => (
                    <button
                      key={i}
                      onClick={() => updateProfile({ avatar: url })}
                      className={`aspect-square rounded-xl border-2 transition-all overflow-hidden bg-primary/5 ${
                        profile.avatar === url ? "border-accent scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-contain p-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={handleUpdateProfile}
                className="w-full py-3 rounded-xl bg-emerald-deep text-gold font-serif font-bold text-base shadow-lg shadow-emerald-deep/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t("profile.saveChanges")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
