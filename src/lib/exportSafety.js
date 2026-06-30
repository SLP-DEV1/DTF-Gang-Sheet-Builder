const MEGAPIXEL_WARNING = 150;

export function getExportStats(sheet) {
  const pixels = sheet.widthPx * sheet.heightPx;
  const megapixels = pixels / 1000000;
  const ramBytes = pixels * 4;
  const ramMb = ramBytes / 1024 / 1024;

  return {
    widthPx: sheet.widthPx,
    heightPx: sheet.heightPx,
    pixels,
    megapixels,
    ramBytes,
    ramMb,
    isLarge: megapixels > MEGAPIXEL_WARNING,
  };
}
