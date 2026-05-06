import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  Trophy, 
  Zap, 
  MessageSquare, 
  Sparkles,
  Search,
  Bell,
  Activity as ActivityIcon,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuranHeader from "@/components/QuranHeader";
import { useUser } from "@/contexts/UserContext";
import { toArabicNumber } from "@/data/quranData";
import FriendsManager from "./FriendsManager";
import { communityService, Notification as CommunityNotification } from "@/services/communityService";
import { toast } from "sonner";
import ActivityFeed from "@/components/community/ActivityFeed";
import SpiritualDuels from "@/components/community/SpiritualDuels";
import NotificationsModal from "@/components/community/NotificationsModal";
import Leaderboard from "@/components/community/Leaderboard";
import EpicQuests from "@/components/community/EpicQuests";
import GrowthTree from "@/components/community/GrowthTree";

// Placeholder components - will be implemented in next steps

const CommunityHub = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'duels' | 'leaderboard' | 'quests'>('feed');
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = communityService.subscribeToNotifications(profile.uid, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return () => unsub();
  }, [profile?.uid]);

  const tabs = [
    { id: 'feed', label: isAr ? 'الخلاصة' : 'Feed', icon: ActivityIcon },
    { id: 'friends', label: isAr ? 'الأصدقاء' : 'Friends', icon: Users },
    { id: 'duels', label: isAr ? 'التحديات' : 'Duels', icon: Zap },
    { id: 'leaderboard', label: isAr ? 'المتصدرون' : 'Leaderboard', icon: Trophy },
    { id: 'quests', label: isAr ? 'المهمات' : 'Quests', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <QuranHeader 
        title={isAr ? 'مركز المجتمع' : 'Community Hub'} 
        subtitle={isAr ? 'تواصل وتنافس في الخير' : 'Connect and compete in goodness'}
        variant="compact"
        showBack
      />

      <main className="container max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        {/* User Stats Summary Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 flex flex-col md:flex-row bg-card/95 backdrop-blur-xl border border-border/40 rounded-[2.5rem] p-6 shadow-xl items-center justify-between gap-6 overflow-hidden">
            <div className="flex items-center gap-4 min-w-max">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Trophy className="text-gold" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{isAr ? 'النقاط' : 'Points'}</p>
                <p className="text-lg font-bold text-primary">{isAr ? toArabicNumber(profile.points) : profile.points.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 min-w-max">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <ActivityIcon className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{isAr ? 'المستوى' : 'Level'}</p>
                <p className="text-lg font-bold text-emerald-600">{isAr ? toArabicNumber(level) : level}</p>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-border/40" />

            <button 
              className="relative p-4 rounded-[2rem] bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 flex items-center gap-3"
              onClick={() => setShowNotifications(true)}
            >
              <Bell size={20} className="text-primary" />
              <span className="text-xs font-bold text-primary/80">{isAr ? 'التنبيهات' : 'Notifications'}</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="lg:col-span-4">
            <GrowthTree />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-card/40 backdrop-blur-md rounded-3xl p-1.5 border border-border/20 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold font-serif transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-deep shadow-lg text-gold"
                  : "text-primary/40 hover:text-primary/60"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-card/40 backdrop-blur-md border border-border/20 rounded-[2.5rem] min-h-[500px] shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 pattern-islamic opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10">
            {activeTab === 'feed' && <ActivityFeed />}
            {activeTab === 'friends' && <FriendsManager />}
            {activeTab === 'duels' && <SpiritualDuels />}
            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'quests' && <EpicQuests />}
          </div>
        </div>
      </main>

      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        notifications={notifications} 
      />
    </div>
  );
};

export default CommunityHub;
