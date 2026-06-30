import { calculateConsumption } from '../lib/consumption.js';

const euro = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const FIELDS = [
  ['foilPricePerMeter', 'Folienpreis pro Meter (€)', 0.01],
  ['rollWidthCm', 'Rollenbreite cm', 0.1],
  ['powderGramsPerM2', 'Pulver g pro m2', 1],
  ['powderPricePerKg', 'Pulverpreis pro kg (€)', 0.01],
  ['inkMlPerM2', 'Tinte ml pro m2', 1],
  ['inkPricePerLiter', 'Tintenpreis pro Liter (€)', 0.01],
];

const PRACTICAL_CONSUMPTION_VALUES = {
  foilPricePerMeter: 2.6,
  rollWidthCm: 56,
  powderGramsPerM2: 18,
  powderPricePerKg: 14,
  inkMlPerM2: 10,
  inkPricePerLiter: 55,
};

export default function ConsumptionPanel({ sheet, items, values, onChange }) {
  const result = calculateConsumption({ sheet, values, items });

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
      <button className="button secondary full" type="button" onClick={() => onChange(PRACTICAL_CONSUMPTION_VALUES)}>
        Praxiswerte einsetzen
      </button>
      <dl className="result-list">
        <div>
          <dt>Folienkosten</dt>
          <dd>{euro.format(result.foilCosts)}</dd>
        </div>
        <div>
          <dt>Pulververbrauch</dt>
          <dd>{result.powderGrams.toFixed(1)} g</dd>
        </div>
        <div>
          <dt>Pulverkosten</dt>
          <dd>{euro.format(result.powderCosts)}</dd>
        </div>
        <div>
          <dt>Tintenverbrauch</dt>
          <dd>{result.inkMl.toFixed(1)} ml</dd>
        </div>
        <div>
          <dt>Tintenkosten</dt>
          <dd>{euro.format(result.inkCosts)}</dd>
        </div>
        <div>
          <dt>Gesamt grob</dt>
          <dd>{euro.format(result.totalCosts)}</dd>
        </div>
      </dl>
      <p className="meta small">
        Folie wird nach Sheet-Laenge gerechnet. Pulver und Tinte nutzen die belegte Motivflaeche:{' '}
        {result.printAreaM2.toFixed(3)} m2. Sheet-Flaeche: {result.areaM2.toFixed(3)} m2.
      </p>
    </section>
  );
}
