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
import TemplateSelector, { TEMPLATES } from './components/TemplateSelector.jsx';
import SheetTabs from './components/SheetTabs.jsx';
import Toolbar from './components/Toolbar.jsx';
import UploadPanel from './components/UploadPanel.jsx';
import { clearAutosave, loadAutosave, saveAutosave } from './lib/autosave.js';
import { calculateConsumption } from './lib/consumption.js';
import { getExportStats } from './lib/exportSafety.js';
import { exportTransparentPng, downloadDataUrl } from './lib/exportImage.js';
import { getBounds, getVisualBox, moveItemBoxTo } from './lib/geometry.js';
import { calculateAlphaRatio, imageHasTransparency, trimTransparency } from './lib/imageAnalysis.js';
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

const defaultSheetConfig = {
  widthCm: 56,
  heightCm: 100,
  dpi: DEFAULT_DPI,
};

let sheetCounter = 0;
function createDefaultSheet(name) {
  sheetCounter++;
  return {
    id: makeId(),
    name: name || `Sheet ${sheetCounter}`,
    ...defaultSheetConfig,
  };
}

const initialPricing = {
  pricePerCm2: 0.018,
  laborMinutes: 3,
  hourlyRate: 35,
  marginPercent: 20,
  minimumPrice: 0,
};

const initialConsumption = {
  foilPricePerMeter: 2.6,
  rollWidthCm: 56,
  powderGramsPerM2: 18,
  powderPricePerKg: 14,
  inkMlPerM2: 10,
  inkPricePerLiter: 55,
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
  const [sheets, setSheets] = useState(() => [createDefaultSheet('Sheet 1')]);
  const [activeSheetId, setActiveSheetId] = useState(() => sheets[0].id);
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
  const activeSheetIdRef = useRef(activeSheetId);
  useEffect(() => { activeSheetIdRef.current = activeSheetId; }, [activeSheetId]);

  // Active Sheet abgeleitet aus sheets[] Array
  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  const sheet = useMemo(
    () => ({
      ...activeSheet,
      widthPx: cmToPx(activeSheet.widthCm, activeSheet.dpi),
      heightPx: cmToPx(activeSheet.heightCm, activeSheet.dpi),
    }),
    [activeSheet],
  );

  // Items nach aktivem Sheet filtern
  const sheetItems = useMemo(
    () => items.filter((item) => item.sheetId === activeSheetId),
    [items, activeSheetId],
  );

  const selectedId = selectedIds[0] || null;
  const selectedItem = items.find((item) => item.id === selectedId) || null;
  const selectedSizeCm = selectedItem
    ? getItemPrintedSizeCm(selectedItem, activeSheet.dpi)
    : { widthCm: 0, heightCm: 0 };
  const motifGroups = useMemo(() => groupItems(sheetItems), [sheetItems]);
  const exportStats = useMemo(() => getExportStats(sheet), [sheet]);
  const placementResult = useMemo(() => checkPlacement(sheetItems, sheet, gapMm), [sheetItems, sheet, gapMm]);

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

  const updateActiveSheet = (patch) => {
    setSheetTemplate('custom');
    setSheets((current) =>
      current.map((s) => (s.id === activeSheetId ? { ...s, ...patch } : s)),
    );
  };

  const updateGuideSettings = (patch) => {
    setGuideSettings((current) => ({ ...current, ...patch }));
  };

  const applyTemplate = (template) => {
    setSheetTemplate(template.id);
    if (template.id === 'custom') return;
    setSheets((current) =>
      current.map((s) =>
        s.id === activeSheetId
          ? { ...s, widthCm: template.widthCm, heightCm: template.heightCm ?? s.heightCm }
          : s,
      ),
    );
  };

  // Sheet-Management
  const addSheet = (template) => {
    const tpl = template || sheetTemplate;
    const matched = TEMPLATES.find((t) => t.id === tpl);
    const newSheet = {
      id: makeId(),
      name: `Sheet ${sheets.length + 1}`,
      widthCm: matched && matched.id !== 'custom' ? matched.widthCm : defaultSheetConfig.widthCm,
      heightCm: (matched && matched.id !== 'custom' ? matched.heightCm : null) ?? defaultSheetConfig.heightCm,
      dpi: defaultSheetConfig.dpi,
    };
    setSheets((current) => [...current, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const deleteSheet = (sheetId) => {
    setSheets((current) => {
      if (current.length <= 1) return current;
      const filtered = current.filter((s) => s.id !== sheetId);
      // Items des gelöschten Sheets entfernen
      setItems((prev) => prev.filter((item) => item.sheetId !== sheetId));
      setImages((prev) => {
        const removeIds = new Set(items.filter((i) => i.sheetId === sheetId).map((i) => i.id));
        const next = new Map(prev);
        removeIds.forEach((id) => next.delete(id));
        return next;
      });
      if (activeSheetId === sheetId && filtered.length > 0) {
        setActiveSheetId(filtered[0].id);
      }
      setSelectedIds([]);
      return filtered;
    });
  };

  const renameSheet = (sheetId, name) => {
    setSheets((current) =>
      current.map((s) => (s.id === sheetId ? { ...s, name } : s)),
    );
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
        const alphaRatio = calculateAlphaRatio(image);
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
            alphaAreaRatio: alphaRatio,
            sheetId: activeSheetIdRef.current,
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
    if (patch.widthCm) nextPatch.scaleX = Math.max(0.01, cmToPx(patch.widthCm, activeSheet.dpi) / selectedItem.width);
    if (patch.heightCm) nextPatch.scaleY = Math.max(0.01, cmToPx(patch.heightCm, activeSheet.dpi) / selectedItem.height);

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

  const trimGroup = async (groupKey) => {
    const group = items.filter((item) => item.groupKey === groupKey);
    if (!group.length) return;
    const source = images.get(group[0].id);
    if (!source) {
      setStatus('Bild konnte nicht geladen werden.');
      return;
    }
    try {
      const trimmed = trimTransparency(source);
      const newSrc = trimmed.dataUrl;
      const newImage = await loadImage(newSrc);

      // Berechne neuen Scale um dieselbe Größe in cm zu behalten
      const oldWidthPx = group[0].width * group[0].scaleX;
      const scaleFactor = oldWidthPx / trimmed.width || 1;
      const newAlphaRatio = calculateAlphaRatio(newImage);

      setImages((current) => {
        const next = new Map(current);
        group.forEach((item) => next.set(item.id, newImage));
        return next;
      });
      applyItemsChange((current) =>
        current.map((item) => {
          if (item.groupKey !== groupKey) return item;
          return {
            ...item,
            src: newSrc,
            width: trimmed.width,
            height: trimmed.height,
            scaleX: scaleFactor,
            scaleY: scaleFactor,
            alphaAreaRatio: newAlphaRatio,
          };
        }),
      );
      setStatus(
        `Transparenz getrimmt: ${trimmed.originalWidth}x${trimmed.originalHeight}px -> ${trimmed.width}x${trimmed.height}px`,
      );
    } catch (error) {
      setStatus(`Trim fehlgeschlagen: ${error.message}`);
    }
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

  const exportAllPng = async () => {
    const stage = stageRef.current;
    if (!stage || sheets.length < 2) return;
    setSelectedIds([]);

    const previousActiveSheetId = activeSheetId;

    for (let i = 0; i < sheets.length; i++) {
      const s = sheets[i];
      // Switch to this sheet and wait for canvas re-render
      setActiveSheetId(s.id);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      runExport(() => {
        const sSheet = {
          ...s,
          widthPx: cmToPx(s.widthCm, s.dpi),
          heightPx: cmToPx(s.heightCm, s.dpi),
        };
        const dataUrl = exportTransparentPng(stage, sSheet, {
          includeGuides: guideSettings.exportGuides,
          includeDpiMetadata: true,
        });
        const safeName = (s.name || `sheet-${i + 1}`).replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '-');
        downloadDataUrl(dataUrl, `${safeName}.png`);
      });

      // Small delay between downloads so the browser doesn't block them
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Restore original active sheet
    setActiveSheetId(previousActiveSheetId);
    setStatus(`${sheets.length} Sheets als PNG exportiert.`);
  };

  const makeProjectPayload = () =>
    createProjectPayload(sheets, activeSheetId, items, {
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
    sheet: activeSheet,
    export: exportStats,
    placement: { issueCount: placementResult.issues.length, summary: placementResult.summary },
    motifs: motifGroups.map((group) => {
      const item = group.items[0];
      return {
        name: item.name,
        quantity: group.items.length,
        sizeCm: getItemPrintedSizeCm(item, activeSheet.dpi),
        rotation: item.rotation,
        quality: calculateEffectiveDpi(item, activeSheet.dpi),
      };
    }),
    pricing: calculatePricing({ items: sheetItems, sheet: activeSheet, ...pricingValues }),
    consumption: calculateConsumption({ sheet: activeSheet, values: consumptionValues, items: sheetItems }),
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
    // Multi-sheet: neue Projekte haben sheets[], alte Projekte nutzen sheetSettings (Legacy-Fallback)
    let loadedSheets;
    let loadedActiveSheetId;
    if (Array.isArray(project.sheets)) {
      loadedSheets = project.sheets;
      loadedActiveSheetId = project.activeSheetId || loadedSheets[0]?.id;
    } else {
      // Legacy-Fallback: altes Format mit sheetSettings
      const legacySheet = project.sheetSettings || defaultSheetConfig;
      loadedSheets = [{ id: makeId(), name: 'Sheet 1', ...legacySheet }];
      loadedActiveSheetId = loadedSheets[0].id;
    }

    const normalizedItems = project.items.map((item) => ({
      ...item,
      groupKey: item.groupKey || item.src,
      originalWidth: item.originalWidth || item.width,
      originalHeight: item.originalHeight || item.height,
      sheetId: item.sheetId || loadedActiveSheetId, // Legacy-Fallback: alle Items auf aktives Sheet
    }));
    const loadedImages = await Promise.all(
      normalizedItems.map(async (item) => [item.id, await loadImage(item.src)]),
    );
    setSheets(loadedSheets);
    setActiveSheetId(loadedActiveSheetId);
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
      const autosave = await loadAutosave();
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

  const removeAutosave = async () => {
    try {
      await clearAutosave();
      setStatus('Autosave gelöscht.');
    } catch (error) {
      setStatus(`Autosave konnte nicht gelöscht werden: ${error.message}`);
    }
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
    const timeout = window.setTimeout(async () => {
      try {
        await saveAutosave(makeProjectPayload());
      } catch (error) {
        setStatus(`Autosave konnte nicht gespeichert werden: ${error.message}`);
      }
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [items, sheets, activeSheetId, pricingValues, consumptionValues, gapMm, allowPackingRotation, sortPackingBySize, guideSettings, darkMode]);

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
          <SheetSettings settings={activeSheet} sheetPixels={sheet} onChange={updateActiveSheet} />
          <ExportSafetyPanel stats={exportStats} />
          <PlacementWarnings
            result={placementResult}
            highlightIssues={highlightIssues}
            onHighlightIssuesChange={setHighlightIssues}
          />
        </aside>

        <section className="editor-column">
          {sheets.length > 0 && (
            <SheetTabs
              sheets={sheets}
              activeId={activeSheetId}
              onSelect={setActiveSheetId}
              onAdd={addSheet}
              onDelete={deleteSheet}
              onRename={renameSheet}
            />
          )}
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
            items={sheetItems}
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
            sheetDpi={activeSheet.dpi}
            selectedId={selectedId}
            onSelect={(id) => selectItem(id)}
            onDuplicate={duplicateItem}
            onDelete={deleteItem}
            onDeleteGroup={deleteGroup}
            onQuantityChange={changeGroupQuantity}
            onTrimGroup={trimGroup}
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
            onExportAllPng={exportAllPng}
            sheetsCount={sheets.length}
            onExportZip={exportZip}
            onSaveProject={saveProject}
            guideSettings={guideSettings}
            onGuideSettingsChange={updateGuideSettings}
          />
          <PricingPanel
            items={sheetItems}
            groups={motifGroups}
            sheet={activeSheet}
            values={pricingValues}
            onChange={(patch) => setPricingValues((current) => ({ ...current, ...patch }))}
          />
          <ConsumptionPanel
            sheet={activeSheet}
            items={sheetItems}
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
