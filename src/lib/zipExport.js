import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { exportTransparentPng } from './exportImage.js';

function dataUrlToBase64(dataUrl) {
  return dataUrl.split(',')[1] || '';
}

export async function exportProjectZip({ stage, sheet, project, summary, includeGuides }) {
  const zip = new JSZip();
  const pngDataUrl = exportTransparentPng(stage, sheet, { includeGuides });

  zip.file('gang-sheet.png', dataUrlToBase64(pngDataUrl), { base64: true });
  zip.file('project.json', JSON.stringify(project, null, 2));
  zip.file('summary.json', JSON.stringify(summary, null, 2));
  zip.file(
    'summary.txt',
    [
      'DTF Gang Sheet Summary',
      `Sheet: ${summary.sheet.widthCm} x ${summary.sheet.heightCm} cm`,
      `DPI: ${summary.sheet.dpi}`,
      `Motive: ${summary.motifs.length}`,
      `Belegte Flaeche: ${summary.pricing.occupiedAreaCm2.toFixed(2)} cm2`,
      `Auslastung: ${summary.pricing.utilizationPercent.toFixed(2)} %`,
      `Preis Motivflaeche: ${summary.pricing.occupiedPrice.toFixed(2)}`,
      `Geschaetzte Gesamtkosten: ${summary.consumption.totalCosts.toFixed(2)}`,
    ].join('\n'),
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'dtf-gang-sheet-export.zip');
}
