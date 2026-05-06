import { db } from "@/firebase";
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
  | 'BADGE_EARNED' 
  | 'QUEST_COMPLETE' 
  | 'DHIKR_MILESTONE' 
  | 'DUEL_WON';

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

export const activityService = {
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

  subscribeToFriendActivities(friendIds: string[], gender: string, callback: (activities: Activity[]) => void) {
    if (friendIds.length === 0) {
      callback([]);
      return () => {};
    }

    // Filter by friends AND same gender (as per existing rules)
    const q = query(
      collection(db, "activities"),
      where("userId", "in", friendIds),
      where("gender", "==", gender),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      callback(activities);
    }, (error) => {
      console.warn("Activities sync error:", error);
      callback([]);
    });
  }
};
