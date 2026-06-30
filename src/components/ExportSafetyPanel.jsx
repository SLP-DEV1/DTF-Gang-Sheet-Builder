export default function ExportSafetyPanel({ stats }) {
  return (
    <section className="panel">
      <h2>Export-Sicherheit</h2>
      <dl className="result-list">
        <div>
          <dt>Pixelgröße</dt>
          <dd>{stats.widthPx} x {stats.heightPx} px</dd>
        </div>
        <div>
          <dt>Megapixel</dt>
          <dd>{stats.megapixels.toFixed(1)} MP</dd>
        </div>
        <div>
          <dt>RAM geschätzt</dt>
          <dd>{stats.ramMb.toFixed(1)} MB</dd>
        </div>
      </dl>
      {stats.isLarge ? (
        <p className="warning">Sehr großer Export: über 150 Megapixel. Der Browser kann dabei an Speichergrenzen kommen.</p>
      ) : null}
    </section>
  );
}
