import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '@/firebase';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import QuranHeader from '@/components/QuranHeader';
import { 
  UserPlus, 
  UserCheck, 
  UserMinus, 
  MessageCircle, 
  Trophy, 
  Target, 
  Calendar, 
  BookOpen,
  Award,
  ShieldCheck,
  Ban,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toArabicNumber } from '@/data/quranData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { setDoc, serverTimestamp } from 'firebase/firestore';

import { useUser } from '@/contexts/UserContext';

const UserProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t, i18n } = useTranslation();
  const { profile: currentUserProfile } = useUser();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Fetch public profile
    const unsubProfile = onSnapshot(doc(db, 'profiles', userId), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        toast.error(t('profile.notFound') || (isArabic ? 'الملف الشخصي غير موجود' : 'Profile not found'));
        navigate('/hub');
      }
      setLoading(false);
    });

    // Check friendship status if logged in
    if (auth.currentUser && auth.currentUser.uid !== userId) {
      const q = query(
        collection(db, 'friendships'),
        where('users', 'array-contains', auth.currentUser.uid)
      );

      const unsubFriends = onSnapshot(q, (snap) => {
        const friendship = snap.docs.find(d => d.data().users.includes(userId));
        if (friendship) {
          setFriendshipStatus(friendship.data().status);
        } else {
          setFriendshipStatus('none');
        }
      });

      return () => {
        unsubProfile();
        unsubFriends();
      };
    }

    return () => unsubProfile();
  }, [userId, navigate, t, isArabic]);

  const sendRequest = async () => {
    if (!auth.currentUser || !userId) return;
    
    try {
      const shipId = [auth.currentUser.uid, userId].sort().join('_');
      await setDoc(doc(db, 'friendships', shipId), {
        users: [auth.currentUser.uid, userId],
        status: 'pending',
        requester: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      toast.success(isArabic ? 'تم إرسال طلب الصداقة' : 'Friend request sent');
    } catch (e) {
      toast.error(isArabic ? 'فشل إرسال الطلب' : 'Failed to send request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = auth.currentUser?.uid === userId;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Cover Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep/90 via-emerald-900 to-black/80" />
        <div className="absolute inset-0 opacity-20 pattern-islamic scale-150 rotate-12" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="container max-w-5xl mx-auto px-6 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-card p-1 shadow-2xl overflow-hidden">
                <img 
                  src={profile.avatar || '/avatar-man-1.svg'} 
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-[2.2rem]"
                />
              </div>
              {profile.role === 'admin' && (
                <div className="absolute -top-2 -right-2 bg-gold text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <ShieldCheck size={20} />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-right space-y-2 mb-2">
              <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                  {profile.name}
                </h1>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-1 rounded-full text-xs font-naskh">
                  {t(`profile.levels.${Math.floor(profile.points / 1000) + 1}`)}
                </Badge>
              </div>
              <p className="text-white/60 text-sm font-naskh flex items-center justify-center md:justify-start gap-2">
                <Calendar size={14} />
                {t('profile.joinedDate')}: {new Date(profile.joinedDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex gap-3 mb-2">
                {friendshipStatus === 'none' ? (
                  <Button 
                    onClick={() => {
                      if (currentUserProfile.gender !== 'unspecified' && profile.gender !== 'unspecified' && currentUserProfile.gender !== profile.gender) {
                        toast.error(t('common.genderMismatch'));
                        return;
                      }
                      sendRequest();
                    }}
                    className="bg-gold hover:bg-gold/90 text-white rounded-2xl px-6 py-6 h-auto shadow-lg shadow-gold/20 flex items-center gap-2 group"
                  >
                    <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold">{t('profile.addFriend') || (isArabic ? 'إضافة صديق' : 'Add Friend')}</span>
                  </Button>
                ) : friendshipStatus === 'pending' ? (
                  <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl px-6 py-6 h-auto">
                    <UserCheck size={20} className="ml-2 text-gold" />
                    {t('profile.requestSent') || (isArabic ? 'تم إرسال الطلب' : 'Request Sent')}
                  </Button>
                ) : (
                  <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl px-6 py-6 h-auto">
                    <MessageCircle size={20} className="ml-2" />
                    {t('profile.sendMessage') || (isArabic ? 'مراسلة' : 'Message')}
                  </Button>
                )}
                
                <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl p-4 h-auto">
                  <MoreVertical size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <main className="container max-w-5xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={<BookOpen className="text-emerald-500" />} 
            label={t('profile.pagesRead')} 
            value={isArabic ? toArabicNumber(profile.totalPagesRead || 0) : (profile.totalPagesRead || 0)}
            color="emerald"
          />
          <StatCard 
            icon={<Trophy className="text-gold" />} 
            label={t('profile.points')} 
            value={isArabic ? toArabicNumber(profile.points || 0) : (profile.points || 0)}
            color="gold"
          />
          <StatCard 
            icon={<Target className="text-rose-500" />} 
            label={t('profile.juzCompleted')} 
            value={isArabic ? toArabicNumber(profile.totalJuzCompleted || 0) : (profile.totalJuzCompleted || 0)}
            color="rose"
          />
          <StatCard 
            icon={<Award className="text-blue-500" />} 
            label={t('profile.level')} 
            value={isArabic ? toArabicNumber(Math.floor(profile.points / 1000) + 1) : (Math.floor(profile.points / 1000) + 1)}
            color="blue"
          />
        </div>

        {/* Content Tabs/Sections */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Badges */}
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
              <Award className="text-gold" />
              {t('profile.badgesTitle')}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted/40 flex items-center justify-center group cursor-help relative">
                  <Trophy size={24} className="text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-muted-foreground/20 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Activity / About */}
          <div className="md:col-span-2 space-y-8">
             <section className="p-8 rounded-[2.5rem] bg-card border border-border/40 shadow-soft">
                <h3 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-3">
                   <Sparkles className="text-gold" size={24} />
                   {isArabic ? 'الرحلة الروحانية' : 'Spiritual Journey'}
                </h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <BookOpen size={24} />
                         </div>
                         <div>
                            <p className="font-bold">{isArabic ? 'معدل القراءة اليومي' : 'Daily Reading Avg'}</p>
                            <p className="text-xs text-muted-foreground">{isArabic ? 'بناءً على نشاط الأسبوع الأخير' : 'Based on last 7 days activity'}</p>
                         </div>
                      </div>
                      <span className="text-xl font-bold text-accent">
                         {isArabic ? toArabicNumber(5) : 5} {isArabic ? 'ص' : 'p'}
                      </span>
                   </div>
                   
                   <div className="p-6 rounded-3xl border-2 border-dashed border-border/40 text-center">
                      <p className="text-muted-foreground font-naskh">
                         {isArabic ? 'هذا المستخدم يفضل القراءة في الثلث الأخير من الليل' : 'This user prefers reading during the last third of the night'}
                      </p>
                   </div>
                </div>
             </section>
          </div>
        </div>
      </main>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="p-6 rounded-[2rem] bg-card border border-border/40 shadow-soft flex flex-col items-center text-center gap-2 group hover:scale-105 transition-all">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform", 
      color === 'emerald' ? 'bg-emerald-500/10' : 
      color === 'gold' ? 'bg-gold/10' : 
      color === 'rose' ? 'bg-rose-500/10' : 'bg-blue-500/10'
    )}>
      {icon}
    </div>
    <div className="space-y-1">
      <span className="text-2xl font-bold text-primary block">{value}</span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  </div>
);

const Sparkles = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

export default UserProfileView;
