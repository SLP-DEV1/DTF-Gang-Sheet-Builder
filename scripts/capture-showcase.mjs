import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const chromeCandidates = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));
if (!executablePath) {
  throw new Error('No Chrome/Chromium executable found. Set CHROME_PATH.');
}

const outputDir = path.resolve('showcase');
const tempDir = path.join(outputDir, 'demo-artwork');
await mkdir(tempDir, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 1,
});

const demoArtwork = [
  { title: 'DTF', subtitle: 'GANG SHEET', accent: '#2563eb', soft: '#93c5fd' },
  { title: 'PRINT', subtitle: 'READY', accent: '#7c3aed', soft: '#c4b5fd' },
  { title: 'LOCAL', subtitle: 'FIRST', accent: '#059669', soft: '#6ee7b7' },
];

const artworkPaths = [];
for (const [index, artwork] of demoArtwork.entries()) {
  await page.setContent(`
    <!doctype html>
    <html>
      <body style="margin:0;background:transparent">
        <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 480 320">
          <rect x="20" y="20" width="440" height="280" rx="44" fill="rgba(255,255,255,.96)" stroke="${artwork.accent}" stroke-width="10"/>
          <rect x="42" y="42" width="396" height="64" rx="26" fill="${artwork.accent}"/>
          <circle cx="410" cy="151" r="20" fill="${artwork.soft}"/>
          <circle cx="68" cy="248" r="13" fill="${artwork.soft}"/>
          <text x="62" y="82" fill="white" font-family="Arial, sans-serif" font-size="24">OPEN SOURCE</text>
          <text x="240" y="195" text-anchor="middle" fill="#141821" font-family="Arial, sans-serif" font-weight="700" font-size="${artwork.title.length > 5 ? 58 : 72}">${artwork.title}</text>
          <text x="240" y="260" text-anchor="middle" fill="${artwork.accent}" font-family="Arial, sans-serif" font-weight="700" font-size="34">${artwork.subtitle}</text>
        </svg>
      </body>
    </html>
  `);

  const filePath = path.join(tempDir, `demo-${index + 1}.png`);
  await page.locator('svg').screenshot({ path: filePath, omitBackground: true });
  artworkPaths.push(filePath);
}

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

const upload = page.locator('input[type="file"][accept="image/png"]');
await upload.setInputFiles(artworkPaths);
await page.locator('strong').filter({ hasText: 'demo-1.png' }).first().waitFor({ timeout: 10_000 });

await page.getByLabel('Sheet-Vorlage').selectOption('a4');

const quantityInputs = page.locator('.motif-card input[type="number"]');
for (let index = 0; index < 3; index += 1) {
  await quantityInputs.nth(index).fill('2');
}

const gapInput = page.getByLabel('Abstand mm');
await gapInput.fill('5');
await page.getByLabel('Rotation erlauben').check();
await page.getByRole('button', { name: 'Auto Arrange' }).click();
await page.getByLabel('Abstandslinien').check();

await page.waitForTimeout(900);
await page.evaluate(() => window.scrollTo(0, 0));

await page.screenshot({
  path: path.join(outputDir, 'dtf-gang-sheet-builder.png'),
  fullPage: false,
});

await browser.close();
