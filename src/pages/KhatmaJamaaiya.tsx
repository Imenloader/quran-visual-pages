import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  LogOut
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { 
  collection, 
  query, 
  where, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  orderBy,
  getDoc
} from "firebase/firestore";
import { 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "@/firebase";
import { useUser } from "@/contexts/UserContext";
import BackButton from "@/components/BackButton";
import { toArabicNumber } from "@/data/quranData";
import QuranTextViewer from "@/components/QuranTextViewer";
import QuranPlayerBar from "@/components/QuranPlayerBar";
import { useTheme } from "@/contexts/ThemeContext";

// --- Types ---
// ... (rest of types)

interface Portion {
  status: 'available' | 'claimed' | 'completed';
  claimedBy: string | null;
  claimedByName?: string | null;
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
  const [currentKhatma, setCurrentKhatma] = useState<Khatma | null>(null);
  const [myKhatmas, setMyKhatmas] = useState<Khatma[]>([]);
  const [availableKhatmas, setAvailableKhatmas] = useState<Khatma[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
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

    // Safety timeout: if still loading after 8 seconds, force stop loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      toast.success(isAr ? "تم تسجيل الدخول بنجاح" : "Logged in successfully");
    } catch (e: unknown) {
      console.error("Login Error:", e);
      const error = e as { message?: string; code?: string };
      const errorMessage = error.message || (isAr ? "فشل تسجيل الدخول" : "Login failed");
      toast.error(isAr ? `فشل تسجيل الدخول: ${errorMessage}` : `Login failed: ${errorMessage}`);
      
      if (error.code === 'auth/unauthorized-domain') {
        toast.info(isAr ? "يرجى إضافة نطاق التطبيق إلى النطاقات المصرح بها في Firebase Console" : "Please add the app domain to authorized domains in Firebase Console");
      }
    }
  };

  // 2. Load Khatma from URL or Public
  useEffect(() => {
    if (!user || !isAuthReady) return;
    let isSubscribed = true;

    const khatmaId = searchParams.get("id");
    console.log("Khatma Effect Triggered:", { khatmaId, userId: user.uid });

    if (khatmaId) {
      setLoading(true);
      // Load specific khatma
      const unsubscribe = onSnapshot(doc(db, "khatmas", khatmaId), (snapshot) => {
        if (!isSubscribed) return;
        
        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<Khatma, 'id'>;
          setCurrentKhatma({ id: snapshot.id, ...data });
          setLoading(false);
          // Check for timeouts
          handleTimeouts(snapshot.id, data.portions);
        } else {
          console.warn("Khatma not found:", khatmaId);
          toast.error(isAr ? "الختمة غير موجودة" : "Khatma not found");
          setCurrentKhatma(null);
          setLoading(false);
        }
      }, (err) => {
        if (!isSubscribed) return;
        console.error("Khatma Snapshot Error:", err);
        handleFirestoreError(err, OperationType.GET, `khatmas/${khatmaId}`);
        setLoading(false);
      });
      
      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    } else {
      setCurrentKhatma(null);
      // Load lists
      const loadLists = async () => {
        if (!isSubscribed) return;
        setLoading(true);
        try {
          console.log("Loading khatma lists for user:", user.uid);
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
            console.error("Load Lists Error:", e);
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
  }, [user, isAuthReady, searchParams, isAr, navigate]);

  // 3. Timeout Logic (Lazy)
  const handleTimeouts = async (id: string, portions: Record<string, Portion>) => {
    const now = Date.now();
    const timeoutMs = 3 * 60 * 60 * 1000; // 3 hours
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
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
  };

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
      console.log("Creating Khatma...", { type, title: newKhatmaTitle });
      const docRef = await addDoc(collection(db, "khatmas"), {
        title: newKhatmaTitle || (type === 'public' ? (isAr ? "ختمة عامة" : "Public Khatma") : (isAr ? "ختمة خاصة" : "Private Khatma")),
        type,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        portions: initialPortions
      });
      
      console.log("Khatma created, navigating to:", docRef.id);
      toast.success(isAr ? "تم إنشاء الختمة بنجاح" : "Khatma created successfully", { id: toastId });
      setShowCreateModal(false);
      setNewKhatmaTitle("");
      window.scrollTo(0, 0);
      navigate(`/khatma-jamaaiya?id=${docRef.id}`, { replace: true });
    } catch (e) {
      console.error("Create Khatma Error:", e);
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
    console.log("Joining Public Khatma...");
    
    try {
      // 1. Check if user is already in an active khatma
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
        console.log("User already in active khatma, navigating:", existingKhatma.id);
        toast.success(isAr ? "أنت مشارك بالفعل في ختمة نشطة" : "You are already participating in an active Khatma", { id: toastId });
        window.scrollTo(0, 0);
        navigate(`/khatma-jamaaiya?id=${existingKhatma.id}`, { replace: true });
        return;
      }

      // 2. Find active public khatma with available portions
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
        
        // Check if user has already finished a juz in this khatma
        const hasFinishedInThis = Object.values(data.portions).some(
          p => p.claimedBy === currentUser.uid && p.status === 'completed'
        );
        
        if (hasFinishedInThis) {
          console.log(`User already finished a juz in khatma ${d.id}, skipping...`);
          continue; // Skip this khatma and look for another one
        }

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
        // 3. Assign a random available Juz
        const randomIndex = Math.floor(Math.random() * availableJuz.length);
        const selectedJuz = availableJuz[randomIndex];
        await assignJuz(targetKhatmaId, selectedJuz);
        console.log("Joined existing public khatma, navigating to:", targetKhatmaId);
        toast.success(isAr ? "تم الانضمام للختمة بنجاح" : "Joined Khatma successfully", { id: toastId });
        window.scrollTo(0, 0);
        navigate(`/khatma-jamaaiya?id=${targetKhatmaId}`, { replace: true });
      } else {
        // 4. Create new public one and assign random Juz
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
        
        console.log("Created and joined new public khatma, navigating to:", docRef.id);
        toast.success(isAr ? "تم إنشاء ختمة جديدة والانضمام إليها" : "Created and joined new public Khatma", { id: toastId });
        window.scrollTo(0, 0);
        navigate(`/khatma-jamaaiya?id=${docRef.id}`, { replace: true });
      }
    } catch (e) {
      console.error("Join Public Khatma Error:", e);
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
    
    // Check if user already has a claimed portion in this khatma
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
      // Error handled in assignJuz
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

      // Check if all are completed
      const allCompleted = Object.values(updatedPortions).every(p => p.status === 'completed');
      
      await updateDoc(doc(db, "khatmas", currentKhatma.id), {
        [`portions.${juzIndex}.status`]: 'completed',
        [`portions.${juzIndex}.completedAt`]: serverTimestamp(),
        status: allCompleted ? 'completed' : 'active'
      });

      addPoints(500); // Reward for completing a portion
      if (allCompleted) {
        addJuzCompleted();
        toast.success(isAr ? "مبارك! اكتملت الختمة بالكامل" : "Mabrouk! The entire Khatma is complete");
        // Redirect after a delay to allow seeing the trophy
        setTimeout(() => {
          navigate("/khatma-jamaaiya", { replace: true });
        }, 5000);
      }
      
      toast.success(isAr ? "تقبل الله طاعتك!" : "May Allah accept your good deed!");
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
    
    const copyToClipboard = () => {
      navigator.clipboard.writeText(url);
      toast.success(isAr ? "تم نسخ الرابط" : "Link copied to clipboard");
    };

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentKhatma.title,
          text: isAr ? `انضم إلينا في ختمة جماعية: ${currentKhatma.title}` : `Join us in a collaborative Khatma: ${currentKhatma.title}`,
          url
        });
      } catch (e) {
        console.warn("Share failed, falling back to clipboard:", e);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
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
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold font-naskh shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
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
                onClick={loginWithGoogle}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold font-naskh shadow-islamic flex items-center justify-center gap-3"
              >
                <Globe size={20} />
                {isAr ? "تسجيل الدخول بجوجل" : "Sign in with Google"}
              </button>
            </div>
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
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
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
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
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
                          <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
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
                          <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Khatma View */}
            <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-islamic space-y-6 relative overflow-hidden">
              {currentKhatma.status === 'completed' && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-[2rem] shadow-2xl text-center space-y-4 max-w-[90%]"
                  >
                    <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
                    <h2 className="text-2xl font-bold font-naskh text-emerald-600">
                      {isAr ? "تمت الختمة بنجاح!" : "Khatma Completed!"}
                    </h2>
                    <p className="text-sm text-muted-foreground font-naskh leading-relaxed">
                      {isAr 
                        ? "تقبل الله منا ومنكم صالح الأعمال. هنيئاً لكم ختم كتاب الله."
                        : "May Allah accept from us and you. Congratulations on completing the Book of Allah."}
                    </p>
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-800 text-xs font-naskh leading-loose italic">
                      "اللهم ارحمني بالقرآن واجعله لي إماما ونورا وهدى ورحمة، اللهم ذكرني منه ما نسيت وعلمني منه ما جهلت وارزقني تلاوته آناء الليل وأطراف النهار واجعله لي حجة يا رب العالمين"
                    </div>
                    <button 
                      onClick={() => navigate("/khatma-jamaaiya")}
                      className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold font-naskh"
                    >
                      {isAr ? "العودة للرئيسية" : "Back to Home"}
                    </button>
                  </motion.div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <BookOpen className="text-primary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-naskh text-foreground">{currentKhatma.title}</h2>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-naskh">
                      {currentKhatma.type === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                      <span>{currentKhatma.type === 'public' ? (isAr ? "عامة" : "Public") : (isAr ? "خاصة" : "Private")}</span>
                      <span>•</span>
                      <span>{isAr ? `منذ ${new Date(currentKhatma.createdAt?.toMillis()).toLocaleDateString('ar-EG')}` : `Since ${new Date(currentKhatma.createdAt?.toMillis()).toLocaleDateString()}`}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {userPortion && (
                    <button 
                      onClick={() => setShowQuitConfirm(true)}
                      disabled={actionLoading}
                      className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title={isAr ? "انسحاب من الجزء" : "Quit Portion"}
                    >
                      <LogOut size={18} />
                    </button>
                  )}
                  {currentKhatma.createdBy === user.uid && currentKhatma.type === 'private' && (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={actionLoading}
                      className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                      title={isAr ? "حذف الختمة" : "Delete Khatma"}
                    >
                      <Plus className="rotate-45" size={18} />
                    </button>
                  )}
                  <button 
                    onClick={shareKhatma}
                    className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-naskh font-bold">
                  <span className="text-muted-foreground">{isAr ? "نسبة الإنجاز" : "Completion"}</span>
                  <span className="text-primary">{toArabicNumber(progress)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              {userPortion ? (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Clock className="text-primary animate-pulse" size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-naskh uppercase tracking-widest">{isAr ? "مهمتك الحالية" : "Your Current Task"}</p>
                        <p className="text-sm font-bold font-naskh text-foreground">{juzNames[parseInt(userPortion.index) - 1]}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsReading(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold font-naskh shadow-md active:scale-95 transition-transform flex items-center gap-2"
                    >
                      <BookMarked size={14} />
                      {isAr ? "ابدأ القراءة" : "Start Reading"}
                    </button>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
                    <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-700 font-naskh leading-tight">
                      {isAr 
                        ? "يرجى إكمال القراءة خلال 3 ساعات، وإلا سيتم إتاحة الجزء لمتطوع آخر لضمان استمرار الختمة."
                        : "Please complete reading within 3 hours, otherwise the portion will be released for others."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/30 rounded-2xl flex items-center gap-3">
                  <Info size={18} className="text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground font-naskh leading-relaxed">
                    {isAr 
                      ? "اختر جزءاً متاحاً من القائمة أدناه لتبدأ القراءة وتساهم في الختمة."
                      : "Choose an available portion from the list below to start reading."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold font-naskh text-foreground px-2 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                {isAr ? "أجزاء المصحف" : "Quran Portions"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(currentKhatma.portions)
                  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                  .filter(([index, portion]) => {
                    // Restricted Visibility: Only show assigned Juz if user has one
                    if (userPortion) {
                      return index === userPortion.index;
                    }
                    return true;
                  })
                  .map(([index, portion]) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        portion.status === 'completed' 
                          ? "bg-emerald-500/5 border-emerald-500/20 opacity-80" 
                          : portion.status === 'claimed'
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-card border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                          portion.status === 'completed' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {toArabicNumber(index)}
                        </div>
                        <div>
                          <p className="text-xs font-bold font-naskh text-foreground">{juzNames[parseInt(index) - 1]}</p>
                          <p className="text-[9px] text-muted-foreground font-naskh">
                            {portion.status === 'completed' 
                              ? (isAr ? "تمت القراءة" : "Completed")
                              : portion.status === 'claimed'
                              ? (isAr ? `${portion.claimedByName || "مستخدم"} يقرأ هذا الجزء` : `${portion.claimedByName || "User"} is reading this juz`)
                              : (isAr ? "غير متاح حالياً" : "Not available")}
                          </p>
                        </div>
                      </div>
                      
                      {portion.status === 'available' && !userPortion && !hasCompletedInThisKhatma && (
                        <button
                          onClick={() => claimPortion(index)}
                          disabled={actionLoading}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title={isAr ? "حجز الجزء" : "Claim Portion"}
                        >
                          <Plus size={20} />
                        </button>
                      )}

                      {portion.status === 'completed' && (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      )}

                      {portion.status === 'claimed' && (
                        <Clock size={16} className="text-amber-500 animate-pulse" />
                      )}
                    </div>
                  ))}
              </div>
              
              {userPortion && (
                <div className="p-6 bg-muted/20 rounded-3xl border border-dashed border-border text-center space-y-4">
                  <div className="space-y-2">
                    <Lock className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground font-naskh">
                      {isAr 
                        ? "تم إخفاء باقي الأجزاء للتركيز على مهمتك الحالية." 
                        : "Other portions are hidden to help you focus on your task."}
                    </p>
                  </div>
                  
                  {/* Allow going back if it's a private khatma or just to see other khatmas, 
                      but user requested "only after finishing". 
                      However, we should provide a way to leave if they really want to, 
                      maybe with a warning. But I will stick to the request.
                  */}
                  <button
                    onClick={() => {
                      setCurrentKhatma(null);
                      setSearchParams({});
                    }}
                    className="text-[10px] text-primary font-bold font-naskh underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {isAr ? "العودة لقائمة الختمات" : "Back to Khatmas List"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold font-naskh text-foreground">
                  {isAr ? "إنشاء ختمة جديدة" : "Create New Khatma"}
                </h3>
                <p className="text-xs text-muted-foreground font-naskh">
                  {isAr ? "أدخل اسماً لختمتك الخاصة" : "Enter a name for your private Khatma"}
                </p>
              </div>

              <input 
                type="text"
                value={newKhatmaTitle}
                onChange={(e) => setNewKhatmaTitle(e.target.value)}
                placeholder={isAr ? "مثلاً: ختمة العائلة" : "e.g. Family Khatma"}
                className="w-full p-4 bg-muted/50 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-naskh text-center"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl font-bold font-naskh"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() => createKhatma('private')}
                  disabled={actionLoading || !newKhatmaTitle.trim()}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold font-naskh shadow-islamic disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isAr ? "إنشاء" : "Create")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold font-naskh text-foreground">
                  {isAr ? "حذف الختمة" : "Delete Khatma"}
                </h3>
                <p className="text-xs text-muted-foreground font-naskh">
                  {isAr 
                    ? "هل أنت متأكد من حذف هذه الختمة؟ لا يمكن التراجع عن هذا الإجراء." 
                    : "Are you sure you want to delete this Khatma? This action cannot be undone."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl font-bold font-naskh"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={deleteKhatma}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-destructive text-white rounded-xl font-bold font-naskh shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isAr ? "حذف" : "Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Quit Confirmation Modal */}
      <AnimatePresence>
        {showQuitConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuitConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <LogOut size={32} />
                </div>
                <h3 className="text-xl font-bold font-naskh text-foreground">
                  {isAr ? "انسحاب من الجزء" : "Quit Portion"}
                </h3>
                <p className="text-xs text-muted-foreground font-naskh">
                  {isAr 
                    ? "هل أنت متأكد من الانسحاب من هذا الجزء؟ سيتم إتاحته لمتطوع آخر." 
                    : "Are you sure you want to quit this portion? It will be released for another volunteer."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl font-bold font-naskh"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={quitKhatma}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold font-naskh shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isAr ? "انسحاب" : "Quit")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KhatmaJamaaiya;
