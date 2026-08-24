const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 375, height: 812 });
  
  const html = \
  <!DOCTYPE html>
  <html>
  <body style='margin:0; height: 100vh; display: flex;'>
    <div style='flex:1; position: relative;'>
      <img src='https://jahedev.github.io/tajweed-quran-pages/hafs/tajweed-003.jpg' style='position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top;' />
    </div>
  </body>
  </html>
  \;
  
  await page.setContent(html);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-cover.png' });
  
  await browser.close();
  console.log('Done');
})();
