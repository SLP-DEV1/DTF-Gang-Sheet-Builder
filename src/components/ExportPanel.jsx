export default function ExportPanel({
  selectedItem,
  selectedSizeCm,
  aspectUnlocked,
  onAspectUnlockedChange,
  onDelete,
  onDuplicate,
  onUpdateSelected,
  onUpdateSelectedSizeCm,
  onExportPng,
  onExportZip,
  onSaveProject,
  guideSettings,
  onGuideSettingsChange,
}) {
  return (
    <>
      <section className="panel">
        <h2>Objekt</h2>
        {selectedItem ? (
          <>
            <p className="selected-name">{selectedItem.name}</p>
            <label className="field">
              <span>Rotation</span>
              <input
                type="number"
                step="1"
                value={Math.round(selectedItem.rotation)}
                onChange={(event) => onUpdateSelected({ rotation: Number(event.target.value) })}
              />
            </label>
            <label className="field">
              <span>Breite cm</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={selectedSizeCm.widthCm.toFixed(1)}
                onChange={(event) => onUpdateSelectedSizeCm({ widthCm: Number(event.target.value) })}
              />
            </label>
            <label className="field">
              <span>Hoehe cm</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={selectedSizeCm.heightCm.toFixed(1)}
                onChange={(event) => onUpdateSelectedSizeCm({ heightCm: Number(event.target.value) })}
              />
            </label>
            <label className="toggle-line">
              <input
                type="checkbox"
                checked={aspectUnlocked}
                onChange={(event) => onAspectUnlockedChange(event.target.checked)}
              />
              <span>Seitenverhaeltnis entsperren</span>
            </label>
            <div className="button-row">
              <button className="button secondary" type="button" onClick={onDuplicate}>
                Duplizieren
              </button>
              <button className="button danger" type="button" onClick={onDelete}>
                Löschen
              </button>
            </div>
          </>
        ) : (
          <p className="meta">Kein Objekt ausgewählt.</p>
        )}
      </section>

      <section className="panel">
        <h2>Vorschau</h2>
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={guideSettings.whiteUnderbase}
            onChange={(event) => onGuideSettingsChange({ whiteUnderbase: event.target.checked })}
          />
          <span>White Underbase Vorschau</span>
        </label>
        <p className="meta small">
          White-Underbase ist nur Vorschau. Die echte Weissunterlegung macht normalerweise das RIP.
        </p>
      </section>

      <section className="panel">
        <h2>Export</h2>
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={guideSettings.exportGuides}
            onChange={(event) => onGuideSettingsChange({ exportGuides: event.target.checked })}
          />
          <span>Hilfslinien exportieren</span>
        </label>
        <button className="button primary" type="button" onClick={onExportPng}>
          Download PNG
        </button>
        <button className="button secondary full" type="button" onClick={onExportZip}>
          Export ZIP
        </button>
        <button className="button secondary full" type="button" onClick={onSaveProject}>
          Projekt speichern
        </button>
      </section>
    </>
  );
}
