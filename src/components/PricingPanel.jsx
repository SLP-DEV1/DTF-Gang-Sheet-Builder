import { calculateGroupPricing, calculatePricing } from '../lib/pricing.js';

const euro = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const PRACTICAL_PRICING_VALUES = {
  pricePerCm2: 0.018,
  laborMinutes: 3,
  hourlyRate: 35,
  marginPercent: 20,
  minimumPrice: 0,
};

export default function PricingPanel({ items, groups, sheet, values, onChange }) {
  const result = calculatePricing({ items, sheet, ...values });
  const groupPricing = calculateGroupPricing(groups, sheet, values);

  return (
    <section className="panel">
      <h2>Preisrechner</h2>
      <label className="field">
        <span>Verkaufspreis pro cm2 (€)</span>
        <input
          type="number"
          min="0"
          step="0.001"
          value={values.pricePerCm2}
          onChange={(event) => onChange({ pricePerCm2: Number(event.target.value) })}
        />
      </label>
      <button className="button secondary full" type="button" onClick={() => onChange(PRACTICAL_PRICING_VALUES)}>
        Praxiswerte einsetzen
      </button>
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
          <dt>Umriss-Fläche (Bounding Box)</dt>
          <dd>{result.occupiedAreaCm2.toFixed(2)} cm2</dd>
        </div>
        {result.alphaPrintedAreaCm2 !== undefined && result.alphaPrintedAreaCm2 !== result.occupiedAreaCm2 ? (
          <div>
            <dt>Tatsächliche Druckfläche (Alpha)</dt>
            <dd>
              {result.alphaPrintedAreaCm2.toFixed(2)} cm2
              {' '}
              <span className="meta small">
                ({((result.alphaPrintedAreaCm2 / result.occupiedAreaCm2) * 100).toFixed(0)}% der Umrissfläche)
              </span>
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Sheet-Fläche</dt>
          <dd>{result.sheetAreaCm2.toFixed(2)} cm2</dd>
        </div>
        <div>
          <dt>Auslastung</dt>
          <dd>{result.utilizationPercent.toFixed(1)}%</dd>
        </div>
        <div>
          <dt>Motivpreis (Umriss)</dt>
          <dd>{euro.format(result.occupiedPrice)}</dd>
        </div>
        {result.alphaMaterialPrice !== undefined && result.alphaMaterialPrice !== result.occupiedPrice ? (
          <div>
            <dt>Motivpreis (Alpha-basiert)</dt>
            <dd>{euro.format(result.alphaMaterialPrice)}</dd>
          </div>
        ) : null}
        <div>
          <dt>Komplettes Sheet</dt>
          <dd>{euro.format(result.fullSheetPrice)}</dd>
        </div>
        <div>
          <dt>Arbeitskosten</dt>
          <dd>{euro.format(result.laborPrice)}</dd>
        </div>
        <div>
          <dt>Mindestpreis</dt>
          <dd>{euro.format(values.minimumPrice)}</dd>
        </div>
        <div>
          <dt>Empf. Verkaufspreis</dt>
          <dd>{euro.format(result.recommendedPrice)}</dd>
        </div>
      </dl>
      <p className="meta small">
        Praxisnaher Startwert: niedriger cm2-Preis plus kurze Rüstzeit. Passe Stundensatz,
        Marge und Mindestpreis an deinen Betrieb an.
      </p>
      {groupPricing.length ? (
        <div className="mini-table">
          {groupPricing.map((group) => (
            <div key={group.key}>
              <span>{group.name}</span>
              <strong>{euro.format(group.groupPrice)} / {euro.format(group.unitPrice)} Stk.</strong>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
