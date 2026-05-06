import { useTranslation } from "react-i18next";
import { 
  X, 
  Heart, 
  Zap, 
  Bell, 
  Check,
  Clock
} from "lucide-react";
import { Notification, communityService } from "@/services/communityService";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationsModal = ({ isOpen, onClose, notifications }: NotificationsModalProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  if (!isOpen) return null;

  const handleAction = async (notif: Notification) => {
    await communityService.markNotificationRead(notif.id!);
    // Additional logic if needed (e.g. navigate to duel)
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-border/20 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-primary" />
            <h3 className="text-lg font-serif font-bold text-primary">{isAr ? 'التنبيهات' : 'Notifications'}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-primary/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Bell size={40} className="text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground">{isAr ? 'لا توجد تنبيهات حالياً' : 'No notifications yet'}</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const timeAgo = formatDistanceToNow(notif.timestamp?.toDate ? notif.timestamp.toDate() : new Date(), { 
                addSuffix: true, 
                locale: isAr ? ar : enUS 
              });

              return (
                <div 
                  key={notif.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    notif.read ? "bg-transparent border-border/20 opacity-60" : "bg-primary/5 border-primary/20 shadow-sm"
                  }`}
                  onClick={() => handleAction(notif)}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.type === 'dua' ? 'bg-rose-500/10 text-rose-600' : 'bg-gold/10 text-gold'
                    }`}>
                      {notif.type === 'dua' ? <Heart size={20} /> : <Zap size={20} />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-serif leading-relaxed">
                        <span className="font-bold text-primary">{notif.fromName}</span>{' '}
                        {notif.type === 'dua' 
                          ? (isAr ? 'أرسل لك دعاء بظهر الغيب ❤️' : 'sent you a secret Dua ❤️')
                          : notif.type === 'duel_request'
                            ? (isAr ? 'يدعوك لتحدي جديد ⚔️' : 'invited you to a new duel ⚔️')
                            : (isAr ? 'قبل تحديك! استعد 🚀' : 'accepted your challenge! Get ready 🚀')
                        }
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock size={10} />
                        {timeAgo}
                      </div>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-primary/5 border-t border-border/20">
          <button 
            onClick={() => {/* Mark all as read */}}
            className="w-full py-2 text-[10px] font-bold text-primary/60 uppercase tracking-widest hover:text-primary transition-colors"
          >
            {isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
