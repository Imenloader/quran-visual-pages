import { db, auth } from "@/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";

/**
 * SyncService handles bidirectional synchronization of user tool data
 * between LocalStorage and Firestore.
 */
export const syncService = {
  /**
   * Saves a simple object or value to both LocalStorage and Firestore.
   */
  async saveData<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
    
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid, "data", key);
      await setDoc(userRef, { 
        payload: data, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    }
  },

  /**
   * Loads data, prioritizing Firestore if authenticated, falling back to LocalStorage.
   */
  async loadData<T>(key: string, defaultValue: T): Promise<T> {
    const local = localStorage.getItem(key);
    let result = local ? JSON.parse(local) : defaultValue;

    if (auth.currentUser) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid, "data", key);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          result = snap.data().payload;
          localStorage.setItem(key, JSON.stringify(result));
        }
      } catch (e) {
        console.error(`SyncService: Error loading ${key}`, e);
      }
    }
    return result;
  },

  /**
   * Saves an item to a collection (e.g., sadaqah-entries).
   */
  async saveCollectionItem<T extends { id: string }>(collectionKey: string, item: T) {
    // Update Local
    const local = localStorage.getItem(collectionKey);
    const items = local ? JSON.parse(local) : [];
    const index = items.findIndex((i: any) => i.id === item.id);
    
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(collectionKey, JSON.stringify(items));

    // Update Cloud
    if (auth.currentUser) {
      const itemRef = doc(db, "users", auth.currentUser.uid, collectionKey, item.id);
      await setDoc(itemRef, { 
        ...item, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    }
  },

  /**
   * Loads a full collection from Firestore.
   */
  async loadCollection<T>(collectionKey: string): Promise<T[]> {
    const local = localStorage.getItem(collectionKey);
    let result: T[] = local ? JSON.parse(local) : [];

    if (auth.currentUser) {
      try {
        const colRef = collection(db, "users", auth.currentUser.uid, collectionKey);
        // We order by updatedAt if it exists, otherwise we'll just take what we get
        const q = query(colRef); 
        const snap = await getDocs(q);
        if (!snap.empty) {
          result = snap.docs.map(d => ({ ...d.data() } as T));
          // Update local cache
          localStorage.setItem(collectionKey, JSON.stringify(result));
        }
      } catch (e) {
        console.error(`SyncService: Error loading collection ${collectionKey}`, e);
      }
    }
    return result;
  },

  /**
   * Deletes an item from a collection.
   */
  async deleteCollectionItem(collectionKey: string, itemId: string) {
    // Update Local
    const local = localStorage.getItem(collectionKey);
    if (local) {
      const items = JSON.parse(local);
      const filtered = items.filter((i: any) => i.id !== itemId);
      localStorage.setItem(collectionKey, JSON.stringify(filtered));
    }

    // Update Cloud
    if (auth.currentUser) {
      const itemRef = doc(db, "users", auth.currentUser.uid, collectionKey, itemId);
      await deleteDoc(itemRef);
    }
  }
};
