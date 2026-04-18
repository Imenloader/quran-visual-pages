import { useState, useEffect, useCallback, useRef } from 'react';

export const useWakeLock = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;

    try {
      const lock = await navigator.wakeLock.request('screen');
      wakeLockRef.current = lock;
      setIsActive(true);
      
      lock.addEventListener('release', () => {
        wakeLockRef.current = null;
        setIsActive(false);
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
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  // Re-request wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [requestWakeLock]);

  return { isSupported, requestWakeLock, releaseWakeLock, isActive };
};
