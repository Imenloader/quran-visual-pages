import { db } from "@/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  where
} from "firebase/firestore";

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userRole?: string;
  text: string;
  timestamp: Timestamp;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole?: string;
  text: string;
  imageUrl?: string | null;
  gender: 'male' | 'female';
  likes: string[]; // Array of user IDs who liked it
  commentsCount: number;
  createdAt: Timestamp;
}

export const postService = {
  subscribeToPosts(gender: 'male' | 'female', callback: (posts: CommunityPost[]) => void) {
    const q = query(
      collection(db, 'community_posts'),
      where('gender', '==', gender),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost));
      callback(posts);
    });
  },

  async createPost(postData: {
    authorId: string;
    authorName: string;
    authorAvatar: string | null;
    authorRole?: string;
    text: string;
    imageUrl?: string | null;
    gender: 'male' | 'female';
  }) {
    const docRef = await addDoc(collection(db, 'community_posts'), {
      ...postData,
      likes: [],
      commentsCount: 0,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async deletePost(postId: string) {
    await deleteDoc(doc(db, 'community_posts', postId));
  },

  async toggleLike(postId: string, userId: string, isCurrentlyLiked: boolean) {
    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        likes: isCurrentlyLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error: any) {
      if (error?.code === 'not-found') {
        console.warn('Post not found (may have been deleted).');
      } else {
        throw error;
      }
    }
  },

  subscribeToComments(postId: string, callback: (comments: PostComment[]) => void) {
    const q = query(
      collection(db, 'community_posts', postId, 'comments'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PostComment));
      callback(comments);
    });
  },

  async addComment(postId: string, commentData: {
    userId: string;
    userName: string;
    userAvatar: string | null;
    userRole?: string;
    text: string;
  }) {
    try {
      // 1. Add comment to subcollection
      const commentsRef = collection(db, 'community_posts', postId, 'comments');
      await addDoc(commentsRef, {
        ...commentData,
        timestamp: serverTimestamp()
      });

      // 2. Increment comment count
      const postRef = doc(db, 'community_posts', postId);
      const snap = await getDoc(postRef);
      if (snap.exists()) {
        const currentCount = snap.data().commentsCount || 0;
        await updateDoc(postRef, {
          commentsCount: currentCount + 1
        });
      }
    } catch (error: any) {
      if (error?.code === 'not-found') {
        console.warn('Post not found (may have been deleted).');
      } else {
        throw error;
      }
    }
  }
};
