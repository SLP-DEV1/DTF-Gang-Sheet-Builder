import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CanvasEditor from './components/CanvasEditor.jsx';
import ConsumptionPanel from './components/ConsumptionPanel.jsx';
import DarkModeToggle from './components/DarkModeToggle.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import ExportSafetyPanel from './components/ExportSafetyPanel.jsx';
import MotifList from './components/MotifList.jsx';
import MultiSelectPanel from './components/MultiSelectPanel.jsx';
import PlacementWarnings from './components/PlacementWarnings.jsx';
import PricingPanel from './components/PricingPanel.jsx';
import SheetSettings from './components/SheetSettings.jsx';
import TemplateSelector from './components/TemplateSelector.jsx';
import Toolbar from './components/Toolbar.jsx';
import UploadPanel from './components/UploadPanel.jsx';
import { clearAutosave, loadAutosave, saveAutosave } from './lib/autosave.js';
import { calculateConsumption } from './lib/consumption.js';
import { getExportStats } from './lib/exportSafety.js';
import { exportTransparentPng, downloadDataUrl } from './lib/exportImage.js';
import { getBounds, getVisualBox, moveItemBoxTo } from './lib/geometry.js';
import { imageHasTransparency } from './lib/imageAnalysis.js';
import { autoPackItemsWithOptions } from './lib/packing.js';
import { checkPlacement } from './lib/placement.js';
import { calculatePricing, getItemPrintedSizeCm } from './lib/pricing.js';
import {
  createProjectPayload,
  downloadProjectJson,
  readProjectFile,
} from './lib/projectStorage.js';
import { calculateEffectiveDpi } from './lib/quality.js';
import { cmToPx, DEFAULT_DPI } from './lib/units.js';
import { exportProjectZip } from './lib/zipExport.js';

const initialSettings = {
  widthCm: 56,
  heightCm: 100,
  dpi: DEFAULT_DPI,
};

const initialPricing = {
  pricePerCm2: 0.05,
  laborMinutes: 10,
  hourlyRate: 45,
  marginPercent: 30,
  minimumPrice: 15,
};

const initialConsumption = {
  foilPricePerMeter: 4,
  rollWidthCm: 56,
  powderGramsPerM2: 20,
  powderPricePerKg: 18,
  inkMlPerM2: 12,
  inkPricePerLiter: 85,
};

const initialGuideSettings = {
  showGapLines: false,
  showCutLines: false,
  exportGuides: false,
  whiteUnderbase: false,
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [gapMm, setGapMm] = useState(5);
  const [allowPackingRotation, setAllowPackingRotation] = useState(false);
  const [sortPackingBySize, setSortPackingBySize] = useState(true);
  const [guideSettings, setGuideSettings] = useState(initialGuideSettings);
  const [pricingValues, setPricingValues] = useState(initialPricing);
  const [consumptionValues, setConsumptionValues] = useState(initialConsumption);
  const [sheetTemplate, setSheetTemplate] = useState('roll-56');
  const [aspectUnlocked, setAspectUnlocked] = useState(false);
  const [highlightIssues, setHighlightIssues] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dtf-dark-mode') === 'true');
  const [arrangeWarning, setArrangeWarning] = useState('');
  const [status, setStatus] = useState('');
  const [historyVersion, setHistoryVersion] = useState(0);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const stageRef = useRef(null);

  const sheet = useMemo(
    () => ({
      ...settings,
      widthPx: cmToPx(settings.widthCm, settings.dpi),
      heightPx: cmToPx(settings.heightCm, settings.dpi),
    }),
    [settings],
  );

  const selectedId = selectedIds[0] || null;
  const selectedItem = items.find((item) => item.id === selectedId) || null;
  const selectedSizeCm = selectedItem
    ? getItemPrintedSizeCm(selectedItem, settings.dpi)
    : { widthCm: 0, heightCm: 0 };
  const motifGroups = useMemo(() => groupItems(items), [items]);
  const exportStats = useMemo(() => getExportStats(sheet), [sheet]);
  const placementResult = useMemo(() => checkPlacement(items, sheet, gapMm), [items, sheet, gapMm]);

  const pushHistory = (snapshot) => {
    historyRef.current = [...historyRef.current.slice(-49), snapshot.map((item) => ({ ...item }))];
    redoRef.current = [];
    setHistoryVersion((value) => value + 1);
  };

  const applyItemsChange = (updater, record = true) => {
    setItems((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (record && next !== current) pushHistory(current);
      return next;
    });
  };

  const updateSettings = (patch) => {
    setSheetTemplate('custom');
    setSettings((current) => ({ ...current, ...patch }));
  };

  const updateGuideSettings = (patch) => {
    setGuideSettings((current) => ({ ...current, ...patch }));
  };

  const applyTemplate = (template) => {
    setSheetTemplate(template.id);
    if (template.id === 'custom') return;
    setSettings((current) => ({
      ...current,
      widthCm: template.widthCm,
      heightCm: template.heightCm || current.heightCm,
    }));
  };

  const addImageItems = useCallback(async (files) => {
    const fileList = Array.from(files || []);
    const unsupported = fileList.filter((file) => file.type !== 'image/png');
    const pngFiles = fileList.filter((file) => file.type === 'image/png');
    if (pngFiles.length === 0) {
      if (unsupported.length) setStatus('Nur PNG-Dateien werden unterstuetzt.');
      return;
    }

    const transparencyWarnings = [];
    const loaded = await Promise.all(
      pngFiles.map(async (file, index) => {
        const src = await readFileAsDataUrl(file);
        const image = await loadImage(src);
        if (!imageHasTransparency(image)) transparencyWarnings.push(file.name);
        const id = makeId();
        const groupKey = makeId();
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        return {
          image,
          item: {
            id,
            groupKey,
            name: file.name,
            src,
            x: 24 + index * 18,
            y: 24 + index * 18,
            originalWidth: width,
            originalHeight: height,
            width,
            height,
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
    applyItemsChange((current) => [...current, ...loaded.map(({ item }) => item)], false);
    setSelectedIds([loaded[loaded.length - 1].item.id]);
    const messages = [`${loaded.length} PNG-Datei(en) geladen.`];
    if (unsupported.length) messages.push(`${unsupported.length} Datei(en) uebersprungen.`);
    if (transparencyWarnings.length) messages.push(`Warnung: ${transparencyWarnings.join(', ')} hat keine Transparenz.`);
    setStatus(messages.join(' '));
  }, []);

  const handleUpload = async (event) => {
    await addImageItems(event.target.files);
    event.target.value = '';
  };

  const selectItem = (id, additive = false) => {
    if (!id) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds((current) => {
      if (!additive) return [id];
      return current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id];
    });
  };

  const changeItem = (id, patch, record = true) => {
    applyItemsChange((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)), record);
  };

  const changeItems = (patches, record = true) => {
    applyItemsChange(
      (current) => current.map((item) => (patches[item.id] ? { ...item, ...patches[item.id] } : item)),
      record,
    );
  };

  const updateSelected = (patch) => {
    if (!selectedId) return;
    changeItem(selectedId, patch);
  };

  const updateSelectedSizeCm = (patch) => {
    if (!selectedItem) return;
    const nextPatch = {};
    if (patch.widthCm) nextPatch.scaleX = Math.max(0.01, cmToPx(patch.widthCm, settings.dpi) / selectedItem.width);
    if (patch.heightCm) nextPatch.scaleY = Math.max(0.01, cmToPx(patch.heightCm, settings.dpi) / selectedItem.height);

    if (!aspectUnlocked) {
      if (patch.widthCm) nextPatch.scaleY = nextPatch.scaleX;
      if (patch.heightCm) nextPatch.scaleX = nextPatch.scaleY;
    }

    updateSelected(nextPatch);
  };

  const deleteItem = useCallback(
    (id) => {
      const ids = id ? [id] : selectedIds;
      if (!ids.length) return;
      const removeIds = new Set(ids);
      applyItemsChange((current) => current.filter((item) => !removeIds.has(item.id)));
      setSelectedIds((current) => current.filter((entry) => !removeIds.has(entry)));
    },
    [selectedId, selectedIds],
  );

  const duplicateItem = async (id = selectedId) => {
    const source = items.find((item) => item.id === id);
    if (!source) return;
    const newId = makeId();
    const nextItem = {
      ...source,
      id: newId,
      x: source.x + 24,
      y: source.y + 24,
    };
    const image = images.get(source.id) || (await loadImage(source.src));
    setImages((current) => {
      const next = new Map(current);
      next.set(newId, image);
      return next;
    });
    applyItemsChange((current) => [...current, nextItem]);
    setSelectedIds([newId]);
  };

  const deleteGroup = (groupKey) => {
    const ids = new Set(items.filter((item) => item.groupKey === groupKey).map((item) => item.id));
    applyItemsChange((current) => current.filter((item) => !ids.has(item.id)));
    setSelectedIds((current) => current.filter((id) => !ids.has(id)));
  };

  const changeGroupQuantity = async (groupKey, quantity) => {
    const target = Math.max(0, Math.floor(quantity || 0));
    const group = items.filter((item) => item.groupKey === groupKey);
    if (target <= group.length) {
      const removeIds = new Set(group.slice(target).map((item) => item.id));
      applyItemsChange((current) => current.filter((item) => !removeIds.has(item.id)));
      return;
    }

    const source = group[0];
    if (!source) return;
    const clones = Array.from({ length: target - group.length }, (_, index) => ({
      ...source,
      id: makeId(),
      x: source.x + 24 * (index + 1),
      y: source.y + 24 * (index + 1),
    }));
    const image = images.get(source.id) || (await loadImage(source.src));
    setImages((current) => {
      const next = new Map(current);
      clones.forEach((clone) => next.set(clone.id, image));
      return next;
    });
    applyItemsChange((current) => [...current, ...clones]);
  };

  const arrangeItems = () => {
    const result = autoPackItemsWithOptions(items, sheet, gapMm, {
      allowRotation: allowPackingRotation,
      sortBySize: sortPackingBySize,
    });
    applyItemsChange(result.items);
    const utilization = `Auslastung: ${result.beforeUtilization.toFixed(1)}% -> ${result.afterUtilization.toFixed(1)}%.`;
    setArrangeWarning(
      result.overflow
        ? `${utilization} Nicht alle Motive passen auf dieses Sheet. Vorbereitet fuer ca. ${result.sheetsNeededEstimate} Sheets.`
        : utilization,
    );
  };

  const runExport = (callback) => {
    try {
      callback();
      setStatus('Export erstellt.');
    } catch (error) {
      setStatus(`Export fehlgeschlagen: ${error.message}`);
    }
  };

  const exportPng = () => {
    const stage = stageRef.current;
    if (!stage) return;
    setSelectedIds([]);
    requestAnimationFrame(() => {
      runExport(() => {
        const dataUrl = exportTransparentPng(stage, sheet, {
          includeGuides: guideSettings.exportGuides,
          includeDpiMetadata: true,
        });
        downloadDataUrl(dataUrl, 'dtf-gang-sheet.png');
      });
    });
  };

  const makeProjectPayload = () =>
    createProjectPayload(settings, items, {
      sheetTemplate,
      pricingValues,
      consumptionValues,
      darkMode,
      gapMm,
      allowPackingRotation,
      sortPackingBySize,
      guideSettings,
    });

  const makeSummary = () => ({
    sheet: settings,
    export: exportStats,
    placement: { issueCount: placementResult.issues.length, summary: placementResult.summary },
    motifs: motifGroups.map((group) => {
      const item = group.items[0];
      return {
        name: item.name,
        quantity: group.items.length,
        sizeCm: getItemPrintedSizeCm(item, settings.dpi),
        rotation: item.rotation,
        quality: calculateEffectiveDpi(item, settings.dpi),
      };
    }),
    pricing: calculatePricing({ items, sheet: settings, ...pricingValues }),
    consumption: calculateConsumption({ sheet: settings, values: consumptionValues }),
  });

  const saveProject = () => {
    downloadProjectJson(makeProjectPayload());
  };

  const exportZip = async () => {
    if (!stageRef.current) return;
    setSelectedIds([]);
    requestAnimationFrame(async () => {
      try {
        await exportProjectZip({
          stage: stageRef.current,
          sheet,
          project: makeProjectPayload(),
          summary: makeSummary(),
          includeGuides: guideSettings.exportGuides,
        });
        setStatus('ZIP-Export erstellt.');
      } catch (error) {
        setStatus(`ZIP-Export fehlgeschlagen: ${error.message}`);
      }
    });
  };

  const applyProject = async (project) => {
    const normalizedItems = project.items.map((item) => ({
      ...item,
      groupKey: item.groupKey || item.src,
      originalWidth: item.originalWidth || item.width,
      originalHeight: item.originalHeight || item.height,
    }));
    const loadedImages = await Promise.all(
      normalizedItems.map(async (item) => [item.id, await loadImage(item.src)]),
    );
    setSettings(project.sheetSettings || initialSettings);
    setItems(normalizedItems);
    setImages(new Map(loadedImages));
    setSheetTemplate(project.sheetTemplate || 'custom');
    setPricingValues({ ...initialPricing, ...(project.pricingValues || {}) });
    setConsumptionValues({ ...initialConsumption, ...(project.consumptionValues || {}) });
    setGuideSettings({ ...initialGuideSettings, ...(project.guideSettings || {}) });
    setGapMm(project.gapMm ?? 5);
    setAllowPackingRotation(Boolean(project.allowPackingRotation));
    setSortPackingBySize(project.sortPackingBySize ?? true);
    setSelectedIds([]);
    historyRef.current = [];
    redoRef.current = [];
    setHistoryVersion((value) => value + 1);
  };

  const loadProject = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const project = await readProjectFile(file);
      await applyProject(project);
      setStatus('Projekt geladen.');
    } catch (error) {
      setStatus(`Projekt konnte nicht geladen werden: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };

  const restoreAutosave = async () => {
    try {
      const autosave = loadAutosave();
      if (!autosave?.project) {
        setStatus('Kein Autosave gefunden.');
        return;
      }
      await applyProject(autosave.project);
      setStatus(`Autosave wiederhergestellt (${new Date(autosave.savedAt).toLocaleString()}).`);
    } catch (error) {
      setStatus(`Autosave konnte nicht geladen werden: ${error.message}`);
    }
  };

  const removeAutosave = () => {
    clearAutosave();
    setStatus('Autosave geloescht.');
  };

  const undo = useCallback(() => {
    setItems((current) => {
      const previous = historyRef.current.pop();
      if (!previous) return current;
      redoRef.current.push(current.map((item) => ({ ...item })));
      setHistoryVersion((value) => value + 1);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setItems((current) => {
      const next = redoRef.current.pop();
      if (!next) return current;
      historyRef.current.push(current.map((item) => ({ ...item })));
      setHistoryVersion((value) => value + 1);
      return next;
    });
  }, []);

  const runMultiSelectCommand = (command) => {
    const selectedItems = items.filter((item) => selectedIds.includes(item.id));
    if (selectedItems.length < 2) return;
    const bounds = getBounds(selectedItems);
    const sortedX = [...selectedItems].sort((a, b) => getVisualBox(a).x - getVisualBox(b).x);
    const sortedY = [...selectedItems].sort((a, b) => getVisualBox(a).y - getVisualBox(b).y);
    const reference = getVisualBox(selectedItems[0]);

    applyItemsChange((current) =>
      current.map((item) => {
        if (!selectedIds.includes(item.id)) return item;
        const box = getVisualBox(item);
        if (command === 'align-left') return moveItemBoxTo(item, { ...box, x: bounds.x });
        if (command === 'align-right') return moveItemBoxTo(item, { ...box, x: bounds.right - box.width });
        if (command === 'align-top') return moveItemBoxTo(item, { ...box, y: bounds.y });
        if (command === 'align-bottom') return moveItemBoxTo(item, { ...box, y: bounds.bottom - box.height });
        if (command === 'same-width') return { ...item, scaleX: reference.width / item.width };
        if (command === 'same-height') return { ...item, scaleY: reference.height / item.height };
        if (command === 'distribute-x' && sortedX.length > 2) {
          const index = sortedX.findIndex((entry) => entry.id === item.id);
          const step = (bounds.width - box.width) / (sortedX.length - 1);
          return moveItemBoxTo(item, { ...box, x: bounds.x + step * index });
        }
        if (command === 'distribute-y' && sortedY.length > 2) {
          const index = sortedY.findIndex((entry) => entry.id === item.id);
          const step = (bounds.height - box.height) / (sortedY.length - 1);
          return moveItemBoxTo(item, { ...box, y: bounds.y + step * index });
        }
        return item;
      }),
    );
  };

  useEffectForKeys({ deleteSelected: () => deleteItem(), undo, redo });

  useEffect(() => {
    localStorage.setItem('dtf-dark-mode', String(darkMode));
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    const handler = (event) => {
      const files = Array.from(event.clipboardData?.files || []).filter((file) => file.type === 'image/png');
      if (files.length) addImageItems(files);
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [addImageItems]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        saveAutosave(makeProjectPayload());
      } catch {
        setStatus('Autosave konnte nicht gespeichert werden. Browser-Speicher ist moeglicherweise voll.');
      }
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [items, settings, pricingValues, consumptionValues, gapMm, allowPackingRotation, sortPackingBySize, guideSettings, darkMode]);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>DTF Gang Sheet Builder</h1>
          <p>Lokaler PNG-Editor fuer transparente DTF-Sheets.</p>
        </div>
        <div className="header-actions">
          {status ? <span className="status">{status}</span> : null}
          <DarkModeToggle enabled={darkMode} onChange={setDarkMode} />
        </div>
      </header>

      <div className="workspace">
        <aside className="side-column">
          <UploadPanel
            onUpload={handleUpload}
            onDropFiles={addImageItems}
            onLoadProject={loadProject}
            onRestoreAutosave={restoreAutosave}
            onClearAutosave={removeAutosave}
          />
          <TemplateSelector value={sheetTemplate} onChange={applyTemplate} />
          <SheetSettings settings={settings} sheetPixels={sheet} onChange={updateSettings} />
          <ExportSafetyPanel stats={exportStats} />
          <PlacementWarnings
            result={placementResult}
            highlightIssues={highlightIssues}
            onHighlightIssuesChange={setHighlightIssues}
          />
        </aside>

        <section className="editor-column">
          <Toolbar
            gapMm={gapMm}
            onGapChange={setGapMm}
            onArrange={arrangeItems}
            warning={arrangeWarning}
            allowRotation={allowPackingRotation}
            onAllowRotationChange={setAllowPackingRotation}
            sortBySize={sortPackingBySize}
            onSortBySizeChange={setSortPackingBySize}
            guideSettings={guideSettings}
            onGuideSettingsChange={updateGuideSettings}
          />
          <CanvasEditor
            items={items}
            images={images}
            selectedIds={selectedIds}
            sheet={sheet}
            onSelect={selectItem}
            onChangeItem={changeItem}
            onChangeItems={changeItems}
            onBeginInteraction={() => pushHistory(items)}
            stageRef={stageRef}
            guideSettings={guideSettings}
            gapMm={gapMm}
            issueMap={placementResult.itemIssueMap}
            highlightIssues={highlightIssues}
          />
        </section>

        <aside className="side-column">
          <MotifList
            groups={motifGroups}
            sheetDpi={settings.dpi}
            selectedId={selectedId}
            onSelect={(id) => selectItem(id)}
            onDuplicate={duplicateItem}
            onDelete={deleteItem}
            onDeleteGroup={deleteGroup}
            onQuantityChange={changeGroupQuantity}
          />
          <MultiSelectPanel
            selectedCount={selectedIds.length}
            onCommand={runMultiSelectCommand}
            canUndo={historyRef.current.length > 0 || historyVersion < 0}
            canRedo={redoRef.current.length > 0}
            onUndo={undo}
            onRedo={redo}
          />
          <ExportPanel
            selectedItem={selectedItem}
            selectedSizeCm={selectedSizeCm}
            aspectUnlocked={aspectUnlocked}
            onAspectUnlockedChange={setAspectUnlocked}
            onDelete={() => deleteItem()}
            onDuplicate={() => duplicateItem()}
            onUpdateSelected={updateSelected}
            onUpdateSelectedSizeCm={updateSelectedSizeCm}
            onExportPng={exportPng}
            onExportZip={exportZip}
            onSaveProject={saveProject}
            guideSettings={guideSettings}
            onGuideSettingsChange={updateGuideSettings}
          />
          <PricingPanel
            items={items}
            groups={motifGroups}
            sheet={settings}
            values={pricingValues}
            onChange={(patch) => setPricingValues((current) => ({ ...current, ...patch }))}
          />
          <ConsumptionPanel
            sheet={settings}
            values={consumptionValues}
            onChange={(patch) => setConsumptionValues((current) => ({ ...current, ...patch }))}
          />
        </aside>
      </div>
    </main>
  );
}

function groupItems(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.groupKey || item.src;
    if (!groups.has(key)) groups.set(key, { key, items: [] });
    groups.get(key).items.push(item);
  });
  return Array.from(groups.values());
}

function useEffectForKeys({ deleteSelected, undo, redo }) {
  useEffect(() => {
    const handler = (event) => {
      const tagName = document.activeElement?.tagName;
      if (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA') return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') deleteSelected();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected, undo, redo]);
}
