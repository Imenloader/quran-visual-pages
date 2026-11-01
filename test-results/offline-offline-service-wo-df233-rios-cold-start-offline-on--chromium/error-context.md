# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: offline.spec.ts >> offline service worker regression scenarios >> cold start offline on /
- Location: e2e/playwright/offline.spec.ts:18:3

# Error details

```
Error: page.reload: net::ERR_INTERNET_DISCONNECTED
Call log:
  - waiting for navigation until "domcontentloaded"

```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | 
  3   | const waitForServiceWorkerReady = async (page: any) => {
  4   |   await page.waitForFunction(async () => {
  5   |     if (!('serviceWorker' in navigator)) return false;
  6   |     const registration = await navigator.serviceWorker.getRegistration();
  7   |     return Boolean(registration?.active);
  8   |   });
  9   | };
  10  | 
  11  | test.describe('offline service worker regression scenarios', () => {
  12  |   test.beforeEach(async ({ page, context }) => {
  13  |     await context.setOffline(false);
  14  |     await page.goto('/');
  15  |     await waitForServiceWorkerReady(page);
  16  |   });
  17  | 
  18  |   test('cold start offline on /', async ({ page, context }) => {
  19  |     await context.setOffline(true);
> 20  |     await page.reload({ waitUntil: 'domcontentloaded' });
      |                ^ Error: page.reload: net::ERR_INTERNET_DISCONNECTED
  21  | 
  22  |     await expect(page).toHaveURL(/\/$/);
  23  |     await expect(page.locator('#root')).toBeVisible();
  24  |   });
  25  | 
  26  |   test('open /juz/:id and navigate pages offline', async ({ page, context }) => {
  27  |     await page.goto('/juz/1');
  28  |     await page.locator('button[title="الانتقال لصفحة"]').first().click();
  29  |     await page.locator('input[type="number"]').fill('3');
  30  |     await page.locator('button:has-text("انتقال")').click();
  31  | 
  32  |     await context.setOffline(true);
  33  |     await page.reload({ waitUntil: 'domcontentloaded' });
  34  | 
  35  |     await page.locator('button[title="الانتقال لصفحة"]').first().click();
  36  |     await page.locator('input[type="number"]').fill('4');
  37  |     await page.locator('button:has-text("انتقال")').click();
  38  | 
  39  |     await expect(page).toHaveURL(/\/juz\/1$/);
  40  |     await expect(page.locator('img').first()).toBeVisible();
  41  |   });
  42  | 
  43  |   test('open tafsir offline with cached data', async ({ page, context }) => {
  44  |     await page.goto('/tafsir');
  45  |     await page.waitForSelector('select option', { timeout: 30_000 });
  46  |     await page.locator('select').first().selectOption('1');
  47  |     await page.locator('select').nth(1).selectOption('1');
  48  |     await page.waitForTimeout(2000);
  49  | 
  50  |     await context.setOffline(true);
  51  |     await page.reload({ waitUntil: 'domcontentloaded' });
  52  | 
  53  |     const tafsirBody = page.locator('div.p-6.bg-primary\/5 p').nth(1);
  54  |     await expect(tafsirBody).toBeVisible();
  55  |     await expect(tafsirBody).not.toContainText('فشل الاتصال بالخادم');
  56  |   });
  57  | 
  58  |   test('use global nav while offline', async ({ page, context }) => {
  59  |     await page.goto('/prayer-times');
  60  |     await page.goto('/athkar');
  61  | 
  62  |     await context.setOffline(true);
  63  | 
  64  |     await page.locator('a[href="/"]').click();
  65  |     await expect(page).toHaveURL(/\/$/);
  66  | 
  67  |     await page.locator('a[href="/hub"]').click();
  68  |     await expect(page).toHaveURL(/\/hub$/);
  69  |   });
  70  | 
  71  |   test('audio playback from cached recitations while offline', async ({ page, context }) => {
  72  |     const seed = await page.evaluate(async () => {
  73  |       const recitersResponse = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
  74  |       const payload = await recitersResponse.json();
  75  |       const reciters = payload.reciters || [];
  76  | 
  77  |       const normalizeServer = (server: string) => {
  78  |         let url = (server || '').trim();
  79  |         if (url.startsWith('http://')) url = url.replace('http://', 'https://');
  80  |         if (url.startsWith('//')) url = `https:${url}`;
  81  |         if (!url.startsWith('https://')) url = `https://${url}`;
  82  |         if (!url.endsWith('/')) url += '/';
  83  |         return url;
  84  |       };
  85  | 
  86  |       for (const reciter of reciters) {
  87  |         const firstMoshaf = reciter?.moshaf?.find((m: { server?: string; surah_list?: string }) => m.server && m.surah_list);
  88  |         if (!firstMoshaf) continue;
  89  | 
  90  |         const firstSurah = String(firstMoshaf.surah_list.split(',')[0] || '').trim().padStart(3, '0');
  91  |         if (!firstSurah) continue;
  92  | 
  93  |         const audioUrl = `${normalizeServer(firstMoshaf.server)}${firstSurah}.mp3`;
  94  | 
  95  |         try {
  96  |           const response = await fetch(audioUrl, { mode: 'no-cors' });
  97  |           const cache = await caches.open('quran-audio-cache');
  98  |           await cache.put(audioUrl, response.clone());
  99  |           return { ok: true, audioUrl };
  100 |         } catch {
  101 |           // continue to next reciter
  102 |         }
  103 |       }
  104 | 
  105 |       return { ok: false, audioUrl: null };
  106 |     });
  107 | 
  108 |     expect(seed.ok).toBeTruthy();
  109 | 
  110 |     await context.setOffline(true);
  111 | 
  112 |     const playbackResult = await page.evaluate(async (audioUrl) => {
  113 |       const cachedResponse = await caches.match(audioUrl);
  114 |       if (!cachedResponse) return { played: false, reason: 'missing_cache' };
  115 | 
  116 |       const audio = new Audio(audioUrl);
  117 |       audio.preload = 'auto';
  118 |       audio.muted = true;
  119 | 
  120 |       return await new Promise<{ played: boolean; reason?: string }>((resolve) => {
```