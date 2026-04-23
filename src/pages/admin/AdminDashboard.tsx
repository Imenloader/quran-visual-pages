import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
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
  Library as LucideLibrary
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db } from "@/firebase";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import BackButton from "@/components/BackButton";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeQuests: 0,
    totalPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const khatmasSnap = await getDocs(collection(db, "khatmas"));
        
        setStats({
          totalUsers: usersSnap.size,
          activeQuests: khatmasSnap.size,
          totalPoints: usersSnap.docs.reduce((acc, doc) => acc + (doc.data().points || 0), 0)
        });

        const activityList: any[] = [];
        usersSnap.docs
          .sort((a, b) => (b.data().joinedDate || 0) - (a.data().joinedDate || 0))
          .slice(0, 3)
          .forEach(d => activityList.push({
            id: d.id,
            user: d.data().displayName || "مستخدم جديد",
            action: "انضم إلى المنصة",
            time: "جديد",
            icon: <Users className="w-4 h-4 text-green-500" />
          }));

        khatmasSnap.docs
          .sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0))
          .slice(0, 3)
          .forEach(d => activityList.push({
            id: d.id,
            user: d.data().createdBy?.slice(0, 5) || "مجهول",
            action: `أنشأ ختمة: ${d.data().title || "بدون عنوان"}`,
            time: "مؤخراً",
            icon: <LucideBook className="w-4 h-4 text-blue-500" />
          }));

        setActivities(activityList.slice(0, 5));
      } catch (error) {
        console.error("Admin Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
            title="إجمالي المستخدمين" 
            value={stats.totalUsers} 
            icon={<Users className="w-5 h-5" />} 
            trend="+12% هذا الشهر"
          />
          <StatCard 
            title="نقاط الخبرة الكلية" 
            value={stats.totalPoints.toLocaleString()} 
            icon={<TrendingUp className="w-5 h-5" />} 
          />
          <div className="hidden md:block">
            <StatCard 
              title="تنبيهات النظام" 
              value="0" 
              icon={<AlertCircle className="w-5 h-5" />} 
              color="text-green-500"
            />
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, idx) => (
            <Link key={item.id} to={item.path}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-card border border-border rounded-3xl shadow-soft group hover:border-accent/50 transition-all cursor-pointer flex items-center justify-between"
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
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Quick Actions / Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-bold font-naskh mb-4 px-2">آخر النشاطات</h2>
          <div className="bg-card border border-border rounded-3xl p-4 space-y-4">
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
  <div className="p-5 bg-card border border-border rounded-3xl shadow-soft">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-xl bg-accent/5 ${color}`}>
        {icon}
      </div>
      {trend && <span className="text-[10px] text-green-500 font-bold">{trend}</span>}
    </div>
    <div className="space-y-1">
      <h3 className="text-xs text-muted-foreground font-naskh">{title}</h3>
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
        <p className="text-sm font-bold font-naskh text-foreground">
          <span className="text-accent">{user}</span> {action}
        </p>
        <p className="text-[10px] text-muted-foreground">{time}</p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
