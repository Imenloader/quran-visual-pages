import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Activity,
  Target,
  Loader2
} from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import BackButton from "@/components/BackButton";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeKhatmas: 0,
    totalDhikr: 0,
    topUsers: [] as any[]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const khatmasSnap = await getDocs(collection(db, "khatmas"));
        
        const sortedUsers = usersSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
          .slice(0, 5);

        const dhikrSnap = await getDoc(doc(db, "stats", "dhikr"));
        const totalDhikrVal = dhikrSnap.exists() ? (dhikrSnap.data().total || 0) : 0;

        setStats({
          totalUsers: usersSnap.size,
          newUsersToday: usersSnap.docs.filter(d => {
            const joined = d.data().joinedDate;
            if (!joined) return false;
            return new Date(joined).getTime() > Date.now() - 86400000;
          }).length,
          activeKhatmas: khatmasSnap.size,
          totalDhikr: totalDhikrVal,
          topUsers: sortedUsers
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="text-right">
            <h1 className="text-2xl font-bold font-naskh">تحليلات المنصة</h1>
            <p className="text-xs text-muted-foreground">نظرة شاملة على أداء التطبيق ونشاط المستخدمين</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <AnalyticCard title="إجمالي المستخدمين" value={stats.totalUsers} icon={<Users />} color="text-blue-500" />
          <AnalyticCard title="مستخدمين جدد (اليوم)" value={stats.newUsersToday} icon={<TrendingUp />} color="text-green-500" />
          <AnalyticCard title="ختمات جارية" value={stats.activeKhatmas} icon={<Target />} color="text-amber-500" />
          <AnalyticCard title="مرات التسبيح" value={stats.totalDhikr.toLocaleString()} icon={<Activity />} color="text-rose-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard Section */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8">
            <h2 className="text-lg font-bold font-naskh mb-6 text-right">المتصدرون (الأكثر نقاطاً)</h2>
            <div className="space-y-4">
              {stats.topUsers.map((user, idx) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">{idx + 1}</span>
                    <span className="font-bold text-sm">{user.displayName || "مستخدم"}</span>
                  </div>
                  <span className="text-xs font-bold text-accent">{user.points?.toLocaleString() || 0} نقطة</span>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Chart (Mock for UI) */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="font-bold text-muted-foreground">النمو الأسبوعي</h3>
            <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-2">سيتم تفعيل الرسوم البيانية التفاعلية عند توفر بيانات تاريخية كافية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticCard = ({ title, value, icon, color }: any) => (
  <div className="p-6 bg-card border border-border rounded-3xl shadow-soft hover:shadow-md transition-shadow active:scale-98">
    <div className={`w-10 h-10 rounded-xl bg-accent/5 ${color} flex items-center justify-center mb-4`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 text-right">{title}</h3>
    <p className="text-2xl font-bold text-foreground text-right">{value}</p>
  </div>
);

export default AnalyticsPage;
