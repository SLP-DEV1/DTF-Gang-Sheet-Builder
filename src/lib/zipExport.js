import { exportTransparentPng } from './exportImage.js';

function dataUrlToBase64(dataUrl) {
  return dataUrl.split(',')[1] || '';
}

export async function exportProjectZip({ stage, sheet, project, summary, includeGuides, pngEntries }) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const entries = pngEntries?.length
    ? pngEntries
    : [{ filename: 'gang-sheet.png', dataUrl: exportTransparentPng(stage, sheet, { includeGuides }) }];

  entries.forEach((entry, index) => {
    const filename = entry.filename || `gang-sheet-${index + 1}.png`;
    zip.file(filename, dataUrlToBase64(entry.dataUrl), { base64: true });
  });

  zip.file('project.json', JSON.stringify(project, null, 2));
  zip.file('summary.json', JSON.stringify(summary, null, 2));
  zip.file('summary.txt', buildSummaryText(summary));

  const { saveAs } = await import('file-saver');
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'dtf-gang-sheet-export.zip');
}

function buildSummaryText(summary) {
  if (summary?.type === 'project' && Array.isArray(summary.sheets)) {
    return [
      'DTF Gang Sheet Summary',
      `Erstellt: ${summary.generatedAt}`,
      `Sheets: ${summary.sheetCount}`,
      `Motive gesamt: ${summary.totals.motifCount}`,
      `Belegte Fläche gesamt: ${summary.totals.occupiedAreaCm2.toFixed(2)} cm²`,
      `Alpha-Druckfläche gesamt: ${summary.totals.alphaPrintedAreaCm2.toFixed(2)} cm²`,
      `Empfohlener Verkaufspreis gesamt: ${summary.totals.recommendedPrice.toFixed(2)} EUR`,
      `Geschätzte Kosten gesamt: ${summary.totals.estimatedCosts.toFixed(2)} EUR`,
      `Platzierungsprobleme: ${summary.totals.placementIssues}`,
      '',
      ...summary.sheets.flatMap((entry, index) => [
        `Sheet ${index + 1}: ${entry.name}`,
        `  Größe: ${entry.sheet.widthCm} x ${entry.sheet.heightCm} cm`,
        `  DPI: ${entry.sheet.dpi}`,
        `  Motive: ${entry.motifs.reduce((sum, motif) => sum + motif.quantity, 0)}`,
        `  Belegte Fläche: ${entry.pricing.occupiedAreaCm2.toFixed(2)} cm²`,
        `  Auslastung: ${entry.pricing.utilizationPercent.toFixed(2)} %`,
        `  Preis: ${entry.pricing.recommendedPrice.toFixed(2)} EUR`,
        `  Kosten grob: ${entry.consumption.totalCosts.toFixed(2)} EUR`,
        '',
      ]),
    ].join('\n');
  }

  return [
    'DTF Gang Sheet Summary',
    `Sheet: ${summary.sheet.widthCm} x ${summary.sheet.heightCm} cm`,
    `DPI: ${summary.sheet.dpi}`,
    `Motive: ${summary.motifs.length}`,
    `Belegte Fläche: ${summary.pricing.occupiedAreaCm2.toFixed(2)} cm²`,
    `Alpha-Druckfläche: ${summary.pricing.alphaPrintedAreaCm2.toFixed(2)} cm²`,
    `Auslastung: ${summary.pricing.utilizationPercent.toFixed(2)} %`,
    `Empfohlener Verkaufspreis: ${summary.pricing.recommendedPrice.toFixed(2)} EUR`,
    `Geschätzte Gesamtkosten: ${summary.consumption.totalCosts.toFixed(2)} EUR`,
    `Platzierung: ${summary.placement.summary}`,
  ].join('\n');
}
