import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CanvasEditor from './components/CanvasEditor.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import SheetSettings from './components/SheetSettings.jsx';
import Toolbar from './components/Toolbar.jsx';
import UploadPanel from './components/UploadPanel.jsx';
import { exportTransparentPng, downloadDataUrl } from './lib/exportImage.js';
import { autoPackItems } from './lib/packing.js';
import {
  createProjectPayload,
  downloadProjectJson,
  readProjectFile,
} from './lib/projectStorage.js';
import { cmToPx, DEFAULT_DPI } from './lib/units.js';

const initialSettings = {
  widthCm: 56,
  heightCm: 100,
  dpi: DEFAULT_DPI,
};

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [items, setItems] = useState([]);
  const [images, setImages] = useState(new Map());
  const [selectedId, setSelectedId] = useState(null);
  const [gapMm, setGapMm] = useState(5);
  const [arrangeWarning, setArrangeWarning] = useState('');
  const [status, setStatus] = useState('');
  const stageRef = useRef(null);

  const sheet = useMemo(
    () => ({
      ...settings,
      widthPx: cmToPx(settings.widthCm, settings.dpi),
      heightPx: cmToPx(settings.heightCm, settings.dpi),
    }),
    [settings],
  );

  const selectedItem = items.find((item) => item.id === selectedId) || null;

  const updateSettings = (patch) => {
    setSettings((current) => ({
      ...current,
      ...patch,
    }));
  };

  const addImageItems = useCallback(async (files) => {
    const pngFiles = Array.from(files).filter((file) => file.type === 'image/png');
    if (pngFiles.length === 0) return;

    const loaded = await Promise.all(
      pngFiles.map(async (file) => {
        const src = await readFileAsDataUrl(file);
        const image = await loadImage(src);
        const id = makeId();
        return {
          image,
          item: {
            id,
            name: file.name,
            src,
            x: 24,
            y: 24,
            width: image.naturalWidth || image.width,
            height: image.naturalHeight || image.height,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
          },
        };
      }),
    );

    setImages((current) => {
      const next = new Map(current);
      loaded.forEach(({ item, image }) => next.set(item.id, image));
      return next;
    });
    setItems((current) => [...current, ...loaded.map(({ item }) => item)]);
    setSelectedId(loaded[loaded.length - 1].item.id);
    setStatus(`${loaded.length} PNG-Datei(en) geladen.`);
  }, []);

  const handleUpload = async (event) => {
    await addImageItems(event.target.files);
    event.target.value = '';
  };

  const changeItem = (id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateSelected = (patch) => {
    if (!selectedId) return;
    changeItem(selectedId, patch);
  };

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setItems((current) => current.filter((item) => item.id !== selectedId));
    setImages((current) => {
      const next = new Map(current);
      next.delete(selectedId);
      return next;
    });
    setSelectedId(null);
  }, [selectedId]);

  const duplicateSelected = async () => {
    if (!selectedItem) return;
    const id = makeId();
    const nextItem = {
      ...selectedItem,
      id,
      name: `${selectedItem.name} Kopie`,
      x: selectedItem.x + 24,
      y: selectedItem.y + 24,
    };
    const image = await loadImage(nextItem.src);
    setImages((current) => {
      const next = new Map(current);
      next.set(id, image);
      return next;
    });
    setItems((current) => [...current, nextItem]);
    setSelectedId(id);
  };

  const arrangeItems = () => {
    const result = autoPackItems(items, sheet, gapMm);
    setItems(result.items);
    setArrangeWarning(result.overflow ? 'Warnung: Nicht alle Motive passen auf das Sheet.' : '');
  };

  const exportPng = () => {
    const stage = stageRef.current;
    if (!stage) return;
    setSelectedId(null);
    requestAnimationFrame(() => {
      const dataUrl = exportTransparentPng(stage, sheet);
      downloadDataUrl(dataUrl, 'dtf-gang-sheet.png');
    });
  };

  const saveProject = () => {
    downloadProjectJson(createProjectPayload(settings, items));
  };

  const loadProject = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const project = await readProjectFile(file);
      const loadedImages = await Promise.all(
        project.items.map(async (item) => [item.id, await loadImage(item.src)]),
      );
      setSettings(project.sheetSettings);
      setItems(project.items);
      setImages(new Map(loadedImages));
      setSelectedId(null);
      setStatus('Projekt geladen.');
    } catch (error) {
      setStatus(`Projekt konnte nicht geladen werden: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };

  useEffectForDeleteKey(deleteSelected);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>DTF Gang Sheet Builder</h1>
          <p>Lokaler PNG-Editor für transparente DTF-Sheets.</p>
        </div>
        {status ? <span className="status">{status}</span> : null}
      </header>

      <div className="workspace">
        <aside className="side-column">
          <UploadPanel onUpload={handleUpload} onLoadProject={loadProject} />
          <SheetSettings settings={settings} sheetPixels={sheet} onChange={updateSettings} />
        </aside>

        <section className="editor-column">
          <Toolbar
            gapMm={gapMm}
            onGapChange={setGapMm}
            onArrange={arrangeItems}
            warning={arrangeWarning}
          />
          <CanvasEditor
            items={items}
            images={images}
            selectedId={selectedId}
            sheet={sheet}
            onSelect={setSelectedId}
            onChangeItem={changeItem}
            stageRef={stageRef}
          />
        </section>

        <ExportPanel
          selectedItem={selectedItem}
          onDelete={deleteSelected}
          onDuplicate={duplicateSelected}
          onUpdateSelected={updateSelected}
          onExportPng={exportPng}
          onSaveProject={saveProject}
        />
      </div>
    </main>
  );
}

function useEffectForDeleteKey(deleteSelected) {
  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const tagName = document.activeElement?.tagName;
        if (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA') return;
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected]);
}
