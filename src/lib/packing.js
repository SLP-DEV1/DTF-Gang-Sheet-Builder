import { getVisualBox } from './geometry.js';
import { mmToPx } from './units.js';

export function autoPackItems(items, sheet, gapMm) {
  return autoPackItemsWithOptions(items, sheet, gapMm, { allowRotation: false });
}

export function calculatePackedArea(items) {
  return items.reduce((total, item) => {
    const box = getVisualBox(item);
    return total + box.width * box.height;
  }, 0);
}

export function autoPackItemsWithOptions(items, sheet, gapMm, options = {}) {
  const gap = mmToPx(gapMm, sheet.dpi);
  const beforeUtilization = sheet.widthPx * sheet.heightPx > 0
    ? (calculatePackedArea(items) / (sheet.widthPx * sheet.heightPx)) * 100
    : 0;
  const sortedItems = options.sortBySize
    ? [...items].sort((a, b) => getArea(b) - getArea(a))
    : [...items];

  const shelves = [];
  const packedItems = [];
  const overflowItems = [];

  sortedItems.forEach((item) => {
    const variants = getVariants(item, Boolean(options.allowRotation));
    const placement = findPlacement(variants, shelves, sheet, gap);

    if (!placement) {
      overflowItems.push(item);
      return;
    }

    if (!placement.shelf) {
      shelves.push({
        y: placement.y,
        height: placement.height,
        cursorX: gap + placement.width + gap,
      });
    } else {
      placement.shelf.cursorX += placement.width + gap;
      placement.shelf.height = Math.max(placement.shelf.height, placement.height);
    }

    packedItems.push({
      ...item,
      x: placement.rotation === 90 ? placement.x + placement.width : placement.x,
      y: placement.y,
      rotation: placement.rotation,
    });
  });

  const overflowPlacedBelow = overflowItems.map((item, index) => ({
    ...item,
    x: gap,
    y: sheet.heightPx + gap + index * (getVisualBox(item).height + gap),
  }));
  const nextItems = restoreOriginalOrder([...packedItems, ...overflowPlacedBelow], items);
  const afterUtilization = sheet.widthPx * sheet.heightPx > 0
    ? (calculatePackedArea(packedItems) / (sheet.widthPx * sheet.heightPx)) * 100
    : 0;

  return {
    items: nextItems,
    overflow: overflowItems.length > 0,
    overflowItems,
    beforeUtilization,
    afterUtilization,
    sheetsNeededEstimate: overflowItems.length > 0 ? 2 : 1,
  };
}

function findPlacement(variants, shelves, sheet, gap) {
  let best = null;

  shelves.forEach((shelf) => {
    variants.forEach((variant) => {
      const fitsWidth = shelf.cursorX + variant.width + gap <= sheet.widthPx;
      const fitsHeight = shelf.y + Math.max(shelf.height, variant.height) + gap <= sheet.heightPx;
      if (!fitsWidth || !fitsHeight) return;

      const wastedHeight = Math.max(shelf.height, variant.height) - variant.height;
      const score = shelf.y * 100000 + shelf.cursorX + wastedHeight;
      if (!best || score < best.score) {
        best = { ...variant, x: shelf.cursorX, y: shelf.y, shelf, score };
      }
    });
  });

  const nextY = shelves.length ? Math.max(...shelves.map((shelf) => shelf.y + shelf.height + gap)) : gap;
  variants.forEach((variant) => {
    const fits = gap + variant.width + gap <= sheet.widthPx && nextY + variant.height + gap <= sheet.heightPx;
    if (!fits) return;
    const score = nextY * 100000 + gap;
    if (!best || score < best.score) best = { ...variant, x: gap, y: nextY, score };
  });

  return best;
}

function getVariants(item, allowRotation) {
  const normal = {
    width: item.width * item.scaleX,
    height: item.height * item.scaleY,
    rotation: 0,
  };
  const rotated = {
    width: item.height * item.scaleY,
    height: item.width * item.scaleX,
    rotation: 90,
  };
  return allowRotation && rotated.width < normal.width ? [rotated, normal] : [normal, ...(allowRotation ? [rotated] : [])];
}

function getArea(item) {
  const box = getVisualBox(item);
  return box.width * box.height;
}

function restoreOriginalOrder(packedItems, originalItems) {
  const byId = new Map(packedItems.map((item) => [item.id, item]));
  return originalItems.map((item) => byId.get(item.id) || item);
}
