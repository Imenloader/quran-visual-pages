import { useEffect, useRef } from 'react';
import { db, auth } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useCommunityNotifications = () => {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const startListener = () => {
    if (!auth.currentUser) return;
    
    // Stop existing listener if any
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const currentUid = auth.currentUser.uid;
    const now = Timestamp.now();

    // Listen for new notifications in the last 5 minutes
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUid),
      where('createdAt', '>=', new Timestamp(now.seconds - 300, 0)),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const createdAt = data.createdAt as Timestamp;
          
          if (createdAt && (Date.now() - createdAt.toMillis() < 60000)) { // Within 60 seconds
            if (data.type === 'worship_nudge') {
              notificationService.triggerPeerNudge(
                data.title || 'تنبيه صلاة',
                data.body || 'حان وقت الصلاة',
                data.sound || 'adhan.mp3'
              );
              
              toast.info(data.body, {
                description: data.title,
                duration: 15000,
              });
            }
          }
        }
      });
    }, (error) => {
      console.error("Community notifications listener error:", error);
      // Attempt to restart after a delay if it fails
      setTimeout(startListener, 10000);
    });
  };

  useEffect(() => {
    startListener();

    // Re-sync when app comes back from background to ensure we didn't miss anything
    let stateListener: any = null;
    if (Capacitor.isNativePlatform()) {
      stateListener = CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          startListener();
        }
      });
    }

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (stateListener) stateListener.then((l: any) => l.remove());
    };
  }, []);
};
