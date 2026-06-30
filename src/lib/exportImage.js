export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportTransparentPng(stage, sheet, options = {}) {
  const { includeGuides = false, includeDpiMetadata = true } = options;
  const backgrounds = stage.find('.sheet-background');
  const guides = stage.find('.export-guide');
  const previews = stage.find('.export-preview');
  const exportUi = stage.find('.export-ui');
  const previousSize = {
    width: stage.width(),
    height: stage.height(),
    scaleX: stage.scaleX(),
    scaleY: stage.scaleY(),
  };

  backgrounds.forEach((node) => node.hide());
  if (!includeGuides) guides.forEach((node) => node.hide());
  previews.forEach((node) => node.hide());
  exportUi.forEach((node) => node.hide());
  stage.width(sheet.widthPx);
  stage.height(sheet.heightPx);
  stage.scale({ x: 1, y: 1 });
  stage.batchDraw();

  try {
    const dataUrl = stage.toDataURL({
      x: 0,
      y: 0,
      width: sheet.widthPx,
      height: sheet.heightPx,
      pixelRatio: 1,
      mimeType: 'image/png',
    });

    return includeDpiMetadata ? addPngDpiMetadata(dataUrl, sheet.dpi) : dataUrl;
  } finally {
    stage.width(previousSize.width);
    stage.height(previousSize.height);
    stage.scale({ x: previousSize.scaleX, y: previousSize.scaleY });
    backgrounds.forEach((node) => node.show());
    guides.forEach((node) => node.show());
    previews.forEach((node) => node.show());
    exportUi.forEach((node) => node.show());
    stage.batchDraw();
  }
}

export function addPngDpiMetadata(dataUrl, dpi) {
  if (!dataUrl.startsWith('data:image/png;base64,')) return dataUrl;
  const bytes = base64ToBytes(dataUrl.split(',')[1]);
  const ppm = Math.round((Number(dpi) || 300) / 0.0254);
  const chunk = createPhysChunk(ppm);
  let offset = 8;

  while (offset < bytes.length) {
    const length = readUint32(bytes, offset);
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    if (type === 'pHYs') {
      bytes.splice(offset, length + 12, ...chunk);
      return `data:image/png;base64,${bytesToBase64(bytes)}`;
    }
    if (type === 'IDAT') {
      bytes.splice(offset, 0, ...chunk);
      return `data:image/png;base64,${bytesToBase64(bytes)}`;
    }
    offset += length + 12;
  }

  return dataUrl;
}

function createPhysChunk(ppm) {
  const type = [0x70, 0x48, 0x59, 0x73];
  const data = [
    ...uint32Bytes(ppm),
    ...uint32Bytes(ppm),
    1,
  ];
  const crc = crc32([...type, ...data]);
  return [...uint32Bytes(data.length), ...type, ...data, ...uint32Bytes(crc)];
}

function readUint32(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function uint32Bytes(value) {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

function base64ToBytes(base64) {
  return Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 8192;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }
  return btoa(binary);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  });
  return (crc ^ 0xffffffff) >>> 0;
}
