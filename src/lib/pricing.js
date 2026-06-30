import { pxToCm } from './units.js';

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function getItemPrintedSizeCm(item, dpi) {
  return {
    widthCm: pxToCm(numberOrZero(item.width) * numberOrZero(item.scaleX || 1), dpi),
    heightCm: pxToCm(numberOrZero(item.height) * numberOrZero(item.scaleY || 1), dpi),
  };
}

export function calculateOccupiedAreaCm2(items, dpi) {
  return items.reduce((total, item) => {
    const { widthCm, heightCm } = getItemPrintedSizeCm(item, dpi);
    return total + widthCm * heightCm;
  }, 0);
}

export function calculatePricing({ items, sheet, pricePerCm2, laborMinutes = 0, hourlyRate = 0, marginPercent = 0, minimumPrice = 0 }) {
  const occupiedAreaCm2 = calculateOccupiedAreaCm2(items, sheet.dpi);
  const sheetAreaCm2 = numberOrZero(sheet.widthCm) * numberOrZero(sheet.heightCm);
  const priceRate = numberOrZero(pricePerCm2);
  const materialPrice = occupiedAreaCm2 * priceRate;
  const laborPrice = (numberOrZero(laborMinutes) / 60) * numberOrZero(hourlyRate);
  const basePrice = materialPrice + laborPrice;
  const recommendedPrice = Math.max(numberOrZero(minimumPrice), basePrice * (1 + numberOrZero(marginPercent) / 100));

  return {
    occupiedAreaCm2,
    sheetAreaCm2,
    utilizationPercent: sheetAreaCm2 > 0 ? (occupiedAreaCm2 / sheetAreaCm2) * 100 : 0,
    occupiedPrice: materialPrice,
    fullSheetPrice: sheetAreaCm2 * priceRate,
    laborPrice,
    basePrice,
    recommendedPrice,
  };
}

export function calculateGroupPricing(groups, sheet, values) {
  const total = calculatePricing({ items: groups.flatMap((group) => group.items), sheet, ...values });
  const occupiedArea = total.occupiedAreaCm2 || 1;

  return groups.map((group) => {
    const groupArea = calculateOccupiedAreaCm2(group.items, sheet.dpi);
    const share = groupArea / occupiedArea;
    const groupPrice = total.recommendedPrice * share;
    return {
      key: group.key,
      name: group.items[0]?.name || 'Motiv',
      quantity: group.items.length,
      groupAreaCm2: groupArea,
      groupPrice,
      unitPrice: group.items.length ? groupPrice / group.items.length : 0,
    };
  });
}
