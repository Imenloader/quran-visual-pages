import { expect, test } from '@playwright/test';

const waitForServiceWorkerReady = async (page: any) => {
  // The page must actually be controlled by an activated worker, otherwise a
  // reload bypasses the service worker entirely and offline navigation fails.
  await page.waitForFunction(
    () => navigator.serviceWorker.controller?.state === 'activated',
    undefined,
    { polling: 250, timeout: 30_000 }
  );
};

test.describe('offline service worker regression scenarios', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.setOffline(false);
    await page.goto('/');
    await waitForServiceWorkerReady(page);
  });

  test('cold start offline on /', async ({ page, context }) => {
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#root')).toBeVisible();
  });

  test('open /juz/:id and navigate pages offline', async ({ page, context }) => {
    // Current reader UI: controls live behind the "أدوات القراءة" drawer.
    const goToPage = async (n: string) => {
      // Tap the reader to reveal the auto-hiding toolbar, then open the tools drawer.
      await page.locator('img').first().click();
      await page.locator('button[aria-label="أدوات القراءة"]').click();
      await page.locator('button:has-text("انتقال لصفحة")').click();
      await page.locator('input[type="number"]').fill(n);
      await page.locator('button:has-text("انتقال")').click();
    };

    await page.goto('/juz/1');
    await goToPage('3');

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await goToPage('4');

    await expect(page).toHaveURL(/\/juz\/1$/);
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('open tafsir offline with cached data', async ({ page, context }) => {
    await page.goto('/tafsir');
    await page.waitForSelector('select option', { state: 'attached', timeout: 30_000 });
    await page.locator('select').first().selectOption('1');
    await page.locator('select').nth(1).selectOption('1');
    await page.waitForTimeout(2000);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    const tafsirBody = page.locator('div.p-6.bg-primary\\/5 p').nth(1);
    await expect(tafsirBody).toBeVisible();
    await expect(tafsirBody).not.toContainText('فشل الاتصال بالخادم');
  });

  test('use global nav while offline', async ({ page, context }) => {
    await page.goto('/prayer-times');
    await page.goto('/athkar');

    await context.setOffline(true);

    await page.locator('a[href="/"]').click();
    await expect(page).toHaveURL(/\/$/);

    await page.locator('a[href="/hub"]').click();
    await expect(page).toHaveURL(/\/hub$/);
  });

  test('audio playback from cached recitations while offline', async ({ page, context }) => {
    // Same-origin bundled audio is served CacheFirst by the service worker.
    // Fetch it once online so it lands in quran-audio-cache, then play offline.
    const audioUrl = await page.evaluate(async () => {
      const res = await fetch('/Adhan%20Sounds/Adhan-Makkah.mp3');
      return res.ok ? res.url : null;
    });
    expect(audioUrl).toBeTruthy();

    await context.setOffline(true);

    const playbackResult = await page.evaluate(async (audioUrl) => {
      // The service worker serves precached/cached audio for the bare URL
      // (the cache key carries a revision query, so don't precondition on caches.match).
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.muted = true;

      return await new Promise<{ played: boolean; reason?: string }>((resolve) => {
        const timeout = window.setTimeout(() => resolve({ played: false, reason: 'timeout' }), 8000);

        const onPlayable = () => {
          clearTimeout(timeout);
          resolve({ played: true });
        };

        audio.addEventListener('canplaythrough', onPlayable, { once: true });
        audio.addEventListener('error', () => {
          clearTimeout(timeout);
          resolve({ played: false, reason: 'audio_error' });
        }, { once: true });

        void audio.play().catch(() => {
          // fall back to canplaythrough event if autoplay is blocked
        });
      });
    }, audioUrl);

    expect(playbackResult.played).toBeTruthy();
  });
});
