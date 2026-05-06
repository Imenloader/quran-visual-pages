import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuranHeader from "@/components/QuranHeader";
import { useUser } from "@/contexts/UserContext";
import { toArabicNumber } from "@/data/quranData";
import FriendsManager from "./FriendsManager";
import { communityService, Notification as CommunityNotification } from "@/services/communityService";
import { toast } from "sonner";
import ActivityFeed from "@/components/community/ActivityFeed";
import SpiritualDuels from "@/components/community/SpiritualDuels";
import NotificationsModal from "@/components/community/NotificationsModal";
import Leaderboard from "@/components/community/Leaderboard";
import EpicQuests from "@/components/community/EpicQuests";
import GrowthTree from "@/components/community/GrowthTree";

type CommunityTab = "today" | "feed" | "friends" | "duels" | "leaderboard" | "quests";

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
  const [activeTab, setActiveTab] = useState<CommunityTab>("today");
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = communityService.subscribeToNotifications(profile.uid, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return () => unsub();
  }, [profile?.uid]);

  const today = new Date().toISOString().split("T")[0];
  const todayPages = profile.dailyReadingHistory?.find(day => day.date === today)?.pages || 0;
  const completedQuests = profile.completedQuests?.length || 0;
  const friendCount = profile.friendCount || profile.friendIds?.length || 0;
  const readinessScore = [todayPages > 0, friendCount > 0, completedQuests > 0, unreadCount === 0].filter(Boolean).length;

  const tabs: { id: CommunityTab; label: string; icon: React.ElementType }[] = [
    { id: "today", label: isAr ? "اليوم" : "Today", icon: CalendarDays },
    { id: "feed", label: isAr ? "الخلاصة" : "Feed", icon: ActivityIcon },
    { id: "friends", label: isAr ? "الأصدقاء" : "Friends", icon: Users },
    { id: "duels", label: isAr ? "التحديات" : "Duels", icon: Zap },
    { id: "leaderboard", label: isAr ? "المتصدرون" : "Leaderboard", icon: Trophy },
    { id: "quests", label: isAr ? "المهمات" : "Quests", icon: Sparkles },
  ];

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
      action: () => navigate("/juz/1"),
      actionLabel: isAr ? "افتح المصحف" : "Open Quran",
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
      action: () => navigate("/reading-circles"),
      actionLabel: isAr ? "استكشف الحلقات" : "Explore circles",
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
    {
      id: "active-quest",
      title: isAr ? "تابع مهمة هذا الأسبوع" : "Continue this week's quest",
      description: isAr
        ? "المهمات الموسمية تجعل المنافسة متجددة وعادلة بين الأعضاء."
        : "Seasonal quests keep competition fresh, fair, and focused on meaningful habits.",
      meta: isAr ? `${formatCount(completedQuests, isAr)} مهمة مكتملة` : `${formatCount(completedQuests, isAr)} completed quests`,
      icon: Sparkles,
      accent: "bg-purple-500/10 text-purple-600",
      action: () => setActiveTab("quests"),
      actionLabel: isAr ? "افتح المهمات" : "Open quests",
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
    { label: isAr ? "رمضان" : "Ramadan", path: "/ramadan" },
  ];

  const guidelines = [
    isAr ? "الإخلاص والأدب قبل النقاط والمراكز." : "Sincerity and adab come before points and rank.",
    isAr ? "احمِ خصوصيتك وخصوصية الآخرين ولا تنشر معلومات حساسة." : "Protect your privacy and never share sensitive information about others.",
    isAr ? "لا تُصدر فتوى أو نصيحة دينية متخصصة دون أهلية واضحة." : "Do not issue specialized religious rulings without clear qualification.",
    isAr ? "بلّغ عن الإساءة أو التضليل أو الرسائل التجارية غير المناسبة." : "Report abuse, misinformation, harassment, or inappropriate solicitation.",
  ];

  const reportCategories = [
    isAr ? "إساءة أو مضايقة" : "Abuse or harassment",
    isAr ? "معلومة دينية مضللة" : "Religious misinformation",
    isAr ? "خصوصية أو بيانات شخصية" : "Privacy or personal data",
    isAr ? "رسائل مزعجة أو تجارية" : "Spam or solicitation",
  ];

  const adminMetrics = [
    { label: isAr ? "تنشيط الأعضاء" : "Activation", value: `${formatCount(readinessScore, isAr)}/4` },
    { label: isAr ? "التنبيهات غير المقروءة" : "Unread alerts", value: formatCount(unreadCount, isAr) },
    { label: isAr ? "الأصدقاء" : "Friends", value: formatCount(friendCount, isAr) },
    { label: isAr ? "المهمات المكتملة" : "Quest completions", value: formatCount(completedQuests, isAr) },
  ];

  const showReportToast = () => {
    toast.info(
      isAr
        ? "تم تجهيز تصنيفات البلاغات. اربطها بلوحة الإشراف عند تفعيل إدارة البلاغات."
        : "Report categories are ready. Connect them to the moderation queue when report management is enabled."
    );
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
              onClick={() => setActiveTab(tab.id)}
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
                      <button onClick={showReportToast} className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all" aria-label={isAr ? "إبلاغ" : "Report"}>
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
                        <span key={category} className="rounded-full bg-muted/60 px-3 py-1 text-[10px] font-bold text-muted-foreground">
                          {category}
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
                  </section>
                )}
              </div>
            )}
            {activeTab === "feed" && <ActivityFeed />}
            {activeTab === "friends" && <FriendsManager standalone={false} />}
            {activeTab === "duels" && <SpiritualDuels />}
            {activeTab === "leaderboard" && <Leaderboard />}
            {activeTab === "quests" && <EpicQuests />}
          </div>
        </div>
      </main>

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />
    </div>
  );
};

export default CommunityHub;
