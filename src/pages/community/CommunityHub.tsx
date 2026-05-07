import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, limit, onSnapshot, where } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import {
  Users,
  Trophy,
  Zap,
  Sparkles,
  Bell,
  Activity as ActivityIcon,
  ShieldCheck,
  BookOpen,
  HeartHandshake,
  ClipboardCheck,
  Tags,
  Flag,
  CalendarDays,
  UserPlus,
  Search,
  ArrowRight,
  Star,
  Loader2,
  MessageSquare,
  BookMarked,
  Heart,
  GraduationCap
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuranHeader from "@/components/QuranHeader";
import { useUser } from "@/contexts/UserContext";
import { toArabicNumber } from "@/data/quranData";
import FriendsManager from "./FriendsManager";
import { syncService } from "@/services/syncService";
import {
  communityService,
  CommunityReport,
  Notification as CommunityNotification,
  ReportCategory,
} from "@/services/communityService";
import { toast } from "sonner";
import ActivityFeed from "@/components/community/ActivityFeed";
import SpiritualDuels from "@/components/community/SpiritualDuels";
import NotificationsModal from "@/components/community/NotificationsModal";
import Leaderboard from "@/components/community/Leaderboard";
import EpicQuests from "@/components/community/EpicQuests";
import GrowthTree from "@/components/community/GrowthTree";
import CommunityChat from "@/components/community/CommunityChat";
import GroupKhatma from "@/components/community/GroupKhatma";
import ReadingCirclesComponent from "@/components/community/ReadingCirclesComponent";
import PrayerCirclesComponent from "@/components/community/PrayerCirclesComponent";
import KnowledgeSessionsComponent from "@/components/community/KnowledgeSessionsComponent";
import CommunityPosts from "@/components/community/CommunityPosts";
import AdminPanel from "@/components/community/AdminPanel";
import { invitationService, CommunityInvitation } from "@/services/invitationService";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CommunityTab = "today" | "posts" | "chat" | "feed" | "friends" | "khatma" | "circles" | "sessions" | "prayer" | "duels" | "leaderboard" | "quests" | "admin";

type CommunityAction = {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: React.ElementType;
  accent: string;
  action: () => void;
  actionLabel: string;
};

const formatCount = (value: number, isAr: boolean) => (
  isAr ? toArabicNumber(value) : value.toLocaleString()
);

const CommunityHub = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const { profile, level, isAdmin } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<CommunityTab>((searchParams.get("tab") as CommunityTab) || "today");
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [invitations, setInvitations] = useState<CommunityInvitation[]>([]);
  const [readingCircles, setReadingCircles] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportCategory, setReportCategory] = useState<ReportCategory>("abuse");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bookmark, setBookmark] = useState<any>(null);

  useEffect(() => {
    const loadBookmark = async () => {
      const data = await syncService.loadData("quran-bookmark", null);
      setBookmark(data);
    };
    loadBookmark();
  }, []);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsubNotifs = communityService.subscribeToNotifications(profile.uid, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    const unsubInvites = invitationService.subscribeToInvitations(profile.uid, (invites) => {
      setInvitations(invites);
    });

    // Listen for reading circles
    const qCircles = query(collection(db, "reading_circles"), limit(5));
    const unsubCircles = onSnapshot(qCircles, (snap) => {
      setReadingCircles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen for knowledge sessions
    const qSessions = query(collection(db, "knowledge_sessions"), where("status", "==", "ongoing"), limit(5));
    const unsubSessions = onSnapshot(qSessions, (snap) => {
      setActiveSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubNotifs();
      unsubInvites();
      unsubCircles();
      unsubSessions();
    };
  }, [profile?.uid]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = communityService.subscribeToCommunityReports(setCommunityReports);
    return () => unsub();
  }, [isAdmin]);

  if (!profile?.uid) {
    return (
      <div className="min-h-screen bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <QuranHeader />
        <div className="pt-20 pb-32 flex flex-col items-center justify-center text-center px-6 min-h-[85vh]">
          <div className="bg-primary/5 p-5 rounded-full mb-6 text-primary">
            <Users size={56} />
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mb-4">{isAr ? "مجتمع القرآن" : "Quran Community"}</h1>
          <p className="text-muted-foreground text-base max-w-sm mb-10 leading-relaxed">
            {isAr 
              ? "انضم إلى إخوتك في تلاوة القرآن، شارك في الختمات الجماعية، وتنافس في الخيرات." 
              : "Join your siblings in reciting the Quran, participate in group Khatmas, and compete in good deeds."}
          </p>
          <Button
            size="lg"
            className="w-full max-w-xs h-14 text-base font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
            onClick={() => setShowAuthModal(true)}
          >
            {isAr ? "تسجيل الدخول / حساب جديد" : "Sign In / Sign Up"}
          </Button>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayPages = profile.dailyReadingHistory?.find(day => day.date === today)?.pages || 0;
  const completedQuests = profile.completedQuests?.length || 0;
  const friendCount = profile.friendCount || profile.friendIds?.length || 0;
  const readinessScore = [todayPages > 0, friendCount > 0, completedQuests > 0, unreadCount === 0].filter(Boolean).length;

  const tabs: { id: CommunityTab; label: string; icon: React.ElementType }[] = [
    { id: "today", label: isAr ? "اليوم" : "Today", icon: CalendarDays },
    { id: "posts", label: isAr ? "منشورات" : "Posts", icon: MessageSquare },
    { id: "chat", label: isAr ? "المحادثة" : "Chat", icon: MessageSquare },
    { id: "khatma", label: isAr ? "الختمة" : "Khatma", icon: BookMarked },
    { id: "circles", label: isAr ? "الحلقات" : "Circles", icon: BookOpen },
    { id: "sessions", label: isAr ? "الجلسات" : "Sessions", icon: GraduationCap },
    { id: "prayer", label: isAr ? "الدعاء" : "Dua", icon: Heart },
    { id: "feed", label: isAr ? "الخلاصة" : "Feed", icon: ActivityIcon },
    { id: "friends", label: isAr ? "الأصدقاء" : "Friends", icon: Users },
    { id: "duels", label: isAr ? "التحديات" : "Duels", icon: Zap },
    { id: "leaderboard", label: isAr ? "المتصدرون" : "Leaderboard", icon: Trophy },
    { id: "quests", label: isAr ? "المهمات" : "Quests", icon: Sparkles },
  ];

  if (isAdmin) {
    tabs.push({ id: "admin", label: isAr ? "المشرف" : "Admin Panel", icon: ShieldCheck });
  }

  const todayActions: CommunityAction[] = [
    {
      id: "quran-checkin",
      title: isAr ? "ثبّت ورد القرآن اليوم" : "Log today's Quran progress",
      description: isAr
        ? "حوّل القراءة اليومية إلى إنجاز ظاهر في المجتمع دون ضغط أو رياء."
        : "Turn daily reading into a gentle community milestone without pressure.",
      meta: isAr ? `${formatCount(todayPages, isAr)} صفحة اليوم` : `${formatCount(todayPages, isAr)} pages today`,
      icon: BookOpen,
      accent: "bg-emerald-500/10 text-emerald-600",
      action: () => {
        if (bookmark) {
          navigate(`/juz/${bookmark.juz}#page-${bookmark.page}`);
        } else {
          navigate("/juz/1");
        }
      },
      actionLabel: bookmark 
        ? (isAr ? `استكمل من صـ ${toArabicNumber(bookmark.page)}` : `Resume from p. ${bookmark.page}`)
        : (isAr ? "افتح المصحف" : "Open Quran"),
    },
    {
      id: "recommended-chat",
      title: isAr ? "شارك في المحادثة" : "Join the conversation",
      description: isAr
        ? "تواصل مع المسلمين حول العالم في محادثة مباشرة يسودها الأدب والإخاء."
        : "Connect with Muslims worldwide in a live chat built on adab and brotherhood.",
      meta: isAr ? "دردشة مباشرة" : "Live Chat",
      icon: MessageSquare,
      accent: "bg-gold/10 text-gold",
      action: () => setActiveTab("chat"),
      actionLabel: isAr ? "افتح المحادثة" : "Open Chat",
    },
    {
      id: "recommended-circle",
      title: isAr ? "انضم إلى حلقة صغيرة" : "Join a small circle",
      description: isAr
        ? "الحلقات الصغيرة تزيد الالتزام وتسهّل المتابعة مع الأصدقاء أو العائلة."
        : "Small circles create accountability with friends, family, or learners like you.",
      meta: isAr ? "قراءة • دعاء • أذكار" : "Reading • Dua • Dhikr",
      icon: HeartHandshake,
      accent: "bg-gold/10 text-gold",
      action: () => setActiveTab("circles"),
      actionLabel: isAr ? "استكشف الحلقات" : "Explore circles",
    },
    {
      id: "recommended-session",
      title: isAr ? "نظم مجلساً علمياً" : "Organize a learning session",
      description: isAr
        ? "اجتمع مع الآخرين لمدارسة العلم أو مراجعة الحفظ في جلسة تفاعلية."
        : "Gather with others to study knowledge or review memorization in an interactive session.",
      meta: isAr ? "تعلم جماعي" : "Group Learning",
      icon: GraduationCap,
      accent: "bg-purple-500/10 text-purple-600",
      action: () => setActiveTab("sessions"),
      actionLabel: isAr ? "استكشف الجلسات" : "Explore sessions",
    },
    {
      id: "friend-milestone",
      title: isAr ? "ابنِ صحبة صالحة" : "Build supportive friendships",
      description: isAr
        ? "ابدأ بطلب صداقة أو تحدٍ خفيف لتشجيع بعضكم على الخير."
        : "Send a friend request or start a lightweight challenge for mutual encouragement.",
      meta: isAr ? `${formatCount(friendCount, isAr)} صديق` : `${formatCount(friendCount, isAr)} friends`,
      icon: UserPlus,
      accent: "bg-blue-500/10 text-blue-600",
      action: () => setActiveTab("friends"),
      actionLabel: isAr ? "اذهب للأصدقاء" : "Find friends",
    },
  ];

  const worshipTags = [
    { label: isAr ? "القرآن" : "Quran", path: "/juz/1" },
    { label: isAr ? "الحفظ" : "Hifz", path: "/memorization" },
    { label: isAr ? "الدعاء" : "Dua", path: "/dua-library" },
    { label: isAr ? "الأذكار" : "Adhkar", path: "/athkar" },
    { label: isAr ? "القيام" : "Qiyam", path: "/qiyam" },
    { label: isAr ? "الصدقة" : "Sadaqah", path: "/sadaqah-logger" },
    { label: isAr ? "الختمة" : "Khatma", path: "/khatma-jamaaiya" },
    { label: isAr ? "الجلسات" : "Sessions", path: "/community/hub?tab=sessions" },
    { label: isAr ? "رمضان" : "Ramadan", path: "/ramadan" },
  ];

  const guidelines = [
    isAr ? "الإخلاص والأدب قبل النقاط والمراكز." : "Sincerity and adab come before points and rank.",
    isAr ? "احمِ خصوصيتك وخصوصية الآخرين ولا تنشر معلومات حساسة." : "Protect your privacy and never share sensitive information about others.",
    isAr ? "لا تُصدر فتوى أو نصيحة دينية متخصصة دون أهلية واضحة." : "Do not issue specialized religious rulings without clear qualification.",
    isAr ? "بلّغ عن الإساءة أو التضليل أو الرسائل التجارية غير المناسبة." : "Report abuse, misinformation, harassment, or inappropriate solicitation.",
  ];

  const reportCategories: { id: ReportCategory; label: string; helper: string }[] = [
    {
      id: "abuse",
      label: isAr ? "إساءة أو مضايقة" : "Abuse or harassment",
      helper: isAr ? "خطاب جارح، تهديد، تنمر، أو سلوك غير لائق." : "Harmful speech, threats, bullying, or inappropriate behavior.",
    },
    {
      id: "misinformation",
      label: isAr ? "معلومة دينية مضللة" : "Religious misinformation",
      helper: isAr ? "ادعاءات شرعية غير موثقة أو فتوى بلا أهلية." : "Unsupported religious claims or rulings without qualification.",
    },
    {
      id: "privacy",
      label: isAr ? "خصوصية أو بيانات شخصية" : "Privacy or personal data",
      helper: isAr ? "نشر بيانات شخصية أو صور أو تفاصيل حساسة." : "Personal information, images, or sensitive details were shared.",
    },
    {
      id: "spam",
      label: isAr ? "رسائل مزعجة أو تجارية" : "Spam or solicitation",
      helper: isAr ? "روابط مزعجة، إعلانات، أو طلبات مالية غير مناسبة." : "Spam links, ads, or inappropriate commercial/financial requests.",
    },
    {
      id: "other",
      label: isAr ? "سبب آخر" : "Other concern",
      helper: isAr ? "أي مشكلة أخرى تحتاج مراجعة المشرفين." : "Anything else that needs moderator review.",
    },
  ];

  const openReports = communityReports.filter(report => report.status === "new" || report.status === "reviewing");

  const adminMetrics = [
    { label: isAr ? "تنشيط الأعضاء" : "Activation", value: `${formatCount(readinessScore, isAr)}/4` },
    { label: isAr ? "التنبيهات غير المقروءة" : "Unread alerts", value: formatCount(unreadCount, isAr) },
    { label: isAr ? "البلاغات المفتوحة" : "Open reports", value: formatCount(openReports.length, isAr) },
    { label: isAr ? "المهمات المكتملة" : "Quest completions", value: formatCount(completedQuests, isAr) },
  ];

  const handleSubmitReport = async () => {
    if (!profile.uid) {
      toast.error(isAr ? "سجّل الدخول لإرسال البلاغ" : "Sign in to submit a report");
      return;
    }

    if (reportDetails.trim().length < 12) {
      toast.error(isAr ? "اكتب وصفاً أوضح للبلاغ" : "Please add a clearer report description");
      return;
    }

    setIsSubmittingReport(true);
    try {
      await communityService.submitCommunityReport({
        reporterId: profile.uid,
        reporterName: profile.name,
        category: reportCategory,
        details: reportDetails.trim(),
        source: "community_hub",
        locale: i18n.language,
      });
      toast.success(isAr ? "تم إرسال البلاغ للمراجعة" : "Report sent for moderator review");
      setReportDetails("");
      setReportCategory("abuse");
      setShowReportDialog(false);
    } catch (error) {
      console.error("Community report failed:", error);
      toast.error(isAr ? "تعذر إرسال البلاغ" : "Could not submit the report");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader
        title={isAr ? "مركز المجتمع" : "Community Hub"}
        subtitle={isAr ? "تواصل وتنافس في الخير" : "Connect and compete in goodness"}
        variant="compact"
        showBack
      />

      <main className="container max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        {/* User Stats Summary Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 flex flex-col md:flex-row bg-card/95 backdrop-blur-xl border border-border/40 rounded-[2.5rem] p-6 shadow-xl items-center justify-between gap-6 overflow-hidden">
            <div className="flex items-center gap-4 min-w-max">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Trophy className="text-gold" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{isAr ? "النقاط" : "Points"}</p>
                <p className="text-lg font-bold text-primary">{formatCount(profile.points, isAr)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 min-w-max">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <ActivityIcon className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{isAr ? "المستوى" : "Level"}</p>
                <p className="text-lg font-bold text-emerald-600">{formatCount(level, isAr)}</p>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-border/40" />

            <button
              className="relative p-4 rounded-[2rem] bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 flex items-center gap-3"
              onClick={() => setShowNotifications(true)}
            >
              <Bell size={20} className="text-primary" />
              <span className="text-xs font-bold text-primary/80">{isAr ? "التنبيهات" : "Notifications"}</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  {formatCount(unreadCount, isAr)}
                </span>
              )}
            </button>
          </div>

          <div className="lg:col-span-4">
            <GrowthTree />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-card/40 backdrop-blur-md rounded-3xl p-1.5 border border-border/20 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold font-serif transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-deep shadow-lg text-gold"
                  : "text-primary/40 hover:text-primary/60"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-card/40 backdrop-blur-md border border-border/20 rounded-[2.5rem] min-h-[500px] shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 pattern-islamic opacity-[0.03] pointer-events-none" />

          <div className="relative z-10">
            {activeTab === "today" && (
              <div className="p-6 space-y-8">
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-[2rem] bg-gradient-to-br from-emerald-deep to-primary p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 pattern-islamic opacity-10" />
                    <div className="relative z-10 space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
                        <CalendarDays size={14} />
                        {isAr ? "اليوم في المجتمع" : "Today in the Community"}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif font-bold">
                        {isAr ? "ابدأ بخطوة نافعة ثم شارك الخير بلطف" : "Start with one beneficial action, then share goodness gently"}
                      </h2>
                      <p className="text-sm leading-relaxed text-white/70 max-w-2xl">
                        {isAr
                          ? "هذه اللوحة تجمع المهام اليومية، الحلقات المقترحة، طلبات الدعم، ومبادئ السلامة حتى يكون المجتمع معيناً على العبادة لا مصدراً للتشتت."
                          : "This panel brings together daily tasks, recommended circles, support prompts, and safety principles so the community supports worship instead of distraction."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-card border border-border/40 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{isAr ? "جاهزية اليوم" : "Daily readiness"}</p>
                        <p className="text-3xl font-bold text-primary">{formatCount(readinessScore, isAr)}/4</p>
                      </div>
                      <ClipboardCheck className="text-emerald-500" size={32} />
                    </div>
                    <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${readinessScore * 25}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isAr
                        ? "اقرأ، تواصل، تابع مهمة، ثم صفّر التنبيهات المهمة."
                        : "Read, connect, continue a quest, then clear meaningful notifications."}
                    </p>
                  </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayActions.map((item) => (
                    <article key={item.id} className="rounded-[2rem] bg-card border border-border/40 p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex gap-4 items-start">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.accent}`}>
                          <item.icon size={22} />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-serif font-bold text-primary">{item.title}</h3>
                              <span className="text-[9px] px-2 py-1 rounded-full bg-primary/5 text-muted-foreground font-bold whitespace-nowrap">{item.meta}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.description}</p>
                          </div>
                          <button onClick={item.action} className="inline-flex items-center gap-2 text-xs font-bold text-gold hover:text-primary transition-colors">
                            {item.actionLabel}
                            <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-[2rem] bg-card border border-border/40 p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                        <Search size={22} />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-primary">{isAr ? "اكتشف حسب هدفك" : "Discover by goal"}</h3>
                        <p className="text-xs text-muted-foreground">{isAr ? "وسوم أساسية لتنظيم المحتوى والحلقات لاحقاً." : "Core tags that organize content, circles, and recommendations."}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {worshipTags.map(tag => (
                        <button
                          key={tag.path + tag.label}
                          onClick={() => navigate(tag.path)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 px-3 py-2 text-xs font-bold text-primary/70 transition-all"
                        >
                          <Tags size={12} />
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-card border border-border/40 p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
                          <ShieldCheck size={22} />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-primary">{isAr ? "الأمان وآداب المجتمع" : "Safety and community adab"}</h3>
                          <p className="text-xs text-muted-foreground">{isAr ? "قواعد مختصرة قبل توسيع الخلاصة والنقاشات." : "Lightweight guidelines before scaling posts and discussions."}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowReportDialog(true)} className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all" aria-label={isAr ? "إبلاغ" : "Report"}>
                        <Flag size={18} />
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {guidelines.map(rule => (
                        <li key={rule} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <Star size={12} className="text-gold mt-0.5 shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                      {reportCategories.map(category => (
                        <span key={category.id} className="rounded-full bg-muted/60 px-3 py-1 text-[10px] font-bold text-muted-foreground">
                          {category.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {isAdmin && (
                  <section className="rounded-[2rem] bg-primary/5 border border-primary/10 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <ActivityIcon size={22} />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-primary">{isAr ? "مؤشرات الإدارة الأولية" : "Admin health signals"}</h3>
                        <p className="text-xs text-muted-foreground">{isAr ? "بذرة لوحة القياس المقترحة في الخطة." : "A first slice of the analytics dashboard proposed in the roadmap."}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {adminMetrics.map(metric => (
                        <div key={metric.label} className="rounded-2xl bg-card p-4 border border-border/30">
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{metric.label}</p>
                          <p className="text-xl font-bold text-primary mt-1">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-card border border-border/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-primary">{isAr ? "أحدث البلاغات" : "Latest reports"}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground">{formatCount(communityReports.length, isAr)}</span>
                      </div>
                      {communityReports.length === 0 ? (
                        <p className="text-xs text-muted-foreground">{isAr ? "لا توجد بلاغات حالياً." : "No reports yet."}</p>
                      ) : (
                        <div className="space-y-2">
                          {communityReports.slice(0, 3).map(report => (
                            <div key={report.id} className="rounded-xl bg-muted/40 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-primary">
                                  {reportCategories.find(category => category.id === report.category)?.label || report.category}
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${report.priority === "high" ? "bg-rose-500/10 text-rose-600" : "bg-primary/10 text-primary"}`}>
                                  {report.priority === "high" ? (isAr ? "عاجل" : "High") : (isAr ? "عادي" : "Normal")}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{report.details}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}
            {activeTab === "posts" && <div className="p-4 md:p-8"><CommunityPosts /></div>}
            {activeTab === "chat" && <div className="p-4 md:p-8"><CommunityChat /></div>}
            {activeTab === "khatma" && <div className="p-4 md:p-8"><GroupKhatma standalone={false} /></div>}
            {activeTab === "circles" && <div className="p-4 md:p-8"><ReadingCirclesComponent standalone={false} /></div>}
            {activeTab === "sessions" && <div className="p-4 md:p-8"><KnowledgeSessionsComponent standalone={false} /></div>}
            {activeTab === "prayer" && <div className="p-4 md:p-8"><PrayerCirclesComponent standalone={false} /></div>}
            {activeTab === "feed" && <ActivityFeed onFindFriends={() => {
              setActiveTab("friends");
              setSearchParams({ tab: "friends" });
            }} />}
            {activeTab === "friends" && <FriendsManager standalone={false} />}
            {activeTab === "duels" && <SpiritualDuels />}
            {activeTab === "leaderboard" && <Leaderboard />}
            {activeTab === "quests" && <EpicQuests />}
            {activeTab === "admin" && isAdmin && <AdminPanel />}
          </div>
        </div>
      </main>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-serif text-primary">{isAr ? "إرسال بلاغ للمشرفين" : "Send a report to moderators"}</DialogTitle>
            <DialogDescription>
              {isAr
                ? "اختر التصنيف واكتب وصفاً مختصراً. البلاغات تظهر للمشرفين فقط."
                : "Choose a category and add a short description. Reports are visible to moderators only."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <label className="space-y-2 block">
              <span className="text-xs font-bold text-primary">{isAr ? "تصنيف البلاغ" : "Report category"}</span>
              <select
                value={reportCategory}
                onChange={(event) => setReportCategory(event.target.value as ReportCategory)}
                className="w-full rounded-2xl border border-border/50 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                {reportCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              <span className="block text-[11px] text-muted-foreground">
                {reportCategories.find(category => category.id === reportCategory)?.helper}
              </span>
            </label>

            <label className="space-y-2 block">
              <span className="text-xs font-bold text-primary">{isAr ? "وصف مختصر" : "Short description"}</span>
              <Textarea
                value={reportDetails}
                onChange={(event) => setReportDetails(event.target.value)}
                maxLength={600}
                dir="auto"
                className="min-h-[130px] rounded-2xl resize-none"
                placeholder={isAr ? "اشرح ما حدث أو أين ظهرت المشكلة..." : "Explain what happened or where the issue appeared..."}
              />
              <span className="block text-[10px] text-muted-foreground">
                {formatCount(reportDetails.length, isAr)} / {formatCount(600, isAr)}
              </span>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)} disabled={isSubmittingReport}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleSubmitReport} disabled={isSubmittingReport || reportDetails.trim().length < 12} className="bg-rose-600 hover:bg-rose-700 text-white">
              {isSubmittingReport && <Loader2 className="animate-spin" size={16} />}
              {isAr ? "إرسال البلاغ" : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        invitations={invitations}
      />
    </div>
  );
};

export default CommunityHub;
