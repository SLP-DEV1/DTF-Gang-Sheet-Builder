import { calculateGroupPricing, calculatePricing } from '../lib/pricing.js';

function money(value) {
  return Number(value).toFixed(2);
}

export default function PricingPanel({ items, groups, sheet, values, onChange }) {
  const result = calculatePricing({ items, sheet, ...values });
  const groupPricing = calculateGroupPricing(groups, sheet, values);

  return (
    <section className="panel">
      <h2>Preisrechner</h2>
      <label className="field">
        <span>Preis pro cm2</span>
        <input
          type="number"
          min="0"
          step="0.001"
          value={values.pricePerCm2}
          onChange={(event) => onChange({ pricePerCm2: Number(event.target.value) })}
        />
      </label>
      <label className="field compact-field">
        <span>Arbeitszeit Minuten</span>
        <input
          type="number"
          min="0"
          step="1"
          value={values.laborMinutes}
          onChange={(event) => onChange({ laborMinutes: Number(event.target.value) })}
        />
      </label>
      <label className="field compact-field">
        <span>Stundensatz</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={values.hourlyRate}
          onChange={(event) => onChange({ hourlyRate: Number(event.target.value) })}
        />
      </label>
      <label className="field compact-field">
        <span>Marge / Gewinnaufschlag %</span>
        <input
          type="number"
          min="0"
          step="1"
          value={values.marginPercent}
          onChange={(event) => onChange({ marginPercent: Number(event.target.value) })}
        />
      </label>
      <label className="field compact-field">
        <span>Mindestpreis</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={values.minimumPrice}
          onChange={(event) => onChange({ minimumPrice: Number(event.target.value) })}
        />
      </label>
      <dl className="result-list">
        <div>
          <dt>Belegte Flaeche</dt>
          <dd>{result.occupiedAreaCm2.toFixed(2)} cm2</dd>
        </div>
        <div>
          <dt>Sheet-Flaeche</dt>
          <dd>{result.sheetAreaCm2.toFixed(2)} cm2</dd>
        </div>
        <div>
          <dt>Auslastung</dt>
          <dd>{result.utilizationPercent.toFixed(1)}%</dd>
        </div>
        <div>
          <dt>Preis Motive</dt>
          <dd>{money(result.occupiedPrice)}</dd>
        </div>
        <div>
          <dt>Komplettes Sheet</dt>
          <dd>{money(result.fullSheetPrice)}</dd>
        </div>
        <div>
          <dt>Arbeitskosten</dt>
          <dd>{money(result.laborPrice)}</dd>
        </div>
        <div>
          <dt>Mindestpreis</dt>
          <dd>{money(values.minimumPrice)}</dd>
        </div>
        <div>
          <dt>Empf. Verkaufspreis</dt>
          <dd>{money(result.recommendedPrice)}</dd>
        </div>
      </dl>
      {groupPricing.length ? (
        <div className="mini-table">
          {groupPricing.map((group) => (
            <div key={group.key}>
              <span>{group.name}</span>
              <strong>{money(group.groupPrice)} / {money(group.unitPrice)} Stk.</strong>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
