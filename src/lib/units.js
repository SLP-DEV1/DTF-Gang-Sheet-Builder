export const DEFAULT_DPI = 300;

export function cmToPx(cm, dpi = DEFAULT_DPI) {
  const value = Number(cm);
  const dpiValue = Number(dpi);
  if (!Number.isFinite(value) || !Number.isFinite(dpiValue)) return 0;
  return Math.round((value / 2.54) * dpiValue);
}

export function mmToPx(mm, dpi = DEFAULT_DPI) {
  const value = Number(mm);
  const dpiValue = Number(dpi);
  if (!Number.isFinite(value) || !Number.isFinite(dpiValue)) return 0;
  return Math.round((value / 25.4) * dpiValue);
}

export function pxToCm(px, dpi = DEFAULT_DPI) {
  const value = Number(px);
  const dpiValue = Number(dpi);
  if (!Number.isFinite(value) || !Number.isFinite(dpiValue) || dpiValue === 0) return 0;
  return (value / dpiValue) * 2.54;
}
