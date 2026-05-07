import { db } from "@/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  getDocs
} from "firebase/firestore";

export interface CommunityInvitation {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  type: 'reading_circle' | 'prayer_circle' | 'knowledge_session';
  targetId: string; // The ID of the circle/session
  targetTitle: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
}

export const invitationService = {
  async sendInvitation(invitation: Omit<CommunityInvitation, 'id' | 'status' | 'createdAt'>) {
    // Check if invitation already exists
    const q = query(
      collection(db, "community_invitations"),
      where("receiverId", "==", invitation.receiverId),
      where("targetId", "==", invitation.targetId),
      where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    if (!snap.empty) return;

    await addDoc(collection(db, "community_invitations"), {
      ...invitation,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  subscribeToInvitations(userId: string, callback: (invites: CommunityInvitation[]) => void) {
    const q = query(
      collection(db, "community_invitations"),
      where("receiverId", "==", userId),
      where("status", "==", "pending")
    );

    return onSnapshot(q, (snap) => {
      const invites = snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityInvitation));
      callback(invites);
    });
  },

  async respondToInvitation(invitationId: string, status: 'accepted' | 'declined') {
    await updateDoc(doc(db, "community_invitations", invitationId), {
      status,
      respondedAt: serverTimestamp()
    });
  }
};
