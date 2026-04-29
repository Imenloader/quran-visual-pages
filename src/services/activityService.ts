import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type ActivityType = 
  | 'USER_JOINED' 
  | 'KHATMA_CREATED' 
  | 'POST_CREATED' 
  | 'CIRCLE_CREATED' 
  | 'DHIKR_MILESTONE' 
  | 'QUEST_COMPLETED';

interface ActivityLog {
  userId: string;
  userName: string;
  action: string;
  type: ActivityType;
  metadata?: any;
  createdAt: any;
}

export const activityService = {
  log: async (type: ActivityType, action: string, metadata?: any) => {
    try {
      const user = auth.currentUser;
      const activity: ActivityLog = {
        userId: user?.uid || 'anonymous',
        userName: user?.displayName || 'مستخدم',
        action,
        type,
        metadata: metadata || {},
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, "admin_activities"), activity);
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }
};
