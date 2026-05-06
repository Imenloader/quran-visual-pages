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
  updateDoc,
} from "firebase/firestore";
import type { FieldValue, Timestamp } from "firebase/firestore";

type FirestoreDate = Timestamp | FieldValue;

export interface Notification {
  id?: string;
  userId: string;
  fromId: string;
  fromName: string;
  type: "dua" | "duel_request" | "duel_accepted";
  payload?: Record<string, unknown>;
  read: boolean;
  timestamp: FirestoreDate;
}

export interface Duel {
  id?: string;
  initiatorId: string;
  initiatorName: string;
  targetId: string;
  targetName: string;
  type: "reading_pages" | "dhikr_count";
  goal: number;
  status: "pending" | "active" | "finished";
  initiatorProgress: number;
  targetProgress: number;
  winnerId?: string;
  gender: string;
  createdAt: FirestoreDate;
}

export type ReportCategory = "abuse" | "misinformation" | "privacy" | "spam" | "other";

export interface CommunityReport {
  id?: string;
  reporterId: string;
  reporterName: string;
  category: ReportCategory;
  details: string;
  source: "community_hub" | "activity_feed" | "circle" | "profile";
  status: "new" | "reviewing" | "resolved" | "dismissed";
  priority: "normal" | "high";
  locale: string;
  createdAt: FirestoreDate;
}

export const communityService = {
  async sendDua(fromId: string, fromName: string, targetId: string) {
    const notification: Omit<Notification, "id"> = {
      userId: targetId,
      fromId,
      fromName,
      type: "dua",
      read: false,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, "notifications"), notification);
  },

  async createDuel(
    initiatorId: string,
    initiatorName: string,
    targetId: string,
    targetName: string,
    type: "reading_pages" | "dhikr_count",
    goal: number,
    gender: string,
  ) {
    const duel: Omit<Duel, "id"> = {
      initiatorId,
      initiatorName,
      targetId,
      targetName,
      type,
      goal,
      status: "pending",
      initiatorProgress: 0,
      targetProgress: 0,
      gender,
      createdAt: serverTimestamp(),
    };
    const duelDoc = await addDoc(collection(db, "duels"), duel);

    // Also notify target
    await addDoc(collection(db, "notifications"), {
      userId: targetId,
      fromId: initiatorId,
      fromName: initiatorName,
      type: "duel_request",
      payload: { duelId: duelDoc.id },
      read: false,
      timestamp: serverTimestamp(),
    } satisfies Omit<Notification, "id">);
  },

  async acceptDuel(duelId: string, userId: string, userName: string, targetId: string) {
    await updateDoc(doc(db, "duels", duelId), {
      status: "active",
    });

    await addDoc(collection(db, "notifications"), {
      userId: targetId,
      fromId: userId,
      fromName: userName,
      type: "duel_accepted",
      read: false,
      timestamp: serverTimestamp(),
    } satisfies Omit<Notification, "id">);
  },

  async submitCommunityReport(report: Omit<CommunityReport, "id" | "status" | "priority" | "createdAt">) {
    await addDoc(collection(db, "community_reports"), {
      ...report,
      status: "new",
      priority: report.category === "privacy" || report.category === "misinformation" ? "high" : "normal",
      createdAt: serverTimestamp(),
    } satisfies Omit<CommunityReport, "id">);
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(20),
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[]);
    });
  },

  subscribeToCommunityReports(callback: (reports: CommunityReport[]) => void) {
    const q = query(
      collection(db, "community_reports"),
      orderBy("createdAt", "desc"),
      limit(20),
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as CommunityReport[]);
    });
  },

  async markNotificationRead(notifId: string) {
    await updateDoc(doc(db, "notifications", notifId), { read: true });
  },
};
