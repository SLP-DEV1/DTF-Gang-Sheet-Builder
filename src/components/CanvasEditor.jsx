import { useEffect, useMemo, useRef } from 'react';
import { Image as KonvaImage, Layer, Rect, Stage, Transformer } from 'react-konva';
import { getVisualBox } from '../lib/geometry.js';
import { mmToPx } from '../lib/units.js';

export default function CanvasEditor({
  items,
  images,
  selectedIds,
  sheet,
  onSelect,
  onChangeItem,
  onChangeItems,
  onBeginInteraction,
  stageRef,
  guideSettings = {},
  gapMm,
  issueMap,
  highlightIssues,
}) {
  const transformerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const dragStartRef = useRef(null);

  const viewport = useMemo(() => {
    const maxWidth = 980;
    const maxHeight = 760;
    const scale = Math.min(maxWidth / sheet.widthPx, maxHeight / sheet.heightPx, 1);
    return {
      width: Math.max(320, Math.round(sheet.widthPx * scale)),
      height: Math.max(320, Math.round(sheet.heightPx * scale)),
      scale,
    };
  }, [sheet.heightPx, sheet.widthPx]);

  useEffect(() => {
    const selectedNodes = selectedIds.map((id) => itemRefs.current.get(id)).filter(Boolean);
    if (transformerRef.current) {
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [items, selectedIds]);

  return (
    <div className="canvas-shell">
      <div className="canvas-scroll">
        <Stage
          ref={stageRef}
          width={viewport.width}
          height={viewport.height}
          scaleX={viewport.scale}
          scaleY={viewport.scale}
          onMouseDown={(event) => {
            if (event.target === event.target.getStage()) onSelect(null);
          }}
          onTouchStart={(event) => {
            if (event.target === event.target.getStage()) onSelect(null);
          }}
        >
          <Layer>
            <Rect
              name="sheet-background"
              x={0}
              y={0}
              width={sheet.widthPx}
              height={sheet.heightPx}
              fill="#f4f6f8"
              stroke="#c8d0d8"
              strokeWidth={2 / viewport.scale}
              listening={false}
            />
          </Layer>
          <Layer listening={false}>
            {guideSettings.whiteUnderbase
              ? items.map((item) => {
                  const box = getVisualBox(item);
                  return (
                    <Rect
                      key={`underbase-${item.id}`}
                      name="export-preview"
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      fill="#ffffff"
                      opacity={0.82}
                      shadowColor="#ffffff"
                      shadowBlur={10 / viewport.scale}
                      listening={false}
                    />
                  );
                })
              : null}
          </Layer>
          <Layer>
            {items.map((item) => {
              const image = images.get(item.id);
              if (!image) return null;

              return (
                <KonvaImage
                  key={item.id}
                  ref={(node) => {
                    if (node) itemRefs.current.set(item.id, node);
                    else itemRefs.current.delete(item.id);
                  }}
                  image={image}
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  scaleX={item.scaleX}
                  scaleY={item.scaleY}
                  rotation={item.rotation}
                  draggable
                  onClick={(event) => onSelect(item.id, event.evt.shiftKey || event.evt.ctrlKey || event.evt.metaKey)}
                  onTap={() => onSelect(item.id, false)}
                  onDragStart={(event) => {
                    onBeginInteraction();
                    dragStartRef.current = {
                      id: item.id,
                      x: event.target.x(),
                      y: event.target.y(),
                      selected: items
                        .filter((entry) => selectedIds.includes(entry.id))
                        .map((entry) => ({ id: entry.id, x: entry.x, y: entry.y })),
                    };
                  }}
                  onDragMove={(event) => {
                    const start = dragStartRef.current;
                    if (!start || !selectedIds.includes(item.id) || selectedIds.length < 2) return;
                    const dx = event.target.x() - start.x;
                    const dy = event.target.y() - start.y;
                    const patches = {};
                    start.selected
                      .filter((entry) => entry.id !== item.id)
                      .forEach((entry) => {
                        patches[entry.id] = { x: entry.x + dx, y: entry.y + dy };
                      });
                    onChangeItems(patches, false);
                  }}
                  onDragEnd={(event) => {
                    dragStartRef.current = null;
                    onChangeItem(item.id, { x: event.target.x(), y: event.target.y() }, false);
                  }}
                  onTransformStart={onBeginInteraction}
                  onTransformEnd={(event) => {
                    const node = event.target;
                    onChangeItem(item.id, {
                      x: node.x(),
                      y: node.y(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                      rotation: node.rotation(),
                    }, false);
                  }}
                />
              );
            })}
            <Transformer
              name="export-ui"
              ref={transformerRef}
              rotateEnabled
              keepRatio
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 8 || newBox.height < 8) return oldBox;
                return newBox;
              }}
            />
          </Layer>
          <Layer listening={false}>
            {highlightIssues
              ? items.map((item) => {
                  const severity = issueMap?.get(item.id);
                  if (!severity) return null;
                  const box = getVisualBox(item);
                  return (
                    <Rect
                      key={`issue-${item.id}`}
                      name="export-ui"
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      stroke={severity === 'error' ? '#e03131' : '#f08c00'}
                      strokeWidth={3 / viewport.scale}
                      dash={[10 / viewport.scale, 5 / viewport.scale]}
                      listening={false}
                    />
                  );
                })
              : null}
          </Layer>
          <Layer listening={false}>
            {guideSettings.showGapLines || guideSettings.showCutLines
              ? items.flatMap((item) => {
                  const box = getVisualBox(item);
                  const gap = mmToPx(gapMm, sheet.dpi);
                  return [
                    guideSettings.showGapLines ? (
                      <Rect
                        key={`gap-${item.id}`}
                        name="export-guide"
                        x={box.x - gap}
                        y={box.y - gap}
                        width={box.width + gap * 2}
                        height={box.height + gap * 2}
                        stroke="#1f6feb"
                        strokeWidth={1 / viewport.scale}
                        dash={[8 / viewport.scale, 6 / viewport.scale]}
                        opacity={0.35}
                        listening={false}
                      />
                    ) : null,
                    guideSettings.showCutLines ? (
                      <Rect
                        key={`cut-${item.id}`}
                        name="export-guide"
                        x={box.x}
                        y={box.y}
                        width={box.width}
                        height={box.height}
                        stroke="#be3a34"
                        strokeWidth={1 / viewport.scale}
                        opacity={0.55}
                        listening={false}
                      />
                    ) : null,
                  ];
                })
              : null}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
