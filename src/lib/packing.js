import { mmToPx } from './units.js';

export function autoPackItems(items, sheet, gapMm) {
  const gap = mmToPx(gapMm, sheet.dpi);
  let cursorX = gap;
  let cursorY = gap;
  let rowHeight = 0;
  let overflow = false;

  const packedItems = items.map((item) => {
    const boxWidth = item.width * item.scaleX;
    const boxHeight = item.height * item.scaleY;

    if (cursorX + boxWidth + gap > sheet.widthPx) {
      cursorX = gap;
      cursorY += rowHeight + gap;
      rowHeight = 0;
    }

    if (cursorY + boxHeight + gap > sheet.heightPx) {
      overflow = true;
    }

    const nextItem = {
      ...item,
      x: cursorX,
      y: cursorY,
      rotation: 0,
    };

    cursorX += boxWidth + gap;
    rowHeight = Math.max(rowHeight, boxHeight);

    return nextItem;
  });

  return { items: packedItems, overflow };
}
