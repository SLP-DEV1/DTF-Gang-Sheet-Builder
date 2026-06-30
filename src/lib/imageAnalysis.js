export function imageHasTransparency(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return true;
  context.drawImage(image, 0, 0);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) return true;
  }
  return false;
}

/**
 * Gibt den Anteil nicht-transparenter Pixel als Wert zwischen 0 und 1 zurück.
 * Ein alphaAreaRatio von 1 bedeutet dass das Bild vollstaendig ohne Transparenz ist.
 */
export function calculateAlphaRatio(image) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return 1;

  context.drawImage(image, 0, 0);
  const data = context.getImageData(0, 0, width, height).data;

  let alphaPixels = 0;
  const totalPixels = width * height;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) alphaPixels++;
  }

  return totalPixels > 0 ? alphaPixels / totalPixels : 1;
}

/**
 * Finde den kleinsten Bounding Box wo Alpha > threshold.
 * Gibt { top, left, bottom, right } zurück oder null wenn kein Pixel gefunden wurde.
 */
export function findAlphaBoundingBox(image, threshold = 0) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  let top = height;
  let left = width;
  let bottom = 0;
  let right = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (data[index + 3] > threshold) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  if (top >= bottom || left >= right) return null;
  return { top, left, bottom, right };
}

/**
 * Schneide transparente Ränder ab und gibt ein Objekt zurück mit:
 * { dataUrl, width, height, originalWidth, originalHeight }
 * Der optionale padding-Parameter fügt Pixel um den Bounding Box hinzu.
 */
export function trimTransparency(image, threshold = 0, padding = 0) {
  const box = findAlphaBoundingBox(image, threshold);
  if (!box) {
    // Vollständig transparentes Bild — ursprüngliches zurückgeben
    return {
      dataUrl: image.src,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      originalWidth: image.naturalWidth || image.width,
      originalHeight: image.naturalHeight || image.height,
    };
  }

  const cropX = Math.max(0, box.left - padding);
  const cropY = Math.max(0, box.top - padding);
  const cropWidth = Math.min(image.width - box.right, padding) + (box.right - box.left);
  const cropHeight = Math.min(image.height - box.bottom, padding) + (box.bottom - box.top);

  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    return {
      dataUrl: image.src,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      originalWidth: image.naturalWidth || image.width,
      originalHeight: image.naturalHeight || image.height,
    };
  }

  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: cropWidth,
    height: cropHeight,
    originalWidth: image.naturalWidth || image.width,
    originalHeight: image.naturalHeight || image.height,
  };
}
