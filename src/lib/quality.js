import { getItemPrintedSizeCm } from './pricing.js';

export function calculateEffectiveDpi(item, sheetDpi) {
  const { widthCm, heightCm } = getItemPrintedSizeCm(item, sheetDpi);
  const originalWidth = item.originalWidth || item.width;
  const originalHeight = item.originalHeight || item.height;
  const dpiX = widthCm > 0 ? originalWidth / (widthCm / 2.54) : 0;
  const dpiY = heightCm > 0 ? originalHeight / (heightCm / 2.54) : 0;
  const dpi = Math.min(dpiX, dpiY);

  let level = 'good';
  let label = 'gut';
  if (dpi < 150) {
    level = 'low';
    label = 'zu niedrig';
  } else if (dpi <= 250) {
    level = 'medium';
    label = 'okay, aber nicht optimal';
  }

  return { dpiX, dpiY, dpi, level, label };
}
