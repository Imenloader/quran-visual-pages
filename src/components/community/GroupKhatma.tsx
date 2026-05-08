import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Users, 
  Plus, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Globe, 
  ChevronRight, 
  BookOpen,
  Trophy,
  Info,
  AlertCircle,
  Loader2,
  BookMarked,
  ArrowRight,
  Maximize2,
  LogOut,
  LogIn,
  X,
  User as UserIcon
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { 
  collection, 
  query, 
  where,
  limit,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  orderBy
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db, handleFirestoreError, OperationType } from "@/firebase";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import BackButton from "@/components/BackButton";
import QuranHeader from "@/components/QuranHeader";
import { juzData, toArabicNumber } from "@/data/quranData";
import QuranTextViewer from "@/components/QuranTextViewer";
import QuranPlayerBar from "@/components/QuranPlayerBar";
import AuthModal from "@/components/AuthModal";
import { activityService } from "@/services/activityService";

// --- Types ---

interface Portion {
  status: 'available' | 'claimed' | 'completed';
  claimedBy: string | null;
  claimedByName?: string | null;
  claimedByAvatar?: string | null;
  claimedAt: Timestamp | null;
  completedAt: Timestamp | null;
}

interface Khatma {
  id: string;
  title: string;
  type: 'public' | 'private';
  createdBy: string;
  createdAt: Timestamp;
  status: 'active' | 'completed';
  portions: Record<string, Portion>;
}

const JUZ_NAMES_AR = [
  "الجزء الأول", "الجزء الثاني", "الجزء الثالث", "الجزء الرابع", "الجزء الخامس",
  "الجزء السادس", "الجزء السابع", "الجزء الثامن", "الجزء التاسع", "الجزء العاشر",
  "الجزء الحادي عشر", "الجزء الثاني عشر", "الجزء الثالث عشر", "الجزء الرابع عشر", "الجزء الخامس عشر",
  "الجزء السادس عشر", "الجزء السابع عشر", "الجزء الثامن عشر", "الجزء التاسع عشر", "الجزء العشرون",
  "الجزء الحادي والعشرون", "الجزء الثاني والعشرون", "الجزء الثالث والعشرون", "الجزء الرابع والعشرون", "الجزء الخامس والعشرون",
  "الجزء السادس والعشرون", "الجزء السابع والعشرون", "الجزء الثامن والعشرون", "الجزء التاسع والعشرون", "الجزء الثلاثون"
];

const JUZ_NAMES_EN = Array.from({ length: 30 }, (_, i) => `Juz ${i + 1}`);

const ISLAMIC_KHATMA_NAMES = [
  { ar: "ختمة التقوى", en: "Khatma of Taqwa" },
  { ar: "ختمة الإخلاص", en: "Khatma of Ikhlas" },
  { ar: "ختمة الهدى", en: "Khatma of Huda" },
  { ar: "ختمة النور", en: "Khatma of Noor" },
  { ar: "ختمة الفرقان", en: "Khatma of Furqan" },
  { ar: "ختمة السكينة", en: "Khatma of Sakeenah" },
  { ar: "ختمة الرضوان", en: "Khatma of Ridwan" },
  { ar: "ختمة الفوز", en: "Khatma of Success" },
  { ar: "ختمة الجنة", en: "Khatma of Jannah" },
  { ar: "ختمة المغفرة", en: "Khatma of Forgiveness" },
  { ar: "ختمة الرحمة", en: "Khatma of Mercy" },
  { ar: "ختمة الصدق", en: "Khatma of Truth" }
];

interface GroupKhatmaProps {
  standalone?: boolean;
}

const GroupKhatma: React.FC<GroupKhatmaProps> = ({ standalone = true }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile, addPoints, addJuzCompleted, isAuthReady } = useUser();
  const { isFullscreen, setIsFullscreen } = useTheme();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const currentUser = user;

  const [currentKhatma, setCurrentKhatma] = useState<Khatma | null>(null);
  const [myKhatmas, setMyKhatmas] = useState<Khatma[]>([]);
  const [availableKhatmas, setAvailableKhatmas] = useState<Khatma[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newKhatmaTitle, setNewKhatmaTitle] = useState("");
  const [isReading, setIsReading] = useState(false);

  const isAr = i18n.language === "ar";
  const juzNames = isAr ? JUZ_NAMES_AR : JUZ_NAMES_EN;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleTimeouts = useCallback(async (id: string, portions: Record<string, Portion>) => {
    const now = Date.now();
    const timeoutMs = 3 * 60 * 60 * 1000;
    const updates: Record<string, unknown> = {};
    let hasUpdates = false;

    Object.entries(portions).forEach(([key, portion]) => {
      if (portion.status === 'claimed' && portion.claimedAt) {
        const claimedTime = portion.claimedAt.toMillis();
        if (now - claimedTime > timeoutMs) {
          updates[`portions.${key}`] = {
            status: 'available',
            claimedBy: null,
            claimedByName: null,
            claimedAt: null,
            completedAt: null
          };
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
      try {
        await updateDoc(doc(db, "khatmas", id), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `khatmas/${id}`);
      }
    }
  }, []);

  useEffect(() => {
    if (!user || !isAuthReady) return;
    let isSubscribed = true;
    const khatmaId = searchParams.get("id");

    if (khatmaId) {
      setLoading(true);
      const unsubscribe = onSnapshot(doc(db, "khatmas", khatmaId), (snapshot) => {
        if (!isSubscribed) return;
        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<Khatma, 'id'>;
          setCurrentKhatma({ id: snapshot.id, ...data });
          setLoading(false);
          handleTimeouts(snapshot.id, data.portions);
        } else {
          toast.error(isAr ? "الختمة غير موجودة" : "Khatma not found");
          setCurrentKhatma(null);
          setLoading(false);
        }
      }, (err) => {
        if (!isSubscribed) return;
        handleFirestoreError(err, OperationType.GET, `khatmas/${khatmaId}`);
        setLoading(false);
      });
      return () => { isSubscribed = false; unsubscribe(); };
    } else {
      setCurrentKhatma(null);
      const loadLists = async () => {
        if (!isSubscribed) return;
        setLoading(true);
        try {
          const q = query(
            collection(db, "khatmas"),
            where("status", "==", "active"),
            orderBy("createdAt", "desc"),
            limit(50)
          );
          const snapshot = await getDocs(q);
          if (!isSubscribed) return;
          const allKhatmas = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Khatma));
          const mine = allKhatmas.filter(k => Object.values(k.portions).some(p => p.claimedBy === user.uid && p.status === 'claimed'));
          const available = allKhatmas.filter(k => k.type === 'public' && Object.values(k.portions).some(p => p.status === 'available') && !mine.some(m => m.id === k.id));
          setMyKhatmas(mine);
          setAvailableKhatmas(available);
        } catch (e) {
          if (isSubscribed) handleFirestoreError(e, OperationType.LIST, "khatmas");
        } finally {
          if (isSubscribed) setLoading(false);
        }
      };
      loadLists();
      return () => { isSubscribed = false; };
    }
  }, [user, isAuthReady, searchParams, isAr, handleTimeouts]);

  const createKhatma = async (type: 'public' | 'private') => {
    if (!auth.currentUser) return;
    setActionLoading(true);
    const toastId = toast.loading(isAr ? "جاري إنشاء الختمة..." : "Creating Khatma...");
    const randomJuz = (Math.floor(Math.random() * 30) + 1).toString();
    const initialPortions: Record<string, Portion> = {};
    for (let i = 1; i <= 30; i++) {
      const isAssigned = i.toString() === randomJuz;
      initialPortions[i.toString()] = {
        status: isAssigned ? 'claimed' : 'available',
        claimedBy: isAssigned ? auth.currentUser.uid : null,
        claimedByName: isAssigned ? (profile?.name || auth.currentUser.displayName || (isAr ? "مستخدم" : "User")) : null,
        claimedAt: isAssigned ? serverTimestamp() as Timestamp : null,
        completedAt: null
      };
    }
    try {
      const randomNameObj = ISLAMIC_KHATMA_NAMES[Math.floor(Math.random() * ISLAMIC_KHATMA_NAMES.length)];
      const defaultTitle = type === 'public' 
        ? (isAr ? randomNameObj.ar : randomNameObj.en)
        : (isAr ? "ختمة خاصة" : "Private Khatma");

      const docRef = await addDoc(collection(db, "khatmas"), {
        title: newKhatmaTitle || defaultTitle,
        type,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        portions: initialPortions
      });
      
      toast.success(isAr ? "تم إنشاء الختمة بنجاح" : "Khatma created successfully", { 
        id: toastId,
        duration: type === 'public' ? Infinity : 5000
      });
      setShowCreateModal(false);
      setNewKhatmaTitle("");
      setSearchParams({ id: docRef.id });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "khatmas");
      toast.error(isAr ? "فشل إنشاء الختمة" : "Failed to create Khatma", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const assignJuz = async (khatmaId: string, juzIndex: string) => {
    if (!user) return;
    await updateDoc(doc(db, "khatmas", khatmaId), {
      [`portions.${juzIndex}`]: {
        status: 'claimed',
        claimedBy: user.uid,
        claimedByName: profile?.name || user.displayName || (isAr ? "مستخدم" : "User"),
        claimedByAvatar: profile?.avatar || null,
        claimedAt: serverTimestamp(),
        completedAt: null
      }
    });
  };

  const joinPublicKhatma = async () => {
    if (!auth.currentUser) return;
    setActionLoading(true);
    const toastId = toast.loading(isAr ? "جاري البحث عن ختمة متاحة..." : "Searching for available Khatma...");
    try {
      const q = query(collection(db, "khatmas"), where("type", "==", "public"), where("status", "==", "active"), limit(20));
      const snapshot = await getDocs(q);
      let targetKhatmaId = "";
      let availableJuz: string[] = [];
      for (const d of snapshot.docs) {
        const data = d.data() as Khatma;
        if (Object.values(data.portions).some(p => p.claimedBy === auth.currentUser?.uid)) continue;
        const available = Object.entries(data.portions).filter(([_, p]) => p.status === 'available').map(([idx]) => idx);
        if (available.length > 0) { targetKhatmaId = d.id; availableJuz = available; break; }
      }
      if (targetKhatmaId) {
        const selectedJuz = availableJuz[Math.floor(Math.random() * availableJuz.length)];
        await assignJuz(targetKhatmaId, selectedJuz);
        toast.success(isAr ? "تم الانضمام للختمة بنجاح" : "Joined Khatma successfully", { id: toastId });
        setSearchParams({ id: targetKhatmaId });
      } else {
        await createKhatma('public');
      }
    } catch (e) {
      toast.error(isAr ? "فشل الانضمام للختمة" : "Failed to join Khatma", { id: toastId });
    } finally { setActionLoading(false); }
  };

  const completePortion = async (juzIndex: string) => {
    if (!user || !currentKhatma) return;
    setActionLoading(true);
    try {
      const updatedPortions = { ...currentKhatma.portions };
      updatedPortions[juzIndex] = { ...updatedPortions[juzIndex], status: 'completed', completedAt: Timestamp.now() };
      const allCompleted = Object.values(updatedPortions).every(p => p.status === 'completed');
      await updateDoc(doc(db, "khatmas", currentKhatma.id), {
        [`portions.${juzIndex}.status`]: 'completed',
        [`portions.${juzIndex}.completedAt`]: serverTimestamp(),
        status: allCompleted ? 'completed' : 'active'
      });
      addPoints(500); 
      if (allCompleted) { addJuzCompleted(); toast.success(isAr ? "مبارك! اكتملت الختمة بالكامل" : "Mabrouk! The entire Khatma is complete"); }
      toast.success(isAr ? "تقبل الله طاعتك!" : "May Allah accept your good deed!");
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `khatmas/${currentKhatma.id}`); }
    finally { setActionLoading(false); }
  };

  const quitKhatma = async () => {
    if (!currentKhatma || !user) return;
    setActionLoading(true);
    try {
      const juzIndex = Object.keys(currentKhatma.portions).find(key => currentKhatma.portions[key].claimedBy === user.uid && currentKhatma.portions[key].status === 'claimed');
      if (juzIndex) {
        await updateDoc(doc(db, "khatmas", currentKhatma.id), {
          [`portions.${juzIndex}`]: { status: 'available', claimedBy: null, claimedByName: null, claimedAt: null, completedAt: null }
        });
        toast.success(isAr ? "تم الانسحاب من الجزء بنجاح" : "Successfully quit the portion");
        setShowQuitConfirm(false);
        setSearchParams({});
      }
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `khatmas/${currentKhatma.id}`); }
    finally { setActionLoading(false); }
  };

  const progress = useMemo(() => {
    if (!currentKhatma) return 0;
    const completed = Object.values(currentKhatma.portions).filter(p => p.status === 'completed').length;
    return Math.round((completed / 30) * 100);
  }, [currentKhatma]);

  const userPortion = useMemo(() => {
    if (!currentKhatma || !user) return null;
    const entry = Object.entries(currentKhatma.portions).find(([_, p]) => p.claimedBy === user.uid && p.status === 'claimed');
    return entry ? { index: entry[0], ...entry[1] } : null;
  }, [currentKhatma, user]);

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (isReading && userPortion) {
    return (
      <div className={`bg-background ${isFullscreen ? "fixed inset-0 z-[200]" : "pb-24"}`}>
        <div className="sticky top-0 z-[210] bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setIsReading(false)} className="flex items-center gap-2 text-primary font-bold font-naskh">
            <ArrowRight size={20} className={isAr ? "rotate-180" : ""} />
            {isAr ? "العودة للختمة" : "Back to Khatma"}
          </button>
          <div className="text-center">
            <h2 className="text-sm font-bold font-naskh text-foreground">{juzNames[parseInt(userPortion.index) - 1]}</h2>
          </div>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary">
            <Maximize2 size={18} />
          </button>
        </div>
        <div className="max-w-4xl mx-auto"><QuranTextViewer juzNumber={parseInt(userPortion.index)} readOnly={true} /></div>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[220] w-full max-w-xs px-4">
          <button onClick={() => { completePortion(userPortion.index); setIsReading(false); }} disabled={actionLoading} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold font-naskh shadow-2xl flex items-center justify-center gap-3">
            <CheckCircle2 size={20} />
            {isAr ? "أتممت القراءة بحمد الله" : "Completed Reading"}
          </button>
        </div>
        <div className="fixed bottom-24 left-0 right-0 z-[205]"><QuranPlayerBar /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {standalone && (
        <header className="flex items-center justify-between mb-4">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh text-foreground">{isAr ? "الختمة الجماعية" : "Collaborative Khatma"}</h1>
          <div className="w-10" />
        </header>
      )}

      {!user ? (
        <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-center space-y-6">
           <Lock className="w-10 h-10 text-primary mx-auto" />
           <h2 className="text-xl font-bold font-naskh">{isAr ? "سجّل دخولك للمشاركة" : "Login to participate"}</h2>
           <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-primary text-white rounded-2xl font-bold font-naskh">{isAr ? "تسجيل الدخول" : "Sign In"}</button>
           <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      ) : !currentKhatma ? (
        <div className="space-y-8">
           <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-center space-y-4">
              <Users size={32} className="text-primary mx-auto" />
              <h2 className="text-xl font-bold font-naskh">{isAr ? "اقرأ القرآن مع الآخرين" : "Read Quran with Others"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                 <button onClick={joinPublicKhatma} className="p-6 bg-card border rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <Globe className="text-emerald-500 mx-auto mb-2" />
                    <span className="font-bold text-sm">{isAr ? "انضم لختمة عامة" : "Join Public"}</span>
                 </button>
                 <button onClick={() => setShowCreateModal(true)} className="p-6 bg-card border rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <Plus className="text-amber-500 mx-auto mb-2" />
                    <span className="font-bold text-sm">{isAr ? "إنشاء ختمة خاصة" : "Create Private"}</span>
                 </button>
              </div>
           </div>
           
           {myKhatmas.length > 0 && (
              <div className="space-y-3">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{isAr ? "ختماتي الحالية" : "Active Khatmas"}</h3>
                 {myKhatmas.map(k => (
                    <button key={k.id} onClick={() => setSearchParams({ id: k.id })} className="w-full p-4 bg-card border rounded-2xl flex items-center justify-between">
                       <span className="font-bold text-sm">{k.title}</span>
                       <ChevronRight size={16} className={isAr ? "rotate-180" : ""} />
                    </button>
                 ))}
              </div>
           )}
        </div>
      ) : (
        <div className="space-y-6">
           <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold font-naskh">{currentKhatma.title}</h2>
                    <p className="text-xs text-muted-foreground">{currentKhatma.type === 'public' ? (isAr ? "ختمة عامة" : "Public") : (isAr ? "ختمة خاصة" : "Private")}</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setSearchParams({})} className="p-2 bg-muted rounded-xl"><X size={18} /></button>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold">
                    <span>{toArabicNumber(progress)}%</span>
                    <span>{isAr ? "الإنجاز الكلي" : "Total Progress"}</span>
                 </div>
                 <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                 </div>
              </div>

              {userPortion && (
                 <div className="bg-primary text-white p-6 rounded-2xl flex items-center justify-between">
                    <div>
                       <p className="text-[10px] opacity-80">{isAr ? "جزءك الحالي" : "Your current portion"}</p>
                       <h3 className="text-lg font-bold font-naskh">{juzNames[parseInt(userPortion.index) - 1]}</h3>
                    </div>
                    <button onClick={() => setIsReading(true)} className="px-6 py-2 bg-white text-primary rounded-xl font-bold">{isAr ? "ابدأ القراءة" : "Read Now"}</button>
                 </div>
              )}
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(currentKhatma.portions).map(([idx, p]) => (
                 <button 
                   key={idx} 
                   onClick={() => p.status === 'available' && !userPortion && assignJuz(currentKhatma.id, idx)}
                   disabled={p.status !== 'available' || !!userPortion}
                   className={`p-4 rounded-2xl border text-center transition-all ${
                     p.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                     p.status === 'claimed' ? "bg-primary/10 border-primary/20 text-primary" :
                     "bg-card hover:border-primary/40"
                   }`}
                 >
                    <p className="text-[10px] font-bold">{juzNames[parseInt(idx) - 1]}</p>
                    <p className="text-[9px] opacity-60 mt-1">
                       {p.status === 'completed' ? (isAr ? "مكتمل" : "Done") : 
                        p.status === 'claimed' ? (p.claimedByName || (isAr ? "محجوز" : "Claimed")) : 
                        (isAr ? "متاح" : "Available")}
                    </p>
                 </button>
              ))}
           </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
           <div onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
           <div className="relative bg-card border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <h3 className="text-xl font-bold font-naskh">{isAr ? "إنشاء ختمة جديدة" : "New Khatma"}</h3>
              <input value={newKhatmaTitle} onChange={e => setNewKhatmaTitle(e.target.value)} placeholder={isAr ? "اسم الختمة..." : "Title..."} className="w-full p-4 bg-muted/50 rounded-2xl outline-none" />
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => createKhatma('public')} className="p-4 bg-emerald-500 text-white rounded-2xl font-bold">{isAr ? "عامة" : "Public"}</button>
                 <button onClick={() => createKhatma('private')} className="p-4 bg-amber-500 text-white rounded-2xl font-bold">{isAr ? "خاصة" : "Private"}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GroupKhatma;
