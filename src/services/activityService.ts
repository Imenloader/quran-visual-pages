import { auth, db } from "@/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";

export type ActivityType = 
  | 'JUZ_COMPLETE' 
  | 'KHATMA_COMPLETE' 
  | 'KHATMA_CREATED'
  | 'BADGE_EARNED' 
  | 'QUEST_COMPLETE' 
  | 'QUEST_COMPLETED'
  | 'DHIKR_MILESTONE' 
  | 'DUEL_WON'
  | 'USER_JOINED'
  | 'POST_CREATED'
  | 'CIRCLE_CREATED';

export interface Activity {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: ActivityType;
  payload: any;
  timestamp: any;
  gender: 'male' | 'female' | 'unspecified';
}

export interface ActivityService {
  logActivity(userId: string, type: ActivityType, payload?: any): Promise<void>;
  log(type: ActivityType, payload?: any): Promise<void>;
  subscribeToFriendActivities(friendIds: string[], gender: string, callback: (activities: Activity[]) => void): () => void;
}

export const activityService: ActivityService = {
  async logActivity(userId: string, type: ActivityType, payload: any = {}) {
    try {
      // Get user info for the activity
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) return;
      
      const userData = userDoc.data();
      
      const activityData: Omit<Activity, 'id'> = {
        userId,
        userName: userData.name || 'مستخدم',
        userAvatar: userData.avatar,
        type,
        payload,
        gender: userData.gender || 'unspecified',
        timestamp: serverTimestamp(),
      };
      
      await addDoc(collection(db, "activities"), activityData);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  },

  /**
   * Alias for logActivity to support legacy calls
   */
  async log(type: ActivityType, payload: any = {}) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    return this.logActivity(userId, type, payload);
  },

  subscribeToFriendActivities(friendIds: string[], gender: string, callback: (activities: Activity[]) => void) {
    if (friendIds.length === 0) {
      callback([]);
      return () => {};
    }

    // Split friendIds into chunks of 10 (Firebase 'in' query limit)
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < friendIds.length; i += chunkSize) {
      chunks.push(friendIds.slice(i, i + chunkSize));
    }

    const unsubs: (() => void)[] = [];
    const activitiesMap = new Map<string, Activity[]>();

    chunks.forEach((chunk, index) => {
      const q = query(
        collection(db, "activities"),
        where("userId", "in", chunk),
        where("gender", "==", gender),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const chunkActivities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[];

        activitiesMap.set(`chunk_${index}`, chunkActivities);

        // Combine all chunks and sort by timestamp
        const allActivities = Array.from(activitiesMap.values()).flat();
        allActivities.sort((a, b) => {
          const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
          const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
          return timeB - timeA;
        });

        callback(allActivities.slice(0, 50));
      }, (error) => {
        console.warn(`Activities sync error for chunk ${index}:`, error);
      });

      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }
};
