
export async function registerPeriodicSync() {
  if (!('serviceWorker' in navigator)) return;
  
  const registration = await navigator.serviceWorker.ready;
  
  if (!('periodicSync' in registration)) {
    console.log('Periodic Background Sync is not supported by this browser.');
    return;
  }

  try {
    // @ts-expect-error: periodicSync is not yet in standard TS types
    const status = await navigator.permissions.query({
      // @ts-expect-error: periodicSync is not yet in standard TS types
      name: 'periodic-background-sync',
    });

    if (status.state === 'granted') {
      // @ts-expect-error: periodicSync is not yet in standard TS types
      await registration.periodicSync.register('refresh-prayer-times', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      });
      console.log('Periodic Background Sync registered!');
    } else {
      console.log('Periodic Background Sync permission not granted.');
    }
  } catch (error) {
    console.error('Periodic Background Sync registration failed:', error);
  }
}
