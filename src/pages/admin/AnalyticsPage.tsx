import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Activity,
  Target,
  Loader2,
  PieChart as PieChartIcon,
  MousePointer2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, limit, doc, getDoc, onSnapshot } from "firebase/firestore";
import BackButton from "@/components/BackButton";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeKhatmas: 0,
    totalDhikr: 0,
    communityPosts: 0,
    topUsers: [] as any[]
  });

  // Mock data for charts (would be replaced by real historical data aggregation)
  const growthData = [
    { name: 'السبت', users: 12 },
    { name: 'الأحد', users: 18 },
    { name: 'الاثنين', users: 15 },
    { name: 'الثلاثاء', users: 25 },
    { name: 'الأربعاء', users: 32 },
    { name: 'الخميس', users: 28 },
    { name: 'الجمعة', users: 45 },
  ];

  const activityData = [
    { name: 'ختمات', value: 400, color: '#10b981' },
    { name: 'أذكار', value: 300, color: '#f59e0b' },
    { name: 'مجتمع', value: 300, color: '#6366f1' },
    { name: 'أسئلة', value: 200, color: '#f43f5e' },
  ];

  useEffect(() => {
    // Real-time listeners for counts
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const topUsers = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
        .slice(0, 5);

      const newToday = snap.docs.filter(d => {
        const joined = d.data().joinedDate;
        if (!joined) return false;
        return new Date(joined).getTime() > Date.now() - 86400000;
      }).length;

      setStats(prev => ({ ...prev, totalUsers: snap.size, newUsersToday: newToday, topUsers }));
    });

    const unsubKhatmas = onSnapshot(collection(db, "khatmas"), (snap) => {
      setStats(prev => ({ ...prev, activeKhatmas: snap.size }));
    });

    const unsubPosts = onSnapshot(collection(db, "community_posts"), (snap) => {
      setStats(prev => ({ ...prev, communityPosts: snap.size }));
    });

    const unsubDhikr = onSnapshot(doc(db, "stats", "dhikr"), (snap) => {
      if (snap.exists()) {
        setStats(prev => ({ ...prev, totalDhikr: snap.data().count || 0 }));
      }
    });

    setLoading(false);

    return () => {
      unsubUsers();
      unsubKhatmas();
      unsubPosts();
      unsubDhikr();
    };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="text-right">
            <h1 className="text-2xl font-bold font-naskh">تحليلات المنصة</h1>
            <p className="text-xs text-muted-foreground">نظرة شاملة على أداء التطبيق ونشاط المستخدمين</p>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <AnalyticCard title="المستخدمين" value={stats.totalUsers} icon={<Users />} color="text-blue-500" />
          <AnalyticCard title="جدد اليوم" value={stats.newUsersToday} icon={<TrendingUp />} color="text-green-500" />
          <AnalyticCard title="الختمات" value={stats.activeKhatmas} icon={<Target />} color="text-amber-500" />
          <AnalyticCard title="المنشورات" value={stats.communityPosts} icon={<PieChartIcon />} color="text-indigo-500" />
          <AnalyticCard title="التسبيح" value={stats.totalDhikr.toLocaleString()} icon={<Activity />} color="text-rose-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-8 space-y-8">
            {/* Growth Line Chart */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold font-naskh text-right">نمو المستخدمين (آخر ٧ أيام)</h2>
                <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-bold">+٢٤٪ نمو</div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Bar Chart */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft">
              <h2 className="text-lg font-bold font-naskh mb-8 text-right">توزيع النشاط حسب القسم</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: '#88888810'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-8">
            {/* Top Users List */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-soft">
              <h2 className="text-lg font-bold font-naskh mb-6 text-right">المتصدرون</h2>
              <div className="space-y-4">
                {stats.topUsers.map((user, idx) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-accent/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? "bg-amber-500 text-white" :
                        idx === 1 ? "bg-slate-300 text-slate-700" :
                        idx === 2 ? "bg-orange-400 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="font-bold text-sm text-foreground">{user.name || user.displayName || "مستخدم"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-accent px-2 py-1 bg-accent/10 rounded-lg">
                      {user.points?.toLocaleString() || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 space-y-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <MousePointer2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg font-naskh mb-2">رؤى المنصة</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-naskh">
                  تلاحظ زيادة في النشاط خلال الساعات المتأخرة من الليل بنسبة ٣٠٪. نقترح تكثيف التنبيهات في هذا الوقت.
                </p>
              </div>
              <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs font-naskh active:scale-95 transition-transform">
                تحميل التقرير الكامل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticCard = ({ title, value, icon, color }: any) => (
  <div className="p-6 bg-card border border-border rounded-3xl shadow-soft hover:shadow-md transition-all active:scale-95 group">
    <div className={`w-12 h-12 rounded-2xl bg-accent/5 ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1 text-right">{title}</h3>
    <p className="text-2xl font-bold text-foreground text-right">{value}</p>
  </div>
);

export default AnalyticsPage;
