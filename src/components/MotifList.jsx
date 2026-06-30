import { getItemPrintedSizeCm } from '../lib/pricing.js';
import QualityWarning from './QualityWarning.jsx';

export default function MotifList({
  groups,
  sheetDpi,
  selectedId,
  onSelect,
  onDuplicate,
  onDelete,
  onDeleteGroup,
  onQuantityChange,
  onTrimGroup,
}) {
  return (
    <section className="panel">
      <h2>Motivliste</h2>
      {groups.length === 0 ? (
        <p className="meta">Noch keine Motive geladen.</p>
      ) : (
        <div className="motif-list">
          {groups.map((group) => {
            const item = group.items[0];
            const size = getItemPrintedSizeCm(item, sheetDpi);
            return (
              <article
                className={`motif-card ${group.items.some((entry) => entry.id === selectedId) ? 'active' : ''}`}
                key={group.key}
              >
                <img src={item.src} alt="" />
                <div className="motif-info">
                  <strong>{item.name}</strong>
                  <span>
                    {size.widthCm.toFixed(1)} x {size.heightCm.toFixed(1)} cm
                  </span>
                  <span>Anzahl {group.items.length}</span>
                  <span>Rotation {Math.round(item.rotation || 0)} Grad</span>
                  <QualityWarning item={item} dpi={sheetDpi} />
                </div>
                <label className="field compact-field">
                  <span>Anzahl</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={group.items.length}
                    onChange={(event) => onQuantityChange(group.key, Number(event.target.value))}
                  />
                </label>
                <div className="button-row compact-buttons">
                  <button className="button secondary" type="button" onClick={() => onSelect(item.id)}>
                    Auswählen
                  </button>
                  <button className="button secondary" type="button" onClick={() => onDuplicate(item.id)}>
                    Duplizieren
                  </button>
                  {onTrimGroup && (
                    <button className="button secondary" type="button" onClick={() => onTrimGroup(group.key)}>
                      Transparenz trimmen
                    </button>
                  )}
                  <button className="button danger" type="button" onClick={() => onDelete(item.id)}>
                    Löschen
                  </button>
                  <button className="button danger" type="button" onClick={() => onDeleteGroup(group.key)}>
                    Alle löschen
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
