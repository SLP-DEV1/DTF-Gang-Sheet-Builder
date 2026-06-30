# Alpha-basierte Druckflaechenberechnung

Berechnet die tatsaechliche gedruckte Flaeche basierend auf nicht-transparenten Pixeln statt der Bounding-Box-Umrissflaeche. Wichtig fuer realistische DTF-Preisberechnungen, da transparente Bereiche innerhalb des Motivs keine Farbe verbrauchen.

## Warum

Die Standard-Bounding-Box-Methode (`width × height`) ueberschaetzt den Materialverbrauch bei Motiven mit transparenten Loechern oder unregelmäßigen Formen (z.B. Logos, Schriftzug-Umrisse). Die Alpha-basierte Berechnung liefert realistischere Werte.

## Architektur (3-Schicht-Ansatz)

### 1. Pixel-Scan in imageAnalysis.js

```js
export function calculateAlphaRatio(image) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true }); // wichtig für Performance!
  context.drawImage(image, 0, 0);
  const data = context.getImageData(0, 0, width, height).data;

  let alphaPixels = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) alphaPixels++; // Alpha-Kanal bei Index+3
  }
  return totalPixels > 0 ? alphaPixels / totalPixels : 1;
}
```

**Wichtig:** `willReadFrequently: true` verhindert Canvas-Dekopplung und beschleunigt getImageData. Ohne diesen Flag wird der Scan auf groessen Bildern extrem langsam.

### 2. Ratio als Item-Metadaten speichern

Speichere das Ergebnis beim Laden des Bildes (nicht bei jedem Pricing-Recalculation):

```js
// In addImageItems:
const alphaRatio = calculateAlphaRatio(image); // synchron, Canvas-basiert
return { ...item, alphaAreaRatio: alphaRatio };

// In trimGroup (nach Trimmen neu berechnen):
const newAlphaRatio = calculateAlphaRatio(newImage);
```

**Warum nicht bei jeder Berechnung neu scannen?** Canvas-Scan ist teuer (O(width×height)). Das Ratio einmal beim Laden/Trimmen berechnen und auf dem Item speichern spart Rechenzeit bei jedem Pricing-Update.

### 3. Alpha-faktorierte Flaeche in pricing.js

```js
export function calculateAlphaPrintedAreaCm2(items, dpi) {
  return items.reduce((total, item) => {
    const { widthCm, heightCm } = getItemPrintedSizeCm(item, dpi);
    const ratio = Number.isFinite(item.alphaAreaRatio) ? item.alphaAreaRatio : 1; // fallback fuer alte Items
    return total + widthCm * heightCm * ratio;
  }, 0);
}
```

**Rueckwaertskompatibilitaet:** `Number.isFinite(item.alphaAreaRatio)` faellt auf Ratio=1 zurueck wenn ein altes Item (vor Feature-Einfuehrung) geladen wird.

## UI-Anzeige in PricingPanel.jsx

Beide Werte nebeneinander anzeigen:
- **Umriss-Flaeche** (Bounding Box, bisheriger Standard)
- **Tatsaechliche Druckflaeche (Alpha)** mit Prozentangabe zur Umrissflaeche
- **Motivpreis (Alpha-basiert)** als separater Preis

Nur anzeigen wenn `alphaPrintedAreaCm2 !== occupiedAreaCm2` (spart Platz bei vollstaendigen Bildern ohne Transparenz).

## Wann anwenden

- DTF/DTG Druckkostenberechnung
- Materialverbrauchsschaetzung fuer transparente Grafiken
- Jeder Kontext wo Bounding-Box-Flaeche ungenau ist weil transparente Bereiche enthalten sind
