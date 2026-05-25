import React, { useState, useEffect, useMemo } from "react";
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
import { juzData, surahData, surahByNumber } from "@/data/quranData";
import AuthModal from "@/components/AuthModal";
import { communityCache } from "@/lib/communityCache";

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

interface ReadingCirclesComponentProps {
  standalone?: boolean;
}

const ReadingCirclesComponent: React.FC<ReadingCirclesComponentProps> = ({ standalone = true }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  useEffect(() => {
    if (!user || searchParams.get("id")) return;
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
    const unsubscribe = onSnapshot(doc(db, "reading_circles", circleId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Omit<ReadingCircle, 'id'>;
        const circle = { id: snapshot.id, ...data };
        setCurrentCircle(circle);
        communityCache.set("circles", circle.id, circle);
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
    const surah = surahByNumber.get(selectedSurah);
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
      setSearchParams({ id: docRef.id });
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

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6">
      {standalone && (
        <header className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh text-foreground">{isAr ? "حلقات القراءة الخاصة" : "Private Reading Circles"}</h1>
          <div className="w-10" />
        </header>
      )}

      {!user ? (
        <div className="bg-card border border-border rounded-[2.5rem] p-8 text-center space-y-6">
           <Lock className="w-10 h-10 text-accent mx-auto" />
           <h2 className="text-xl font-bold font-naskh">{isAr ? "سجّل دخولك للمتابعة" : "Login to Continue"}</h2>
           <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-primary text-white rounded-2xl font-bold font-naskh">{isAr ? "تسجيل الدخول" : "Sign In"}</button>
           <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      ) : !currentCircle ? (
        <div className="space-y-8">
           <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-center space-y-4">
              <Users size={32} className="text-primary mx-auto" />
              <h2 className="text-xl font-bold font-naskh">{isAr ? "اقرأ مع أصدقائك" : "Read with Friends"}</h2>
              <p className="text-sm text-muted-foreground">{isAr ? "أنشئ حلقة خاصة لسورة معينة وشارك التقدم لحظياً مع 10 من أصدقائك" : "Create a private circle for a surah and share progress with 10 friends"}</p>
              <button onClick={() => setShowCreateModal(true)} className="w-full py-4 bg-accent text-white rounded-2xl font-bold mt-4 shadow-lg">{isAr ? "إنشاء حلقة جديدة" : "Create New Circle"}</button>
           </div>

           {myCircles.length > 0 && (
              <div className="space-y-3">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{isAr ? "حلقاتي المشتركة" : "My Circles"}</h3>
                 {myCircles.map(circle => (
                    <button key={circle.id} onClick={() => setSearchParams({ id: circle.id })} className="w-full p-5 bg-card border rounded-3xl flex items-center justify-between hover:bg-primary/5 transition-all group">
                       <div className="flex items-center gap-4 text-right">
                          <BookOpen size={24} className="text-primary" />
                          <div>
                             <h4 className="font-bold text-sm font-naskh">{circle.title}</h4>
                             <p className="text-[10px] text-muted-foreground">{isAr ? `سورة ${surahData[circle.surahNumber - 1].name}` : `Surah ${surahData[circle.surahNumber - 1].englishName}`}</p>
                          </div>
                       </div>
                       <ChevronRight size={18} className={isAr ? "rotate-180" : ""} />
                    </button>
                 ))}
              </div>
           )}
        </div>
      ) : (
        <div className="space-y-6">
           <div className="bg-card border rounded-[2.5rem] p-6 shadow-sm space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                 <div>
                    <h2 className="text-2xl font-bold font-naskh text-primary">{currentCircle.title}</h2>
                    <p className="text-xs text-muted-foreground">{isAr ? `سورة ${surahData[currentCircle.surahNumber - 1].name}` : `Surah ${surahData[currentCircle.surahNumber - 1].englishName}`}</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success(isAr ? "تم نسخ الرابط" : "Link copied"); }} className="p-2 bg-accent/10 text-accent rounded-xl"><Share2 size={18} /></button>
                    <button onClick={() => setSearchParams({})} className="p-2 bg-muted rounded-xl"><X size={18} /></button>
                 </div>
              </div>

              <div className="space-y-4 pt-4">
                 {Object.values(currentCircle.members).map(member => (
                    <div key={member.uid} className="space-y-1.5">
                       <div className="flex items-center justify-between text-[10px] font-bold">
                          <span>{member.name}</span>
                          <span>{member.currentAyah} / {currentCircle.totalAyahs}</span>
                       </div>
                       <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${member.uid === user.uid ? "bg-accent" : "bg-primary/40"}`} style={{ width: `${(member.currentAyah / currentCircle.totalAyahs) * 100}%` }} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {!currentCircle.members[user.uid] ? (
              <button onClick={joinCircle} className="w-full py-6 bg-accent text-white rounded-[2rem] font-bold shadow-2xl flex items-center justify-center gap-4"><Plus size={24} />{isAr ? "انضم للحلقة الآن" : "Join Circle"}</button>
           ) : (
              <button onClick={() => { const s = surahData[currentCircle.surahNumber - 1]; navigate(`/juz/${Math.floor((s.startPage - 1) / 20) + 1}?page=${s.startPage}`); }} className="w-full py-6 bg-primary text-white rounded-[2rem] font-bold shadow-2xl flex items-center justify-center gap-4"><BookOpen size={24} />{isAr ? "ابدأ القراءة الآن" : "Start Reading"}</button>
           )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
           <div onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
           <div className="relative bg-card border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold font-naskh text-primary">{isAr ? "إنشاء حلقة جديدة" : "New Reading Circle"}</h3>
              <input value={newCircleTitle} onChange={e => setNewCircleTitle(e.target.value)} placeholder={isAr ? "اسم الحلقة..." : "Title..."} className="w-full p-4 bg-muted/50 rounded-2xl outline-none" />
              <select value={selectedSurah} onChange={e => setSelectedSurah(Number(e.target.value))} className="w-full p-4 bg-muted/50 rounded-2xl outline-none appearance-none">
                 {surahData.map(s => <option key={s.number} value={s.number}>{isAr ? s.name : s.englishName}</option>)}
              </select>
              <button onClick={createCircle} className="w-full py-4 bg-primary text-white rounded-2xl font-bold">{isAr ? "تأكيد الإنشاء" : "Confirm Creation"}</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReadingCirclesComponent;
