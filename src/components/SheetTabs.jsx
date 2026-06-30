import { useState } from 'react';
import { TEMPLATES } from './TemplateSelector.jsx';

export default function SheetTabs({ sheets, activeId, onSelect, onAdd, onDelete, onRename }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startRename = (sheet) => {
    setEditingId(sheet.id);
    setEditName(sheet.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setEditingId(null); setEditName(''); }
  };

  return (
    <div className="sheet-tabs">
      <div className="sheet-tab-list">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={`sheet-tab ${sheet.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(sheet.id)}
          >
            {editingId === sheet.id ? (
              <input
                type="text"
                className="sheet-tab-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleKeyDown}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="sheet-tab-name">{sheet.name}</span>
                {sheets.length > 1 && (
                  <button
                    className="sheet-tab-delete"
                    title="Sheet loeschen"
                    onClick={(e) => { e.stopPropagation(); onDelete(sheet.id); }}
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div className="sheet-tab-actions">
        <select
          id="add-sheet-template"
          title="Sheet-Vorlage zum Hinzufuegen"
          defaultValue={TEMPLATES[0].id}
        >
          {TEMPLATES.filter((t) => t.id !== 'custom').map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <button
          title="Neues Sheet hinzufuegen"
          onClick={() => {
            const sel = document.getElementById('add-sheet-template');
            onAdd(sel?.value || TEMPLATES[0].id);
          }}
        >
          + Sheet
        </button>
        {sheets.length > 1 && (
          <span className="sheet-tab-count">{sheets.length} Sheets</span>
        )}
      </div>
    </div>
  );
}
