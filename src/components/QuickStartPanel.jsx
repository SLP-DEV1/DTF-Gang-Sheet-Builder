const STEPS = [
  'PNG hochladen oder per Drag & Drop ablegen',
  'Sheet-Vorlage wählen und Größe prüfen',
  'Motive platzieren oder Auto Arrange nutzen',
  'Warnungen, Preis und Verbrauch prüfen',
  'PNG, ZIP oder Projektdatei exportieren',
];

const SHORTCUTS = [
  ['Strg + Z', 'Undo'],
  ['Strg + Y', 'Redo'],
  ['Entf', 'Auswahl löschen'],
  ['Strg/Shift + Klick', 'Mehrfachauswahl'],
  ['Strg + V', 'PNG aus Zwischenablage einfügen'],
];

export default function QuickStartPanel() {
  return (
    <section className="panel quickstart-panel">
      <h2>Schnellstart</h2>
      <ol className="compact-list">
        {STEPS.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <details className="details-box">
        <summary>Tastenkürzel anzeigen</summary>
        <dl className="shortcut-list">
          {SHORTCUTS.map(([keys, label]) => (
            <div key={keys}>
              <dt>{keys}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
