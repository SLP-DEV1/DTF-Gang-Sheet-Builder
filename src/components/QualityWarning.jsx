import { calculateEffectiveDpi } from '../lib/quality.js';

export default function QualityWarning({ item, dpi }) {
  if (!item) return null;
  const quality = calculateEffectiveDpi(item, dpi);

  return (
    <span className={`quality-badge ${quality.level}`}>
      {Math.round(quality.dpi)} DPI - {quality.label}
    </span>
  );
}
