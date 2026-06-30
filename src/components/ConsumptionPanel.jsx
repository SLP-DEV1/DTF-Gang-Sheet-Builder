import { calculateConsumption } from '../lib/consumption.js';

const FIELDS = [
  ['foilPricePerMeter', 'Folienpreis pro Meter', 0.01],
  ['rollWidthCm', 'Rollenbreite cm', 0.1],
  ['powderGramsPerM2', 'Pulver g pro m2', 1],
  ['powderPricePerKg', 'Pulverpreis pro kg', 0.01],
  ['inkMlPerM2', 'Tinte ml pro m2', 1],
  ['inkPricePerLiter', 'Tintenpreis pro Liter', 0.01],
];

export default function ConsumptionPanel({ sheet, values, onChange }) {
  const result = calculateConsumption({ sheet, values });

  return (
    <section className="panel">
      <h2>Verbrauch</h2>
      {FIELDS.map(([key, label, step]) => (
        <label className="field compact-field" key={key}>
          <span>{label}</span>
          <input
            type="number"
            min="0"
            step={step}
            value={values[key]}
            onChange={(event) => onChange({ [key]: Number(event.target.value) })}
          />
        </label>
      ))}
      <dl className="result-list">
        <div>
          <dt>Folienkosten</dt>
          <dd>{result.foilCosts.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Pulververbrauch</dt>
          <dd>{result.powderGrams.toFixed(1)} g</dd>
        </div>
        <div>
          <dt>Pulverkosten</dt>
          <dd>{result.powderCosts.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Tintenverbrauch</dt>
          <dd>{result.inkMl.toFixed(1)} ml</dd>
        </div>
        <div>
          <dt>Tintenkosten</dt>
          <dd>{result.inkCosts.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Gesamt grob</dt>
          <dd>{result.totalCosts.toFixed(2)}</dd>
        </div>
      </dl>
      <p className="meta small">
        Grobe Rechnung: Sheet-Flaeche {result.areaM2.toFixed(3)} m2, Folienlaenge{' '}
        {result.lengthM.toFixed(2)} m bei {result.rollWidthCm} cm Rolle.
      </p>
    </section>
  );
}
