import { db, auth } from "@/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
} from "firebase/firestore";

/**
 * SyncService handles bidirectional synchronization of user tool data
 * between LocalStorage and Firestore, using a "Last Modified Wins" strategy.
 */
export const syncService = {
  /**
   * Saves a simple object or value to both LocalStorage and Firestore.
   * Always writes a `_syncedAt` timestamp so that `loadData` can resolve conflicts.
   */
  async saveData<T>(key: string, data: T) {
    const payload = { data, _syncedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(payload));

    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid, "data", key);
      await setDoc(userRef, {
        payload: data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  },

  /**
   * Loads data using "Last Modified Wins":
   * - If authenticated, compares the Firestore `updatedAt` vs. local `_syncedAt`.
   * - Returns whichever is newer to prevent overwriting fresh offline changes with stale cloud data.
   * - Falls back to local storage if Firestore is unavailable or user is offline.
   */
  async loadData<T>(key: string, defaultValue: T): Promise<T> {
    // Parse local data — may be wrapped with a `_syncedAt` timestamp or raw
    let localData: T = defaultValue;
    let localSyncedAt: string | null = null;

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && '_syncedAt' in parsed) {
          // New wrapped format
          localData = parsed.data as T;
          localSyncedAt = parsed._syncedAt as string;
        } else {
          // Legacy raw format (no timestamp)
          localData = parsed as T;
        }
      }
    } catch {
      localData = defaultValue;
    }

    if (auth.currentUser) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid, "data", key);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const firestoreData = snap.data().payload as T;
          const firestoreUpdatedAt: string = snap.data().updatedAt || "";

          // If Firestore data is newer than our local data (or we have no local timestamp), use Firestore
          const useFirestore = !localSyncedAt || firestoreUpdatedAt > localSyncedAt;
          if (useFirestore) {
            // Update local cache with the fresher cloud version
            const wrappedPayload = { data: firestoreData, _syncedAt: firestoreUpdatedAt };
            localStorage.setItem(key, JSON.stringify(wrappedPayload));
            return firestoreData;
          }
        }
      } catch (e) {
        console.error(`SyncService: Error loading ${key}`, e);
      }
    }

    return localData;
  },

  /**
   * Saves an item to a collection (e.g., sadaqah-entries).
   */
  async saveCollectionItem<T extends { id: string }>(collectionKey: string, item: T) {
    // Update local
    const raw = localStorage.getItem(collectionKey);
    const items: T[] = raw ? JSON.parse(raw) : [];
    const index = items.findIndex((i) => i.id === item.id);

    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(collectionKey, JSON.stringify(items));

    // Update cloud
    if (auth.currentUser) {
      const itemRef = doc(db, "users", auth.currentUser.uid, collectionKey, item.id);
      await setDoc(itemRef, {
        ...item,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  },

  /**
   * Loads a full collection from Firestore (preferred) or local storage (fallback).
   */
  async loadCollection<T>(collectionKey: string): Promise<T[]> {
    const raw = localStorage.getItem(collectionKey);
    let result: T[] = raw ? JSON.parse(raw) : [];

    if (auth.currentUser) {
      try {
        const colRef = collection(db, "users", auth.currentUser.uid, collectionKey);
        const q = query(colRef);
        const snap = await getDocs(q);
        if (!snap.empty) {
          result = snap.docs.map(d => ({ ...d.data() } as T));
          localStorage.setItem(collectionKey, JSON.stringify(result));
        }
      } catch (e) {
        console.error(`SyncService: Error loading collection ${collectionKey}`, e);
      }
    }
    return result;
  },

  /**
   * Deletes an item from a collection (both local and cloud).
   */
  async deleteCollectionItem(collectionKey: string, itemId: string) {
    const raw = localStorage.getItem(collectionKey);
    if (raw) {
      const items = JSON.parse(raw);
      const filtered = items.filter((i: { id: string }) => i.id !== itemId);
      localStorage.setItem(collectionKey, JSON.stringify(filtered));
    }

    if (auth.currentUser) {
      const itemRef = doc(db, "users", auth.currentUser.uid, collectionKey, itemId);
      await deleteDoc(itemRef);
    }
  }
};
