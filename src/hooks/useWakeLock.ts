import { useState, useEffect, useCallback } from 'react';

export const useWakeLock = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      
      lock.addEventListener('release', () => {
        setWakeLock(null);
      });
      
      console.log('Screen Wake Lock is active');
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        console.warn('Screen Wake Lock is disallowed by permissions policy. This is expected in some environments like iframes.');
      } else {
        console.error(`${err instanceof Error ? err.name : 'Error'}, ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  // Re-request wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock, requestWakeLock]);

  return { isSupported, requestWakeLock, releaseWakeLock, isActive: !!wakeLock };
};
