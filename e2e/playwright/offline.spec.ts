import { expect, test } from '@playwright/test';

const waitForServiceWorkerReady = async (page: any) => {
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.getRegistration();
    return Boolean(registration?.active);
  });
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
    await page.goto('/juz/1');
    await page.locator('button[title="الانتقال لصفحة"]').first().click();
    await page.locator('input[type="number"]').fill('3');
    await page.locator('button:has-text("انتقال")').click();

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await page.locator('button[title="الانتقال لصفحة"]').first().click();
    await page.locator('input[type="number"]').fill('4');
    await page.locator('button:has-text("انتقال")').click();

    await expect(page).toHaveURL(/\/juz\/1$/);
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('open tafsir offline with cached data', async ({ page, context }) => {
    await page.goto('/tafsir');
    await page.waitForSelector('select option', { timeout: 30_000 });
    await page.locator('select').first().selectOption('1');
    await page.locator('select').nth(1).selectOption('1');
    await page.waitForTimeout(2000);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    const tafsirBody = page.locator('div.p-6.bg-primary\/5 p').nth(1);
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
    const seed = await page.evaluate(async () => {
      const recitersResponse = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
      const payload = await recitersResponse.json();
      const reciters = payload.reciters || [];

      const normalizeServer = (server: string) => {
        let url = (server || '').trim();
        if (url.startsWith('http://')) url = url.replace('http://', 'https://');
        if (url.startsWith('//')) url = `https:${url}`;
        if (!url.startsWith('https://')) url = `https://${url}`;
        if (!url.endsWith('/')) url += '/';
        return url;
      };

      for (const reciter of reciters) {
        const firstMoshaf = reciter?.moshaf?.find((m: { server?: string; surah_list?: string }) => m.server && m.surah_list);
        if (!firstMoshaf) continue;

        const firstSurah = String(firstMoshaf.surah_list.split(',')[0] || '').trim().padStart(3, '0');
        if (!firstSurah) continue;

        const audioUrl = `${normalizeServer(firstMoshaf.server)}${firstSurah}.mp3`;

        try {
          const response = await fetch(audioUrl, { mode: 'no-cors' });
          const cache = await caches.open('quran-audio-cache');
          await cache.put(audioUrl, response.clone());
          return { ok: true, audioUrl };
        } catch {
          // continue to next reciter
        }
      }

      return { ok: false, audioUrl: null };
    });

    expect(seed.ok).toBeTruthy();

    await context.setOffline(true);

    const playbackResult = await page.evaluate(async (audioUrl) => {
      const cachedResponse = await caches.match(audioUrl);
      if (!cachedResponse) return { played: false, reason: 'missing_cache' };

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
    }, seed.audioUrl);

    expect(playbackResult.played).toBeTruthy();
  });
});
