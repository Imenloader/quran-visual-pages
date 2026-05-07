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
  MoreVertical,
  Sparkles,
  Flame,
  Wand2,
  Sun,
  Shield,
  GraduationCap,
  LayoutGrid,
  RotateCcw,
  Heart,
  Moon,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toArabicNumber } from '@/data/quranData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

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
  const [isBanning, setIsBanning] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<{ id: string; label: string; desc: string; icon: React.ReactNode; earned: boolean; color: string; bg: string } | null>(null);

  const getBadgeDescAr = (id: string) => {
    const descs: Record<string, string> = {
      "early-bird": "تحية لكل من يبدأ يومه بذكر الله والقرآن الكريم.",
      "quran-lover": "قراءة أكثر من ٥٠٠ آية كريمة من كتاب الله.",
      "tasbih-master": "التسبيح والذكر لأكثر من ١,٠٠٠ مرة.",
      "streak-7": "المحافظة على الورد اليومي لمدة ٧ أيام متتالية.",
      "khatma-1": "إكمال قراءة جزء كامل من القرآن الكريم.",
      "consistent": "الاستمرار في الطاعات والذكر لمدة شهر كامل.",
      "scholar": "قراءة أكثر من ٥,٠٠٠ آية (رحلة في أعماق كتاب الله).",
      "juz-master": "إنجاز عظيم بإكمال ١٥ جزءاً من القرآن الكريم.",
      "juz-expert": "ختم القرآن الكريم كاملاً (٣٠ جزءاً) - مبارك لك هذا الفوز.",
      "tasbih-pro": "ذكر الله لأكثر من ١٠,٠٠٠ مرة (بذكر الله تطمئن القلوب).",
      "spiritualLegend": "الوصول إلى مستوى روحي رفيع (المستوى ١٥).",
      "pure-heart": "ذكر الله لأكثر من ٢٠,٠٠٠ مرة - جعل الله قلبك عامراً بذكره.",
      "night-owl": "المحافظة على ورد الليل والذكر والقرآن في وقت السحر.",
      "devout": "الوصول للمستوى ٢٠ - من المخلصين في عبادة الله."
    };
    return descs[id] || "وسام تقديري لمجهوداتك الروحية.";
  };

  const getBadgeDescEn = (id: string) => {
    const descs: Record<string, string> = {
      "early-bird": "A tribute to those who start their day with Quran and Dhikr.",
      "quran-lover": "Read over 500 verses from the Holy Quran.",
      "tasbih-master": "Recited Dhikr and Tasbih over 1,000 times.",
      "streak-7": "Maintained a daily spiritual routine for 7 consecutive days.",
      "khatma-1": "Completed the reading of one full Juz.",
      "consistent": "Stayed dedicated to spiritual goals for a full month.",
      "scholar": "Read over 5,000 verses (A deep journey through the Quran).",
      "juz-master": "A great achievement: 15 Juz completed.",
      "juz-expert": "Completed the entire Quran (30 Juz) - MashaAllah!",
      "tasbih-pro": "Recited Dhikr over 10,000 times.",
      "spiritualLegend": "Reached a high spiritual level (Level 15).",
      "pure-heart": "Recited Dhikr over 20,000 times - May your heart be filled with light.",
      "night-owl": "Maintained spiritual devotion during the late night hours.",
      "devout": "Reached Level 20 - A dedicated servant of Allah."
    };
    return descs[id] || "An honorary badge for your spiritual efforts.";
  };

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

  const handleBanToggle = async () => {
    if (!auth.currentUser || currentUserProfile?.role !== 'admin' || !userId) return;
    try {
      // Update both profiles and users collections for redundancy, though users is the source of truth for rules
      await updateDoc(doc(db, 'users', userId), {
        isBanned: !profile.isBanned
      });
      await updateDoc(doc(db, 'profiles', userId), {
        isBanned: !profile.isBanned
      });
      toast.success(isArabic 
        ? (!profile.isBanned ? 'تم حظر المستخدم بنجاح' : 'تم رفع الحظر عن المستخدم')
        : (!profile.isBanned ? 'User banned successfully' : 'User unbanned successfully')
      );
    } catch (e) {
      console.error(e);
      toast.error(isArabic ? 'فشل تحديث حالة الحظر' : 'Failed to update ban status');
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
        
        <div className="absolute top-6 left-6 z-30" dir="ltr">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="bg-black/20 border-white/20 text-white hover:bg-black/40 rounded-full w-12 h-12 p-0 flex items-center justify-center backdrop-blur-md transition-all shadow-lg hover:scale-105"
          >
            {isArabic ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
          </Button>
        </div>

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
                <div className="absolute -top-2 -right-2 bg-gold text-white px-3 py-1.5 rounded-xl shadow-lg border-2 border-white flex items-center gap-1.5 text-xs font-bold">
                  <ShieldCheck size={16} />
                  <span>{isArabic ? 'المشرف' : 'Admin'}</span>
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
                {t('profile.joinedDate')}: {profile.joinedDate ? (profile.joinedDate.toDate ? profile.joinedDate.toDate() : new Date(profile.joinedDate)).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' }) : ''}
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
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/community?tab=chat&privateId=${profile.uid}`)}
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl px-6 py-6 h-auto"
                  >
                    <MessageCircle size={20} className="ml-2" />
                    {t('profile.sendMessage') || (isArabic ? 'مراسلة' : 'Message')}
                  </Button>
                )}
                
                {currentUserProfile?.role === 'admin' && (
                  <Button 
                    onClick={handleBanToggle}
                    variant="outline" 
                    className={`border-white/20 text-white hover:bg-white/10 rounded-2xl p-4 h-auto ${profile.isBanned ? 'bg-rose-500 hover:bg-rose-600 border-none' : 'bg-white/5'}`}
                  >
                    <Ban size={20} className={isArabic ? 'ml-2' : 'mr-2'} />
                    {profile.isBanned 
                      ? (isArabic ? 'رفع الحظر' : 'Unban')
                      : (isArabic ? 'حظر المستخدم' : 'Ban User')}
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
        {(() => {
          const profileLevel = Math.floor((profile.points || 0) / 1000) + 1;
          const nextLevelPoints = profileLevel * 1000;
          const pointsToNext = nextLevelPoints - (profile.points || 0);

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard 
                icon={<BookOpen className="text-emerald-500" />} 
                label={t('profile.ayahsRead') || (isArabic ? 'آيات مقروءة' : 'Ayahs Read')} 
                value={isArabic ? toArabicNumber(profile.totalAyahsRead || 0) : (profile.totalAyahsRead || 0)}
                color="emerald"
              />
              <StatCard 
                icon={<BookOpen className="text-emerald-500" />} 
                label={t('profile.pagesRead')} 
                value={isArabic ? toArabicNumber(profile.totalPagesRead || 0) : (profile.totalPagesRead || 0)}
                color="emerald"
              />
              <StatCard 
                icon={<Target className="text-rose-500" />} 
                label={t('profile.juzCompleted')} 
                value={isArabic ? toArabicNumber(profile.totalJuzCompleted || 0) : (profile.totalJuzCompleted || 0)}
                color="rose"
              />
              <StatCard 
                icon={<Sparkles className="text-accent" />} 
                label={t('profile.athkarRecited') || (isArabic ? 'ذكر مسبح' : 'Dhikr Count')} 
                value={isArabic ? toArabicNumber(profile.totalAthkarRecited || 0) : (profile.totalAthkarRecited || 0)}
                color="accent"
              />
              <StatCard 
                icon={<Flame className="text-orange-500" />} 
                label={t('profile.dayStreak') || (isArabic ? 'أيام الاستمرارية' : 'Streak Days')} 
                value={isArabic ? toArabicNumber(profile.daysActive || 0) : (profile.daysActive || 0)}
                color="orange"
              />
              <StatCard 
                icon={<Award className="text-blue-500" />} 
                label={t('profile.level')} 
                value={isArabic ? toArabicNumber(profileLevel) : profileLevel}
                color="blue"
              />
              <StatCard 
                icon={<Trophy className="text-gold" />} 
                label={t('profile.points')} 
                value={isArabic ? toArabicNumber(profile.points || 0) : (profile.points || 0)}
                color="gold"
              />
              <StatCard 
                icon={<Wand2 className="text-gold" />} 
                label={t('profile.pointsToNext') || (isArabic ? 'نقاط للمستوى التالي' : 'Next Level')} 
                value={isArabic ? toArabicNumber(pointsToNext) : pointsToNext}
                color="gold"
              />
            </div>
          );
        })()}

        {/* Content Tabs/Sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Badges */}
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
              <Award className="text-gold" />
              {t('profile.badgesTitle') || (isArabic ? 'الأوسمة والإنجازات' : 'Badges & Achievements')}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {(() => {
                const pLevel = Math.floor((profile.points || 0) / 1000) + 1;
                const badges = [
                  { id: "early-bird", icon: <Sun className="w-5 h-5" />, label: t("profile.badges.earlyBird"), earned: true, color: "text-amber-500", bg: "bg-amber-500/10" },
                  { id: "quran-lover", icon: <BookOpen className="w-5 h-5" />, label: t("profile.badges.quranLover"), earned: (profile.totalAyahsRead || 0) >= 500, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { id: "tasbih-master", icon: <Sparkles className="w-5 h-5" />, label: t("profile.badges.tasbihMaster"), earned: (profile.totalAthkarRecited || 0) >= 1000, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { id: "streak-7", icon: <Calendar className="w-5 h-5" />, label: t("profile.badges.sevenDayStreak"), earned: (profile.daysActive || 0) >= 7, color: "text-rose-500", bg: "bg-rose-500/10" },
                  { id: "khatma-1", icon: <Trophy className="w-5 h-5" />, label: t("profile.badges.firstKhatma"), earned: (profile.totalJuzCompleted || 0) >= 1, color: "text-gold", bg: "bg-gold/10" },
                  { id: "consistent", icon: <Shield className="w-5 h-5" />, label: t("profile.badges.consistent"), earned: (profile.daysActive || 0) >= 30, color: "text-emerald-600", bg: "bg-emerald-600/10" },
                  { id: "scholar", icon: <GraduationCap className="w-5 h-5" />, label: t("profile.badges.scholar"), earned: (profile.totalAyahsRead || 0) >= 5000, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                  { id: "juz-master", icon: <LayoutGrid className="w-5 h-5" />, label: t("profile.badges.juzMaster"), earned: (profile.totalJuzCompleted || 0) >= 15, color: "text-primary", bg: "bg-primary/10" },
                  { id: "juz-expert", icon: <Sparkles className="w-5 h-5" />, label: isArabic ? "خاتم الأجزاء" : "Juz Expert", earned: (profile.totalJuzCompleted || 0) >= 30, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { id: "tasbih-pro", icon: <RotateCcw className="w-5 h-5" />, label: t("profile.badges.tasbihPro"), earned: (profile.totalAthkarRecited || 0) >= 10000, color: "text-cyan-500", bg: "bg-cyan-500/10" },
                  { id: "legend", icon: <Sparkles className="w-5 h-5" />, label: t("profile.badges.spiritualLegend"), earned: pLevel >= 15, color: "text-gold", bg: "bg-gold/15" },
                  { id: "pure-heart", icon: <Heart className="w-5 h-5" />, label: t("profile.badges.pureHeart"), earned: (profile.totalAthkarRecited || 0) >= 20000, color: "text-rose-600", bg: "bg-rose-600/10" },
                  { id: "night-owl", icon: <Moon className="w-5 h-5" />, label: t("profile.badges.nightOwl"), earned: (profile.totalAthkarRecited || 0) >= 500 && (profile.totalAyahsRead || 0) >= 500, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                  { id: "devout", icon: <Flame className="w-5 h-5" />, label: isArabic ? "عابد مخلص" : "Devout", earned: pLevel >= 20, color: "text-orange-500", bg: "bg-orange-500/10" },
                ];
                
                return badges.map((badge) => (
                  <button 
                    key={badge.id} 
                    onClick={() => setSelectedBadge({
                      ...badge,
                      desc: isArabic ? getBadgeDescAr(badge.id) : getBadgeDescEn(badge.id)
                    })}
                    className="flex flex-col items-center gap-1.5 group outline-none"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all relative ${
                      badge.earned 
                        ? `${badge.bg} ${badge.color.replace('text-', 'border-').replace('500', '500/30')} shadow-md hover:scale-110` 
                        : "bg-muted/50 border-border/20 grayscale opacity-40 hover:opacity-60"
                    }`}>
                      {badge.icon}
                      {badge.earned && (
                        <div 
                          className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-emerald-deep rounded-full flex items-center justify-center border-2 border-white dark:border-black"
                        >
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  </button>
                ));
              })()}
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

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          onClick={() => setSelectedBadge(null)}
          className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-card rounded-[2.5rem] border border-border/20 shadow-2xl p-8 text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 pattern-islamic opacity-[0.03] pointer-events-none" />
            
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border-2 shadow-xl ${
              selectedBadge.earned ? `${selectedBadge.bg} ${selectedBadge.color.replace('text-', 'border-').replace('500', '500/30')}` : "bg-muted/50 border-border/20 grayscale"
            }`}>
              {selectedBadge.icon && React.cloneElement(selectedBadge.icon as React.ReactElement, { size: 40 })}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-primary">{selectedBadge.label}</h3>
              <div className="inline-flex px-3 py-1 rounded-full bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                {selectedBadge.earned ? (isArabic ? "مكتمل" : "EARNED") : (isArabic ? "قيد التقدم" : "IN PROGRESS")}
              </div>
            </div>

            <p className="text-sm text-primary/70 font-serif italic leading-relaxed">
              {selectedBadge.desc}
            </p>

            <button 
              onClick={() => setSelectedBadge(null)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-serif font-bold hover:opacity-90 transition-opacity"
            >
              {isArabic ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
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



export default UserProfileView;
