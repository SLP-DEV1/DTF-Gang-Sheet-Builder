---
name: multi-sheet-export
description: Export all sheets as individual PNG files by iterating over the sheets array and reusing exportTransparentPng per sheet
source: auto-skill
extracted-at: '2026-06-30T17:03:20.062Z'
---

## Procedure for multi-sheet PNG export in DTF Gang Sheet Builder

When the user wants to export all sheets as separate PNG files (not just the active sheet), follow this pattern:

### 1. Create an async `exportAllPng` function in `App.jsx`

```jsx
const exportAllPng = async () => {
  const stage = stageRef.current;
  if (!stage || sheets.length < 2) return; // Guard: only useful with 2+ sheets
  setSelectedIds([]);

  const previousActiveSheetId = activeSheetId;

  for (let i = 0; i < sheets.length; i++) {
    const s = sheets[i];
    setActiveSheetId(s.id);
    // Wait two frames for canvas to re-render with the new sheet's items
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    runExport(() => {
      const sSheet = { ...s, widthPx: cmToPx(s.widthCm, s.dpi), heightPx: cmToPx(s.heightCm, s.dpi) };
      const dataUrl = exportTransparentPng(stage, sSheet, {
        includeGuides: guideSettings.exportGuides,
        includeDpiMetadata: true,
      });
      const safeName = (s.name || `sheet-${i + 1}`).replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '-');
      downloadDataUrl(dataUrl, `${safeName}.png`);
    });

    // Delay between downloads so the browser does not block consecutive file downloads
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  setActiveSheetId(previousActiveSheetId); // Restore original active sheet
};
```

### Key details

- **Guard clause**: `sheets.length < 2` — single-sheet projects already have the regular "Download PNG" button.
- **Double `requestAnimationFrame`**: One frame is not enough for the canvas to re-render after `setActiveSheetId`. Two frames ensure the stage has drawn the new sheet's items before export.
- **300ms inter-download delay**: Browsers may block or merge consecutive programmatic downloads. A short pause prevents this.
- **Safe filename**: Strip non-alphanumeric characters (except German umlauts and hyphens) from sheet names for clean filenames.
- **Restore active sheet**: After the loop, switch back to the originally active sheet so the user's view is unchanged.

### 2. Wire the prop through `ExportPanel`

Pass two props from `App.jsx`:

```jsx
<ExportPanel onExportAllPng={exportAllPng} sheetsCount={sheets.length} ... />
```

In `ExportPanel.jsx`, destructure both and render conditionally:

```jsx
{sheetsCount > 1 && (
  <button className="button secondary full" type="button" onClick={onExportAllPng}>
    Alle {sheetsCount} Sheets als PNG exportieren
  </button>
)}
```

### Why this approach

- Reuses the existing `exportTransparentPng` and `runExport` pipeline — no new rendering logic needed.
- Each sheet gets its own DPI metadata, guide settings, and filename derived from the sheet name.
- The user sees a progress status message after all downloads complete.
