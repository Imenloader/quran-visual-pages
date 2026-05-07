import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";
import { communityService, Duel } from "@/services/communityService";
import { 
  Zap, 
  Sword, 
  Target, 
  Plus, 
  Check, 
  X,
  Users,
  Trophy,
  Loader2
} from "lucide-react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, doc, getDocs, or } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SpiritualDuels = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { profile } = useUser();
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [pendingDuels, setPendingDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;

    // We must query by initiatorId or targetId to bypass Firestore security rules correctly.
    // However, onSnapshot with `or` might not work correctly if indexes are missing or depending on firebase version.
    // If it fails, we catch the error to stop infinite loading.
    const q = query(
      collection(db, "duels"),
      or(
        where("initiatorId", "==", profile.uid),
        where("targetId", "==", profile.uid)
      )
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Duel[];

      // Filter out completed ones, and ensure gender matches if needed (though user is one of the parties anyway)
      const relevant = all.filter(d => ["active", "pending"].includes(d.status));
      
      setActiveDuels(relevant.filter(d => d.status === 'active'));
      setPendingDuels(relevant.filter(d => d.status === 'pending'));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching duels:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [profile?.uid]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!profile?.friendIds || profile.friendIds.length === 0) return;
      const q = query(collection(db, "profiles"), where("__name__", "in", profile.friendIds));
      const snap = await getDocs(q);
      setFriends(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchFriends();
  }, [profile?.friendIds]);

  const handleCreateDuel = async (friend: any) => {
    if (!profile.uid) return;
    try {
      await communityService.createDuel(
        profile.uid,
        profile.name,
        friend.id,
        friend.name,
        'reading_pages',
        10, // Default goal: 10 pages
        profile.gender || 'unspecified'
      );
      toast.success(isAr ? 'تم إرسال طلب التحدي' : 'Duel request sent');
      setShowCreate(false);
    } catch (e) {
      toast.error(isAr ? 'فشل إرسال التحدي' : 'Failed to send challenge');
    }
  };

  const handleAccept = async (duel: Duel) => {
    if (!duel.id || !profile.uid) return;
    try {
      await communityService.acceptDuel(duel.id, profile.uid, profile.name, duel.initiatorId);
      toast.success(isAr ? 'تم قبول التحدي! بالتوفيق' : 'Duel accepted! Good luck');
    } catch (e) {
      toast.error(isAr ? 'فشل قبول التحدي' : 'Failed to accept duel');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gold/10">
            <Sword className="text-gold" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-primary">{isAr ? 'التحديات الروحانية' : 'Spiritual Duels'}</h3>
            <p className="text-xs text-muted-foreground">{isAr ? 'تنافس مع أصدقائك في طاعة الله' : 'Compete with friends in obedience to Allah'}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={16} />
          {isAr ? 'تحدي جديد' : 'New Duel'}
        </button>
      </div>

      {/* Active Duels */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
          <Zap size={14} className="text-gold fill-gold" />
          {isAr ? 'تحديات نشطة' : 'Active Duels'}
        </h4>
        
        {activeDuels.length === 0 ? (
          <div className="p-8 border border-dashed border-border/40 rounded-3xl text-center">
            <p className="text-xs text-muted-foreground italic">{isAr ? 'لا توجد تحديات نشطة حالياً' : 'No active duels at the moment'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDuels.map((duel) => {
              const isInitiator = duel.initiatorId === profile.uid;
              const myProgress = isInitiator ? duel.initiatorProgress : duel.targetProgress;
              const opponentProgress = isInitiator ? duel.targetProgress : duel.initiatorProgress;
              const opponentName = isInitiator ? duel.targetName : duel.initiatorName;
              const progressPct = Math.min(100, (myProgress / duel.goal) * 100);
              const oppPct = Math.min(100, (opponentProgress / duel.goal) * 100);

              return (
                <div key={duel.id} className="p-5 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 bg-gold/10 rounded-bl-2xl">
                    <Zap size={12} className="text-gold" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-primary">{isAr ? 'تحدي القراءة' : 'Reading Challenge'}</span>
                      <span className="text-gold">{isAr ? 'الهدف:' : 'Goal:'} {duel.goal} {isAr ? 'صفحة' : 'pages'}</span>
                    </div>

                    <div className="space-y-3">
                      {/* My Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{isAr ? 'تقدمك' : 'Your Progress'}</span>
                          <span>{myProgress} / {duel.goal}</span>
                        </div>
                        <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>

                      {/* Opponent Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>{opponentName}</span>
                          <span>{opponentProgress} / {duel.goal}</span>
                        </div>
                        <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${oppPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {pendingDuels.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-primary flex items-center gap-2">
            <Bell size={14} className="text-primary" />
            {isAr ? 'دعوات بانتظار الرد' : 'Pending Invitations'}
          </h4>
          <div className="space-y-2">
            {pendingDuels.map((duel) => {
              const isReceived = duel.targetId === profile.uid;
              if (!isReceived) return null;

              return (
                <div key={duel.id} className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                      <Sword size={20} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">{duel.initiatorName} {isAr ? 'يدعوك لتحدي قراءة' : 'invited you to a reading duel'}</p>
                      <p className="text-[10px] text-muted-foreground">{duel.goal} {isAr ? 'صفحة' : 'pages'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAccept(duel)}
                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                    >
                      <Check size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Modal (Simple list for now) */}
      {showCreate && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-primary">{isAr ? 'اختر منافساً' : 'Choose Opponent'}</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-full hover:bg-primary/5"><X size={20} /></button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {friends.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground p-8">{isAr ? 'لا يوجد أصدقاء متاحون للتحدي' : 'No friends available to challenge'}</p>
              ) : (
                friends.map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => handleCreateDuel(friend)}
                    className="w-full p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all flex items-center gap-4"
                  >
                    <img src={friend.avatar || "/avatar-man-1.svg"} className="w-10 h-10 rounded-xl object-cover" />
                    <span className="font-bold text-sm flex-1 text-right">{friend.name}</span>
                    <Plus size={16} className="text-primary" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Bell = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default SpiritualDuels;
