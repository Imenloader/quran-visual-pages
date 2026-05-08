import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db, auth } from '@/firebase';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  arrayUnion, 
  deleteField,
  Timestamp 
} from 'firebase/firestore';
import { 
  Users, 
  MessageSquare, 
  UserPlus, 
  Bell, 
  ArrowLeft, 
  Loader2, 
  Heart, 
  Send,
  MoreVertical,
  LogOut,
  Trash2,
  Share2
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface CircleMember {
  uid: string;
  name: string;
  avatar?: string;
  joinedAt?: Timestamp;
}

interface Circle {
  id: string;
  name: string;
  createdBy: string;
  members: string[] | Record<string, CircleMember>;
  createdAt: Timestamp;
}

interface WallPost {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Timestamp;
  heartCount: number;
  hearters: string[];
}

const PrayerCircleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { profile } = useUser();
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Load Circle
    const unsubCircle = onSnapshot(doc(db, 'prayer_circles', id), (snap) => {
      if (snap.exists()) {
        setCircle({ id: snap.id, ...snap.data() } as Circle);
      } else {
        toast.error(isAr ? 'الحلقة غير موجودة' : 'Circle not found');
        navigate('/community/hub');
      }
      setLoading(false);
    });

    // Load Wall Posts
    const postsQuery = query(
      collection(db, 'prayer_circles', id, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubPosts = onSnapshot(postsQuery, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as WallPost)));
    });

    return () => {
      unsubCircle();
      unsubPosts();
    };
  }, [id, isAr, navigate]);

  const handlePostDua = async () => {
    if (!id || !newPostText.trim() || !auth.currentUser) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'prayer_circles', id, 'posts'), {
        text: newPostText.trim(),
        userId: auth.currentUser.uid,
        userName: profile?.name || auth.currentUser.displayName || (isAr ? 'مستخدم' : 'User'),
        userAvatar: profile?.avatar || auth.currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        heartCount: 0,
        hearters: []
      });
      setNewPostText('');
      toast.success(isAr ? 'تم نشر دعائك على الحائط' : 'Dua posted to the wall');
    } catch (e) {
      toast.error(isAr ? 'فشل النشر' : 'Failed to post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveCircle = async () => {
    if (!circle || !auth.currentUser) return;
    if (!window.confirm(isAr ? 'هل أنت متأكد من مغادرة هذه الحلقة؟' : 'Are you sure you want to leave this circle?')) return;
    
    try {
      const circleRef = doc(db, 'prayer_circles', circle.id);
      if (Array.isArray(circle.members)) {
        const newMembers = circle.members.filter(m => m !== auth.currentUser?.uid);
        await updateDoc(circleRef, { members: newMembers });
      } else {
        await updateDoc(circleRef, { [`members.${auth.currentUser.uid}`]: deleteField() });
      }
      toast.success(isAr ? 'تمت مغادرة الحلقة' : 'Left circle');
      navigate('/community/hub');
    } catch (e) {
      toast.error(isAr ? 'فشلت العملية' : 'Failed to leave');
    }
  };

  const getMemberIds = (members: Circle['members']): string[] => {
    if (Array.isArray(members)) return members;
    if (members && typeof members === 'object') return Object.keys(members);
    return [];
  };

  const handleInviteFriend = async (friendId: string, friendName: string) => {
    if (!id || !circle || !auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: friendId,
        fromId: auth.currentUser.uid,
        fromName: profile?.name || auth.currentUser.displayName || (isAr ? 'مستخدم' : 'User'),
        type: 'circle_invite',
        payload: { 
          circleId: id, 
          circleName: circle.name 
        },
        read: false,
        timestamp: serverTimestamp()
      });
      toast.success(isAr ? `تم إرسال دعوة لـ ${friendName}` : `Invitation sent to ${friendName}`);
    } catch (e) {
      toast.error(isAr ? 'فشل إرسال الدعوة' : 'Failed to send invitation');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: circle?.name || 'حلقة دعاء',
      text: isAr ? `انضم إلي في حلقة الدعاء: ${circle?.name}` : `Join me in this prayer circle: ${circle?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isAr ? 'تم نسخ الرابط' : 'Link copied');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  if (!circle) return null;

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-card border hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold font-naskh text-primary">{circle.name}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {t('prayerCircles.membersCount', { count: getMemberIds(circle.members).length })}
            </p>
          </div>
          <button onClick={handleLeaveCircle} className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
            <LogOut size={20} />
          </button>
        </header>

        {/* Member Roster (Horizontal Scroll) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isAr ? 'أعضاء الحلقة' : 'Circle Members'}</h3>
            <button onClick={() => setShowInviteDialog(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full hover:bg-emerald-500 hover:text-white transition-all">
              <UserPlus size={12} />
              {isAr ? 'دعوة صديق' : 'Invite Friend'}
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
            {getMemberIds(circle.members).map((uid) => (
              <div key={uid} className="flex flex-col items-center gap-1.5 shrink-0 group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-transparent group-hover:border-primary/50 transition-all overflow-hidden shadow-sm">
                   <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                     {uid.charAt(0).toUpperCase()}
                   </div>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground w-14 truncate text-center">
                  {uid === auth.currentUser?.uid ? (isAr ? 'أنت' : 'You') : (isAr ? 'عضو' : 'Member')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Action Center - Request Dua */}
        <section className="bg-card border rounded-[2.5rem] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold-deep flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold">{isAr ? 'طلب دعاء عاجل' : 'Request Urgent Dua'}</h4>
              <p className="text-[10px] text-muted-foreground">{isAr ? 'سيتم تنبيه كافة الأعضاء فوراً' : 'All members will be notified instantly'}</p>
            </div>
          </div>
          <div className="relative">
            <Textarea 
              value={newPostText} 
              onChange={e => setNewPostText(e.target.value)}
              placeholder={isAr ? 'اكتب ما في قلبك ليدعو لك الإخوة...' : 'Write what is in your heart...'}
              className="min-h-[100px] rounded-2xl p-4 bg-muted/30 border-none resize-none focus-visible:ring-primary/20"
            />
            <button 
              onClick={handlePostDua}
              disabled={isSubmitting || !newPostText.trim()}
              className="absolute bottom-3 left-3 md:left-auto md:right-3 p-3 rounded-xl bg-primary text-white shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </section>

        {/* Dua Wall */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <MessageSquare size={16} className="text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isAr ? 'حائط الأدعية' : 'Dua Wall'}</h3>
          </div>
          
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="p-12 text-center bg-muted/20 rounded-[2.5rem] border border-dashed">
                <Heart size={32} className="mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground italic">{isAr ? 'لا يوجد أدعية بعد، كن أول من يطلب الدعاء' : 'No prayers yet, be the first to request a dua'}</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="p-5 bg-card border rounded-3xl shadow-sm space-y-3 group hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                        {post.userName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-primary">{post.userName}</p>
                        <p className="text-[8px] text-muted-foreground">
                          {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: isAr ? ar : enUS }) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-serif italic text-foreground/80 leading-relaxed px-1">"{post.text}"</p>
                  <div className="flex items-center gap-4 pt-2 border-t border-border/10">
                    <button className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 hover:scale-110 transition-transform">
                      <Heart size={14} />
                      {isAr ? 'آمين' : 'Ameen'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-center font-serif">{isAr ? 'دعوة أصدقاء للحلقة' : 'Invite Friends to Circle'}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-6 no-scrollbar">
            {/* Direct Share Options */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">{isAr ? 'مشاركة الرابط' : 'Share Link'}</h4>
              <Button 
                onClick={handleShare}
                className="w-full rounded-2xl bg-emerald-600 text-white font-bold h-12 flex items-center gap-2 shadow-lg"
              >
                <Share2 size={18} />
                {isAr ? 'مشاركة أو نسخ الرابط' : 'Share or Copy Link'}
              </Button>
            </div>

            {/* Friend List */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">{isAr ? 'دعوة مباشرة للأصدقاء' : 'Invite Friends Directly'}</h4>
              <div className="space-y-2">
                {profile?.friendIds && profile.friendIds.length > 0 ? (
                  profile.friendIds
                    .filter(fid => !getMemberIds(circle.members).includes(fid))
                    .map(fid => (
                      <div key={fid} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {fid.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold">{isAr ? 'صديق' : 'Friend'}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleInviteFriend(fid, isAr ? 'صديق' : 'Friend')}
                          className="text-[10px] font-bold text-primary hover:bg-primary/10"
                        >
                          {isAr ? 'إرسال دعوة' : 'Send Invite'}
                        </Button>
                      </div>
                    ))
                ) : (
                  <p className="text-[10px] text-muted-foreground italic px-1">
                    {isAr ? 'لم تقم بإضافة أصدقاء بعد.' : 'No friends added yet.'}
                  </p>
                )}
                {profile?.friendIds && profile.friendIds.length > 0 && profile.friendIds.filter(fid => !getMemberIds(circle.members).includes(fid)).length === 0 && (
                   <p className="text-[10px] text-muted-foreground italic px-1">
                    {isAr ? 'جميع أصدقائك في هذه الحلقة بالفعل.' : 'All your friends are already in this circle.'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-2 border-t border-border/10">
            <Button variant="ghost" onClick={() => setShowInviteDialog(false)} className="w-full rounded-xl text-xs font-bold">
              {isAr ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrayerCircleDetail;
