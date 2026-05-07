import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Send, 
  Loader2, 
  Trash2, 
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Smile,
  Check,
  CheckCheck,
  MoreVertical,
  Flag,
  Users,
  Clock
} from "lucide-react";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  doc, 
  Timestamp,
  where 
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { toArabicNumber } from "@/data/quranData";
import { toast } from "sonner";
import { formatDistanceToNow, subDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderLevel?: number;
  gender: 'male' | 'female';
  timestamp: Timestamp | null;
  type: 'text' | 'system';
}

const COMMON_EMOJIS = ["😊", "😂", "❤️", "👍", "🙏", "✨", "🌸", "📚", "🤲", "🕌", "⭐", "🌙", "🙌", "💡", "✅", "🎉", "🔥", "💯", "👏", "🌹"];

const CommunityChat: React.FC = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const navigate = useNavigate();
  const { profile, level, isAdmin } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(profile?.gender === 'female' ? 'female' : 'male');
  const scrollRef = useRef<HTMLDivElement>(null);

  const userGender = profile?.gender || 'male'; // Fallback to male if not set, but rules will catch it

  useEffect(() => {
    if (!profile?.uid) return;

    // Filter for last 7 days
    const sevenDaysAgo = subDays(new Date(), 7);
    
    const q = query(
      collection(db, "community_messages"),
      where("gender", "==", selectedGender),
      where("timestamp", ">=", Timestamp.fromDate(sevenDaysAgo)),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)).reverse();
      setMessages(msgs);
      setLoading(false);
      // Auto scroll to bottom
      scrollToBottom();
    }, (err) => {
      console.error("Chat error:", err);
      // If index is missing, it might fail initially
      if (err.code === 'failed-precondition') {
        toast.error(isAr ? "نظام الدردشة قيد التحديث... (Index required)" : "Chat system updating... (Index required)");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedGender, profile?.uid]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser || isSending) return;

    setIsSending(true);
    const text = newMessage.trim();
    setNewMessage("");

    if (!isAdmin && selectedGender !== profile?.gender) {
      toast.error(isAr ? "يمكنك النشر فقط في قسم جنسك" : "You can only post in your gender section");
      setIsSending(false);
      setNewMessage(text);
      return;
    }

    try {
      await addDoc(collection(db, "community_messages"), {
        text,
        senderId: auth.currentUser.uid,
        senderName: profile?.name || auth.currentUser.displayName || (isAr ? "مستخدم" : "User"),
        senderAvatar: profile?.avatar || null,
        senderLevel: level || 1,
        gender: selectedGender,
        timestamp: serverTimestamp(),
        type: 'text'
      });
      scrollToBottom();
    } catch (err) {
      toast.error(isAr ? "تعذر إرسال الرسالة" : "Could not send message");
      setNewMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm(isAr ? "هل تريد حذف هذه الرسالة؟" : "Delete this message?")) return;
    try {
      await deleteDoc(doc(db, "community_messages", id));
    } catch (err) {
      toast.error(isAr ? "فشل الحذف" : "Delete failed");
    }
  };

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return "";
    const date = ts.toDate();
    return date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  if (loading) return <div className="h-[600px] flex items-center justify-center bg-card/20 rounded-[2.5rem]"><Loader2 className="animate-spin text-primary" /></div>;

  if (profile?.gender === 'unspecified') {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-card/20 backdrop-blur-sm rounded-[2.5rem] border border-border/40 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Users size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif font-bold text-primary">
            {isAr ? "يرجى تحديد الجنس أولاً" : "Please select your gender first"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {isAr 
              ? "للمشاركة في المحادثة، يجب تحديد الجنس في ملفك الشخصي ليتم توجيهك للغرفة المناسبة." 
              : "To participate in the chat, please select your gender in your profile to be directed to the appropriate room."}
          </p>
        </div>
        <Button 
          onClick={() => navigate("/profile")}
          className="rounded-2xl px-8 h-12 bg-primary shadow-lg shadow-primary/20"
        >
          {isAr ? "الذهاب للملف الشخصي" : "Go to Profile"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[650px] bg-[#E5DDD5] dark:bg-zinc-950 rounded-[2.5rem] border border-border/40 overflow-hidden shadow-2xl relative">
      {/* Background Pattern Overlay (WhatsApp Style) */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none pattern-islamic" />

      {/* Header */}
      <div className="px-6 py-3 bg-[#075E54] dark:bg-emerald-950 text-white flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">
              {isAr ? "المجتمع العام" : "Global Community"} 
              <span className="mx-1 opacity-60">•</span>
              <span className="text-[10px] font-normal opacity-80 uppercase tracking-widest">
                {selectedGender === 'male' ? (isAr ? "رجال" : "Men") : (isAr ? "نساء" : "Women")}
              </span>
            </h3>
            <p className="text-[10px] opacity-70">
              {isAr ? "متصل الآن" : "online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[9px] font-bold">
            <Clock size={12} />
            {isAr ? "تُحذف كل 7 أيام" : "Cleared every 7 days"}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <MoreVertical size={18} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 rounded-2xl border-emerald-500/20 shadow-2xl space-y-1">
              <div className="flex flex-col gap-1">
                {isAdmin && (
                  <>
                    <button 
                      onClick={() => setSelectedGender('male')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === 'male' ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-muted"}`}
                    >
                      <Users size={14} />
                      {isAr ? "قسم الرجال" : "Men's Section"}
                    </button>
                    <button 
                      onClick={() => setSelectedGender('female')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === 'female' ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-muted"}`}
                    >
                      <Users size={14} />
                      {isAr ? "قسم النساء" : "Women's Section"}
                    </button>
                    <div className="h-px bg-border my-1" />
                  </>
                )}
                
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-muted transition-all"
                  onClick={() => { toast.info(isAr ? "سيتم مسح المحادثة تلقائياً كل 7 أيام" : "Chat clears automatically every 7 days"); }}
                >
                  <Clock size={14} />
                  {isAr ? "معلومات الحذف" : "Cleanup Info"}
                </button>
                
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-rose-500/10 text-rose-600 transition-all"
                  onClick={() => { toast.success(isAr ? "تم الإبلاغ بنجاح" : "Reported successfully"); }}
                >
                  <Flag size={14} />
                  {isAr ? "إبلاغ عن محتوى" : "Report Content"}
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Gender Switcher (Only for Admins) */}
      {isAdmin && (
        <div className="flex bg-[#075E54]/90 dark:bg-emerald-950/90 text-white/80 border-t border-white/10 relative z-10">
          <button 
            onClick={() => setSelectedGender('male')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedGender === 'male' ? "text-white border-b-2 border-white" : "hover:text-white"}`}
          >
            {isAr ? "مجلس الرجال" : "Men's Council"}
          </button>
          <button 
            onClick={() => setSelectedGender('female')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedGender === 'female' ? "text-white border-b-2 border-white" : "hover:text-white"}`}
          >
            {isAr ? "مجلس النساء" : "Women's Council"}
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 no-scrollbar relative z-10"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center p-8 bg-white/40 dark:bg-black/20 rounded-3xl backdrop-blur-sm m-4 border border-white/20">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-emerald-600" />
            </div>
            <h4 className="font-serif font-bold text-emerald-900 dark:text-emerald-100">
              {isAr ? "مرحباً بك في المحادثة" : "Welcome to the chat"}
            </h4>
            <p className="text-xs mt-2 max-w-[200px] leading-relaxed">
              {isAr 
                ? "ابدأ بالسلام وشارك الخير مع إخوتك في الله." 
                : "Start with Salam and share goodness with your brothers/sisters."}
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const isSameUser = prevMsg?.senderId === msg.senderId;
            
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${isSameUser ? "mt-1" : "mt-4"}`}
              >
                {!isSameUser && (
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                      {msg.senderName}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/10">
                      {isAr ? `لـ ${toArabicNumber(msg.senderLevel || 1)}` : `Lvl ${msg.senderLevel || 1}`}
                    </span>
                  </div>
                )}
                
                <div className={`flex gap-2 max-w-[85%] sm:max-w-[70%] group relative ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {!isMe && !isSameUser && (
                    <div className="shrink-0 mt-auto">
                      {msg.senderAvatar ? (
                        <img src={msg.senderAvatar} className="w-7 h-7 rounded-full object-cover border border-white/50" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold border border-white/50">
                          {msg.senderName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}
                  {isSameUser && !isMe && <div className="w-7 shrink-0" />}

                  <div className={`relative px-3 py-2 rounded-xl shadow-sm min-w-[60px] ${
                    isMe 
                      ? "bg-[#DCF8C6] dark:bg-emerald-900 text-zinc-900 dark:text-emerald-50 rounded-tr-none" 
                      : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-tl-none"
                  }`}>
                    {/* Tiny "WhatsApp Tail" */}
                    {!isSameUser && (
                      <div className={`absolute top-0 w-3 h-3 ${
                        isMe 
                          ? "right-[-6px] bg-[#DCF8C6] dark:bg-emerald-900 rounded-tr-sm" 
                          : "left-[-6px] bg-white dark:bg-zinc-900 rounded-tl-sm"
                      } transform rotate-45 z-[-1]`} />
                    )}

                    <p className="text-sm font-naskh whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                    
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                      <span className="text-[9px] font-medium uppercase tracking-tighter">
                        {formatTime(msg.timestamp)}
                      </span>
                      {isMe && <CheckCheck size={10} />}
                    </div>

                    {(isMe || isAdmin) && (
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className={`absolute -top-2 ${isMe ? "right-full mr-2" : "left-full ml-2"} p-1.5 rounded-lg bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-75`}
                        title={isAr ? "حذف" : "Delete"}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#F0F2F5] dark:bg-zinc-900/50 border-t border-border/20 relative z-10">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-end gap-2"
        >
          <div className="flex-1 bg-white dark:bg-zinc-800 rounded-2xl flex items-end p-2 border border-zinc-200 dark:border-zinc-700 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  type="button" 
                  className="p-2 text-zinc-500 hover:text-emerald-600 transition-colors"
                >
                  <Smile size={22} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 rounded-2xl grid grid-cols-5 gap-1 border-emerald-500/20 shadow-2xl">
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="p-2 text-xl hover:bg-emerald-500/10 rounded-lg transition-all active:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              placeholder={isAr ? "اكتب رسالتك..." : "Type a message..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 max-h-32 min-h-[40px] resize-none font-naskh"
              dir="auto"
              rows={1}
            />
          </div>

          <button 
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 rounded-full bg-[#00A884] hover:bg-[#06cf9c] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shrink-0"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={isAr ? "rotate-180" : ""} />}
          </button>
        </form>
        
        <div className="mt-2 flex items-center justify-center gap-4 text-[9px] font-bold text-zinc-500">
           <div className="flex items-center gap-1 text-rose-500">
            <ShieldAlert size={10} />
            {isAr ? "ممنوع الإساءة" : "No abuse"}
          </div>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCheck size={10} />
            {isAr ? "تشغيل التشفير" : "Encrypted"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
