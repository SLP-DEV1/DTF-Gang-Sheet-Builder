export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportTransparentPng(stage, sheet) {
  const backgrounds = stage.find('.sheet-background');
  const previousSize = {
    width: stage.width(),
    height: stage.height(),
    scaleX: stage.scaleX(),
    scaleY: stage.scaleY(),
  };

  backgrounds.forEach((node) => node.hide());
  stage.width(sheet.widthPx);
  stage.height(sheet.heightPx);
  stage.scale({ x: 1, y: 1 });
  stage.batchDraw();

  const dataUrl = stage.toDataURL({
    x: 0,
    y: 0,
    width: sheet.widthPx,
    height: sheet.heightPx,
    pixelRatio: 1,
    mimeType: 'image/png',
  });

  stage.width(previousSize.width);
  stage.height(previousSize.height);
  stage.scale({ x: previousSize.scaleX, y: previousSize.scaleY });
  backgrounds.forEach((node) => node.show());
  stage.batchDraw();

  return dataUrl;
}
