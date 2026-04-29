import React, { useState, useEffect } from "react";
import { Users, Plus, Play, Pause, RotateCcw, Share2, LogOut, Sparkles, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { db, auth } from "@/firebase";
import { collection, doc, onSnapshot, updateDoc, setDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove } from "firebase/firestore";
import { toArabicNumber } from "@/data/quranData";
import QuranHeader from "@/components/QuranHeader";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

interface AthkarCircle {
  id: string;
  name: string;
  target: number;
  current: number;
  participants: { uid: string; name: string; avatar: string; count: number }[];
  createdBy: string;
  createdAt: any;
}

const AthkarCircles: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [searchParams, setSearchParams] = useSearchParams();
  const circleId = searchParams.get("id");
  const [currentCircle, setCurrentCircle] = useState<AthkarCircle | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCircleName, setNewCircleName] = useState("");
  const [newCircleTarget, setNewCircleTarget] = useState(1000);
  const user = auth.currentUser;

  useEffect(() => {
    if (circleId) {
      setLoading(true);
      const unsub = onSnapshot(doc(db, "athkar_circles", circleId), (doc) => {
        if (doc.exists()) {
          setCurrentCircle({ id: doc.id, ...doc.data() } as AthkarCircle);
        } else {
          toast.error(isAr ? "الحلقة غير موجودة" : "Circle not found");
          setSearchParams({});
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [circleId]);

  const createCircle = async () => {
    if (!user || !newCircleName.trim()) return;
    setLoading(true);
    try {
      const newId = Math.random().toString(36).substring(7);
      const circleData = {
        name: newCircleName,
        target: newCircleTarget,
        current: 0,
        participants: [{
          uid: user.uid,
          name: user.displayName || (isAr ? "مستخدم" : "User"),
          avatar: user.photoURL || "",
          count: 0
        }],
        createdBy: user.uid,
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, "athkar_circles", newId), circleData);
      setSearchParams({ id: newId });
      toast.success(isAr ? "تم إنشاء حلقة الذكر" : "Athkar circle created");
    } catch (e) {
      toast.error(isAr ? "فشل إنشاء الحلقة" : "Failed to create circle");
    } finally {
      setLoading(false);
    }
  };

  const joinCircle = async (id: string) => {
    if (!user) return;
    try {
      const circleRef = doc(db, "athkar_circles", id);
      await updateDoc(circleRef, {
        participants: arrayUnion({
          uid: user.uid,
          name: user.displayName || (isAr ? "مستخدم" : "User"),
          avatar: user.photoURL || "",
          count: 0
        })
      });
    } catch (e) {
      console.error("Join error:", e);
    }
  };

  const increment = async () => {
    if (!user || !currentCircle) return;
    const circleRef = doc(db, "athkar_circles", currentCircle.id);
    const updatedParticipants = currentCircle.participants.map(p => {
      if (p.uid === user.uid) {
        return { ...p, count: p.count + 1 };
      }
      return p;
    });

    await updateDoc(circleRef, {
      current: currentCircle.current + 1,
      participants: updatedParticipants
    });
  };

  const shareCircle = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success(isAr ? "تم نسخ رابط الحلقة" : "Circle link copied");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader />
      
      <main className="container-responsive py-8">
        {!currentCircle ? (
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500">
                <Users size={40} />
              </div>
              <h1 className="text-4xl font-serif font-bold text-primary">{isAr ? "حلقات الذكر الجماعية" : "Group Athkar Circles"}</h1>
              <p className="text-muted-foreground font-naskh">
                {isAr ? "تعاون مع أصدقائك في الوصول لمليونية التسبيح" : "Collaborate with friends to reach dhikr goals together"}
              </p>
            </div>

            <div className="p-8 bg-card border border-border/40 rounded-[2.5rem] space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary/60 uppercase tracking-widest">{isAr ? "اسم الحلقة" : "Circle Name"}</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary/20 font-naskh"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  placeholder={isAr ? "مثلاً: تسبيحات الفجر" : "e.g. Morning Tasbih"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary/60 uppercase tracking-widest">{isAr ? "الهدف الإجمالي" : "Total Goal"}</label>
                <input
                  type="number"
                  className="w-full h-12 px-4 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary/20 font-naskh"
                  value={newCircleTarget}
                  onChange={(e) => setNewCircleTarget(parseInt(e.target.value))}
                />
              </div>
              <button
                onClick={createCircle}
                disabled={loading || !newCircleName}
                className="w-full h-14 bg-primary text-white rounded-2xl font-bold font-naskh shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 active:scale-95"
              >
                {isAr ? "إنشاء حلقة جديدة" : "Create New Circle"}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between bg-card/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-border/40">
              <div className="flex items-center gap-4">
                <button onClick={() => setSearchParams({})} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                  <LogOut size={18} className="rotate-180" />
                </button>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary">{currentCircle.name}</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{isAr ? "حلقة نشطة الآن" : "Active Circle Now"}</p>
                </div>
              </div>
              <button onClick={shareCircle} className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95">
                <Share2 size={20} />
              </button>
            </div>

            <div className="bg-card border border-border/40 rounded-[3rem] p-12 text-center space-y-8 shadow-islamic relative overflow-hidden">
               <div className="absolute inset-0 pattern-islamic opacity-[0.02]" />
               <div className="relative z-10">
                 <div className="text-[120px] font-serif font-bold text-primary leading-none select-none">
                   {isAr ? toArabicNumber(currentCircle.current) : currentCircle.current}
                 </div>
                 <p className="text-muted-foreground font-naskh">
                   {isAr ? `من إجمالي ${toArabicNumber(currentCircle.target)}` : `of ${currentCircle.target} total`}
                 </p>
                 
                 <div className="mt-8 h-3 bg-muted rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-emerald-500 shadow-emerald-500/20 shadow-lg transition-all duration-500"
                    style={{ width: `${(currentCircle.current / currentCircle.target) * 100}%` }}
                   />
                 </div>

                 <button
                  onClick={increment}
                  className="mt-12 w-32 h-32 rounded-full bg-primary text-white text-4xl font-bold shadow-2xl hover:shadow-primary/40 flex items-center justify-center mx-auto transition-transform active:scale-90"
                 >
                   +1
                 </button>
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold font-naskh text-foreground px-4 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                {isAr ? "المشاركون حالياً" : "Participants"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentCircle.participants.map(p => (
                  <div key={p.uid} className="p-4 rounded-2xl bg-card border border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {p.avatar ? (
                        <img src={p.avatar} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Users size={18} />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold font-naskh">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{isAr ? "يسبح الآن" : "Praising now"}</p>
                      </div>
                    </div>
                    <div className="text-lg font-serif font-bold text-primary">
                      {isAr ? toArabicNumber(p.count) : p.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AthkarCircles;
