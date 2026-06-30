import { distanceBetweenBoxes, getVisualBox, boxesOverlap } from './geometry.js';
import { mmToPx } from './units.js';

export function checkPlacement(items, sheet, gapMm) {
  const gap = mmToPx(gapMm, sheet.dpi);
  const issues = [];
  const itemIssueMap = new Map();

  function addIssue(ids, type, message, severity = 'warning') {
    issues.push({ ids, type, message, severity });
    ids.forEach((id) => {
      const current = itemIssueMap.get(id);
      if (current === 'error' || severity === 'error') itemIssueMap.set(id, severity);
      else itemIssueMap.set(id, severity);
    });
  }

  const boxes = items.map((item) => ({ item, box: getVisualBox(item) }));

  boxes.forEach(({ item, box }) => {
    if (box.x < 0 || box.y < 0 || box.x + box.width > sheet.widthPx || box.y + box.height > sheet.heightPx) {
      addIssue([item.id], 'outside', `${item.name} liegt ausserhalb vom Sheet.`, 'error');
    }

    if (box.x < gap || box.y < gap || sheet.widthPx - (box.x + box.width) < gap || sheet.heightPx - (box.y + box.height) < gap) {
      addIssue([item.id], 'edge-gap', `${item.name} ist zu nah am Rand.`, 'warning');
    }
  });

  for (let index = 0; index < boxes.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < boxes.length; compareIndex += 1) {
      const first = boxes[index];
      const second = boxes[compareIndex];
      if (boxesOverlap(first.box, second.box)) {
        addIssue([first.item.id, second.item.id], 'overlap', `${first.item.name} ueberlappt mit ${second.item.name}.`, 'error');
        continue;
      }
      if (distanceBetweenBoxes(first.box, second.box) < gap) {
        addIssue([first.item.id, second.item.id], 'gap', `${first.item.name} ist zu nah an ${second.item.name}.`, 'warning');
      }
    }
  }

  return {
    issues,
    itemIssueMap,
    summary: issues.length ? `${issues.length} Platzierungsproblem(e) gefunden.` : 'Keine Platzierungsprobleme gefunden.',
  };
}
