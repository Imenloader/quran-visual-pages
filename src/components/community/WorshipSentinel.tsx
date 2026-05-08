import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db, auth } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  getDocs,
  limit,
  orderBy
} from 'firebase/firestore';
import { 
  Bell, 
  Moon, 
  Sun, 
  UserCheck, 
  Heart, 
  Zap, 
  Loader2, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

interface NudgeRequest {
  id: string;
  requesterId: string;
  sentinelId: string;
  prayerType: 'fajr' | 'qiyam';
  isActive: boolean;
  requesterName: string;
  sentinelName: string;
}

const WorshipSentinel = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { profile } = useUser();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<NudgeRequest[]>([]);
  const [sentinelRequests, setSentinelRequests] = useState<NudgeRequest[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Load Friends (Simplified for now)
    const loadFriends = async () => {
      if (!profile?.friendIds || profile.friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, 'profiles'),
          where('uid', 'in', profile.friendIds.slice(0, 10))
        );
        const snap = await getDocs(q);
        setFriends(snap.docs.map(d => d.data()));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    // Load Nudge Requests where I am the requester
    const q1 = query(collection(db, 'nudge_requests'), where('requesterId', '==', auth.currentUser.uid), where('isActive', '==', true));
    const unsub1 = onSnapshot(q1, (snap) => {
      setMyRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as NudgeRequest)));
    });

    // Load Nudge Requests where I am the sentinel
    const q2 = query(collection(db, 'nudge_requests'), where('sentinelId', '==', auth.currentUser.uid), where('isActive', '==', true));
    const unsub2 = onSnapshot(q2, (snap) => {
      setSentinelRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as NudgeRequest)));
    });

    loadFriends();
    return () => {
      unsub1();
      unsub2();
    };
  }, [profile?.friendIds]);

  const requestNudge = async (friendId: string, friendName: string, type: 'fajr' | 'qiyam') => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'nudge_requests'), {
        requesterId: auth.currentUser.uid,
        requesterName: profile?.name || auth.currentUser.displayName || (isAr ? 'مستخدم' : 'User'),
        sentinelId: friendId,
        sentinelName: friendName,
        prayerType: type,
        isActive: true,
        createdAt: serverTimestamp()
      });
      toast.success(isAr ? 'تم طلب التنبيه بنجاح' : 'Nudge request sent successfully');
    } catch (e) {
      toast.error(isAr ? 'فشلت العملية' : 'Request failed');
    }
  };

  const sendNudge = async (requestId: string, targetName: string) => {
    try {
      // In a real app, this would trigger a cloud function or push notification
      // For now, we simulate by adding a notification record
      await addDoc(collection(db, 'notifications'), {
        userId: requestId, // Actually we need the target userId
        title: isAr ? 'حان وقت الصلاة!' : 'Time for Prayer!',
        body: isAr ? `${profile?.name} ينبهك لصلاة الفجر` : `${profile?.name} is nudging you for Fajr`,
        type: 'worship_nudge',
        createdAt: serverTimestamp(),
        sound: 'adhan.mp3'
      });
      toast.success(isAr ? `تم إرسال تنبيه لـ ${targetName}` : `Nudge sent to ${targetName}`);
    } catch (e) {
      toast.error(isAr ? 'فشل الإرسال' : 'Failed to send');
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-primary text-white shadow-xl relative overflow-hidden">
        <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-naskh">{isAr ? 'الحارس الروحاني' : 'Worship Sentinel'}</h2>
            <p className="text-xs text-white/70">{isAr ? 'تعاون مع أصدقائك للاستيقاظ للصلاة' : 'Partner with friends to wake up for prayer'}</p>
          </div>
          <ShieldCheck size={40} className="text-white/20" />
        </div>
      </div>

      {/* Friends & Actions */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">{isAr ? 'أصدقائي' : 'My Friends'}</h3>
        <div className="grid grid-cols-1 gap-3">
          {friends.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 rounded-3xl border border-dashed">
              <p className="text-xs text-muted-foreground">{isAr ? 'أضف أصدقاء لتبادل تنبيهات الصلاة' : 'Add friends to exchange prayer nudges'}</p>
            </div>
          ) : (
            friends.map(friend => (
              <div key={friend.uid} className="p-4 bg-card border rounded-3xl flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                    {friend.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{friend.name}</p>
                    <p className="text-[10px] text-muted-foreground">Lvl {friend.level || 1}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => requestNudge(friend.uid, friend.name, 'fajr')}
                    className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                    title={isAr ? 'اطلب تنبيهي للفجر' : 'Request Fajr Nudge'}
                  >
                    <Sun size={18} />
                  </button>
                  <button 
                    onClick={() => requestNudge(friend.uid, friend.name, 'qiyam')}
                    className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white transition-all shadow-sm"
                    title={isAr ? 'اطلب تنبيهي للقيام' : 'Request Qiyam Nudge'}
                  >
                    <Moon size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Requests I need to fulfill */}
      {sentinelRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Award size={16} className="text-gold-deep" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isAr ? 'طلبات بانتظار تنبيهي' : 'Awaiting My Nudge'}</h3>
          </div>
          <div className="space-y-3">
            {sentinelRequests.map(req => (
              <div key={req.id} className="p-5 bg-gold/5 border border-gold/20 rounded-3xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 text-gold-deep flex items-center justify-center">
                    {req.prayerType === 'fajr' ? <Sun size={20} /> : <Moon size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gold-deep">{req.requesterName}</h4>
                    <p className="text-[10px] text-muted-foreground">{isAr ? `ينتظرك لتنبهه لصلاة ${req.prayerType === 'fajr' ? 'الفجر' : 'القيام'}` : `Waiting for your ${req.prayerType} nudge`}</p>
                  </div>
                </div>
                <button 
                  onClick={() => sendNudge(req.requesterId, req.requesterName)}
                  className="px-6 py-2.5 bg-gold text-white rounded-xl font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Zap size={14} />
                  {isAr ? 'تنبيه الآن' : 'Nudge Now'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Guardians */}
      {myRequests.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">{isAr ? 'حراسي الروحانيون' : 'My Spiritual Guardians'}</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {myRequests.map(req => (
              <div key={req.id} className="p-4 bg-primary/5 border border-primary/10 rounded-2xl shrink-0 min-w-[140px] text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <UserCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold">{req.sentinelName}</p>
                  <p className="text-[9px] text-primary/60 font-bold uppercase">{req.prayerType}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default WorshipSentinel;
