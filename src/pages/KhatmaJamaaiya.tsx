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
import { activityService, ActivityType } from "@/services/activityService";


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

// --- Components ---

const KhatmaJamaaiya = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile, addPoints, addJuzCompleted, isAuthReady } = useUser();
  const { isFullscreen, setIsFullscreen } = useTheme();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const currentUser = user; // Alias for compatibility with rest of the code

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

  // 1. Auth Setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // 3. Timeout Logic (Lazy)
  const handleTimeouts = useCallback(async (id: string, portions: Record<string, Portion>) => {
    const now = Date.now();
    const timeoutMs = 3 * 60 * 60 * 1000; // 3 hours
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

  // 2. Load Khatma from URL or Public
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
      
      return () => {
        isSubscribed = false;
        unsubscribe();
      };
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
          
          const mine = allKhatmas.filter(k => 
            Object.values(k.portions).some(p => p.claimedBy === user.uid && p.status === 'claimed')
          );
          
          const available = allKhatmas.filter(k => 
            k.type === 'public' && 
            Object.values(k.portions).some(p => p.status === 'available') &&
            !mine.some(m => m.id === k.id)
          );

          setMyKhatmas(mine);
          setAvailableKhatmas(available);
        } catch (e) {
          if (isSubscribed) {
            handleFirestoreError(e, OperationType.LIST, "khatmas");
          }
        } finally {
          if (isSubscribed) {
            setLoading(false);
          }
        }
      };
      loadLists();
      return () => {
        isSubscribed = false;
      };
    }
  }, [user, isAuthReady, searchParams, isAr, navigate, handleTimeouts]);

  // 4. Actions
  const createKhatma = async (type: 'public' | 'private') => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error(isAr ? "يجب تسجيل الدخول أولاً" : "Please login first");
      return;
    }
    
    setActionLoading(true);
    const toastId = toast.loading(isAr ? "جاري إنشاء الختمة..." : "Creating Khatma...");

    const randomJuz = (Math.floor(Math.random() * 30) + 1).toString();
    const initialPortions: Record<string, Portion> = {};
    for (let i = 1; i <= 30; i++) {
      const isAssigned = i.toString() === randomJuz;
      initialPortions[i.toString()] = {
        status: isAssigned ? 'claimed' : 'available',
        claimedBy: isAssigned ? currentUser.uid : null,
        claimedByName: isAssigned ? (profile?.name || currentUser.displayName || (isAr ? "مستخدم" : "User")) : null,
        claimedAt: isAssigned ? serverTimestamp() as Timestamp : null,
        completedAt: null
      };
    }

    try {
      const docRef = await addDoc(collection(db, "khatmas"), {
        title: newKhatmaTitle || (type === 'public' ? (isAr ? "ختمة عامة" : "Public Khatma") : (isAr ? "ختمة خاصة" : "Private Khatma")),
        type,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        portions: initialPortions
      });
      
      toast.success(isAr ? "تم إنشاء الختمة بنجاح" : "Khatma created successfully", { id: toastId });
      activityService.log('KHATMA_CREATED', `أنشأ ختمة جديدة: ${newKhatmaTitle || (type === 'public' ? 'ختمة عامة' : 'ختمة خاصة')}`);
      setShowCreateModal(false);
      setNewKhatmaTitle("");
      window.scrollTo(0, 0);
      navigate(`/khatma-jamaaiya?id=${docRef.id}`, { replace: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "khatmas");
      toast.error(isAr ? "فشل إنشاء الختمة" : "Failed to create Khatma", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const joinPublicKhatma = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error(isAr ? "يجب تسجيل الدخول أولاً" : "Please login first");
      return;
    }

    setActionLoading(true);
    const toastId = toast.loading(isAr ? "جاري البحث عن ختمة متاحة..." : "Searching for available Khatma...");
    
    try {
      const activeQ = query(
        collection(db, "khatmas"),
        where("status", "==", "active"),
        limit(50)
      );
      const activeSnapshot = await getDocs(activeQ);
      const existingKhatma = activeSnapshot.docs.find(d => {
        const data = d.data() as Khatma;
        return Object.values(data.portions).some(p => p.claimedBy === currentUser.uid && p.status === 'claimed');
      });

      if (existingKhatma) {
        toast.success(isAr ? "أنت مشارك بالفعل في ختمة نشطة" : "You are already participating in an active Khatma", { id: toastId });
        window.scrollTo(0, 0);
        navigate(`/khatma-jamaaiya?id=${existingKhatma.id}`, { replace: true });
        return;
      }

      const q = query(
        collection(db, "khatmas"), 
        where("type", "==", "public"), 
        where("status", "==", "active"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      
      let targetKhatmaId = "";
      let availableJuz: string[] = [];

      for (const d of snapshot.docs) {
        const data = d.data() as Khatma;
        const hasFinishedInThis = Object.values(data.portions).some(
          p => p.claimedBy === currentUser.uid && p.status === 'completed'
        );
        
        if (hasFinishedInThis) continue;

        const available = Object.entries(data.portions)
          .filter(([_, p]) => p.status === 'available')
          .map(([index]) => index);
        
        if (available.length > 0) {
          targetKhatmaId = d.id;
          availableJuz = available;
          break;
        }
      }

      if (targetKhatmaId) {
        const randomIndex = Math.floor(Math.random() * availableJuz.length);
        const selectedJuz = availableJuz[randomIndex];
        await assignJuz(targetKhatmaId, selectedJuz);
        toast.success(isAr ? "تم الانضمام للختمة بنجاح" : "Joined Khatma successfully", { id: toastId });
        window.scrollTo(0, 0);
        navigate(`/khatma-jamaaiya?id=${targetKhatmaId}`, { replace: true });
      } else {
        const randomJuz = (Math.floor(Math.random() * 30) + 1).toString();
        const initialPortions: Record<string, Portion> = {};
        for (let i = 1; i <= 30; i++) {
          const isAssigned = i.toString() === randomJuz;
          initialPortions[i.toString()] = {
            status: isAssigned ? 'claimed' : 'available',
            claimedBy: isAssigned ? currentUser.uid : null,
            claimedByName: isAssigned ? (profile?.name || currentUser.displayName || (isAr ? "مستخدم" : "User")) : null,
            claimedAt: isAssigned ? serverTimestamp() as Timestamp : null,
            completedAt: null
          };
        }
        const docRef = await addDoc(collection(db, "khatmas"), {
          title: isAr ? "ختمة المسلمين العامة" : "Global Muslim Khatma",
          type: 'public',
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          status: 'active',
          portions: initialPortions
        });
        
        toast.success(isAr ? "تم إنشاء ختمة جديدة والانضمام إليها" : "Created and joined new public Khatma", { id: toastId });
        window.scrollTo(0, 0);
        navigate(`/khatma-jamaaiya?id=${docRef.id}`, { replace: true });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "khatmas");
      toast.error(isAr ? "فشل الانضمام للختمة" : "Failed to join Khatma", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const assignJuz = async (khatmaId: string, juzIndex: string) => {
    if (!user) return;
    try {
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
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `khatmas/${khatmaId}`);
      throw e;
    }
  };

  const claimPortion = async (juzIndex: string) => {
    if (!user || !currentKhatma) return;
    
    const alreadyClaimed = Object.values(currentKhatma.portions).some(p => p.claimedBy === user.uid && p.status === 'claimed');
    if (alreadyClaimed) {
      toast.error(isAr ? "لديك جزء قيد القراءة بالفعل" : "You already have a portion being read");
      return;
    }

    setActionLoading(true);
    try {
      await assignJuz(currentKhatma.id, juzIndex);
      toast.success(isAr ? "تم حجز الجزء بنجاح" : "Portion claimed successfully");
    } catch (e) {
    } finally {
      setActionLoading(false);
    }
  };

  const completePortion = async (juzIndex: string) => {
    if (!user || !currentKhatma) return;
    setActionLoading(true);
    try {
      const updatedPortions = { ...currentKhatma.portions };
      updatedPortions[juzIndex] = {
        ...updatedPortions[juzIndex],
        status: 'completed',
        completedAt: Timestamp.now()
      };

      const allCompleted = Object.values(updatedPortions).every(p => p.status === 'completed');
      
      await updateDoc(doc(db, "khatmas", currentKhatma.id), {
        [`portions.${juzIndex}.status`]: 'completed',
        [`portions.${juzIndex}.completedAt`]: serverTimestamp(),
        status: allCompleted ? 'completed' : 'active'
      });

      addPoints(500); 
      if (allCompleted) {
        addJuzCompleted();
        toast.success(isAr ? "مبارك! اكتملت الختمة بالكامل" : "Mabrouk! The entire Khatma is complete");
        setTimeout(() => {
          navigate("/khatma-jamaaiya", { replace: true });
        }, 5000);
      }
      
      toast.success(isAr ? "تقبل الله طاعتك!" : "May Allah accept your good deed!");
      activityService.log('QUEST_COMPLETED', `أتم قراءة ${juzNames[parseInt(juzIndex) - 1]} في ختمة: ${currentKhatma.title}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `khatmas/${currentKhatma.id}`);
    } finally {
      setActionLoading(false);
    }
  };

  const quitKhatma = async () => {
    if (!currentKhatma || !user || !userPortion) return;

    setActionLoading(true);
    try {
      const juzIndex = Object.keys(currentKhatma.portions).find(
        key => currentKhatma.portions[key].claimedBy === user.uid && currentKhatma.portions[key].status === 'claimed'
      );

      if (juzIndex) {
        await updateDoc(doc(db, "khatmas", currentKhatma.id), {
          [`portions.${juzIndex}`]: {
            status: 'available',
            claimedBy: null,
            claimedByName: null,
            claimedAt: null,
            completedAt: null
          }
        });
        toast.success(isAr ? "تم الانسحاب من الجزء بنجاح" : "Successfully quit the portion");
        setShowQuitConfirm(false);
        navigate("/khatma-jamaaiya", { replace: true });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `khatmas/${currentKhatma.id}`);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteKhatma = async () => {
    if (!currentKhatma || !user) return;
    if (currentKhatma.createdBy !== user.uid) return;

    setActionLoading(true);
    try {
      console.log("Deleting Khatma:", currentKhatma.id);
      await deleteDoc(doc(db, "khatmas", currentKhatma.id));
      toast.success(isAr ? "تم حذف الختمة بنجاح" : "Khatma deleted successfully");
      setShowDeleteConfirm(false);
      navigate("/khatma-jamaaiya", { replace: true });
    } catch (e) {
      console.error("Delete Khatma Error:", e);
      handleFirestoreError(e, OperationType.DELETE, `khatmas/${currentKhatma.id}`);
    } finally {
      setActionLoading(false);
    }
  };

  const shareKhatma = async () => {
    if (!currentKhatma) return;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentKhatma.title,
          text: isAr ? `انضم إلينا في ختمة جماعية: ${currentKhatma.title}` : `Join us in a collaborative Khatma: ${currentKhatma.title}`,
          url
        });
      } catch (e) {
        console.warn("Share failed, falling back to QR Modal:", e);
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(isAr ? "تم نسخ الرابط" : "Link copied to clipboard");
  };

  // 5. Calculations
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

  const hasCompletedInThisKhatma = useMemo(() => {
    if (!currentKhatma || !user) return false;
    return Object.values(currentKhatma.portions).some(p => p.claimedBy === user.uid && p.status === 'completed');
  }, [currentKhatma, user]);

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (isReading && userPortion) {
    return (
      <div className={`min-h-screen bg-background ${isFullscreen ? "fixed inset-0 z-[200]" : "pb-24"}`}>
        <div className="sticky top-0 z-[210] bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setIsReading(false)}
            className="flex items-center gap-2 text-primary font-bold font-naskh"
          >
            <ArrowRight size={20} />
            {isAr ? "العودة للختمة" : "Back to Khatma"}
          </button>
          <div className="text-center">
            <h2 className="text-sm font-bold font-naskh text-foreground">{juzNames[parseInt(userPortion.index) - 1]}</h2>
            <p className="text-[10px] text-muted-foreground font-naskh">{currentKhatma?.title}</p>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <QuranTextViewer 
            juzNumber={parseInt(userPortion.index)} 
            readOnly={true}
          />
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[220] w-full max-w-xs px-4">
          <button
            onClick={() => {
              completePortion(userPortion.index);
              setIsReading(false);
            }}
            disabled={actionLoading}
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold font-naskh shadow-2xl flex items-center justify-center gap-3"
          >
            <CheckCircle2 size={20} />
            {isAr ? "أتممت القراءة بحمد الله" : "Completed Reading"}
          </button>
        </div>
        
        <div className="fixed bottom-24 left-0 right-0 z-[205]">
          <QuranPlayerBar />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between mb-4">
          {(!currentKhatma || !userPortion) ? (
            <BackButton />
          ) : (
            <div className="w-10" /> // Spacer when back is hidden
          )}
          <h1 className="text-xl font-bold font-naskh text-foreground">
            {isAr ? "الختمة الجماعية" : "Collaborative Khatma"}
          </h1>
          <div className="w-10 h-10" />
        </header>

        {!user ? (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-naskh text-foreground">
                  {isAr ? "تسجيل الدخول مطلوب" : "Login Required"}
                </h2>
                <p className="text-sm text-muted-foreground font-naskh leading-relaxed">
                  {isAr 
                    ? "يرجى تسجيل الدخول لتتمكن من الانضمام للختمات الجماعية وحجز الأجزاء."
                    : "Please log in to join collaborative Khatmas and claim portions."}
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold font-naskh shadow-islamic flex items-center justify-center gap-3"
              >
                <LogIn size={20} />
                {isAr ? "تسجيل الدخول" : "Sign In"}
              </button>
            </div>
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              title={isAr ? "الختمة الجماعية" : "Collaborative Khatma"}
              subtitle={isAr ? "سجّل دخولك للانضمام إلى الختمة" : "Sign in to join the Khatma"}
            />
          </div>
        ) : !currentKhatma ? (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-naskh text-foreground">
                  {isAr ? "اقرأ القرآن مع الآخرين" : "Read Quran with Others"}
                </h2>
                <p className="text-sm text-muted-foreground font-naskh leading-relaxed">
                  {isAr 
                    ? "انضم إلى ختمة عامة مع المسلمين حول العالم، أو أنشئ ختمة خاصة لأهلك وأصدقائك وشاركهم الأجر."
                    : "Join a public Khatma with Muslims worldwide, or create a private one for family and friends."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={joinPublicKhatma}
                disabled={actionLoading}
                className="p-6 bg-card border border-border rounded-3xl shadow-islamic hover:shadow-lg transition-all text-center space-y-4 group"
              >
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="font-bold font-naskh text-foreground">
                    {isAr ? "انضم لختمة عامة" : "Join Public Khatma"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-naskh">
                    {isAr ? "توزيع تلقائي للأجزاء المتاحة" : "Auto-assign available portions"}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                disabled={actionLoading}
                className="p-6 bg-card border border-border rounded-3xl shadow-islamic hover:shadow-lg transition-all text-center space-y-4 group"
              >
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="font-bold font-naskh text-foreground">
                    {isAr ? "إنشاء ختمة خاصة" : "Create Private Khatma"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-naskh">
                    {isAr ? "رابط خاص للعائلة والأصدقاء" : "Private link for family & friends"}
                  </p>
                </div>
              </button>
            </div>

            {/* My Active Khatmas */}
            {myKhatmas.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-naskh text-foreground flex items-center gap-2">
                  <BookMarked size={16} className="text-primary" />
                  {isAr ? "ختماتي الحالية" : "My Active Khatmas"}
                </h3>
                <div className="grid gap-3">
                  {myKhatmas.map(k => {
                    const myPortion = Object.entries(k.portions).find(([_, p]) => p.claimedBy === user.uid && p.status === 'claimed');
                    const juzIdx = myPortion ? parseInt(myPortion[0]) - 1 : 0;
                    const comp = Math.round((Object.values(k.portions).filter(p => p.status === 'completed').length / 30) * 100);
                    
                    return (
                      <button
                        key={k.id}
                        onClick={() => navigate(`/khatma-jamaaiya?id=${k.id}`)}
                        className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between hover:border-primary/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <BookOpen size={20} />
                          </div>
                          <div className="text-right">
                            <h4 className="text-xs font-bold font-naskh text-foreground">{k.title}</h4>
                            <p className="text-[10px] text-muted-foreground font-naskh">
                              {isAr ? `جزءك: ${juzNames[juzIdx]}` : `Your Juz: ${juzNames[juzIdx]}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <p className="text-[10px] font-bold text-primary">{toArabicNumber(comp)}%</p>
                          </div>
                          <ChevronRight size={16} className="text-muted-foreground transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Public Khatmas */}
            {availableKhatmas.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-naskh text-foreground flex items-center gap-2">
                  <Globe size={16} className="text-emerald-500" />
                  {isAr ? "ختمات عامة متاحة" : "Available Public Khatmas"}
                </h3>
                <div className="grid gap-3">
                  {availableKhatmas.map(k => {
                    const availableCount = Object.values(k.portions).filter(p => p.status === 'available').length;
                    const comp = Math.round((Object.values(k.portions).filter(p => p.status === 'completed').length / 30) * 100);
                    
                    return (
                      <button
                        key={k.id}
                        onClick={() => navigate(`/khatma-jamaaiya?id=${k.id}`)}
                        className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <Globe size={20} />
                          </div>
                          <div className="text-right">
                            <h4 className="text-xs font-bold font-naskh text-foreground">{k.title}</h4>
                            <p className="text-[10px] text-muted-foreground font-naskh">
                              {isAr ? `${toArabicNumber(availableCount)} أجزاء متاحة` : `${availableCount} portions available`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <p className="text-[10px] font-bold text-emerald-500">{toArabicNumber(comp)}%</p>
                          </div>
                          <ChevronRight size={16} className="text-muted-foreground transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Khatma Progress Header */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-islamic space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold font-naskh text-foreground">{currentKhatma.title}</h2>
                  <p className="text-xs text-muted-foreground font-naskh">
                    {currentKhatma.type === 'public' ? (isAr ? "ختمة عامة" : "Public Khatma") : (isAr ? "ختمة خاصة" : "Private Khatma")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={shareKhatma}
                    className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary"
                  >
                    <Share2 size={18} />
                  </button>
                  {currentKhatma.createdBy === user.uid && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-primary font-naskh">{toArabicNumber(progress)}%</span>
                  <span className="text-[10px] text-muted-foreground font-naskh">
                    {isAr ? "إجمالي الإنجاز" : "Overall Progress"}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                  <div 
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stats & Current User Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                <div className="bg-primary/5 rounded-2xl p-4 text-center space-y-1">
                  <p className="text-2xl font-bold text-primary">{toArabicNumber(Object.values(currentKhatma.portions).filter(p => p.status === 'completed').length)}</p>
                  <p className="text-[10px] text-muted-foreground font-naskh">{isAr ? "أجزاء تمت قراءتها" : "Portions Completed"}</p>
                </div>
                <div className="bg-emerald-500/5 rounded-2xl p-4 text-center space-y-1">
                  <p className="text-2xl font-bold text-emerald-600">{toArabicNumber(Object.values(currentKhatma.portions).filter(p => p.status === 'claimed').length)}</p>
                  <p className="text-[10px] text-muted-foreground font-naskh">{isAr ? "قيد القراءة حالياً" : "Currently Reading"}</p>
                </div>
              </div>

              {userPortion && (
                <div className="bg-primary text-primary-foreground rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-1">
                    <p className="text-[10px] opacity-80 font-naskh">{isAr ? "جزءك الحالي" : "Your current portion"}</p>
                    <h3 className="text-xl font-bold font-naskh">{juzNames[parseInt(userPortion.index) - 1]}</h3>
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    <button
                      onClick={() => setShowQuitConfirm(true)}
                      className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      title={isAr ? "انسحاب من الجزء" : "Quit Portion"}
                    >
                      <LogOut size={18} />
                    </button>
                    <button
                      onClick={() => setIsReading(true)}
                      className="px-6 py-2 bg-white text-primary rounded-xl font-bold font-naskh shadow-sm active:scale-95 transition-transform"
                    >
                      {isAr ? "ابدأ القراءة" : "Start Reading"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Portions Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold font-naskh text-foreground flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  {isAr ? "أجزاء الختمة" : "Khatma Portions"}
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-naskh">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {isAr ? "مكتمل" : "Completed"}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-naskh">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    {isAr ? "قيد القراءة" : "Reading"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(currentKhatma.portions).map(([index, portion]) => {
                  const isAvailable = portion.status === 'available';
                  const isMyPortion = portion.claimedBy === user.uid;
                  const isClaimedByOthers = portion.status === 'claimed' && !isMyPortion;
                  const isCompleted = portion.status === 'completed';

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        isCompleted ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50" :
                        isClaimedByOthers ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50" :
                        isMyPortion ? "bg-primary/5 border-primary shadow-sm" :
                        "bg-card border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-naskh ${
                          isCompleted ? "bg-emerald-500 text-white" :
                          isClaimedByOthers ? "bg-amber-500 text-white" :
                          isMyPortion ? "bg-primary text-white" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {toArabicNumber(index)}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold font-naskh ${isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
                            {juzNames[parseInt(index) - 1]}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-naskh">
                            {isCompleted ? (isAr ? `أتمّه: ${portion.claimedByName}` : `Completed by: ${portion.claimedByName}`) :
                             isClaimedByOthers ? (isAr ? `يقرأه: ${portion.claimedByName}` : `Reading: ${portion.claimedByName}`) :
                             isMyPortion ? (isAr ? "جزءك الحالي" : "Your current portion") :
                             (isAr ? "متاح للقراءة" : "Available to read")}
                          </p>
                        </div>
                      </div>

                      {isAvailable && !userPortion && !hasCompletedInThisKhatma && (
                        <button
                          onClick={() => claimPortion(index)}
                          disabled={actionLoading}
                          className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-bold font-naskh hover:bg-primary/90 transition-all"
                        >
                          {isAr ? "احجز الجزء" : "Claim Portions"}
                        </button>
                      )}

                      {isCompleted && (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Khatma Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <Plus size={32} />
              </div>
              <h3 className="text-xl font-bold font-naskh text-foreground">{isAr ? "إنشاء ختمة جديدة" : "Create New Khatma"}</h3>
              <p className="text-[10px] text-muted-foreground font-naskh">
                {isAr ? "سيتم حجز جزء عشوائي لك فور الإنشاء" : "A random portion will be assigned to you upon creation"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground font-naskh px-1">
                  {isAr ? "عنوان الختمة" : "Khatma Title"}
                </label>
                <input
                  type="text"
                  value={newKhatmaTitle}
                  onChange={(e) => setNewKhatmaTitle(e.target.value)}
                  placeholder={isAr ? "مثال: ختمة العائلة" : "e.g. Family Khatma"}
                  className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-primary/30 rounded-xl outline-none text-sm font-naskh transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => createKhatma('public')}
                  disabled={actionLoading}
                  className="py-4 bg-emerald-500 text-white rounded-2xl font-bold font-naskh shadow-lg flex flex-col items-center gap-1 hover:bg-emerald-600 transition-colors"
                >
                  <Globe size={20} />
                  <span className="text-xs">{isAr ? "ختمة عامة" : "Public"}</span>
                </button>
                <button
                  onClick={() => createKhatma('private')}
                  disabled={actionLoading}
                  className="py-4 bg-amber-500 text-white rounded-2xl font-bold font-naskh shadow-lg flex flex-col items-center gap-1 hover:bg-amber-600 transition-colors"
                >
                  <Lock size={20} />
                  <span className="text-xs">{isAr ? "ختمة خاصة" : "Private"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto text-destructive">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-naskh text-foreground">{isAr ? "حذف الختمة" : "Delete Khatma"}</h3>
              <p className="text-sm text-muted-foreground font-naskh leading-relaxed">
                {isAr ? "هل أنت متأكد من حذف هذه الختمة؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this Khatma? This action cannot be undone."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-3 bg-muted text-foreground rounded-xl font-bold font-naskh"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={deleteKhatma}
                disabled={actionLoading}
                className="py-3 bg-destructive text-white rounded-xl font-bold font-naskh shadow-lg"
              >
                {isAr ? "حذف" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirm Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowQuitConfirm(false)} />
          <div className="relative bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
              <LogOut size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-naskh text-foreground">{isAr ? "الانسحاب من الجزء" : "Quit Portion"}</h3>
              <p className="text-sm text-muted-foreground font-naskh leading-relaxed">
                {isAr ? "هل تريد الانسحاب من قراءة هذا الجزء؟ سيصبح متاحاً للآخرين." : "Do you want to quit reading this portion? It will become available for others."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="py-3 bg-muted text-foreground rounded-xl font-bold font-naskh"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={quitKhatma}
                disabled={actionLoading}
                className="py-3 bg-amber-500 text-white rounded-xl font-bold font-naskh shadow-lg"
              >
                {isAr ? "انسحاب" : "Quit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal (QR) */}
      {showShareModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">
            <h3 className="text-xl font-bold font-naskh text-foreground">{isAr ? "مشاركة الختمة" : "Share Khatma"}</h3>
            <div className="bg-white p-4 rounded-3xl inline-block shadow-inner">
              <QRCodeSVG value={window.location.href} size={200} />
            </div>
            <p className="text-[10px] text-muted-foreground font-naskh leading-relaxed px-4">
              {isAr ? "امسح الكود للانضمام للختمة أو انسخ الرابط أدناه" : "Scan the QR code to join or copy the link below"}
            </p>
            <div className="space-y-3">
              <button
                onClick={copyToClipboard}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold font-naskh shadow-islamic flex items-center justify-center gap-3"
              >
                <Share2 size={18} />
                {isAr ? "نسخ رابط الختمة" : "Copy Link"}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-3 text-muted-foreground font-bold font-naskh"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhatmaJamaaiya;
