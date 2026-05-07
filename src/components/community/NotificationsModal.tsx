import { useTranslation } from "react-i18next";
import { 
  X, 
  Heart, 
  Zap, 
  Bell, 
  Check, 
  Clock, 
  UserPlus, 
  BookOpen, 
  GraduationCap, 
  Users 
} from "lucide-react";
import { Notification, communityService } from "@/services/communityService";
import { invitationService, CommunityInvitation } from "@/services/invitationService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  invitations: CommunityInvitation[];
}

const NotificationsModal = ({ isOpen, onClose, notifications, invitations }: NotificationsModalProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAction = async (notif: Notification) => {
    await communityService.markNotificationRead(notif.id!);
  };

  const handleInvite = async (invite: CommunityInvitation, status: 'accepted' | 'declined') => {
    try {
      await invitationService.respondToInvitation(invite.id!, status);
      if (status === 'accepted') {
        toast.success(isAr ? "تم قبول الدعوة" : "Invitation accepted");
        // Navigate to the target
        if (invite.type === 'reading_circle') {
          navigate(`/community?tab=circles&id=${invite.targetId}`);
        } else if (invite.type === 'knowledge_session') {
          navigate(`/community?tab=sessions`);
        }
      } else {
        toast.info(isAr ? "تم رفض الدعوة" : "Invitation declined");
      }
      onClose();
    } catch (err) {
      toast.error(isAr ? "فشل تحديث الدعوة" : "Failed to update invitation");
    }
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {invitations.length > 0 && (
            <div className="space-y-3 pb-4 border-b border-border/20">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                {isAr ? "دعوات جديدة" : "New Invitations"}
              </h4>
              {invitations.map(invite => (
                <div key={invite.id} className="p-4 rounded-2xl bg-gold/5 border border-gold/20 shadow-sm space-y-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                      {invite.type === 'reading_circle' ? <BookOpen size={20} /> : invite.type === 'knowledge_session' ? <GraduationCap size={20} /> : <Users size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-serif leading-relaxed">
                        <span className="font-bold text-primary">{invite.senderName}</span>{' '}
                        {isAr ? "يدعوك للانضمام إلى" : "invited you to join"}{' '}
                        <span className="font-bold text-emerald-700">"{invite.targetTitle}"</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleInvite(invite, 'accepted')}
                      className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                    >
                      {isAr ? "قبول" : "Accept"}
                    </button>
                    <button 
                      onClick={() => handleInvite(invite, 'declined')}
                      className="flex-1 py-2 bg-muted text-muted-foreground rounded-xl text-[10px] font-bold hover:bg-muted/80 transition-colors"
                    >
                      {isAr ? "رفض" : "Decline"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length === 0 && invitations.length === 0 ? (
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
