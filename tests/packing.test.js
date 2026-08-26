import test from 'node:test';
import assert from 'node:assert/strict';

import { boxesOverlap, getVisualBox } from '../src/lib/geometry.js';
import { autoPackItemsWithOptions } from '../src/lib/packing.js';

function item(id, width, height) {
  return {
    id,
    name: id,
    x: 0,
    y: 0,
    width,
    height,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  };
}

const sheet = {
  widthPx: 100,
  heightPx: 100,
  dpi: 300,
};

test('auto pack keeps all placed items inside the sheet', () => {
  const result = autoPackItemsWithOptions(
    [item('a', 30, 20), item('b', 30, 20), item('c', 30, 20)],
    sheet,
    0,
    { sortBySize: false, allowRotation: false },
  );

  assert.equal(result.overflow, false);
  for (const packed of result.items) {
    const box = getVisualBox(packed);
    assert.ok(box.x >= 0);
    assert.ok(box.y >= 0);
    assert.ok(box.x + box.width <= sheet.widthPx);
    assert.ok(box.y + box.height <= sheet.heightPx);
  }
});

test('regression: expanding an earlier shelf must not overlap a later shelf', () => {
  const result = autoPackItemsWithOptions(
    [item('first-row', 50, 20), item('second-row', 100, 20), item('tall-late-item', 50, 40)],
    sheet,
    0,
    { sortBySize: false, allowRotation: false },
  );

  assert.equal(result.overflow, false);
  const boxes = result.items.map(getVisualBox);

  for (let index = 0; index < boxes.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < boxes.length; compareIndex += 1) {
      assert.equal(boxesOverlap(boxes[index], boxes[compareIndex]), false);
    }
  }
});

test('items that cannot fit are reported as overflow', () => {
  const tooLarge = item('too-large', 120, 30);
  const result = autoPackItemsWithOptions([tooLarge], sheet, 0, {
    sortBySize: false,
    allowRotation: false,
  });

  assert.equal(result.overflow, true);
  assert.deepEqual(result.overflowItems.map((entry) => entry.id), ['too-large']);
});
