import test from 'node:test';
import assert from 'node:assert/strict';

import { cmToPx, mmToPx, pxToCm } from '../src/lib/units.js';

test('physical unit conversions are consistent at 300 DPI', () => {
  assert.equal(cmToPx(2.54, 300), 300);
  assert.equal(mmToPx(25.4, 300), 300);
  assert.ok(Math.abs(pxToCm(300, 300) - 2.54) < 1e-10);
});

test('unit helpers reject non-finite values safely', () => {
  assert.equal(cmToPx('not-a-number', 300), 0);
  assert.equal(mmToPx(10, Number.NaN), 0);
  assert.equal(pxToCm(100, 0), 0);
});
