export default function Toolbar({ gapMm, onGapChange, onArrange, warning }) {
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
      {warning ? <span className="warning">{warning}</span> : null}
    </div>
  );
}
