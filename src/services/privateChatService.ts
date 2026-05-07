import { db } from "@/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
  setDoc,
  getDoc
} from "firebase/firestore";
import { subDays } from "date-fns";

export interface PrivateChat {
  id: string;
  participants: string[];
  gender: 'male' | 'female';
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  updatedAt: Timestamp;
  unreadCount?: Record<string, number>;
}

export interface PrivateMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: Timestamp;
  imageUrl?: string;
  type?: 'text' | 'image';
}

export const privateChatService = {
  // Generate a consistent ID for 1-on-1 chats
  getChatId(uid1: string, uid2: string) {
    return [uid1, uid2].sort().join('_');
  },

  async startOrGetChat(currentUserUid: string, targetUserUid: string, gender: 'male' | 'female') {
    const chatId = this.getChatId(currentUserUid, targetUserUid);
    const chatRef = doc(db, 'private_chats', chatId);
    
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      await setDoc(chatRef, {
        participants: [currentUserUid, targetUserUid],
        gender,
        updatedAt: serverTimestamp(),
        unreadCount: {
          [currentUserUid]: 0,
          [targetUserUid]: 0
        }
      });
    }
    return chatId;
  },

  async sendMessage(chatId: string, senderId: string, text: string, imageUrl?: string) {
    // 1. Add message to subcollection
    const messagesRef = collection(db, 'private_chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text,
      senderId,
      timestamp: serverTimestamp(),
      ...(imageUrl ? { imageUrl, type: 'image' } : { type: 'text' })
    });

    // 2. Update parent chat doc
    const chatRef = doc(db, 'private_chats', chatId);
    await setDoc(chatRef, {
      lastMessage: imageUrl ? (text || "📷 صورة") : text,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Note: To truly increment unread counts properly without race conditions, 
    // a Cloud Function or FieldValue.increment() should be used, but merging is fine for now.
  },

  subscribeToChats(userId: string, callback: (chats: PrivateChat[]) => void) {
    const q = query(
      collection(db, 'private_chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      const chats = snap.docs.map(d => ({ id: d.id, ...d.data() } as PrivateChat));
      callback(chats);
    });
  },

  adminSubscribeToAllChats(callback: (chats: PrivateChat[]) => void) {
    const q = query(
      collection(db, 'private_chats'),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snap) => {
      const chats = snap.docs.map(d => ({ id: d.id, ...d.data() } as PrivateChat));
      callback(chats);
    });
  },

  subscribeToMessages(chatId: string, callback: (msgs: PrivateMessage[]) => void) {
    const sevenDaysAgo = subDays(new Date(), 7);
    
    const q = query(
      collection(db, 'private_chats', chatId, 'messages'),
      where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snap) => {
      // Reverse to get chronological order (oldest top, newest bottom)
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as PrivateMessage)).reverse();
      callback(msgs);
    });
  }
};
