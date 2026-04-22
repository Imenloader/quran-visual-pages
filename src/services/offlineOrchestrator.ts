import { getQuranPageFallbackImageUrl, getQuranPageImageUrl } from "@/data/quranData";

export type OfflineBundleId = "quran-pages" | "tafsir" | "audio";
export type OfflineTaskStatus = "pending" | "running" | "done" | "failed";
export type OfflineBundleState = "idle" | "running" | "paused" | "completed" | "error";

const OFFLINE_DB_NAME = "offline-orchestrator-db";
const OFFLINE_DB_VERSION = 1;
const OFFLINE_BUNDLES_STORE = "bundles";

const PAGES_CACHE_NAME = "quran-pages-cache";
const TOTAL_QURAN_PAGES = 604;

const BUNDLE_CONCURRENCY: Record<OfflineBundleId, number> = {
  "quran-pages": 3,
  tafsir: 5,
  audio: 2,
};

interface OfflineTask {
  id: string;
  pageNumber?: number;
  url?: string;
  fallbackUrl?: string;
  status: OfflineTaskStatus;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: number;
  lastError?: string;
  startedAt?: number;
  completedAt?: number;
}

interface OfflineBundleRecord {
  bundleId: OfflineBundleId;
  state: OfflineBundleState;
  total: number;
  completed: number;
  failed: number;
  updatedAt: number;
  tasks: OfflineTask[];
}

export interface OfflineBundleStatus {
  bundleId: OfflineBundleId;
  state: OfflineBundleState;
  total: number;
  completed: number;
  failed: number;
  progress: number;
  updatedAt: number;
}

export interface OfflineGlobalStatus {
  bundles: OfflineBundleStatus[];
  totalItems: number;
  completedItems: number;
  failedItems: number;
  progress: number;
}

export interface OfflineOrchestratorEvent {
  type: "bundle-updated" | "global-updated";
  bundleId?: OfflineBundleId;
  bundleStatus?: OfflineBundleStatus;
  globalStatus: OfflineGlobalStatus;
}

type OfflineEventListener = (event: OfflineOrchestratorEvent) => void;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class OfflineOrchestrator {
  private listeners = new Set<OfflineEventListener>();
  private records = new Map<OfflineBundleId, OfflineBundleRecord>();
  private runningBundles = new Map<OfflineBundleId, Promise<void>>();
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.hydrate();
  }

  subscribe(listener: OfflineEventListener) {
    this.listeners.add(listener);
    this.emit({ type: "global-updated", globalStatus: this.toGlobalStatus() });

    return () => {
      this.listeners.delete(listener);
    };
  }

  async prepareBundle(bundleId: OfflineBundleId): Promise<OfflineBundleStatus> {
    await this.readyPromise;

    let record = this.records.get(bundleId);
    if (!record) {
      record = this.createBundleRecord(bundleId);
      this.records.set(bundleId, record);
      await this.persistRecord(record);
    }

    if (record.state === "completed") {
      this.emitBundleUpdate(bundleId);
      return this.toBundleStatus(record);
    }

    record.state = "running";
    record.updatedAt = Date.now();
    await this.persistRecord(record);
    this.emitBundleUpdate(bundleId);

    this.startBundleProcessor(bundleId);

    return this.toBundleStatus(record);
  }

  async pauseBundle(bundleId: OfflineBundleId): Promise<OfflineBundleStatus> {
    await this.readyPromise;

    const record = this.requireBundle(bundleId);
    if (record.state === "running") {
      record.state = "paused";
      record.updatedAt = Date.now();

      for (const task of record.tasks) {
        if (task.status === "running") {
          task.status = "pending";
        }
      }

      await this.persistRecord(record);
      this.emitBundleUpdate(bundleId);
    }

    return this.toBundleStatus(record);
  }

  async resumeBundle(bundleId: OfflineBundleId): Promise<OfflineBundleStatus> {
    await this.readyPromise;

    const record = this.requireBundle(bundleId);
    if (record.state === "completed") {
      return this.toBundleStatus(record);
    }

    record.state = "running";
    record.updatedAt = Date.now();
    await this.persistRecord(record);
    this.emitBundleUpdate(bundleId);

    this.startBundleProcessor(bundleId);

    return this.toBundleStatus(record);
  }

  async clearBundle(bundleId: OfflineBundleId): Promise<void> {
    await this.readyPromise;

    this.runningBundles.delete(bundleId);

    if (bundleId === "quran-pages" && "caches" in window) {
      await caches.delete(PAGES_CACHE_NAME);
    }

    this.records.delete(bundleId);

    const db = await this.openDb();
    await this.withRequest(db.transaction(OFFLINE_BUNDLES_STORE, "readwrite").objectStore(OFFLINE_BUNDLES_STORE).delete(bundleId));

    this.emit({ type: "bundle-updated", bundleId, globalStatus: this.toGlobalStatus() });
  }

  async getBundleStatus(bundleId: OfflineBundleId): Promise<OfflineBundleStatus> {
    await this.readyPromise;

    const record = this.records.get(bundleId) ?? this.createBundleRecord(bundleId);
    if (!this.records.has(bundleId)) {
      this.records.set(bundleId, record);
      await this.persistRecord(record);
    }

    return this.toBundleStatus(record);
  }

  async getGlobalStatus(): Promise<OfflineGlobalStatus> {
    await this.readyPromise;
    return this.toGlobalStatus();
  }

  private async hydrate() {
    const db = await this.openDb();
    const tx = db.transaction(OFFLINE_BUNDLES_STORE, "readonly");
    const records = await this.withRequest<OfflineBundleRecord[]>(tx.objectStore(OFFLINE_BUNDLES_STORE).getAll());

    for (const record of records) {
      this.records.set(record.bundleId, record);
    }

    for (const bundleId of this.records.keys()) {
      const record = this.records.get(bundleId);
      if (!record) {
        continue;
      }

      if (record.state === "running") {
        record.state = "paused";
        record.updatedAt = Date.now();
        for (const task of record.tasks) {
          if (task.status === "running") {
            task.status = "pending";
          }
        }
        await this.persistRecord(record);
      }
    }
  }

  private requireBundle(bundleId: OfflineBundleId) {
    const record = this.records.get(bundleId);
    if (!record) {
      throw new Error(`Bundle ${bundleId} is not initialized. Call prepareBundle first.`);
    }

    return record;
  }

  private createBundleRecord(bundleId: OfflineBundleId): OfflineBundleRecord {
    if (bundleId === "quran-pages") {
      const tasks: OfflineTask[] = Array.from({ length: TOTAL_QURAN_PAGES }, (_, index) => {
        const pageNumber = index + 1;
        return {
          id: `page-${pageNumber}`,
          pageNumber,
          url: getQuranPageImageUrl(pageNumber, true),
          fallbackUrl: getQuranPageFallbackImageUrl(pageNumber, 0, true),
          status: "pending",
          attempts: 0,
          maxAttempts: 3,
        };
      });

      return {
        bundleId,
        state: "idle",
        total: tasks.length,
        completed: 0,
        failed: 0,
        updatedAt: Date.now(),
        tasks,
      };
    }

    return {
      bundleId,
      state: "idle",
      total: 0,
      completed: 0,
      failed: 0,
      updatedAt: Date.now(),
      tasks: [],
    };
  }

  private startBundleProcessor(bundleId: OfflineBundleId) {
    if (this.runningBundles.has(bundleId)) {
      return;
    }

    const runner = this.processBundle(bundleId)
      .catch((error) => {
        console.error("Offline bundle processing error:", error);
      })
      .finally(() => {
        this.runningBundles.delete(bundleId);
      });

    this.runningBundles.set(bundleId, runner);
  }

  private async processBundle(bundleId: OfflineBundleId) {
    const record = this.requireBundle(bundleId);
    const concurrency = BUNDLE_CONCURRENCY[bundleId] ?? 1;

    while (record.state === "running") {
      const now = Date.now();
      const runningCount = record.tasks.filter((task) => task.status === "running").length;

      const availableSlots = Math.max(0, concurrency - runningCount);
      if (availableSlots === 0) {
        await wait(60);
        continue;
      }

      const nextTasks = record.tasks.filter(
        (task) =>
          task.status === "pending" &&
          (typeof task.nextRetryAt !== "number" || task.nextRetryAt <= now),
      ).slice(0, availableSlots);

      if (nextTasks.length === 0) {
        const stillPending = record.tasks.some((task) => task.status === "pending");
        const hasRunning = record.tasks.some((task) => task.status === "running");

        if (!stillPending && !hasRunning) {
          record.state = record.failed > 0 ? "error" : "completed";
          record.updatedAt = Date.now();
          await this.persistRecord(record);
          this.emitBundleUpdate(bundleId);
          return;
        }

        await wait(120);
        continue;
      }

      await Promise.all(nextTasks.map((task) => this.runTask(record, task)));
    }
  }

  private async runTask(record: OfflineBundleRecord, task: OfflineTask) {
    if (record.state !== "running") {
      return;
    }

    task.status = "running";
    task.startedAt = Date.now();
    task.nextRetryAt = undefined;
    record.updatedAt = Date.now();
    await this.persistRecord(record);
    this.emitBundleUpdate(record.bundleId);

    let successful = false;
    let lastErrorMessage = "";

    for (let attempt = task.attempts + 1; attempt <= task.maxAttempts; attempt += 1) {
      task.attempts = attempt;
      record.updatedAt = Date.now();
      await this.persistRecord(record);

      try {
        await this.executeTask(record.bundleId, task);
        successful = true;
        break;
      } catch (error) {
        lastErrorMessage = error instanceof Error ? error.message : "Unknown error";
        task.lastError = lastErrorMessage;

        const quotaError = error instanceof Error && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
        if (quotaError || attempt >= task.maxAttempts) {
          break;
        }

        const backoffMs = 500 * attempt;
        task.nextRetryAt = Date.now() + backoffMs;
        record.updatedAt = Date.now();
        await this.persistRecord(record);
        await wait(backoffMs);
      }
    }

    if (successful) {
      task.status = "done";
      task.completedAt = Date.now();
      record.completed += 1;
    } else {
      task.status = "failed";
      task.completedAt = Date.now();
      task.lastError = lastErrorMessage;
      record.failed += 1;
    }

    record.updatedAt = Date.now();
    await this.persistRecord(record);
    this.emitBundleUpdate(record.bundleId);
  }

  private async executeTask(bundleId: OfflineBundleId, task: OfflineTask) {
    if (bundleId === "quran-pages") {
      if (!task.url) {
        throw new Error("Missing page URL");
      }

      if (!navigator.onLine) {
        throw new Error("Offline");
      }

      if (!("caches" in window)) {
        throw new Error("Cache API is not supported");
      }

      const cache = await caches.open(PAGES_CACHE_NAME);
      let response = await fetch(task.url);

      if (!response.ok && task.fallbackUrl) {
        response = await fetch(task.fallbackUrl);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await cache.put(task.url, response.clone());
      return;
    }

    return;
  }

  private toBundleStatus(record: OfflineBundleRecord): OfflineBundleStatus {
    return {
      bundleId: record.bundleId,
      state: record.state,
      total: record.total,
      completed: record.completed,
      failed: record.failed,
      progress: record.total === 0 ? 100 : Math.round((record.completed / record.total) * 100),
      updatedAt: record.updatedAt,
    };
  }

  private toGlobalStatus(): OfflineGlobalStatus {
    const bundleStatuses = Array.from(this.records.values()).map((record) => this.toBundleStatus(record));
    const totals = bundleStatuses.reduce(
      (acc, status) => {
        acc.totalItems += status.total;
        acc.completedItems += status.completed;
        acc.failedItems += status.failed;
        return acc;
      },
      { totalItems: 0, completedItems: 0, failedItems: 0 },
    );

    return {
      bundles: bundleStatuses,
      totalItems: totals.totalItems,
      completedItems: totals.completedItems,
      failedItems: totals.failedItems,
      progress: totals.totalItems === 0 ? 100 : Math.round((totals.completedItems / totals.totalItems) * 100),
    };
  }

  private emitBundleUpdate(bundleId: OfflineBundleId) {
    const record = this.records.get(bundleId);
    this.emit({
      type: "bundle-updated",
      bundleId,
      bundleStatus: record ? this.toBundleStatus(record) : undefined,
      globalStatus: this.toGlobalStatus(),
    });
  }

  private emit(event: OfflineOrchestratorEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  private async persistRecord(record: OfflineBundleRecord) {
    const db = await this.openDb();
    const tx = db.transaction(OFFLINE_BUNDLES_STORE, "readwrite");
    tx.objectStore(OFFLINE_BUNDLES_STORE).put(record);
    await this.withTransaction(tx);
  }

  private async openDb(): Promise<IDBDatabase> {
    return this.withRequest<IDBDatabase>(
      indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION),
      (db) => {
        if (!db.objectStoreNames.contains(OFFLINE_BUNDLES_STORE)) {
          db.createObjectStore(OFFLINE_BUNDLES_STORE, { keyPath: "bundleId" });
        }
      },
    );
  }

  private withTransaction(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    });
  }

  private withRequest<T>(request: IDBRequest<T>, onUpgradeNeeded?: (db: IDBDatabase) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      if ("onupgradeneeded" in request && typeof onUpgradeNeeded === "function") {
        (request as IDBOpenDBRequest).onupgradeneeded = () => {
          const db = (request as IDBOpenDBRequest).result;
          onUpgradeNeeded(db);
        };
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    });
  }
}

export const offlineOrchestrator = new OfflineOrchestrator();
