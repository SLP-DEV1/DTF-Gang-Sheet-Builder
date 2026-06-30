export default function MultiSelectPanel({ selectedCount, onCommand, canUndo, canRedo, onUndo, onRedo }) {
  return (
    <section className="panel">
      <h2>Mehrfachauswahl</h2>
      <p className="meta">{selectedCount} Motiv(e) ausgewählt.</p>
      <div className="button-row compact-buttons">
        <button className="button secondary" type="button" onClick={() => onCommand('align-left')} disabled={selectedCount < 2}>
          Links
        </button>
        <button className="button secondary" type="button" onClick={() => onCommand('align-right')} disabled={selectedCount < 2}>
          Rechts
        </button>
        <button className="button secondary" type="button" onClick={() => onCommand('align-top')} disabled={selectedCount < 2}>
          Oben
        </button>
        <button className="button secondary" type="button" onClick={() => onCommand('align-bottom')} disabled={selectedCount < 2}>
          Unten
        </button>
        <button className="button secondary" type="button" onClick={() => onCommand('distribute-x')} disabled={selectedCount < 3}>
          H verteilen
        </button>
        <button className="button secondary" type="button" onClick={() => onCommand('distribute-y')} disabled={selectedCount < 3}>
          V verteilen
        </button>
        <button className="button secondary" type="button" onClick={() => onCommand('same-width')} disabled={selectedCount < 2}>
          Gleiche Breite
        </button>
        <button className="button secondary" type="button" onClick={() => onCommand('same-height')} disabled={selectedCount < 2}>
          Gleiche Höhe
        </button>
      </div>
      <div className="button-row history-buttons">
        <button className="button secondary" type="button" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button className="button secondary" type="button" onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
      </div>
    </section>
  );
}
