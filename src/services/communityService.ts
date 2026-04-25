import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy,
  Timestamp,
  type DocumentData
} from "firebase/firestore";
import { db } from "@/firebase";
import { communityCache } from "@/lib/communityCache";

export const communityService = {
  /**
   * Fetches the user's reading circles with cache-first logic.
   */
  async getMyCircles(userId: string): Promise<any[]> {
    // 1. Try Cache first
    const cached = await communityCache.getAll<any>("circles");
    
    // 2. Fetch new updates in background (or if cache empty)
    try {
      const q = query(
        collection(db, "reading_circles"),
        where(`members.${userId}.uid`, "==", userId),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const circles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // 3. Update Cache
      for (const circle of circles) {
        await communityCache.set("circles", circle.id, circle);
      }
      
      return circles;
    } catch (err) {
      console.error("Failed to fetch circles from Firestore:", err);
      return cached; // Fallback to cache
    }
  },

  /**
   * Syncs a single circle detail to cache.
   */
  async syncCircle(circleId: string, data: any) {
    await communityCache.set("circles", circleId, data);
  }
};
