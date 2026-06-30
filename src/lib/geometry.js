export function getVisualBox(item) {
  const width = item.width * item.scaleX;
  const height = item.height * item.scaleY;
  const rotation = Math.round((((item.rotation || 0) % 360) + 360) % 360);

  if (rotation === 90) return { x: item.x - height, y: item.y, width: height, height: width };
  if (rotation === 180) return { x: item.x - width, y: item.y - height, width, height };
  if (rotation === 270) return { x: item.x, y: item.y - width, width: height, height: width };
  return { x: item.x, y: item.y, width, height };
}

export function boxesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function distanceBetweenBoxes(a, b) {
  const dx = Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width), 0);
  const dy = Math.max(b.y - (a.y + a.height), a.y - (b.y + b.height), 0);
  return Math.sqrt(dx * dx + dy * dy);
}

export function getBounds(items) {
  const boxes = items.map(getVisualBox);
  if (boxes.length === 0) return null;
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: left, y: top, width: right - left, height: bottom - top, right, bottom };
}

export function moveItemBoxTo(item, nextBox) {
  const box = getVisualBox(item);
  return {
    ...item,
    x: item.x + (nextBox.x - box.x),
    y: item.y + (nextBox.y - box.y),
  };
}
