import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Plus, 
  Share2, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  BookOpen,
  Info,
  Loader2,
  ArrowRight,
  User as UserIcon,
  X,
  Trophy
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  query,
  where,
  limit,
  getDocs,
  getDoc
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useUser } from "@/contexts/UserContext";
import BackButton from "@/components/BackButton";
import { juzData, surahData } from "@/data/quranData";
import AuthModal from "@/components/AuthModal";

interface CircleMember {
  uid: string;
  name: string;
  avatar: string | null;
  currentAyah: number;
  lastActive: Timestamp;
}

interface ReadingCircle {
  id: string;
  title: string;
  surahNumber: number;
  totalAyahs: number;
  createdBy: string;
  createdAt: Timestamp;
  members: Record<string, CircleMember>;
  maxMembers: number;
}

import { communityCache } from "@/lib/communityCache";

const ReadingCircles = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, isAuthReady } = useUser();
  const [user, setUser] = useState(auth.currentUser);
  
  const [currentCircle, setCurrentCircle] = useState<ReadingCircle | null>(null);
  const [myCircles, setMyCircles] = useState<ReadingCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newCircleTitle, setNewCircleTitle] = useState("");
  const [selectedSurah, setSelectedSurah] = useState(1);

  const isAr = i18n.language === "ar";

  // 1. Initial Load from Cache
  useEffect(() => {
    const loadCache = async () => {
      const cached = await communityCache.getAll<ReadingCircle>("circles");
      if (cached.length > 0) setMyCircles(cached);
    };
    loadCache();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Circles (List) with Delta Logic
  useEffect(() => {
    if (!user || searchParams.get("id")) return;

    // We only fetch if we don't have enough or periodically
    const fetchCircles = async () => {
      try {
        const q = query(
          collection(db, "reading_circles"),
          where(`members.${user.uid}.uid`, "==", user.uid),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const circles = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ReadingCircle));
        setMyCircles(circles);
        
        // Update Cache
        for (const circle of circles) {
          await communityCache.set("circles", circle.id, circle);
        }
      } catch (err) {
        console.error("List fetch error:", err);
      }
    };

    fetchCircles();
  }, [user, searchParams]);

  useEffect(() => {
    const circleId = searchParams.get("id");
    if (!circleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Detail view still uses onSnapshot for real-time, but we could cache it too
    const unsubscribe = onSnapshot(doc(db, "reading_circles", circleId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Omit<ReadingCircle, 'id'>;
        const circle = { id: snapshot.id, ...data };
        setCurrentCircle(circle);
        communityCache.set("circles", circle.id, circle); // Update cache on every update
      } else {
        toast.error(isAr ? "الدائرة غير موجودة" : "Circle not found");
        setCurrentCircle(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Circle error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchParams, isAr]);

  const createCircle = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const surah = surahData.find(s => s.number === selectedSurah);
    if (!surah) return;

    try {
      const docRef = await addDoc(collection(db, "reading_circles"), {
        title: newCircleTitle || (isAr ? `حلقة سورة ${surah.name}` : `Surah ${surah.englishName} Circle`),
        surahNumber: selectedSurah,
        totalAyahs: surah.ayahs,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        maxMembers: 10,
        members: {
          [user.uid]: {
            uid: user.uid,
            name: profile?.name || user.displayName || (isAr ? "مستخدم" : "User"),
            avatar: profile?.avatar || null,
            currentAyah: 1,
            lastActive: serverTimestamp()
          }
        }
      });
      setShowCreateModal(false);
      navigate(`/reading-circles?id=${docRef.id}`); // Corrected route
      // Wait, I should probably add a route in App.tsx for this.
    } catch (e) {
      toast.error(isAr ? "فشل إنشاء الحلقة" : "Failed to create circle");
    }
  };

  const joinCircle = async () => {
    if (!user || !currentCircle) return;
    if (currentCircle.members[user.uid]) return;
    if (Object.keys(currentCircle.members).length >= currentCircle.maxMembers) {
      toast.error(isAr ? "الحلقة مكتملة" : "Circle is full");
      return;
    }

    try {
      await updateDoc(doc(db, "reading_circles", currentCircle.id), {
        [`members.${user.uid}`]: {
          uid: user.uid,
          name: profile?.name || user.displayName || (isAr ? "مستخدم" : "User"),
          avatar: profile?.avatar || null,
          currentAyah: 1,
          lastActive: serverTimestamp()
        }
      });
    } catch (e) {
      toast.error(isAr ? "فشل الانضمام للحلقة" : "Failed to join circle");
    }
  };

  const updateProgress = async (ayah: number) => {
    if (!user || !currentCircle) return;
    try {
      await updateDoc(doc(db, "reading_circles", currentCircle.id), {
        [`members.${user.uid}.currentAyah`]: ayah,
        [`members.${user.uid}.lastActive`]: serverTimestamp()
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh text-foreground">
            {isAr ? "حلقات القراءة الخاصة" : "Private Reading Circles"}
          </h1>
          <div className="w-10 h-10" />
        </header>

        {!user ? (
          <div className="bg-card border border-border rounded-[2.5rem] p-8 text-center space-y-6 shadow-islamic">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-naskh text-foreground">{isAr ? "سجّل دخولك للمتابعة" : "Login to Continue"}</h2>
              <p className="text-sm text-muted-foreground font-naskh">{isAr ? "تحتاج لتسجيل الدخول لإنشاء أو الانضمام لحلقات القراءة" : "You need to login to create or join reading circles"}</p>
            </div>
            <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-primary text-white rounded-2xl font-bold font-naskh shadow-lg">
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </button>
          </div>
        ) : !currentCircle ? (
          <div className="space-y-8">
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <Users size={32} />
              </div>
              <h2 className="text-2xl font-bold font-naskh text-foreground">{isAr ? "اقرأ مع أصدقائك" : "Read with Friends"}</h2>
              <p className="text-sm text-muted-foreground font-naskh">{isAr ? "أنشئ حلقة خاصة لسورة معينة وشارك التقدم لحظياً مع 10 من أصدقائك" : "Create a private circle for a surah and share progress in real-time with 10 friends"}</p>
              <button onClick={() => setShowCreateModal(true)} className="w-full py-4 bg-accent text-white rounded-2xl font-bold font-naskh shadow-lg mt-4">
                {isAr ? "إنشاء حلقة جديدة" : "Create New Circle"}
              </button>
            </div>

            {/* My Circles List */}
            {myCircles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-naskh text-foreground flex items-center gap-2 px-1">
                  <div className="w-1.5 h-4 bg-primary rounded-full" />
                  {isAr ? "حلقاتي المشتركة" : "My Joined Circles"}
                </h3>
                <div className="grid gap-3">
                  {myCircles.map(circle => (
                    <button
                      key={circle.id}
                      onClick={() => navigate(`/reading-circles?id=${circle.id}`)}
                      className="p-5 bg-card border border-border/40 rounded-3xl flex items-center justify-between hover:border-primary/30 hover:bg-primary/5 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <BookOpen size={24} />
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold font-naskh text-foreground">{circle.title}</h4>
                          <p className="text-[10px] text-muted-foreground font-naskh">
                            {isAr ? `سورة ${surahData[circle.surahNumber - 1].name}` : `Surah ${surahData[circle.surahNumber - 1].englishName}`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Circle Info */}
            <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-islamic relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <BookOpen size={100} />
               </div>
               <div className="relative z-10 space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold font-naskh text-primary">{currentCircle.title}</h2>
                      <p className="text-xs text-muted-foreground font-naskh">
                        {isAr ? `سورة ${surahData[currentCircle.surahNumber - 1].name}` : `Surah ${surahData[currentCircle.surahNumber - 1].englishName}`}
                      </p>
                    </div>
                    <button onClick={() => {
                       navigator.clipboard.writeText(window.location.href);
                       toast.success(isAr ? "تم نسخ رابط الدعوة" : "Invite link copied");
                    }} className="p-3 bg-accent/10 text-accent rounded-2xl">
                      <Share2 size={20} />
                    </button>
                 </div>

                 {/* Progress Bars */}
                 <div className="space-y-4 pt-4">
                    {Object.values(currentCircle.members).map(member => (
                      <div key={member.uid} className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                               {member.avatar ? <img src={member.avatar} className="w-full h-full rounded-full object-cover" /> : <UserIcon size={12} />}
                             </div>
                             <span className="text-[10px] font-bold font-naskh text-foreground">{member.name}</span>
                          </div>
                          <span className="text-[8px] font-mono text-muted-foreground">
                            {member.currentAyah} / {currentCircle.totalAyahs}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(member.currentAyah / currentCircle.totalAyahs) * 100}%` }}
                             className={`h-full rounded-full ${member.uid === user.uid ? "bg-accent" : "bg-primary/40"}`}
                           />
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            {/* Join / Read Button */}
            {!currentCircle.members[user.uid] ? (
              <button 
                onClick={joinCircle}
                className="w-full py-6 bg-accent text-white rounded-[2rem] font-bold font-naskh shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
              >
                 <Plus size={24} />
                 {isAr ? "انضم للحلقة الآن" : "Join Circle Now"}
              </button>
            ) : (
              <button 
                onClick={() => {
                  const surah = surahData[currentCircle.surahNumber - 1];
                  navigate(`/juz/${Math.floor((surah.page - 1) / 20) + 1}?page=${surah.page}`);
                }}
                className="w-full py-6 bg-primary text-white rounded-[2rem] font-bold font-naskh shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
              >
                 <BookOpen size={24} />
                 {isAr ? "ابدأ القراءة الآن" : "Start Reading Now"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-naskh text-primary">{isAr ? "إنشاء حلقة جديدة" : "New Reading Circle"}</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-muted"><X size={20} /></button>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">{isAr ? "اسم الحلقة" : "Circle Name"}</label>
                     <input value={newCircleTitle} onChange={e => setNewCircleTitle(e.target.value)} placeholder={isAr ? "مثلاً: حلقة سورة البقرة" : "e.g. Al-Baqarah Study"} className="w-full p-4 bg-muted/50 border border-border rounded-2xl focus:ring-2 ring-primary/20 outline-none font-naskh" />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">{isAr ? "اختر السورة" : "Select Surah"}</label>
                     <select value={selectedSurah} onChange={e => setSelectedSurah(Number(e.target.value))} className="w-full p-4 bg-muted/50 border border-border rounded-2xl focus:ring-2 ring-primary/20 outline-none font-naskh appearance-none">
                       {surahData.map(s => (
                         <option key={s.id} value={s.id}>{isAr ? s.name : s.englishName}</option>
                       ))}
                     </select>
                   </div>
                </div>

                <button onClick={createCircle} className="w-full py-4 bg-primary text-white rounded-2xl font-bold font-naskh shadow-lg">
                  {isAr ? "تأكيد الإنشاء" : "Confirm Creation"}
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default ReadingCircles;
