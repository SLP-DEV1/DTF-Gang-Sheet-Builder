import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateConsumption } from '../src/lib/consumption.js';

const sheet = { widthCm: 56, heightCm: 100, dpi: 300 };
const values = {
  foilPricePerMeter: 2.6,
  rollWidthCm: 56,
  powderGramsPerM2: 18,
  powderPricePerKg: 14,
  inkMlPerM2: 10,
  inkPricePerLiter: 55,
};

test('empty sheets do not consume powder or ink', () => {
  const result = calculateConsumption({ sheet, values, items: [] });

  assert.equal(result.printAreaM2, 0);
  assert.equal(result.powderGrams, 0);
  assert.equal(result.inkMl, 0);
  assert.equal(result.powderCosts, 0);
  assert.equal(result.inkCosts, 0);
  assert.equal(result.foilCosts, 2.6);
});

test('powder and ink are based on occupied artwork area', () => {
  const oneInchSquare = {
    width: 300,
    height: 300,
    scaleX: 1,
    scaleY: 1,
  };
  const result = calculateConsumption({ sheet, values, items: [oneInchSquare] });
  const expectedAreaM2 = (2.54 * 2.54) / 10000;

  assert.ok(Math.abs(result.printAreaM2 - expectedAreaM2) < 1e-10);
  assert.ok(result.powderGrams > 0);
  assert.ok(result.inkMl > 0);
});
