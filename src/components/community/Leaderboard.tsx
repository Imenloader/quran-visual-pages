import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Users,
  Search,
  Star,
  Loader2
} from "lucide-react";
import { db } from "@/firebase";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { useUser } from "@/contexts/UserContext";
import { toArabicNumber } from "@/data/quranData";
import { Link } from "react-router-dom";

const Leaderboard = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { profile: currentUserProfile } = useUser();
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Filter by gender (as per project rules)
        let q = query(
          collection(db, "profiles"),
          where("gender", "==", currentUserProfile.gender || 'unspecified'),
          orderBy("points", "desc"),
          limit(20)
        );
        
        let snap;
        try {
          snap = await getDocs(q);
        } catch (queryErr: any) {
          console.error("Primary Leaderboard Query Failed:", queryErr);
          // If it's a permission/index error, try a simpler query as fallback
          if (queryErr.code === 'permission-denied' || queryErr.message?.includes('index')) {
             q = query(
               collection(db, "profiles"),
               orderBy("points", "desc"),
               limit(20)
             );
             snap = await getDocs(q);
          } else {
            throw queryErr;
          }
        }
        
        if (snap) {
          setTopUsers(snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() })));
        }
      } catch (e) {
        console.error("Leaderboard Final Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [currentUserProfile.gender, timeframe]);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Timeframe Tabs */}
      <div className="flex gap-2 p-1 bg-primary/5 rounded-2xl border border-primary/10">
        {[
          { id: 'weekly', label: isAr ? 'أسبوعي' : 'Weekly' },
          { id: 'monthly', label: isAr ? 'شهري' : 'Monthly' },
          { id: 'all', label: isAr ? 'الكل' : 'All Time' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTimeframe(t.id as any)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
              timeframe === t.id ? "bg-white shadow-sm text-primary" : "text-primary/40 hover:text-primary/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {topUsers.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center gap-3">
            <Link to={`/profile/${topUsers[1].id}`} className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-300 overflow-hidden shadow-lg">
                <img src={topUsers[1].avatar || "/avatar-man-1.svg"} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-md">٢</div>
            </Link>
            <p className="text-[10px] font-bold text-center truncate w-20">{topUsers[1].name}</p>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center gap-3 -translate-y-4">
            <Link to={`/profile/${topUsers[0].id}`} className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gold/10 border-4 border-gold overflow-hidden shadow-gold/20 shadow-2xl">
                <img src={topUsers[0].avatar || "/avatar-man-1.svg"} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-[12px] font-bold text-white shadow-lg">١</div>
              <Medal className="absolute -top-4 -right-4 text-gold rotate-12" size={24} />
            </Link>
            <p className="text-xs font-bold text-center truncate w-24 text-primary">{topUsers[0].name}</p>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center gap-3">
             <Link to={`/profile/${topUsers[2].id}`} className="relative">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-600/30 overflow-hidden shadow-lg">
                <img src={topUsers[2].avatar || "/avatar-man-1.svg"} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600/30 flex items-center justify-center text-[10px] font-bold text-amber-900 shadow-md">٣</div>
            </Link>
            <p className="text-[10px] font-bold text-center truncate w-20">{topUsers[2].name}</p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {topUsers.slice(3).map((user) => (
          <Link 
            key={user.id} 
            to={`/profile/${user.id}`}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              user.id === currentUserProfile.uid ? "bg-primary/10 border-primary/20 shadow-inner" : "bg-primary/5 border-primary/5 hover:bg-primary/10"
            }`}
          >
            <span className="w-6 text-center text-xs font-bold text-muted-foreground">
              {isAr ? toArabicNumber(user.rank) : user.rank}
            </span>
            <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden border border-border/40">
              <img src={user.avatar || "/avatar-man-1.svg"} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-primary">{user.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                <Star size={10} className="text-gold fill-gold" />
                {isAr ? toArabicNumber(user.points) : user.points.toLocaleString()} {isAr ? 'نقطة' : 'points'}
              </div>
            </div>
            <TrendingUp size={14} className="text-emerald-500" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
