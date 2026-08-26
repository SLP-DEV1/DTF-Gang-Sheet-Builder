import test from 'node:test';
import assert from 'node:assert/strict';

import { checkPlacement } from '../src/lib/placement.js';

const sheet = { widthPx: 100, heightPx: 100, dpi: 25.4 };

function item(id, x, y, width = 20, height = 20) {
  return { id, name: id, x, y, width, height, scaleX: 1, scaleY: 1, rotation: 0 };
}

test('placement reports overlap as an error', () => {
  const result = checkPlacement([item('a', 10, 10), item('b', 20, 20)], sheet, 0);
  assert.ok(result.issues.some((issue) => issue.type === 'overlap' && issue.severity === 'error'));
  assert.equal(result.itemIssueMap.get('a'), 'error');
  assert.equal(result.itemIssueMap.get('b'), 'error');
});

test('placement reports an item outside the sheet', () => {
  const result = checkPlacement([item('outside', 90, 90, 20, 20)], sheet, 0);
  assert.ok(result.issues.some((issue) => issue.type === 'outside' && issue.severity === 'error'));
});
