function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function calculateConsumption({ sheet, values }) {
  const widthCm = numberOrZero(sheet.widthCm);
  const heightCm = numberOrZero(sheet.heightCm);
  const areaM2 = (widthCm * heightCm) / 10000;
  const lengthM = heightCm / 100;
  const rollWidthCm = numberOrZero(values.rollWidthCm) || widthCm;

  const foilCosts = lengthM * numberOrZero(values.foilPricePerMeter);
  const powderGrams = areaM2 * numberOrZero(values.powderGramsPerM2);
  const powderCosts = (powderGrams / 1000) * numberOrZero(values.powderPricePerKg);
  const inkMl = areaM2 * numberOrZero(values.inkMlPerM2);
  const inkCosts = (inkMl / 1000) * numberOrZero(values.inkPricePerLiter);

  return {
    areaM2,
    lengthM,
    rollWidthCm,
    foilCosts,
    powderGrams,
    powderCosts,
    inkMl,
    inkCosts,
    totalCosts: foilCosts + powderCosts + inkCosts,
  };
}
