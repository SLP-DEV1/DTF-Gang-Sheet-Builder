import { useEffect, useMemo, useRef } from 'react';
import { Image as KonvaImage, Layer, Rect, Stage, Transformer } from 'react-konva';

export default function CanvasEditor({
  items,
  images,
  selectedId,
  sheet,
  onSelect,
  onChangeItem,
  stageRef,
}) {
  const transformerRef = useRef(null);
  const itemRefs = useRef(new Map());

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
    const selectedNode = itemRefs.current.get(selectedId);
    if (transformerRef.current) {
      transformerRef.current.nodes(selectedNode ? [selectedNode] : []);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [items, selectedId]);

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
                  onClick={() => onSelect(item.id)}
                  onTap={() => onSelect(item.id)}
                  onDragEnd={(event) => {
                    onChangeItem(item.id, { x: event.target.x(), y: event.target.y() });
                  }}
                  onTransformEnd={(event) => {
                    const node = event.target;
                    onChangeItem(item.id, {
                      x: node.x(),
                      y: node.y(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                      rotation: node.rotation(),
                    });
                  }}
                />
              );
            })}
            <Transformer
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
        </Stage>
      </div>
    </div>
  );
}
