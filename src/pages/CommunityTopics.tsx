import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Clock, 
  Filter, 
  Plus, 
  X, 
  Loader2,
  TrendingUp,
  Hash,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp, 
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useUser } from "@/contexts/UserContext";
import { communityCache } from "@/lib/communityCache";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import AuthModal from "@/components/AuthModal";
import { activityService } from "@/services/activityService";


interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  category: string;
  likes: string[]; // Array of UIDs
  createdAt: Timestamp;
}

const CATEGORIES = [
  { id: "reflection", labelAr: "تدبر", labelEn: "Reflection", color: "bg-blue-500" },
  { id: "quran", labelAr: "القرآن", labelEn: "Quran", color: "bg-emerald-500" },
  { id: "hadith", labelAr: "الحديث", labelEn: "Hadith", color: "bg-amber-500" },
  { id: "qa", labelAr: "سؤال وجواب", labelEn: "Q&A", color: "bg-purple-500" }
];

const CommunityTopics = () => {
  const { t, i18n } = useTranslation();
  const { profile } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("reflection");
  const [filter, setFilter] = useState("all");

  const isAr = i18n.language === "ar";
  const user = auth.currentUser;

  // 1. Initial Load from Cache
  useEffect(() => {
    const loadCache = async () => {
      const cached = await communityCache.getAll<Post>("posts");
      if (cached.length > 0) {
        setPosts(cached.sort((a, b) => {
          const timeA = (a.createdAt as any)?.toMillis?.() || (a.createdAt as any)?.seconds * 1000 || 0;
          const timeB = (b.createdAt as any)?.toMillis?.() || (b.createdAt as any)?.seconds * 1000 || 0;
          return timeB - timeA;
        }));
      }
    };
    loadCache();
  }, []);

  // 2. Real-time Subscription with Ephemeral Logic (7 Days TTL)
  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const q = query(
      collection(db, "community_posts"),
      where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo)),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(fetchedPosts);
      
      // Update Cache
      fetchedPosts.forEach(post => communityCache.set("posts", post.id, post));
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!newPostContent.trim()) return;

    try {
      // Ephemeral Cleanup: Delete user's own old posts locally/silently
      const oldPostsQuery = query(
        collection(db, "community_posts"),
        where("authorId", "==", user.uid),
        where("createdAt", "<", Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      );
      const oldSnap = await getDocs(oldPostsQuery);
      oldSnap.forEach(oldDoc => deleteDoc(doc(db, "community_posts", oldDoc.id)));

      await addDoc(collection(db, "community_posts"), {
        authorId: user.uid,
        authorName: profile?.name || user.displayName || (isAr ? "مستخدم" : "User"),
        authorAvatar: profile?.avatar || null,
        content: newPostContent,
        category: selectedCategory,
        likes: [],
        createdAt: serverTimestamp()
      });

      activityService.log('POST_CREATED', `نشر موضوعاً جديداً في قسم ${CATEGORIES.find(c => c.id === selectedCategory)?.labelAr || 'عام'}`);
      
      setNewPostContent("");
      setShowCreateModal(false);
      toast.success(isAr ? "تم نشر الموضوع بنجاح" : "Topic posted successfully");
    } catch (e) {
      toast.error(isAr ? "حدث خطأ أثناء النشر" : "Failed to post");
    }
  };

  const toggleLike = async (post: Post) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const postRef = doc(db, "community_posts", post.id);
    const hasLiked = post.likes.includes(user.uid);

    try {
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (e) {
      console.error("Like error:", e);
    }
  };

  const filteredPosts = posts.filter(p => filter === "all" || p.category === filter);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <BackButton />
          <div className="text-center">
            <h1 className="text-xl font-bold font-naskh text-foreground flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              {isAr ? "مواضيع المجتمع" : "Community Topics"}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{isAr ? "نقاشات إيمانية" : "Faith Discussions"}</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        </header>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setFilter("all")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold font-naskh whitespace-nowrap transition-all ${filter === "all" ? "bg-primary text-white shadow-lg" : "glass-card hover:-translate-y-1 text-muted-foreground"}`}
          >
            {isAr ? "الكل" : "All"}
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold font-naskh whitespace-nowrap transition-all ${filter === cat.id ? "bg-primary text-white shadow-lg" : "glass-card hover:-translate-y-1 text-muted-foreground"}`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Notice: Ephemeral Feature */}
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 font-naskh leading-relaxed">
            {isAr 
              ? "ملاحظة: هذا المجتمع يتميز بخاصية 'المسح التلقائي'. المواضيع تُحذف تلقائياً بعد 7 أيام للحفاظ على جودة النقاشات وسرعة التطبيق."
              : "Note: This community features 'Auto-Clear'. Topics are automatically deleted after 7 days to maintain quality and app speed."}
          </p>
        </div>

        {loading && posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="animate-spin" />
            <p className="text-xs font-naskh">{isAr ? "جاري تحميل النقاشات..." : "Loading discussions..."}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <MessageSquare size={48} className="mx-auto text-muted/20" />
            <p className="text-sm text-muted-foreground font-naskh">{isAr ? "لا توجد مواضيع حالياً، كن أول من ينشر!" : "No topics yet, be the first to post!"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div 
                key={post.id} 
                className="glass-card hover:-translate-y-1/40 rounded-[2rem] p-6 shadow-sm space-y-4 hover:shadow-md transition-all border-l-4 border-l-primary"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full rounded-full object-cover" /> : <Hash size={20} />}
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-bold font-naskh text-foreground">{post.authorName}</h4>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        <Clock size={10} />
                        {post.createdAt?.toDate?.().toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                        <span className={`px-2 py-0.5 rounded-full text-white ${CATEGORIES.find(c => c.id === post.category)?.color || "bg-muted"}`}>
                          {isAr 
                            ? CATEGORIES.find(c => c.id === post.category)?.labelAr || "عام"
                            : CATEGORIES.find(c => c.id === post.category)?.labelEn || "General"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user?.uid === post.authorId && (
                    <button onClick={() => deleteDoc(doc(db, "community_posts", post.id))} className="text-muted-foreground hover:text-destructive p-2 active:scale-90 transition-transform">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className="text-sm font-naskh text-foreground leading-relaxed whitespace-pre-wrap text-right">
                  {post.content}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-border/40">
                  <button 
                    onClick={() => toggleLike(post)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 ${post.likes.includes(user?.uid || "") ? "bg-rose-500/10 text-rose-500" : "hover:bg-muted text-muted-foreground"}`}
                  >
                    <Heart size={18} fill={post.likes.includes(user?.uid || "") ? "currentColor" : "none"} />
                    <span className="text-xs font-bold">{post.likes.length}</span>
                  </button>
                  
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-naskh">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    {isAr ? "محتوى آمن" : "Safe Content"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
           <div className="relative glass-card hover:-translate-y-1 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl space-y-6 transition-all scale-100 opacity-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-xl font-bold font-naskh text-primary">{isAr ? "نشر موضوع جديد" : "New Discussion"}</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-muted"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">{isAr ? "القسم" : "Category"}</label>
                   <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <button 
                          key={cat.id} 
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`p-3 rounded-2xl text-xs font-bold font-naskh border transition-all ${selectedCategory === cat.id ? "bg-primary/10 border-primary text-primary" : "bg-muted/30 border-border text-muted-foreground"}`}
                        >
                          {isAr ? cat.labelAr : cat.labelEn}
                        </button>
                      ))}
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">{isAr ? "محتوى الموضوع" : "Topic Content"}</label>
                   <textarea 
                      value={newPostContent} 
                      onChange={e => setNewPostContent(e.target.value)} 
                      rows={5}
                      placeholder={isAr ? "اكتب تأملاتك أو أسئلتك هنا..." : "Write your reflections or questions here..."} 
                      className="w-full p-6 bg-muted/50 border border-border rounded-[1.5rem] focus:ring-2 ring-primary/20 outline-none font-naskh text-sm resize-none" 
                   />
                 </div>
              </div>

              <button onClick={handleCreatePost} className="w-full py-5 bg-primary text-white rounded-2xl font-bold font-naskh shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
                <Send size={20} />
                {isAr ? "نشر الموضوع" : "Post Topic"}
              </button>
           </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default CommunityTopics;
