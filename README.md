# DTF Gang Sheet Builder

Browserbasierte React + Vite App zum Erstellen von DTF-Gang-Sheets aus transparenten PNG-Dateien.
Alles laeuft lokal im Browser, ohne Backend, externe Uploads, Datenbank oder API Keys.

## Funktionen

- PNG Upload mit mehreren Dateien gleichzeitig, Drag & Drop und Clipboard-Paste fuer PNG-Bilder
- Warnung bei nicht unterstuetzten Dateitypen und PNGs ohne Transparenz
- Transparente Motive frei platzieren, skalieren, drehen, duplizieren und loeschen
- Undo/Redo fuer Editor-Aktionen per Button, `Strg+Z` und `Strg+Y`
- Mehrfachauswahl per Strg/Shift-Klick mit gemeinsamem Verschieben
- Multi-Select-Werkzeuge fuer links/rechts/oben/unten ausrichten, horizontal/vertikal verteilen sowie gleiche Breite/Hoehe
- Motivgroesse direkt in cm bearbeiten, standardmaessig mit gesperrtem Seitenverhaeltnis
- DPI-/Qualitaetswarnung pro Motiv: niedrig, okay oder gut
- Motivliste mit Vorschaubild, Dateiname, cm-Groesse, Anzahl, Rotation und Schnellaktionen
- Stueckzahlen pro Motivgruppe editieren, inklusive automatischem Duplizieren oder Reduzieren
- Sheet-Vorlagen fuer 56 cm Rolle, 60 cm Rolle, A4, A3 und Custom
- Sheet-Groesse in cm mit DPI-basierter Pixelberechnung
- Besseres Auto-Nesting mit optionaler Groessensortierung und 90-Grad-Rotation
- Auslastung vor/nach Auto Arrange und Warnung, wenn Motive nicht auf das Sheet passen
- Kollisions-, Rand-, Ueberlappungs- und Mindestabstands-Pruefung
- Optionale rote/orange Markierung betroffener Motive im Canvas
- Optionale Abstandslinien und Schneidelinien im Canvas und optional im Export
- Preisrechner fuer Flaeche, Arbeitszeit, Stundensatz, Marge, Mindestpreis und empfohlenen Verkaufspreis
- Preis pro Motivgruppe und Preis pro Stueck
- Grobe Verbrauchsberechnung fuer Folie, Pulver und Tinte
- White-Underbase-Vorschau als reine Anzeigehilfe
- Export-Sicherheitsanzeige mit Pixelgroesse, Megapixeln und geschaetztem RAM-Verbrauch
- Warnung bei sehr grossen Exporten ueber 150 Megapixel
- Export als transparentes PNG mit pHYs-DPI-Metadaten
- ZIP-Export mit `gang-sheet.png`, `project.json`, `summary.json` und `summary.txt`
- Projekt als JSON speichern und wieder laden, inklusive Profi-Einstellungen
- Autosave im Browser mit Wiederherstellen- und Loeschen-Button
- Dark Mode mit Speicherung in `localStorage`


## Installation

```bash
npm install
npm run dev
```

Danach die lokale Vite-Adresse im Browser oeffnen.

## Production Build

```bash
npm run build
npm run preview
```

Beim Build kann wegen der ZIP-Bibliotheken ein Vite-Hinweis zu groesseren Chunks erscheinen. Der Build ist trotzdem gueltig.

## Nutzung

1. Vorlage, Sheet-Breite, Hoehe und DPI einstellen.
2. Transparente PNG-Dateien hochladen, ablegen oder aus der Zwischenablage einfuegen.
3. Motive auf dem Canvas auswaehlen und bearbeiten.
4. Mehrere Motive per Strg/Shift-Klick auswaehlen und gemeinsam ausrichten oder verteilen.
5. Motivgroessen in cm oder per Canvas-Transformation anpassen.
6. Stueckzahlen in der Motivliste festlegen.
7. Optional Auto-Nesting, Rotation, Abstandslinien, Schneidelinien oder White-Underbase-Vorschau aktivieren.
8. Platzierungswarnungen, Preis, Verbrauch und Export-Sicherheit pruefen.
9. Als PNG, ZIP oder Projekt-JSON exportieren.

## Projektdatei

Die gespeicherte JSON-Datei enthaelt neben Sheet und Motiven auch:

- Sheet-Vorlage
- Preisrechner-Werte inklusive Arbeitszeit, Marge und Mindestpreis
- Verbrauchswerte
- Dark-Mode-Einstellung
- Motivgruppen und Stueckzahlen
- Motivgroessen, Rotation und Positionen
- Hilfslinien-Einstellungen
- White-Underbase-Vorschau
- Auto-Nesting-Rotation, Groessensortierung und Abstand

## Export

Vor dem Export zeigt die App die berechnete Pixelgroesse, Megapixel und den ungefaehren RAM-Bedarf an. Auswahlrahmen, Transformer und UI-Hilfsmarkierungen werden beim PNG- und ZIP-Export ausgeblendet. Abstandslinien und Schneidelinien landen nur im Export, wenn der entsprechende Export-Schalter aktiv ist.

## GitHub Pages

Das Projekt enthaelt bereits einen GitHub-Actions-Workflow fuer GitHub Pages.

Nach dem Push zu GitHub:

1. Repository auf GitHub oeffnen
2. **Settings -> Pages** oeffnen
3. Bei **Build and deployment** als Source **GitHub Actions** waehlen
4. Danach erneut auf `main` pushen oder den Workflow manuell starten

Die Vite-Konfiguration nutzt `base: './'`, damit die gebauten Assets auch auf einer GitHub-Pages-Projekt-URL korrekt geladen werden.

## Lizenz

MIT
