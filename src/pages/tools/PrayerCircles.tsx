import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db, auth } from '@/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, addDoc, serverTimestamp, orderBy, limit, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import QuranHeader from '@/components/QuranHeader';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Plus, 
  ChevronRight, 
  Sparkles,
  HandHelping,
  Trash2,
  Clock,
  Send
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
  members: string[];
  createdBy: string;
  lastMessage?: string;
}

const PrayerCircles: React.FC = () => {
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
      where('members', 'array-contains', auth.currentUser.uid)
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
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
      return;
    }

    const name = prompt(isArabic ? 'اسم الحلقة:' : 'Circle Name:');
    if (!name) return;

    try {
      await addDoc(collection(db, 'prayer_circles'), {
        name,
        createdBy: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        createdAt: serverTimestamp()
      });
      toast.success(isArabic ? 'تم إنشاء الحلقة بنجاح' : 'Circle created successfully');
    } catch (e) {
      toast.error(isArabic ? 'فشل إنشاء الحلقة' : 'Failed to create circle');
    }
  };

  const deleteCircle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    
    if (!window.confirm(t('prayerCircles.deleteConfirm'))) return;

    try {
      await deleteDoc(doc(db, 'prayer_circles', id));
      toast.success(isArabic ? 'تم حذف الحلقة' : 'Circle deleted');
    } catch (e) {
      toast.error(isArabic ? 'فشل حذف الحلقة' : 'Failed to delete circle');
    }
  };

  const handleSubmitDua = async () => {
    if (!auth.currentUser || !duaText.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'dua_requests'), {
        text: duaText.trim(),
        userName: auth.currentUser.displayName || (isArabic ? 'مستخدم' : 'User'),
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

  const deleteDua = async (id: string) => {
    if (!window.confirm(t('prayerCircles.deleteDuaConfirm'))) return;

    try {
      await deleteDoc(doc(db, 'dua_requests', id));
      toast.success(isArabic ? 'تم حذف الطلب' : 'Request deleted');
    } catch (e) {
      toast.error(isArabic ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  const handleAmeen = async (id: string, currentAmeeners: string[]) => {
    if (!auth.currentUser) {
       toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader 
        title={t('prayerCircles.title')} 
        subtitle={t('prayerCircles.subtitle')}
        variant="compact"
        showBack
      />

      <main className="container max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <button 
            onClick={createCircle}
            className="p-8 rounded-[2.5rem] bg-emerald-deep text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 pattern-islamic opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center shadow-inner">
                <Plus size={32} />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-serif font-bold">{t('prayerCircles.createTitle')}</h3>
                <p className="text-xs text-white/60 font-naskh">{t('prayerCircles.createDesc')}</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setShowDuaModal(true)}
            className="p-8 rounded-[2.5rem] bg-gold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group text-right"
          >
            <div className="absolute inset-0 pattern-islamic opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10 flex items-center gap-6 flex-row-reverse">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center shadow-inner">
                <HandHelping size={32} />
              </div>
              <div className="text-right flex-1">
                <h3 className="text-xl font-serif font-bold">{t('prayerCircles.requestDua')}</h3>
                <p className="text-xs text-white/60 font-naskh">{t('prayerCircles.requestDuaDesc')}</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 space-y-8">
           <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                 <Users size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary">{t('prayerCircles.activeCircles')}</h2>
           </div>

           {loading ? (
             <div className="py-20 text-center animate-pulse text-muted-foreground">
               {isArabic ? 'جاري التحميل...' : 'Loading...'}
             </div>
           ) : circles.length === 0 ? (
             <div className="py-20 text-center bg-card/40 border-2 border-dashed border-border/40 rounded-[3rem]">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-serif text-muted-foreground">{t('prayerCircles.noCircles')}</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                 {circles.map(circle => (
                  <div 
                    key={circle.id}
                    onClick={() => toast.info(t('prayerCircles.comingSoon'))}
                    className="p-6 rounded-[2rem] bg-card border border-border/40 hover:border-gold/30 transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-primary shadow-inner">
                          <Users size={24} />
                       </div>
                       <div className="text-right">
                          <h4 className="text-lg font-serif font-bold text-primary">{circle.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                             <Users size={12} />
                             {isArabic ? toArabicNumber(circle.members.length) : circle.members.length} {isArabic ? 'أعضاء' : 'members'}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {circle.createdBy === auth.currentUser?.uid && (
                        <button 
                          onClick={(e) => deleteCircle(circle.id, e)}
                          className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-gold group-hover:text-white transition-all">
                         <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Dua Requests Section */}
        <div className="mt-16 space-y-8">
           <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                 <Heart size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary">{t('prayerCircles.duaRequestsTitle')}</h2>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {duaRequests.map(req => (
                <div key={req.id} className="p-8 rounded-[2.5rem] bg-card border border-border/40 shadow-islamic space-y-6 relative group/req">
                   {req.userId === auth.currentUser?.uid && (
                     <button 
                       onClick={() => deleteDua(req.id)}
                       className="absolute top-6 left-6 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover/req:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                     >
                       <Trash2 size={16} />
                     </button>
                   )}
                   
                   <p className="text-xl font-serif text-foreground leading-relaxed italic text-center pt-4">
                     "{req.text}"
                   </p>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-border/20">
                      <div className="flex items-center gap-3">
                         {req.userAvatar ? (
                           <img src={req.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-primary/10" />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase border-2 border-primary/10">
                              {req.userName?.charAt(0)}
                           </div>
                         )}
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-primary">{req.userName}</span>
                           <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-naskh">
                             <Clock size={10} />
                             {formatTime(req.createdAt)}
                           </span>
                         </div>
                      </div>
                      
                      <button 
                        onClick={() => handleAmeen(req.id, req.ameeners || [])}
                        disabled={req.ameeners?.includes(auth.currentUser?.uid)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                          req.ameeners?.includes(auth.currentUser?.uid) 
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                            : 'bg-gold text-white shadow-lg hover:scale-105 active:scale-95'
                        }`}
                      >
                        <Heart size={16} fill={req.ameeners?.includes(auth.currentUser?.uid) ? 'currentColor' : 'none'} />
                        {req.ameeners?.includes(auth.currentUser?.uid) ? t('prayerCircles.ameen') : t('prayerCircles.sayAmeen')}
                        <span className="ml-1 opacity-60">({isArabic ? toArabicNumber(req.ameenCount || 0) : (req.ameenCount || 0)})</span>
                      </button>
                   </div>
                </div>
              ))}
              {duaRequests.length === 0 && (
                <div className="py-20 text-center bg-card/40 border-2 border-dashed border-border/40 rounded-[3rem]">
                   <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="font-serif text-muted-foreground">{t('prayerCircles.noDuas')}</p>
                </div>
              )}
           </div>
        </div>
      </main>

      {/* Request Dua Modal */}
      <Dialog open={showDuaModal} onOpenChange={setShowDuaModal}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold text-primary text-center flex items-center justify-center gap-3">
              <HandHelping className="text-gold" />
              {t('prayerCircles.requestModal.title')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <Textarea
              placeholder={t('prayerCircles.requestModal.placeholder')}
              value={duaText}
              onChange={(e) => setDuaText(e.target.value)}
              className="min-h-[150px] rounded-3xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-gold/30 font-naskh text-lg leading-relaxed resize-none p-6"
              maxLength={500}
              dir="auto"
            />
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
              <span>{duaText.length} / 500</span>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center gap-3">
            <Button
              onClick={handleSubmitDua}
              disabled={!duaText.trim() || isSubmitting}
              className="w-full h-14 rounded-2xl bg-gold hover:bg-gold/90 text-white font-bold text-lg shadow-lg shadow-gold/20 flex items-center gap-2 group transition-all"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              {t('prayerCircles.requestModal.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrayerCircles;
