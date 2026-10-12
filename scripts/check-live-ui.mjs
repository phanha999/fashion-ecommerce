import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir('test-results/live', { recursive: true });
try {
  await page.goto('http://127.0.0.1:5174/shop');
  await page.locator('a[href^="/products/"]').first().waitFor({ timeout: 30000 });
  console.log('PASS live Shopify shop UI');
  const href = await page.locator('a[href^="/products/"]').first().getAttribute('href');
  await page.goto('http://127.0.0.1:5174' + href);
  await page.getByRole('combobox').waitFor({ timeout: 30000 });
  await page.waitForFunction(() => { const image = document.querySelector('img[fetchpriority]'); return image?.complete && image.naturalWidth > 0; }, null, { timeout: 20000 });
  await page.screenshot({ path: 'test-results/live/product-desktop.png', fullPage: true });
  console.log('PASS live product UI, gallery, options and metadata');
  await page.goto('http://127.0.0.1:5174/pages/size-guide');
  await page.locator('.shop-content').waitFor({ timeout: 30000 });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://127.0.0.1:5174/account');
  await page.getByRole('heading', { name: 'Sign in', exact: true }).waitFor({ timeout: 30000 });
  await page.getByRole('link', { name: 'ap panndo', exact: true }).waitFor({ timeout: 20000 });
  await page.screenshot({ path: 'test-results/live/account-mobile.png', fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (overflow) throw new Error('Mobile horizontal overflow');
  if (errors.length) throw new Error('UI errors: ' + errors.join('; '));
  console.log('PASS live content and mobile account; no runtime errors or overflow');
} finally { await browser.close(); }
