import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { postService, CommunityPost, PostComment } from '@/services/postService';
import { auth, storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Loader2, 
  Trash2, 
  MoreVertical,
  X,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { profanityFilter } from '@/lib/profanityFilter';
import { reportService } from '@/services/reportService';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const CommunityPosts = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { profile, isAdmin } = useUser();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(profile?.gender === 'female' ? 'female' : 'male');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post State
  const [newPostText, setNewPostText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = postService.subscribeToPosts(selectedGender, (data) => {
      setPosts(data);
      setLoading(false);
    });
    return () => unsub();
  }, [selectedGender]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newPostText.trim() && !imageFile) || !profile?.uid || isSubmitting) return;

    if (!isAdmin && profile.gender !== selectedGender) {
      toast.error(isAr ? "يمكنك النشر فقط في قسم جنسك" : "You can only post in your gender section");
      return;
    }

    setIsSubmitting(true);
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
        const storageRef = ref(storage, `community_posts/${uniqueName}`);
        const snapshot = await uploadBytes(storageRef, compressedFile);
        uploadedImageUrl = await getDownloadURL(snapshot.ref);
      }

      const { maskedText, hasProfanity } = profanityFilter.filter(newPostText.trim());

      const postId = await postService.createPost({
        authorId: profile.uid,
        authorName: profile.name || (isAr ? "مستخدم" : "User"),
        authorAvatar: profile.avatar || null,
        authorRole: profile.role || 'user',
        text: maskedText,
        imageUrl: uploadedImageUrl,
        gender: selectedGender
      });

      if (hasProfanity) {
        await reportService.submitReport({
          reporterId: 'system',
          reporterName: 'System Filter',
          reportedUserId: profile.uid,
          reportedUserName: profile.name || "User",
          contentId: postId,
          contentType: 'post',
          contentSnippet: newPostText.trim(),
          reason: 'Profanity detected by system filter',
          isAutoReport: true
        });
      }

      setNewPostText("");
      removeImage();
      toast.success(isAr ? "تم نشر المنشور بنجاح" : "Post created successfully");
    } catch (err) {
      console.error(err);
      toast.error(isAr ? "حدث خطأ أثناء النشر" : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Admin Gender Toggle */}
      {isAdmin && (
        <div className="flex bg-muted p-1 rounded-2xl w-max mx-auto shadow-inner border border-border/20">
          <button
            onClick={() => setSelectedGender('male')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedGender === 'male'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-primary hover:bg-muted-foreground/10'
            }`}
          >
            {isAr ? 'قسم الرجال' : "Men's Section"}
          </button>
          <button
            onClick={() => setSelectedGender('female')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedGender === 'female'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-primary hover:bg-muted-foreground/10'
            }`}
          >
            {isAr ? 'قسم النساء' : "Women's Section"}
          </button>
        </div>
      )}

      {/* Create Post Area */}
      <div className="glass-card p-4 rounded-3xl shadow-sm">
        <form onSubmit={handleCreatePost}>
          <div className="flex gap-4">
            <img 
              src={profile?.avatar || "/avatar-man-1.svg"} 
              className="w-10 h-10 rounded-full bg-muted object-cover border border-border/20 shrink-0" 
              alt="Avatar"
            />
            <div className="flex-1 space-y-3">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={isAr ? "بم تفكر؟ شارك فائدة مع إخوتك..." : "Share a thought or benefit..."}
                className="w-full bg-transparent border-none resize-none focus:ring-0 text-foreground placeholder:text-muted-foreground font-naskh text-lg min-h-[60px]"
                dir="auto"
              />
              
              {imagePreviewUrl && (
                <div className="relative inline-block">
                  <img src={imagePreviewUrl} alt="Preview" className="max-h-48 rounded-xl border border-border/40" />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/20 pt-3">
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
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary/5 text-primary transition-colors text-sm font-bold"
                >
                  <ImageIcon size={18} />
                  {isAr ? "صورة" : "Image"}
                </button>

                <button
                  type="submit"
                  disabled={(!newPostText.trim() && !imageFile) || isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isAr ? "نشر" : "Post"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6 pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-serif text-lg">{isAr ? "لا توجد منشورات بعد" : "No posts yet"}</p>
            <p className="text-sm">{isAr ? "كن أول من يشارك فائدة" : "Be the first to share something beneficial"}</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post }: { post: CommunityPost }) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { profile, isAdmin } = useUser();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isLikedByMe = post.likes.includes(profile?.uid || "");
  const timeAgo = formatDistanceToNow(post.createdAt?.toDate ? post.createdAt.toDate() : new Date(), { 
    addSuffix: true, 
    locale: isAr ? ar : enUS 
  });

  const handleLike = async () => {
    if (!profile?.uid || isLiking) return;
    setIsLiking(true);
    try {
      await postService.toggleLike(post.id, profile.uid, isLikedByMe);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !profile?.uid || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const { maskedText, hasProfanity } = profanityFilter.filter(newComment.trim());

      const commentData = {
        userId: profile.uid,
        userName: profile.name || "User",
        userAvatar: profile.avatar || null,
        userRole: profile.role || 'user',
        text: maskedText
      };

      await postService.addComment(post.id, commentData);

      if (hasProfanity) {
        await reportService.submitReport({
          reporterId: 'system',
          reporterName: 'System Filter',
          reportedUserId: profile.uid,
          reportedUserName: profile.name || "User",
          contentId: post.id,
          contentType: 'comment',
          contentSnippet: newComment.trim(),
          reason: 'Profanity detected in comment',
          isAutoReport: true
        });
      }

      setNewComment("");
      if (!showComments) loadComments();
    } catch (err) {
      console.error(err);
      toast.error(isAr ? "فشل إضافة التعليق" : "Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const loadComments = () => {
    setShowComments(true);
    return postService.subscribeToComments(post.id, (data) => {
      setComments(data);
    });
  };

  const handleDelete = async () => {
    if (!window.confirm(isAr ? "هل أنت متأكد من حذف هذا المنشور؟" : "Are you sure you want to delete this post?")) return;
    try {
      await postService.deletePost(post.id);
      toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
    } catch (err) {
      toast.error(isAr ? "فشل الحذف" : "Failed to delete");
    }
  };

  return (
    <div className="glass-card p-5 rounded-3xl shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link to={`/profile/${post.authorId}`} className="flex items-center gap-3 group">
          <img 
            src={post.authorAvatar || "/avatar-man-1.svg"} 
            className="w-12 h-12 rounded-2xl object-cover bg-muted border border-border/20 group-hover:border-primary/50 transition-colors"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{post.authorName}</h4>
              {post.authorRole === 'admin' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-gold text-white font-bold flex items-center gap-1 shadow-sm">
                  <ShieldCheck size={10} />
                  {isAr ? 'المشرف' : 'Admin'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={async () => {
              if (!profile?.uid) return;
              try {
                await reportService.submitReport({
                  reporterId: profile.uid,
                  reporterName: profile.name || 'User',
                  reportedUserId: post.authorId,
                  reportedUserName: post.authorName,
                  contentId: post.id,
                  contentType: 'post',
                  contentSnippet: post.text || 'Image only post',
                  reason: 'User manually reported this post'
                });
                toast.success(isAr ? "تم الإبلاغ بنجاح وسيتم مراجعته" : "Reported successfully for review");
              } catch (e) {
                toast.error(isAr ? "فشل إرسال البلاغ" : "Failed to send report");
              }
            }}
            className="p-2 text-muted-foreground hover:text-rose-500 transition-colors rounded-full hover:bg-rose-500/10"
            title={isAr ? "إبلاغ" : "Report"}
          >
            <Flag size={16} />
          </button>

          {(isAdmin || profile?.uid === post.authorId) && (
            <button 
              onClick={handleDelete}
              className="p-2 text-muted-foreground hover:text-rose-500 transition-colors rounded-full hover:bg-rose-500/10"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {post.text && (
          <p className="text-foreground/90 font-naskh text-lg leading-relaxed whitespace-pre-wrap" dir="auto">
            {post.text}
          </p>
        )}
        {post.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-border/20">
            <img src={post.imageUrl} alt="Post Attachment" className="w-full max-h-[500px] object-cover" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-4 py-3 border-t border-b border-border/20 text-muted-foreground text-sm font-bold">
        <div className="flex items-center gap-1.5">
          <Heart size={16} className={isLikedByMe ? "text-rose-500 fill-rose-500" : ""} />
          <span>{post.likes.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={16} />
          <span>{post.commentsCount}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        <button 
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all font-bold text-sm ${
            isLikedByMe ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Heart size={20} className={isLikedByMe ? "fill-rose-500" : ""} />
          {isAr ? "إعجاب" : "Like"}
        </button>
        <button 
          onClick={() => !showComments ? loadComments() : setShowComments(false)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-all font-bold text-sm"
        >
          <MessageSquare size={20} />
          {isAr ? "تعليق" : "Comment"}
        </button>
      </div>

      {/* Comments Area */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border/20 space-y-4">
          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex gap-3">
            <img src={profile?.avatar || "/avatar-man-1.svg"} className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-2xl px-3 py-1 border border-border/40 focus-within:border-primary/50 transition-colors">
              <input 
                type="text" 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={isAr ? "أضف تعليقاً..." : "Add a comment..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                dir="auto"
              />
              <button 
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="p-1.5 text-primary disabled:opacity-50 hover:bg-primary/10 rounded-full transition-colors"
              >
                {isSubmittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className={isAr ? "rotate-180" : ""} />}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3 group">
                <Link to={`/profile/${comment.userId}`} className="shrink-0">
                  <img src={comment.userAvatar || "/avatar-man-1.svg"} className="w-8 h-8 rounded-full object-cover" />
                </Link>
                <div className="flex-1 bg-muted/30 p-3 rounded-2xl rounded-tl-sm text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${comment.userId}`} className="font-bold text-foreground hover:text-primary">
                        {comment.userName}
                      </Link>
                      {comment.userRole === 'admin' && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-gold text-white font-bold flex items-center gap-1 shadow-sm">
                          <ShieldCheck size={8} />
                          {isAr ? 'المشرف' : 'Admin'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(comment.timestamp?.toDate ? comment.timestamp.toDate() : new Date(), { addSuffix: true, locale: isAr ? ar : enUS })}
                    </span>
                  </div>
                  <p className="text-foreground/90 whitespace-pre-wrap break-words" dir="auto">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPosts;
