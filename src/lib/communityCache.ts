export interface CachedItem<T> {
  id: string;
  data: T;
  timestamp: number;
}

class CommunityCache {
  private dbName = "quraaniat_community";
  private version = 1;
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("circles")) {
          db.createObjectStore("circles", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("feed")) {
          db.createObjectStore("feed", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("posts")) {
          db.createObjectStore("posts", { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(storeName: "circles" | "feed" | "posts", id: string, data: T): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: "circles" | "feed" | "posts", id: string): Promise<T | null> {
    const db = await this.getDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const item = await new Promise<CachedItem<T> | null>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    return item ? item.data : null;
  }

  async getAll<T>(storeName: "circles" | "feed" | "posts"): Promise<T[]> {
    const db = await this.getDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const items = await new Promise<CachedItem<T>[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    return items.map(item => item.data);
  }

  async getLastSync(storeName: "circles" | "feed"): Promise<number> {
    const items = await this.getAll<any>(storeName);
    if (items.length === 0) return 0;
    // This is a simplified version. Ideally we track per collection.
    return Math.max(...items.map(i => i.updatedAt?.toMillis?.() || i.createdAt?.toMillis?.() || 0));
  }
}

export const communityCache = new CommunityCache();
