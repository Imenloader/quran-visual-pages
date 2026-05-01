import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db, auth } from '@/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import QuranHeader from '@/components/QuranHeader';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Plus, 
  ChevronRight, 
  Sparkles,
  Shield,
  Zap,
  HandHelping,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { toArabicNumber } from '@/data/quranData';
import { deleteDoc } from 'firebase/firestore';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'prayer_circles'), 
      where('members', 'array-contains', auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Circle));
      setCircles(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
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
    
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه الحلقة؟' : 'Are you sure you want to delete this circle?')) return;

    try {
      await deleteDoc(doc(db, 'prayer_circles', id));
      toast.success(isArabic ? 'تم حذف الحلقة' : 'Circle deleted');
    } catch (e) {
      toast.error(isArabic ? 'فشل حذف الحلقة' : 'Failed to delete circle');
    }
  };

  const requestDua = () => {
    toast.info(isArabic ? 'سيتم إطلاق ميزة طلب الدعاء قريباً!' : 'Request Dua feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader 
        title={isArabic ? 'حلقات الذكر والدعاء' : 'Prayer & Dhikr Circles'} 
        subtitle={isArabic ? 'تعاونوا على البر والتقوى' : 'Support each other in righteousness'}
        variant="compact"
        showBack
      />

      <main className="container max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Action Cards */}
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
                <h3 className="text-xl font-serif font-bold">{isArabic ? 'إنشاء حلقة جديدة' : 'Create New Circle'}</h3>
                <p className="text-xs text-white/60 font-naskh">{isArabic ? 'ادعُ أصدقاءك وعائلتك للمشاركة' : 'Invite friends and family'}</p>
              </div>
            </div>
          </button>

          <button 
            onClick={requestDua}
            className="p-8 rounded-[2.5rem] bg-gold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group text-right"
          >
            <div className="absolute inset-0 pattern-islamic opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10 flex items-center gap-6 flex-row-reverse">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center shadow-inner">
                <HandHelping size={32} />
              </div>
              <div className="text-right flex-1">
                <h3 className="text-xl font-serif font-bold">{isArabic ? 'طلب دعاء بظهر الغيب' : 'Request Dua'}</h3>
                <p className="text-xs text-white/60 font-naskh">{isArabic ? 'اطلب من إخوتك الدعاء لك' : 'Ask others to pray for you'}</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 space-y-8">
           <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                 <Users size={20} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary">{isArabic ? 'حلقاتك النشطة' : 'Your Active Circles'}</h2>
           </div>

           {loading ? (
             <div className="py-20 text-center animate-pulse text-muted-foreground">
               {isArabic ? 'جاري التحميل...' : 'Loading...'}
             </div>
           ) : circles.length === 0 ? (
             <div className="py-20 text-center bg-card/40 border-2 border-dashed border-border/40 rounded-[3rem]">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-serif text-muted-foreground">{isArabic ? 'لم تنضم إلى أي حلقة بعد' : 'You haven\'t joined any circles yet'}</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                 {circles.map(circle => (
                  <div 
                    key={circle.id}
                    onClick={() => toast.info(isArabic ? 'سيتم تفعيل غرف الدردشة قريباً' : 'Chat rooms coming soon')}
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
      </main>
    </div>
  );
};

export default PrayerCircles;
