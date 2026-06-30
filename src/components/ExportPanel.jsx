export default function ExportPanel({
  selectedItem,
  onDelete,
  onDuplicate,
  onUpdateSelected,
  onExportPng,
  onSaveProject,
}) {
  return (
    <aside className="side-column">
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
              <span>Skalierung %</span>
              <input
                type="number"
                min="1"
                step="1"
                value={Math.round(selectedItem.scaleX * 100)}
                onChange={(event) => {
                  const scale = Math.max(0.01, Number(event.target.value) / 100);
                  onUpdateSelected({ scaleX: scale, scaleY: scale });
                }}
              />
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
        <h2>Export</h2>
        <button className="button primary" type="button" onClick={onExportPng}>
          Download PNG
        </button>
        <button className="button secondary full" type="button" onClick={onSaveProject}>
          Projekt speichern
        </button>
      </section>
    </aside>
  );
}
