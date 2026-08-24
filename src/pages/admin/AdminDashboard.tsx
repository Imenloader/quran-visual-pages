import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Layout,
  Brain,
  Bell,
  Trash2,
  Plus,
  Heart as LucideHeart,
  Moon as LucideMoon,
  Book as LucideBook,
  Sparkles as LucideSparkles,
  Banknote as LucideBanknote,
  CheckCircle as LucideCheckCircle,
  Scroll as LucideScroll,
  History as LucideHistory,
  Zap as LucideZap,
  Library as LucideLibrary,
  Target,
  Users2
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db } from "@/firebase";
import { collection, onSnapshot, query, limit, orderBy } from "firebase/firestore";
import BackButton from "@/components/BackButton";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPoints: 0,
    activeKhatmas: 0,
    communityPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // 1. Listen for User Stats
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const totalPoints = snap.docs.reduce((acc, doc) => acc + (doc.data().points || 0), 0);
      setStats(prev => ({ ...prev, totalUsers: snap.size, totalPoints }));
    });

    // 2. Listen for Khatmas
    const unsubKhatmas = onSnapshot(collection(db, "khatmas"), (snap) => {
      setStats(prev => ({ ...prev, activeKhatmas: snap.size }));
    });

    // 3. Listen for Community Posts
    const unsubPosts = onSnapshot(collection(db, "community_posts"), (snap) => {
      setStats(prev => ({ ...prev, communityPosts: snap.size }));
    });

    // 4. Listen for Real-time Activities
    const qActivities = query(
      collection(db, "admin_activities"), 
      orderBy("createdAt", "desc"), 
      limit(10)
    );
    const unsubActivities = onSnapshot(qActivities, (snap) => {
      const activityList = snap.docs.map(doc => {
        const data = doc.data();
        let icon = <Plus className="w-4 h-4 text-primary" />;
        
        switch (data.type) {
          case 'USER_JOINED': icon = <Users className="w-4 h-4 text-green-500" />; break;
          case 'KHATMA_CREATED': icon = <LucideBook className="w-4 h-4 text-blue-500" />; break;
          case 'POST_CREATED': icon = <MessageSquare className="w-4 h-4 text-amber-500" />; break;
          case 'QUEST_COMPLETED': icon = <LucideCheckCircle className="w-4 h-4 text-emerald-500" />; break;
          case 'CIRCLE_CREATED': icon = <Target className="w-4 h-4 text-indigo-500" />; break;
          case 'DHIKR_MILESTONE': icon = <LucideSparkles className="w-4 h-4 text-amber-500" />; break;
        }

        return {
          id: doc.id,
          user: data.userName,
          action: data.action,
          time: data.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'الآن',
          icon
        };
      });
      setActivities(activityList);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubKhatmas();
      unsubPosts();
      unsubActivities();
    };
  }, []);

  const menuItems = [
    { id: 'content', title: "إدارة الأدعية", icon: <BookOpen />, path: "/admin/content", color: "bg-blue-500/10 text-blue-500" },
    { id: 'athkar', title: "إدارة الأذكار", icon: <MessageSquare />, path: "/admin/athkar", color: "bg-rose-500/10 text-rose-500" },
    { id: 'hub', title: "إدارة المركز (Hub)", icon: <Layout />, path: "/admin/hub", color: "bg-indigo-500/10 text-indigo-500" },
    { id: 'quiz', title: "إدارة المسابقات", icon: <Brain />, path: "/admin/quiz", color: "bg-orange-500/10 text-orange-500" },
    { id: 'names', title: "إدارة الأسماء الحسنى", icon: <LucideHeart />, path: "/admin/names", color: "bg-rose-500/10 text-rose-500" },
    { id: 'stories', title: "إدارة قصص الأنبياء", icon: <BookOpen />, path: "/admin/stories", color: "bg-amber-500/10 text-amber-500" },
    { id: 'khatmas', title: "إدارة الختمات", icon: <LucideBook />, path: "/admin/khatmas", color: "bg-emerald-500/10 text-emerald-500" },
    { id: 'dhikr', title: "إدارة الذكر العالمي", icon: <LucideSparkles />, path: "/admin/dhikr", color: "bg-amber-500/10 text-amber-500" },
    { id: 'ramadan', title: "إدارة رمضان", icon: <LucideMoon />, path: "/admin/ramadan", color: "bg-indigo-500/10 text-indigo-500" },
    { id: 'zakat', title: "إعدادات الزكاة", icon: <LucideBanknote />, path: "/admin/zakat", color: "bg-emerald-500/10 text-emerald-500" },
    { id: 'sunan', title: "سنن الجمعة", icon: <LucideCheckCircle />, path: "/admin/sunan", color: "bg-blue-500/10 text-blue-500" },
    { id: 'hadith', title: "الأحاديث النبوية", icon: <LucideScroll />, path: "/admin/hadith", color: "bg-amber-500/10 text-amber-500" },
    { id: 'seerah', title: "السيرة النبوية", icon: <LucideHistory />, path: "/admin/seerah", color: "bg-primary/10 text-primary" },
    { id: 'routine', title: "الروتين الروحاني", icon: <LucideZap />, path: "/admin/routine", color: "bg-amber-500/10 text-amber-500" },
    { id: 'library', title: "المكتبة الإسلامية", icon: <LucideLibrary />, path: "/admin/library", color: "bg-emerald-500/10 text-emerald-500" },
    { id: 'users', title: "المستخدمين", icon: <Users />, path: "/admin/users", color: "bg-green-500/10 text-green-500" },
    { id: 'settings', title: "إعدادات النظام", icon: <Settings />, path: "/admin/settings", color: "bg-purple-500/10 text-purple-500" },
    { id: 'analytics', title: "الإحصائيات", icon: <BarChart3 />, path: "/admin/analytics", color: "bg-amber-500/10 text-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold font-naskh text-foreground flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-accent" />
                لوحة التحكم
              </h1>
              <p className="text-xs text-muted-foreground font-naskh">إدارة منصة قرآنيات</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="إجمالي المستخدمين" 
            value={stats.totalUsers} 
            icon={<Users className="w-5 h-5" />} 
            color="text-blue-500"
          />
          <StatCard 
            title="الختمات النشطة" 
            value={stats.activeKhatmas} 
            icon={<Target className="w-5 h-5" />} 
            color="text-emerald-500"
          />
          <StatCard 
            title="مواضيع المجتمع" 
            value={stats.communityPosts} 
            icon={<MessageSquare className="w-5 h-5" />} 
            color="text-amber-500"
          />
          <StatCard 
            title="نقاط الخبرة" 
            value={stats.totalPoints.toLocaleString()} 
            icon={<TrendingUp className="w-5 h-5" />} 
            color="text-rose-500"
          />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, idx) => (
            <Link key={item.id} to={item.path}>
              <div
                className="p-6 glass-card hover:-translate-y-1 rounded-3xl shadow-soft group hover:border-accent/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center`}>
                    {React.cloneElement(item.icon as React.ReactElement, { className: "w-7 h-7" })}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-naskh text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground font-naskh">إدارة وتعديل البيانات</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions / Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-bold font-naskh mb-4 px-2 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-accent" />
            آخر النشاطات
          </h2>
          <div className="glass-card hover:-translate-y-1 rounded-3xl p-4 space-y-4">
            {activities.length > 0 ? activities.map(act => (
              <ActivityItem 
                key={act.id}
                user={act.user} 
                action={act.action} 
                time={act.time} 
                icon={act.icon}
              />
            )) : (
              <p className="text-center py-8 text-muted-foreground text-xs font-naskh">لا توجد نشاطات حديثة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color = "text-accent" }: any) => (
  <div className="p-5 glass-card hover:-translate-y-1 rounded-3xl shadow-soft">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-xl bg-accent/5 ${color}`}>
        {icon}
      </div>
      {trend && <span className="text-[10px] text-green-500 font-bold">{trend}</span>}
    </div>
    <div className="space-y-1">
      <h3 className="text-[10px] font-bold text-muted-foreground font-naskh uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const ActivityItem = ({ user, action, time, icon }: any) => (
  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent/5 transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold font-naskh text-foreground leading-tight">
          <span className="text-accent">{user}</span> {action}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
