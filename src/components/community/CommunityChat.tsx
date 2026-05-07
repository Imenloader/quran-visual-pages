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
  Clock,
  X,
  Image as ImageIcon,
  ShieldCheck
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
  where,
  setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/firebase";
import { useUser } from "@/contexts/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toArabicNumber } from "@/data/quranData";
import { toast } from "sonner";
import { formatDistanceToNow, subDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { privateChatService, PrivateChat, PrivateMessage } from "@/services/privateChatService";
import { profanityFilter } from "@/lib/profanityFilter";
import { reportService } from "@/services/reportService";
import imageCompression from 'browser-image-compression';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderLevel?: number;
  gender: 'male' | 'female';
  timestamp: Timestamp | null;
  type: 'text' | 'system' | 'image';
  imageUrl?: string;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  } | null;
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
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(profile?.gender === 'female' ? 'female' : 'male');
  
  // Private Chat States
  const [chatMode, setChatMode] = useState<'global' | 'privateList' | 'privateChat'>('global');
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [activePrivateChatId, setActivePrivateChatId] = useState<string | null>(null);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Image Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const userGender = profile?.gender || 'male'; // Fallback to male if not set, but rules will catch it

  // Handle incoming private chat deep links
  useEffect(() => {
    const initPrivateChat = async () => {
      const privateId = searchParams.get('privateId');
      if (privateId && profile?.uid && profile.gender !== 'unspecified') {
        try {
          // You would typically fetch the target user's gender here to verify,
          // but assuming they got here from a valid profile view, the service handles it.
          // Fallback to current user's gender for the chat room creation rule
          const targetGender = profile.gender; 
          
          const chatId = await privateChatService.startOrGetChat(profile.uid, privateId, targetGender);
          setChatMode('privateChat');
          setActivePrivateChatId(chatId);
          
          // Clear param so it doesn't re-trigger on refresh
          searchParams.delete('privateId');
          setSearchParams(searchParams);
        } catch (err) {
          console.error("Failed to start private chat:", err);
          toast.error(isAr ? "تعذر بدء المحادثة الخاصة" : "Could not start private chat");
        }
      }
    };
    initPrivateChat();
  }, [searchParams, profile?.uid, profile?.gender]);


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
  }, [selectedGender, profile?.uid, chatMode]);

  // Private Chats Listener
  useEffect(() => {
    if (!profile?.uid || chatMode !== 'privateList') return;
    const unsub = privateChatService.subscribeToChats(profile.uid, (chats) => {
      setPrivateChats(chats);
    });
    return () => unsub();
  }, [profile?.uid, chatMode]);

  // Private Messages Listener
  useEffect(() => {
    if (!activePrivateChatId || chatMode !== 'privateChat') return;
    const unsub = privateChatService.subscribeToMessages(activePrivateChatId, (msgs) => {
      setPrivateMessages(msgs);
      scrollToBottom();
    });
    return () => unsub();
  }, [activePrivateChatId, chatMode]);

  // Typing Indicators Listener (Global)
  useEffect(() => {
    if (!profile?.uid || chatMode !== 'global') return;

    const typingDoc = doc(db, "chat_presence", `typing_${selectedGender}`);
    const unsub = onSnapshot(typingDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const activeTypers = Object.entries(data)
          .filter(([uid, info]: [string, any]) => 
            uid !== profile.uid && 
            info.isTyping && 
            (Date.now() - info.lastActive < 10000)
          )
          .map(([_, info]: [string, any]) => info.name);
        setTypingUsers(activeTypers);
      }
    });

    return () => unsub();
  }, [selectedGender, profile?.uid]);

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!profile?.uid) return;
    try {
      const typingDoc = doc(db, "chat_presence", `typing_${selectedGender}`);
      await setDoc(typingDoc, {
        [profile.uid]: {
          name: profile.name || (isAr ? "مستخدم" : "User"),
          isTyping,
          lastActive: Date.now()
        }
      }, { merge: true });
    } catch (err) {
      console.error("Typing status error:", err);
    }
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const handleTyping = () => {
    updateTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(isAr ? "حجم الصورة يجب أن لا يتجاوز 5 ميجابايت" : "Image size must not exceed 5MB");
        return;
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imageFile) || !auth.currentUser || isSending) return;

    setIsSending(true);
    setIsUploadingImage(!!imageFile);
    const text = newMessage.trim();
    setNewMessage("");

    try {
      let uploadedImageUrl = null;
      if (imageFile) {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(imageFile, options);
        
        const uniqueName = `${Math.random().toString(36).substring(2)}_${Date.now()}_${compressedFile.name}`;
        const storageRef = ref(storage, `chat_images/${uniqueName}`);
        const snapshot = await uploadBytes(storageRef, compressedFile);
        uploadedImageUrl = await getDownloadURL(snapshot.ref);
        removeImage();
      }
      if (chatMode === 'global') {
        if (!isAdmin && selectedGender !== profile?.gender) {
          toast.error(isAr ? "يمكنك النشر فقط في قسم جنسك" : "You can only post in your gender section");
          setIsSending(false);
          setNewMessage(text);
          return;
        }

        const { maskedText, hasProfanity } = profanityFilter.filter(text);

        const docRef = await addDoc(collection(db, "community_messages"), {
          text: maskedText,
          senderId: auth.currentUser.uid,
          senderName: profile?.name || auth.currentUser.displayName || (isAr ? "مستخدم" : "User"),
          senderAvatar: profile?.avatar || null,
          senderLevel: level || 1,
          senderRole: profile?.role || 'user',
          gender: selectedGender,
          timestamp: serverTimestamp(),
          type: uploadedImageUrl ? 'image' : 'text',
          ...(uploadedImageUrl && { imageUrl: uploadedImageUrl }),
          replyTo: replyTo ? {
            id: replyTo.id,
            text: replyTo.text,
            senderName: replyTo.senderName
          } : null
        });

        if (hasProfanity) {
          await reportService.submitReport({
            reporterId: 'system',
            reporterName: 'System Filter',
            reportedUserId: auth.currentUser.uid,
            reportedUserName: profile?.name || "User",
            contentId: docRef.id,
            contentType: 'message',
            contentSnippet: text,
            reason: 'Profanity detected in global chat',
            isAutoReport: true
          });
        }

        setReplyTo(null);
        scrollToBottom();
      } else if (chatMode === 'privateChat' && activePrivateChatId) {
        const { maskedText, hasProfanity } = profanityFilter.filter(text);
        
        await privateChatService.sendMessage(activePrivateChatId, auth.currentUser.uid, maskedText, uploadedImageUrl || undefined);

        if (hasProfanity) {
          await reportService.submitReport({
            reporterId: 'system',
            reporterName: 'System Filter',
            reportedUserId: auth.currentUser.uid,
            reportedUserName: profile?.name || "User",
            contentId: activePrivateChatId, // Ideally message ID, but private chat ID works for context
            contentType: 'message',
            contentSnippet: text,
            reason: 'Profanity detected in private chat',
            isAutoReport: true
          });
        }
        scrollToBottom();
      }
    } catch (err) {
      toast.error(isAr ? "تعذر إرسال الرسالة" : "Could not send message");
      setNewMessage(text);
    } finally {
      setIsSending(false);
      setIsUploadingImage(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm(isAr ? "هل تريد حذف هذه الرسالة؟" : "Delete this message?")) return;
    try {
      if (chatMode === 'global') {
        await deleteDoc(doc(db, "community_messages", id));
      } else if (chatMode === 'privateChat' && activePrivateChatId) {
        await deleteDoc(doc(db, "private_chats", activePrivateChatId, "messages", id));
      }
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

  const renderHeader = () => (
    <div className="px-6 py-4 bg-primary/5 border-b border-border/20 flex flex-col gap-4 relative z-10">
      {/* Mode Toggle */}
      <div className="flex p-1 bg-card border border-border/40 rounded-xl max-w-xs mx-auto w-full">
        <button 
          onClick={() => { setChatMode('global'); setActivePrivateChatId(null); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${chatMode === 'global' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-primary'}`}
        >
          {isAr ? "المجتمع العام" : "Global"}
        </button>
        <button 
          onClick={() => { setChatMode('privateList'); setActivePrivateChatId(null); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${chatMode !== 'global' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-primary'}`}
        >
          {isAr ? "الرسائل الخاصة" : "Private"}
        </button>
      </div>

      {chatMode === 'global' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-primary">
                {isAr ? "المجتمع العام" : "Global Community"} 
                <span className="mx-2 opacity-40">•</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {selectedGender === 'male' ? (isAr ? "رجال" : "Men") : (isAr ? "نساء" : "Women")}
                </span>
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {typingUsers.length > 0 
                  ? (isAr ? `${typingUsers.join(", ")} يكتب الآن...` : `${typingUsers.join(", ")} is typing...`)
                  : (isAr ? "متصل الآن" : "online")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-primary">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-[9px] font-bold">
              <Clock size={12} />
              {isAr ? "تُحذف كل 7 أيام" : "Cleared every 7 days"}
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary">
                  <MoreVertical size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 rounded-2xl border-border/40 shadow-2xl space-y-1">
                <div className="flex flex-col gap-1">
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => setSelectedGender('male')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === 'male' ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                      >
                        <Users size={14} />
                        {isAr ? "قسم الرجال" : "Men's Section"}
                      </button>
                      <button 
                        onClick={() => setSelectedGender('female')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === 'female' ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
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
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-[650px] bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/40 overflow-hidden shadow-2xl relative">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none pattern-islamic" />

      {renderHeader()}

      {/* Gender Switcher (Only for Admins) */}
      {isAdmin && chatMode === 'global' && (
        <div className="flex bg-primary/5 border-b border-border/20 relative z-10">
          <button 
            onClick={() => setSelectedGender('male')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedGender === 'male' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}
          >
            {isAr ? "مجلس الرجال" : "Men's Council"}
          </button>
          <button 
            onClick={() => setSelectedGender('female')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedGender === 'female' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}
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
        {chatMode === 'privateList' ? (
          privateChats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center p-8 bg-white/40 dark:bg-black/20 rounded-3xl backdrop-blur-sm m-4 border border-white/20">
              <MessageSquare size={32} className="text-primary mb-4" />
              <p>{isAr ? "لا توجد رسائل خاصة بعد" : "No private messages yet"}</p>
              <p className="text-xs mt-2">{isAr ? "اذهب إلى صفحة صديق لبدء محادثة" : "Go to a friend's profile to start a chat"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {privateChats.map(chat => {
                const otherUserId = chat.participants.find(p => p !== profile?.uid);
                return (
                  <button 
                    key={chat.id}
                    onClick={() => { setActivePrivateChatId(chat.id); setChatMode('privateChat'); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-primary truncate">
                        {isAr ? "محادثة خاصة" : "Private Chat"}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">{chat.lastMessage || (isAr ? "بدأت المحادثة" : "Chat started")}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (chatMode === 'global' ? messages : privateMessages).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center p-8 bg-white/40 dark:bg-black/20 rounded-3xl backdrop-blur-sm m-4 border border-white/20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-primary" />
            </div>
            <h4 className="font-serif font-bold text-primary">
              {isAr ? "مرحباً بك في المحادثة" : "Welcome to the chat"}
            </h4>
            <p className="text-xs mt-2 max-w-[200px] leading-relaxed">
              {isAr 
                ? "ابدأ بالسلام وشارك الخير مع إخوتك في الله." 
                : "Start with Salam and share goodness with your brothers/sisters."}
            </p>
          </div>
        ) : (
          (chatMode === 'global' ? messages : privateMessages).map((msg: any, index: number, arr: any[]) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            const prevMsg = index > 0 ? arr[index - 1] : null;
            const isSameUser = prevMsg?.senderId === msg.senderId;
            
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${isSameUser ? "mt-1" : "mt-4"}`}
              >
                {!isSameUser && (
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <button 
                      onClick={() => navigate(`/profile/${msg.senderId}`)}
                      className="text-[10px] font-bold text-primary hover:underline transition-all"
                    >
                      {msg.senderName}
                    </button>
                    {msg.senderRole === 'admin' && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-gold text-white font-bold flex items-center gap-1 shadow-sm">
                        <ShieldCheck size={10} />
                        {isAr ? 'المشرف' : 'Admin'}
                      </span>
                    )}
                    <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-gold/10 text-gold font-bold border border-gold/20">
                      {isAr ? `لـ ${toArabicNumber(msg.senderLevel || 1)}` : `Lvl ${msg.senderLevel || 1}`}
                    </span>
                  </div>
                )}
                
                <div className={`flex gap-2 max-w-[85%] sm:max-w-[70%] group relative ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {!isMe && !isSameUser && (
                    <button 
                      onClick={() => navigate(`/profile/${msg.senderId}`)}
                      className="shrink-0 mt-auto hover:opacity-80 transition-opacity"
                    >
                      {msg.senderAvatar ? (
                        <img src={msg.senderAvatar} className="w-7 h-7 rounded-full object-cover border border-border/40 shadow-sm" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/10 shadow-sm">
                          {msg.senderName.charAt(0)}
                        </div>
                      )}
                    </button>
                  )}
                  {isSameUser && !isMe && <div className="w-7 shrink-0" />}

                  <div className={`relative px-4 py-2.5 rounded-[1.5rem] shadow-sm min-w-[60px] ${
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-card border border-border/40 text-foreground rounded-bl-sm"
                  }`}>
                    {/* Reply Context */}
                    {msg.replyTo && (
                      <div className={`mb-2 p-2 rounded-xl border-l-4 text-[10px] ${isMe ? "bg-white/10 border-white/50" : "bg-primary/5 border-primary"}`}>
                        <p className={`font-bold mb-0.5 ${isMe ? "text-white" : "text-primary"}`}>{msg.replyTo.senderName}</p>
                        <p className={`line-clamp-1 italic ${isMe ? "text-white/80" : "text-muted-foreground"}`}>{msg.replyTo.text}</p>
                      </div>
                    )}

                    {/* Image Attachment */}
                    {msg.imageUrl && (
                      <div className="mb-2 mt-1 rounded-xl overflow-hidden border border-black/10 shadow-sm">
                        <img src={msg.imageUrl} alt="Attachment" className="max-w-full max-h-[250px] object-cover" />
                      </div>
                    )}

                    {msg.text && <p className="text-sm font-naskh whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>}
                    
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-white/80" : "text-muted-foreground"}`}>
                      <span className="text-[9px] font-bold uppercase tracking-tighter">
                        {formatTime(msg.timestamp)}
                      </span>
                      {isMe && <CheckCheck size={10} />}
                    </div>

                    <div className={`absolute -top-2 ${isMe ? "right-full mr-2" : "left-full ml-2"} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <button 
                        onClick={() => setReplyTo({ id: msg.id, text: msg.text, senderName: msg.senderName })}
                        className="p-1.5 bg-card/80 backdrop-blur text-muted-foreground hover:text-primary rounded-full shadow-sm hover:scale-110 transition-all border border-border/40"
                        title={isAr ? "رد" : "Reply"}
                      >
                        <MessageSquare size={12} />
                      </button>
                      
                      {!isMe && (
                        <button 
                          onClick={async () => {
                            if (!profile?.uid) return;
                            try {
                              await reportService.submitReport({
                                reporterId: profile.uid,
                                reporterName: profile.name || 'User',
                                reportedUserId: msg.senderId,
                                reportedUserName: msg.senderName,
                                contentId: msg.id,
                                contentType: 'message',
                                contentSnippet: msg.text || 'Image only message',
                                reason: 'User manually reported this message'
                              });
                              toast.success(isAr ? "تم الإبلاغ بنجاح" : "Reported successfully");
                            } catch (e) {
                              toast.error(isAr ? "فشل إرسال البلاغ" : "Failed to send report");
                            }
                          }}
                          className="p-1.5 bg-card/80 backdrop-blur text-muted-foreground hover:text-rose-500 rounded-full shadow-sm hover:scale-110 transition-all border border-border/40"
                          title={isAr ? "إبلاغ" : "Report"}
                        >
                          <Flag size={12} />
                        </button>
                      )}

                      {(isMe || isAdmin) && (
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 rounded-xl bg-card border border-border/40 text-rose-500 shadow-lg scale-75 hover:bg-rose-500/10"
                          title={isAr ? "حذف" : "Delete"}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      {chatMode !== 'privateList' && (
        <div className="bg-card/40 backdrop-blur-md border-t border-border/20 relative z-10">
          {/* Reply Preview */}
          {replyTo && (
            <div className="px-4 py-3 bg-primary/5 border-b border-border/20 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 border-r-4 border-primary px-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{isAr ? "الرد على" : "Replying to"}</p>
                  <p className="text-xs font-bold text-foreground">{replyTo.senderName}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{replyTo.text}</p>
                </div>
              </div>
              <button onClick={() => setReplyTo(null)} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary">
                <X size={16} className="text-zinc-400" />
              </button>
            </div>
          )}

          {/* Image Preview */}
          {imagePreviewUrl && (
            <div className="px-4 py-3 bg-primary/5 border-b border-border/20 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3">
                <img src={imagePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-primary/20 shadow-sm" />
                <p className="text-xs font-bold text-primary">{isAr ? "صورة جاهزة للإرسال" : "Image ready to send"}</p>
              </div>
              <button onClick={removeImage} className="p-2 hover:bg-rose-500/10 rounded-full transition-colors text-rose-500">
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="p-4">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-3"
          >
          <div className="flex-1 bg-card rounded-[2rem] flex items-end p-2.5 border border-border/40 shadow-sm focus-within:border-primary/50 transition-all">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ImageIcon size={20} />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  type="button" 
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Smile size={22} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 rounded-[2rem] grid grid-cols-5 gap-1 border-border/40 shadow-2xl">
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="p-2 text-xl hover:bg-primary/10 rounded-xl transition-all active:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
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
            disabled={(!newMessage.trim() && !imageFile) || isSending || isUploadingImage}
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shrink-0"
          >
            {isSending || isUploadingImage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={isAr ? "rotate-180" : ""} />}
          </button>
        </form>
        
        <div className="mt-3 flex items-center justify-center gap-4 text-[9px] font-bold text-muted-foreground">
           <div className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-default">
            <ShieldAlert size={10} />
            {isAr ? "ممنوع الإساءة" : "No abuse"}
          </div>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-default">
            <CheckCheck size={10} />
            {isAr ? "تشغيل التشفير" : "Encrypted"}
          </div>
        </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default CommunityChat;
