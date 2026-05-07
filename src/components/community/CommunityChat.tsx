import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Send, 
  Loader2, 
  Trash2, 
  MessageSquare,
  Sparkles,
  ShieldAlert
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
  Timestamp 
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useUser } from "@/contexts/UserContext";
import { toArabicNumber } from "@/data/quranData";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderLevel?: number;
  timestamp: Timestamp | null;
  type: 'text' | 'system';
}

const CommunityChat: React.FC = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { profile, level, isAdmin } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "community_messages"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)).reverse();
      setMessages(msgs);
      setLoading(false);
      // Auto scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }, (err) => {
      console.error("Chat error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser || isSending) return;

    setIsSending(true);
    const text = newMessage.trim();
    setNewMessage("");

    try {
      await addDoc(collection(db, "community_messages"), {
        text,
        senderId: auth.currentUser.uid,
        senderName: profile?.name || auth.currentUser.displayName || (isAr ? "مستخدم" : "User"),
        senderAvatar: profile?.avatar || null,
        senderLevel: level || 1,
        timestamp: serverTimestamp(),
        type: 'text'
      });
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
    return formatDistanceToNow(ts.toDate(), { 
      addSuffix: true, 
      locale: isAr ? ar : enUS 
    });
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col h-[600px] bg-card/20 backdrop-blur-sm rounded-[2.5rem] border border-border/40 overflow-hidden shadow-islamic">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/40 bg-card/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <MessageSquare size={18} />
          </div>
          <h3 className="font-serif font-bold text-primary">{isAr ? "المحادثة العامة" : "Community Chat"}</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {isAr ? "مباشر" : "LIVE"}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 text-center p-8">
            <Sparkles size={48} className="mb-4" />
            <p className="font-naskh">{isAr ? "ابدأ المحادثة بالسلام..." : "Start the conversation with Salam..."}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="shrink-0 pt-1">
                  {msg.senderAvatar ? (
                    <img src={msg.senderAvatar} className="w-8 h-8 rounded-xl object-cover border border-border/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-[10px] font-bold border border-border/40 uppercase">
                      {msg.senderName.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-primary/80">{msg.senderName}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">
                      {isAr ? `لـ ${toArabicNumber(msg.senderLevel || 1)}` : `Lvl ${msg.senderLevel || 1}`}
                    </span>
                  </div>
                  
                  <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm group ${
                    isMe ? "bg-primary text-white rounded-tr-none" : "bg-card border border-border/40 rounded-tl-none"
                  }`}>
                    <p className="font-naskh whitespace-pre-wrap break-words">{msg.text}</p>
                    
                    {(isMe || isAdmin) && (
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className={`absolute top-0 ${isMe ? "right-full mr-2" : "left-full ml-2"} p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  
                  <span className="text-[9px] text-muted-foreground mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage}
        className="p-4 border-t border-border/40 bg-card/40"
      >
        <div className="relative">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isAr ? "اكتب رسالتك هنا..." : "Type your message..."}
            className="w-full bg-muted/50 border border-border/60 rounded-2xl py-4 px-6 pr-14 text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            maxLength={500}
            dir="auto"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={isAr ? "rotate-180" : ""} />}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
          <ShieldAlert size={12} />
          {isAr ? "التزم بآداب المسلم وتجنب الإساءة." : "Adhere to Islamic etiquette and avoid abuse."}
        </p>
      </form>
    </div>
  );
};

export default CommunityChat;
