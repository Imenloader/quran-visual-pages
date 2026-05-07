import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";
import { activityService, Activity } from "@/services/activityService";
import { communityService } from "@/services/communityService";
import { 
  Trophy, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Clock,
  Heart as HeartOutline
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ActivityFeedProps {
  onFindFriends?: () => void;
}

const ActivityFeed = ({ onFindFriends }: ActivityFeedProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";
  const { profile } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid || !profile?.friendIds) {
      setLoading(false);
      return;
    }

    const unsub = activityService.subscribeToFriendActivities(
      profile.friendIds, 
      profile.gender || 'unspecified', 
      (data) => {
        setActivities(data);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [profile?.uid, profile?.friendIds, profile?.gender]);

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'JUZ_COMPLETE':
        return {
          icon: <BookOpen size={16} className="text-emerald-500" />,
          bgColor: 'bg-emerald-500/10',
          title: isAr ? 'أتمّ قراءة جزء جديد' : 'Completed a new Juz',
        };
      case 'BADGE_EARNED':
        return {
          icon: <Trophy size={16} className="text-gold" />,
          bgColor: 'bg-gold/10',
          title: isAr ? 'حصل على وسام جديد' : 'Earned a new badge',
        };
      case 'KHATMA_COMPLETE':
        return {
          icon: <Sparkles size={16} className="text-purple-500" />,
          bgColor: 'bg-purple-500/10',
          title: isAr ? 'ختم القرآن الكريم' : 'Completed the Quran',
        };
      default:
        return {
          icon: <ActivityIcon size={16} className="text-primary" />,
          bgColor: 'bg-primary/10',
          title: isAr ? 'قام بنشاط جديد' : 'Performed a new activity',
        };
    }
  };

  const handleSendDua = async (targetId: string, targetName: string) => {
    if (!profile.uid) return;
    try {
      await communityService.sendDua(profile.uid, profile.name, targetId);
      toast.success(isAr ? `تم إرسال دعاء لـ ${targetName}` : `Dua sent to ${targetName}`);
    } catch (e) {
      toast.error(isAr ? 'فشل إرسال الدعاء' : 'Failed to send Dua');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-serif text-muted-foreground">{isAr ? 'جاري تحميل الأنشطة...' : 'Loading activities...'}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
          <ActivityIcon size={32} className="text-primary/20" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-lg text-primary">{isAr ? 'الخلاصة فارغة' : 'Feed is empty'}</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {isAr ? 'أضف بعض الأصدقاء لمشاهدة إنجازاتهم وربح الحسنات بالدعاء لهم.' : 'Add some friends to see their achievements and earn rewards by praying for them.'}
          </p>
        </div>
        <button 
          onClick={() => {
            if (onFindFriends) {
              onFindFriends();
              return;
            }
            navigate('/community/hub?tab=friends');
          }} 
          className="px-6 py-2 rounded-xl bg-primary text-white font-serif font-bold text-sm shadow-lg hover:scale-105 transition-all"
        >
          {isAr ? 'ابحث عن أصدقاء' : 'Find Friends'}
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/20">
      {activities.map((activity) => {
        const config = getActivityConfig(activity.type);
        const timeAgo = formatDistanceToNow(activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(), { 
          addSuffix: true, 
          locale: isAr ? ar : enUS 
        });

        return (
          <div key={activity.id} className="p-6 hover:bg-primary/5 transition-colors group">
            <div className="flex gap-4">
              <Link to={`/profile/${activity.userId}`} className="shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-muted border border-border/40 overflow-hidden shadow-sm">
                  <img src={activity.userAvatar || "/avatar-man-1.svg"} alt={activity.userName} className="w-full h-full object-cover" />
                </div>
              </Link>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Link to={`/profile/${activity.userId}`} className="font-serif font-bold text-primary hover:text-gold transition-colors">
                    {activity.userName}
                  </Link>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                    {config.icon}
                  </div>
                  <p className="text-sm text-foreground/80 font-naskh">
                    {config.title} {activity.payload?.detail && <span className="font-bold text-emerald-600">{activity.payload.detail}</span>}
                  </p>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button 
                    onClick={() => handleSendDua(activity.userId, activity.userName)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold"
                  >
                    <Heart size={14} />
                    {isAr ? 'دعاء' : 'Dua'}
                  </button>
                  <button 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 text-primary/60 hover:bg-primary/10 transition-all text-xs font-bold"
                  >
                    {isAr ? 'ما شاء الله' : 'Mabrouk'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Internal icon for the fallback
const ActivityIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default ActivityFeed;
