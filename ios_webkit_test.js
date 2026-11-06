const { webkit, devices } = require('playwright');
(async () => {
  let failed = 0;
  const check = (name, ok, detail = '') => {
    console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' ' + detail : ''));
    if (!ok) failed++;
  };
  const base = 'http://127.0.0.1:8765/';
  const mres = await fetch(base + 'manifest.webmanifest');
  check('manifest 配信', mres.ok);
  const manifest = mres.ok ? await mres.json() : {};
  check('manifest standalone/start_url/icons', manifest.display === 'standalone' && !!manifest.start_url && (manifest.icons || []).length >= 2);
  for (const path of ['sw.js', 'ios-pwa-runtime.js', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png']) {
    const response = await fetch(base + path);
    check(path + ' 配信', response.ok);
  }
  const browser = await webkit.launch();
  for (const name of ['iPhone 13', 'iPhone 14', 'iPhone 15 Pro Max']) {
    const device = devices[name];
    if (!device) { check(name + ' device profile exists', false); continue; }
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(base + 'index.html#noopening');
    await page.waitForTimeout(1800);
    check(name + ' manifest/apple-touch-icon link', await page.evaluate(() =>
      !!document.querySelector('link[rel=manifest]') &&
      !!document.querySelector('link[rel=apple-touch-icon]') &&
      document.querySelector('meta[name=apple-mobile-web-app-capable]')?.content === 'yes'));
    check(name + ' stage exists', await page.evaluate(() => !!document.getElementById('stage')));
    const gear = await page.$('#gear,.gear,#setBtn');
    check(name + ' settings button exists', !!gear);
    if (gear) {
      await gear.tap();
      await page.waitForTimeout(300);
      check(name + ' settings panel opens', await page.evaluate(() => {
        const panel = document.getElementById('panel');
        return !!panel && getComputedStyle(panel).display !== 'none';
      }));
      check(name + ' wake setting exists', await page.evaluate(() => !!document.getElementById('iosWake')));
      await page.evaluate(() => document.getElementById('iosWake')?.click());
      await page.waitForTimeout(300);
      await page.reload();
      await page.waitForTimeout(1200);
      check(name + ' setting persists after reload', await page.evaluate(() => localStorage.getItem('melo_ios_wake') === '1'));
    }
    check(name + ' service worker registration', await page.evaluate(async () => !!navigator.serviceWorker && !!(await navigator.serviceWorker.getRegistration())));
    check(name + ' no page errors', errors.length === 0, errors.join('|'));
    await context.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(error => { console.error(error); process.exit(1); });
