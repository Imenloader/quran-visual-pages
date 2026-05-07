import { db } from "@/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  contentId: string;
  contentType: 'post' | 'comment' | 'message';
  contentSnippet: string;
  reason: string;
  isAutoReport: boolean;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Timestamp;
}

export const reportService = {
  async submitReport(data: {
    reporterId: string;
    reporterName: string;
    reportedUserId: string;
    reportedUserName: string;
    contentId: string;
    contentType: 'post' | 'comment' | 'message';
    contentSnippet: string;
    reason: string;
    isAutoReport?: boolean;
  }) {
    const docRef = await addDoc(collection(db, 'community_reports'), {
      ...data,
      isAutoReport: data.isAutoReport || false,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  subscribeToReports(callback: (reports: ContentReport[]) => void) {
    const q = query(
      collection(db, 'community_reports'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ContentReport));
      callback(reports);
    });
  }
};
