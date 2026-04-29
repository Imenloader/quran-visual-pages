import { test, expect } from '@playwright/test';
test('frontend check', async ({ page }) => {
  await page.goto('http://localhost:5173');
});
