export default function Toolbar({
  gapMm,
  onGapChange,
  onArrange,
  warning,
  allowRotation,
  onAllowRotationChange,
  sortBySize,
  onSortBySizeChange,
  guideSettings,
  onGuideSettingsChange,
}) {
  return (
    <div className="toolbar">
      <label className="field field-inline">
        <span>Abstand mm</span>
        <input
          type="number"
          min="0"
          step="1"
          value={gapMm}
          onChange={(event) => onGapChange(Number(event.target.value))}
        />
      </label>
      <button className="button secondary" type="button" onClick={onArrange}>
        Auto Arrange
      </button>
      <label className="toggle-line">
        <input
          type="checkbox"
          checked={allowRotation}
          onChange={(event) => onAllowRotationChange(event.target.checked)}
        />
        <span>Rotation erlauben</span>
      </label>
      <label className="toggle-line">
        <input
          type="checkbox"
          checked={sortBySize}
          onChange={(event) => onSortBySizeChange(event.target.checked)}
        />
        <span>Nach Groesse sortieren</span>
      </label>
      <label className="toggle-line">
        <input
          type="checkbox"
          checked={guideSettings.showGapLines}
          onChange={(event) => onGuideSettingsChange({ showGapLines: event.target.checked })}
        />
        <span>Abstandslinien</span>
      </label>
      <label className="toggle-line">
        <input
          type="checkbox"
          checked={guideSettings.showCutLines}
          onChange={(event) => onGuideSettingsChange({ showCutLines: event.target.checked })}
        />
        <span>Schneidelinien</span>
      </label>
      {warning ? <span className="warning">{warning}</span> : null}
    </div>
  );
}
