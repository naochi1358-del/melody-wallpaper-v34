const { webkit, devices } = require('playwright');
(async () => {
  let failed = 0;
  const check = (name, ok, detail = '') => {
    console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' ' + detail : ''));
    if (!ok) failed++;
  };
  const browser = await webkit.launch();
  for (const name of ['iPhone SE', 'iPhone 13', 'iPhone 15 Pro Max']) {
    const device = devices[name];
    if (!device) { check(name + ' device profile exists', false); continue; }
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://127.0.0.1:8765/index.html#noopening');
    await page.waitForTimeout(1800);
    check(name + ' stage exists', await page.evaluate(() => !!document.getElementById('stage')));
    const gear = await page.$('#gear,.gear,#setBtn');
    check(name + ' settings button exists', !!gear);
    if (gear) {
      await gear.tap();
      await page.waitForTimeout(300);
      check(name + ' settings panel opens', await page.evaluate(() => {
        const p = document.getElementById('panel');
        return !!p && getComputedStyle(p).display !== 'none';
      }));
      check(name + ' wake setting exists', await page.evaluate(() => !!document.getElementById('iosWake')));
      await page.evaluate(() => document.getElementById('iosWake')?.click());
      await page.waitForTimeout(300);
      check(name + ' setting persists after reload', await (async () => {
        await page.reload(); await page.waitForTimeout(1200);
        return page.evaluate(() => localStorage.getItem('melo_ios_wake') === '1');
      })());
    }
    check(name + ' no page errors', errors.length === 0, errors.join('|'));
    await context.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
