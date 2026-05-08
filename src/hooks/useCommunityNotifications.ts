import { useEffect } from 'react';
import { db, auth } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';

export const useCommunityNotifications = () => {
  useEffect(() => {
    if (!auth.currentUser) return;

    const currentUid = auth.currentUser.uid;
    const now = Timestamp.now();

    // Listen for new notifications in the last 5 minutes to avoid stale nudges on load
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUid),
      where('createdAt', '>=', new Timestamp(now.seconds - 300, 0)),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Avoid triggering on initial load of historical data if createdAt is too old
          const createdAt = data.createdAt as Timestamp;
          if (createdAt && (Date.now() - createdAt.toMillis() < 30000)) { // Within 30 seconds
            if (data.type === 'worship_nudge') {
              notificationService.triggerPeerNudge(
                data.title || 'تنبيه صلاة',
                data.body || 'حان وقت الصلاة',
                data.sound || 'adhan.mp3'
              );
              
              // Also show a toast if the app is in the foreground
              toast.info(data.body, {
                description: data.title,
                duration: 10000,
              });
            }
          }
        }
      });
    }, (error) => {
      console.error("Community notifications listener error:", error);
    });

    return () => unsubscribe();
  }, []);
};
