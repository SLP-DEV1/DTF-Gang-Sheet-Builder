import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
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
const artworkDir = path.join(outputDir, 'demo-artwork');
const framesDir = path.join(outputDir, 'demo-frames');
const palettePath = path.join(framesDir, 'palette.png');
const gifPath = path.join(outputDir, 'dtf-gang-sheet-demo.gif');

await mkdir(artworkDir, { recursive: true });
await rm(framesDir, { recursive: true, force: true });
await mkdir(framesDir, { recursive: true });

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

  const filePath = path.join(artworkDir, `demo-${index + 1}.png`);
  await page.locator('svg').screenshot({ path: filePath, omitBackground: true });
  artworkPaths.push(filePath);
}

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.getByLabel('Sheet-Vorlage').selectOption('a4');
await page.getByLabel('Abstand mm').fill('5');
await page.getByLabel('Rotation erlauben').check();
await page.getByLabel('Abstandslinien').check();
await page.evaluate(() => window.scrollTo(0, 0));

await page.addStyleTag({
  content: `
    #demo-cursor {
      position: fixed;
      width: 30px;
      height: 38px;
      left: 0;
      top: 0;
      z-index: 2147483647;
      pointer-events: none;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
      transition: none;
    }
    #demo-ripple {
      position: fixed;
      width: 12px;
      height: 12px;
      border: 3px solid #2563eb;
      border-radius: 999px;
      z-index: 2147483646;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -50%) scale(.4);
    }
    html { scrollbar-width: none; }
    html::-webkit-scrollbar { display: none; }
  `,
});

await page.evaluate(() => {
  const cursor = document.createElement('div');
  cursor.id = 'demo-cursor';
  cursor.innerHTML = `
    <svg viewBox="0 0 30 38" width="30" height="38" aria-hidden="true">
      <path d="M3 2 L3 29 L10 22 L16 36 L21 34 L15 20 L26 20 Z" fill="white" stroke="#111827" stroke-width="2" stroke-linejoin="round"/>
    </svg>`;
  document.body.appendChild(cursor);

  const ripple = document.createElement('div');
  ripple.id = 'demo-ripple';
  document.body.appendChild(ripple);
});

let frameNumber = 0;
async function captureFrame() {
  const filename = `frame-${String(frameNumber).padStart(3, '0')}.png`;
  frameNumber += 1;
  await page.screenshot({ path: path.join(framesDir, filename), fullPage: false });
}

async function setCursor(x, y, rippleScale = 0, rippleOpacity = 0) {
  await page.evaluate(
    ({ x, y, rippleScale, rippleOpacity }) => {
      const cursor = document.getElementById('demo-cursor');
      const ripple = document.getElementById('demo-ripple');
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      ripple.style.left = `${x + 4}px`;
      ripple.style.top = `${y + 5}px`;
      ripple.style.opacity = String(rippleOpacity);
      ripple.style.transform = `translate(-50%, -50%) scale(${rippleScale})`;
    },
    { x, y, rippleScale, rippleOpacity },
  );
}

async function hold(frames) {
  for (let index = 0; index < frames; index += 1) {
    await captureFrame();
  }
}

async function moveCursor(from, to, frames) {
  for (let index = 1; index <= frames; index += 1) {
    const progress = index / frames;
    const eased = 1 - Math.pow(1 - progress, 3);
    const x = Math.round(from.x + (to.x - from.x) * eased);
    const y = Math.round(from.y + (to.y - from.y) * eased);
    await setCursor(x, y);
    await captureFrame();
  }
}

const dropzone = await page.locator('.dropzone').boundingBox();
if (!dropzone) throw new Error('Upload dropzone not found.');
const uploadPoint = {
  x: Math.round(dropzone.x + dropzone.width * 0.72),
  y: Math.round(dropzone.y + dropzone.height * 0.56),
};

await setCursor(uploadPoint.x, uploadPoint.y);
await hold(5);

for (const scale of [0.55, 0.9, 1.3]) {
  await setCursor(uploadPoint.x, uploadPoint.y, scale, 0.8 - scale * 0.25);
  await captureFrame();
}
await setCursor(uploadPoint.x, uploadPoint.y);

const upload = page.locator('input[type="file"][accept="image/png"]');
await upload.setInputFiles(artworkPaths);
await page.locator('strong').filter({ hasText: 'demo-1.png' }).first().waitFor({ timeout: 10_000 });

const quantityInputs = page.locator('.motif-card input[type="number"]');
for (let index = 0; index < 3; index += 1) {
  await quantityInputs.nth(index).fill('2');
}
await page.waitForTimeout(250);
await hold(4);

const arrangeButton = page.getByRole('button', { name: 'Auto Arrange' });
const arrangeBox = await arrangeButton.boundingBox();
if (!arrangeBox) throw new Error('Auto Arrange button not found.');
const arrangePoint = {
  x: Math.round(arrangeBox.x + arrangeBox.width * 0.72),
  y: Math.round(arrangeBox.y + arrangeBox.height * 0.55),
};

await moveCursor(uploadPoint, arrangePoint, 7);

for (const scale of [0.55, 0.9, 1.35]) {
  await setCursor(arrangePoint.x, arrangePoint.y, scale, 0.85 - scale * 0.25);
  await captureFrame();
}
await setCursor(arrangePoint.x, arrangePoint.y);
await arrangeButton.click();
await page.waitForTimeout(650);

const sheetTarget = { x: 950, y: 520 };
await moveCursor(arrangePoint, sheetTarget, 5);
await hold(8);

await browser.close();

const inputPattern = path.join(framesDir, 'frame-%03d.png');
execFileSync(
  'ffmpeg',
  [
    '-y',
    '-framerate', '6',
    '-i', inputPattern,
    '-vf', 'fps=6,scale=1200:-1:flags=lanczos,palettegen=max_colors=160:stats_mode=diff',
    palettePath,
  ],
  { stdio: 'inherit' },
);

execFileSync(
  'ffmpeg',
  [
    '-y',
    '-framerate', '6',
    '-i', inputPattern,
    '-i', palettePath,
    '-lavfi', 'fps=6,scale=1200:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
    '-loop', '0',
    gifPath,
  ],
  { stdio: 'inherit' },
);

await rm(framesDir, { recursive: true, force: true });

console.log(`Created ${gifPath} from ${frameNumber} real browser frames.`);
