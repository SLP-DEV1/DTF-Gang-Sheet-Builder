const WIDTH_OPTIONS = [30, 33, 56, 60];

export default function SheetSettings({ settings, sheetPixels, onChange }) {
  const isPreset = WIDTH_OPTIONS.includes(Number(settings.widthCm));

  return (
    <section className="panel">
      <h2>Sheet Settings</h2>
      <label className="field">
        <span>Breite</span>
        <select
          value={isPreset ? settings.widthCm : 'custom'}
          onChange={(event) => {
            if (event.target.value === 'custom') return;
            onChange({ widthCm: Number(event.target.value) });
          }}
        >
          {WIDTH_OPTIONS.map((width) => (
            <option key={width} value={width}>
              {width} cm
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </label>
      <label className="field">
        <span>Custom Breite cm</span>
        <input
          type="number"
          min="1"
          step="0.1"
          value={settings.widthCm}
          onChange={(event) => onChange({ widthCm: Number(event.target.value) })}
        />
      </label>
      <label className="field">
        <span>Höhe cm</span>
        <input
          type="number"
          min="1"
          step="0.1"
          value={settings.heightCm}
          onChange={(event) => onChange({ heightCm: Number(event.target.value) })}
        />
      </label>
      <label className="field">
        <span>DPI</span>
        <input
          type="number"
          min="72"
          step="1"
          value={settings.dpi}
          onChange={(event) => onChange({ dpi: Number(event.target.value) })}
        />
      </label>
      <p className="meta">
        Exportgröße: {sheetPixels.widthPx} x {sheetPixels.heightPx} px
      </p>
    </section>
  );
}
