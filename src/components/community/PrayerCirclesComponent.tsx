import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db, auth } from '@/firebase';
import { collection, query, onSnapshot, doc, getDoc, addDoc, serverTimestamp, orderBy, limit, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import BackButton from '@/components/BackButton';
import { 
  Users, 
  Heart, 
  Plus, 
  ChevronRight, 
  HandHelping,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { toArabicNumber } from '@/data/quranData';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Circle {
  id: string;
  name: string;
  members: string[] | Record<string, { uid: string; name?: string }>;
  createdBy: string;
  lastMessage?: string;
}

interface PrayerCirclesComponentProps {
  standalone?: boolean;
}

const PrayerCirclesComponent: React.FC<PrayerCirclesComponentProps> = ({ standalone = true }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [circles, setCircles] = useState<Circle[]>([]);
  const [duaRequests, setDuaRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDuaModal, setShowDuaModal] = useState(false);
  const [duaText, setDuaText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'prayer_circles'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubCircles = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Circle));
      setCircles(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    const duaQuery = query(collection(db, 'dua_requests'), orderBy('createdAt', 'desc'), limit(20));
    const unsubDuas = onSnapshot(duaQuery, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDuaRequests(data);
    });

    return () => {
      unsubCircles();
      unsubDuas();
    };
  }, []);

  const createCircle = async () => {
    if (!auth.currentUser) {
      toast.error(t('common.loginRequired'));
      return;
    }
    const name = prompt(t('prayerCircles.promptName'));
    if (!name) return;
    try {
      await addDoc(collection(db, 'prayer_circles'), {
        name,
        createdBy: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        createdAt: serverTimestamp()
      });
      toast.success(t('prayerCircles.createSuccess'));
    } catch (e) {
      toast.error(t('prayerCircles.createError'));
    }
  };

  const joinCircle = async (circleId: string, members: Circle["members"]) => {
    if (!auth.currentUser) {
       toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
       return;
    }
    
    const currentUid = auth.currentUser.uid;
    
    try {
      const circleRef = doc(db, 'prayer_circles', circleId);
      const latest = await getDoc(circleRef);
      
      if (!latest.exists()) {
        toast.error(isArabic ? 'الحلقة غير موجودة' : 'Circle not found');
        return;
      }

      const data = latest.data();
      const latestMembers = data.members || [];
      
      // Better member ID extraction
      const getMemberIds = (m: any) => {
        if (Array.isArray(m)) return m;
        if (m && typeof m === 'object') {
          return Object.values(m).map((val: any) => typeof val === 'string' ? val : val?.uid).filter(Boolean);
        }
        return [];
      };

      const memberIds = getMemberIds(latestMembers);
      
      if (memberIds.includes(currentUid)) {
        toast.info(isArabic ? 'أنت عضو بالفعل في هذه الحلقة' : 'You are already a member');
        return;
      }

      if (Array.isArray(latestMembers)) {
        await updateDoc(circleRef, {
          members: arrayUnion(currentUid)
        });
      } else {
        // Handle legacy object structure if it exists
        await updateDoc(circleRef, {
          [`members.${currentUid}`]: {
            uid: currentUid,
            name: auth.currentUser.displayName || (isArabic ? 'مستخدم' : 'User'),
            joinedAt: serverTimestamp()
          }
        });
      }
      toast.success(isArabic ? 'تم الانضمام للحلقة بنجاح' : 'Joined circle successfully');
    } catch (e) {
      console.error('Join circle failed:', e);
      toast.error(isArabic ? 'عذراً، فشل الانضمام. يرجى المحاولة لاحقاً' : 'Failed to join. Please try again later');
    }
  };

  const handleSubmitDua = async () => {
    if (!auth.currentUser || !duaText.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'dua_requests'), {
        text: duaText.trim(),
        userName: auth.currentUser.displayName || t('profile.defaultName'),
        userId: auth.currentUser.uid,
        userAvatar: auth.currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        ameenCount: 0,
        ameeners: []
      });
      toast.success(t('prayerCircles.requestModal.success'));
      setDuaText('');
      setShowDuaModal(false);
    } catch (e) {
      toast.error(t('prayerCircles.requestModal.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmeen = async (id: string, currentAmeeners: string[]) => {
    if (!auth.currentUser) {
       toast.error(t('common.loginRequired'));
       return;
    }
    if (currentAmeeners.includes(auth.currentUser.uid)) return;
    try {
      await updateDoc(doc(db, 'dua_requests', id), {
        ameenCount: increment(1),
        ameeners: [...currentAmeeners, auth.currentUser.uid]
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: isArabic ? ar : enUS 
      });
    } catch (e) {
      return '';
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      {standalone && (
        <header className="flex items-center justify-between mb-4">
          <BackButton />
          <h1 className="text-xl font-bold font-naskh text-foreground">{t('prayerCircles.title')}</h1>
          <div className="w-10" />
        </header>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={createCircle} className="p-6 rounded-3xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-4 text-right">
           <Plus size={24} />
           <div>
              <h3 className="font-bold text-sm">{t('prayerCircles.createTitle')}</h3>
              <p className="text-[10px] opacity-70">{t('prayerCircles.createDesc')}</p>
           </div>
        </button>
        <button onClick={() => setShowDuaModal(true)} className="p-6 rounded-3xl bg-gold/10 text-gold-deep border border-gold/20 flex items-center gap-4 text-right">
           <HandHelping size={24} />
           <div>
              <h3 className="font-bold text-sm">{t('prayerCircles.requestDua')}</h3>
              <p className="text-[10px] opacity-70">{t('prayerCircles.requestDuaDesc')}</p>
           </div>
        </button>
      </div>

      <div className="space-y-4">
         <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('prayerCircles.activeCircles')}</h2>
         <div className="grid grid-cols-1 gap-3">
            {circles.map(circle => {
               const getMemberIds = (m: any) => {
                 if (Array.isArray(m)) return m;
                 if (m && typeof m === 'object') {
                   return Object.values(m).map((val: any) => typeof val === 'string' ? val : val?.uid).filter(Boolean);
                 }
                 return [];
               };
               const memberIds = getMemberIds(circle.members);
               const isMember = memberIds.includes(auth.currentUser?.uid || '');
               return (
               <div key={circle.id} onClick={() => !isMember && joinCircle(circle.id, circle.members as any)} className="p-4 rounded-2xl bg-card border flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4 text-right">
                     <Users size={20} className="text-primary" />
                     <div>
                        <h4 className="font-bold text-sm">{circle.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{t('prayerCircles.membersCount', { count: isArabic ? toArabicNumber(memberIds.length) : memberIds.length })}</p>
                     </div>
                  </div>
                  {!isMember ? (
                     <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); joinCircle(circle.id, circle.members as any); }} className="text-[10px] font-bold">{isArabic ? 'انضمام' : 'Join'}</Button>
                  ) : (
                     <ChevronRight size={16} className={isArabic ? "rotate-180" : ""} />
                  )}
               </div>
            )})}
         </div>
      </div>

      <div className="space-y-4">
         <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('prayerCircles.duaRequestsTitle')}</h2>
         <div className="grid grid-cols-1 gap-4">
            {duaRequests.map(req => (
               <div key={req.id} className="p-6 rounded-3xl bg-card border space-y-4">
                  <p className="text-lg font-serif italic text-center">"{req.text}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/20">
                     <div className="flex items-center gap-2 text-right">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{req.userName?.charAt(0)}</div>
                        <div>
                           <p className="text-[10px] font-bold">{req.userName}</p>
                           <p className="text-[8px] text-muted-foreground">{formatTime(req.createdAt)}</p>
                        </div>
                     </div>
                     <button onClick={() => handleAmeen(req.id, req.ameeners || [])} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold ${req.ameeners?.includes(auth.currentUser?.uid) ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gold text-white'}`}>
                        <Heart size={14} fill={req.ameeners?.includes(auth.currentUser?.uid) ? 'currentColor' : 'none'} />
                        {req.ameeners?.includes(auth.currentUser?.uid) ? t('prayerCircles.ameen') : t('prayerCircles.sayAmeen')}
                        <span className="opacity-60">({isArabic ? toArabicNumber(req.ameenCount || 0) : (req.ameenCount || 0)})</span>
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <Dialog open={showDuaModal} onOpenChange={setShowDuaModal}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem]">
           <DialogHeader><DialogTitle className="text-center font-serif">{t('prayerCircles.requestModal.title')}</DialogTitle></DialogHeader>
           <Textarea value={duaText} onChange={e => setDuaText(e.target.value)} maxLength={500} className="min-h-[120px] rounded-2xl p-4 font-naskh" dir="auto" />
           <DialogFooter><Button onClick={handleSubmitDua} disabled={!duaText.trim() || isSubmitting} className="w-full h-12 rounded-xl bg-gold text-white font-bold">{t('prayerCircles.requestModal.submit')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrayerCirclesComponent;
