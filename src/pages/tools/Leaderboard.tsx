import React, { useState, useEffect } from "react";
import { Trophy, Medal, Star, User, Search, TrendingUp, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { db } from "@/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { toArabicNumber } from "@/data/quranData";
import { motion } from "motion/react";
import QuranHeader from "@/components/QuranHeader";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  totalAyahsRead?: number;
}

const Leaderboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"points" | "totalJuzCompleted">("points");

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy(sortBy, "desc"), limit(100));
      const querySnapshot = await getDocs(q);
      
      const leaderboardData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaderboardUser[];
      
      setUsers(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return "text-gold bg-gold/10 border-gold/20";
      case 1: return "text-slate-300 bg-slate-300/10 border-slate-300/20";
      case 2: return "text-amber-600 bg-amber-600/10 border-amber-600/20";
      default: return "text-primary/40 bg-primary/5 border-border/40";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader />
      
      <main className="container-responsive py-8 space-y-8">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-gold/10 rounded-[2rem] flex items-center justify-center mx-auto text-gold shadow-lg"
          >
            <Trophy size={40} />
          </motion.div>
          <h1 className="text-4xl font-serif font-bold text-primary">{isAr ? "لوحة المتصدرين" : "Global Leaderboard"}</h1>
          <p className="text-muted-foreground font-naskh">
            {isAr ? "نخبة من المتنافسين في الخيرات وطاعة الرحمن" : "The elite competitors in good deeds and worship"}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setSortBy("points")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${sortBy === "points" ? "bg-primary text-white shadow-lg" : "bg-card border border-border text-muted-foreground hover:bg-primary/5"}`}
          >
            {isAr ? "بالنقاط" : "By Points"}
          </button>
          <button
            onClick={() => setSortBy("totalJuzCompleted")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${sortBy === "totalJuzCompleted" ? "bg-primary text-white shadow-lg" : "bg-card border border-border text-muted-foreground hover:bg-primary/5"}`}
          >
            {isAr ? "بالأجزاء المختومة" : "By Juz Completed"}
          </button>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
          <input
            type="text"
            placeholder={isAr ? "بحث عن متسابق..." : "Search competitor..."}
            className="w-full h-14 pr-12 pl-6 rounded-2xl bg-card border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 font-naskh text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-card border border-border/40 rounded-[2.5rem] shadow-islamic overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground font-naskh">{isAr ? "جاري تحميل قائمة الشرف..." : "Loading honor list..."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {filteredUsers.map((user, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={user.id}
                  className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-serif font-bold text-lg ${getMedalColor(index)}`}>
                      {isAr ? toArabicNumber(index + 1) : index + 1}
                    </div>
                    
                    <div className="relative">
                      {user.avatar ? (
                        <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt={user.name} />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <User size={24} />
                        </div>
                      )}
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2">
                          <Medal size={20} className={index === 0 ? "text-gold" : index === 1 ? "text-slate-300" : "text-amber-600"} />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                        {user.name}
                        {index === 0 && <Sparkles size={16} className="text-gold animate-pulse" />}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary/60">
                          <Star size={10} className="text-gold" />
                          {isAr ? `المستوى ${toArabicNumber(user.level || 1)}` : `Level ${user.level || 1}`}
                        </div>
                        {user.totalAyahsRead && (
                          <span className="text-[10px] text-muted-foreground font-naskh">
                            {isAr ? `${toArabicNumber(user.totalAyahsRead)} آية` : `${user.totalAyahsRead} Ayahs`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2 text-gold font-serif font-bold text-xl">
                      <TrendingUp size={18} />
                      {isAr 
                        ? toArabicNumber(sortBy === "points" ? user.points : (user.totalJuzCompleted || 0)) 
                        : (sortBy === "points" ? user.points : (user.totalJuzCompleted || 0)).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-sans font-bold tracking-widest uppercase">
                      {sortBy === "points" ? (isAr ? "نقطة" : "Points") : (isAr ? "جزء" : "Juz")}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
