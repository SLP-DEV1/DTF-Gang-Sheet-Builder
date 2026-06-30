# DTF Gang Sheet Builder

[![Deploy to GitHub Pages](https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder/actions/workflows/deploy.yml/badge.svg)](https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder/actions/workflows/deploy.yml)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Built with React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)

Kostenloser, browserbasierter **DTF Gang Sheet Builder** zum Anordnen transparenter PNG-Motive und Exportieren druckfertiger Gang-Sheets.

Die App läuft vollständig lokal im Browser. Es gibt keinen Server-Upload, keine Datenbank, keinen Login und keine API-Keys.

## Live Demo

```text
https://slp-dev1.github.io/DTF-Gang-Sheet-Builder/
```

## Highlights

- PNG Upload mit mehreren Dateien, Drag & Drop und Clipboard-Paste
- Transparente Motive verschieben, skalieren, drehen, duplizieren und löschen
- Motivgröße direkt in Zentimetern bearbeiten
- Größen-Presets für Brust, Rücken, Ärmel, Kinder-Shirt und A4-Breite
- Auto Arrange mit Größensortierung und optionaler 90° Rotation
- Automatische Verteilung auf mehrere Sheets, wenn nicht alles auf ein Sheet passt
- Multi-Sheet Tabs mit Umbenennen, Löschen und neuen Sheet-Vorlagen
- Vorlagen für 56 cm Rolle, 60 cm Rolle, A4, A3 und Custom
- DPI-/Qualitätswarnung pro Motiv
- Transparenz-Trimming pro Motivgruppe
- Kollisions-, Rand-, Überlappungs- und Mindestabstandsprüfung
- Schneidelinien und Abstandslinien optional im Canvas und Export
- Preisrechner mit Arbeitszeit, Stundensatz, Marge und Mindestpreis
- Verbrauchsrechner für Folie, Pulver und Tinte
- Export-Sicherheitsanzeige mit Pixelgröße, Megapixeln und geschätztem RAM-Verbrauch
- PNG-Export mit 300-DPI-Metadaten
- ZIP-Export mit PNG-Dateien, `project.json`, `summary.json` und `summary.txt`
- Projektdatei als JSON speichern und später wieder laden
- IndexedDB-Autosave mit Wiederherstellen- und Löschen-Button
- Dark Mode
- White-Underbase-Vorschau als reine Anzeigehilfe

## Wofür ist das Tool gedacht?

Der Builder ist für kleine DTF-Druckshops, Creator und Hobbydrucker gedacht, die PNG-Motive schnell und platzsparend auf einer Druckfläche vorbereiten möchten.

Typische Workflows:

1. Motive als transparente PNGs hochladen.
2. Sheet-Breite und Sheet-Höhe festlegen.
3. Stückzahlen pro Motivgruppe einstellen.
4. Motive automatisch anordnen lassen.
5. Platzierungswarnungen, Preis und Verbrauch prüfen.
6. Als PNG oder ZIP exportieren.

## Datenschutz

Alle Dateien bleiben lokal im Browser des Nutzers.

Die App:

- lädt keine Motive auf einen Server hoch
- verwendet keine Datenbank
- nutzt keine API-Keys
- speichert keine persönlichen Daten extern
- funktioniert ohne Login

Autosave wird lokal im Browser über IndexedDB gespeichert und kann jederzeit gelöscht werden.

## Installation

```bash
git clone https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder.git
cd DTF-Gang-Sheet-Builder
npm install
npm run dev
```

Danach die angezeigte Vite-Adresse öffnen, zum Beispiel:

```text
http://localhost:5173/
```

## Production Build

```bash
npm run build
npm run preview
```

Der Build erzeugt den Ordner `dist/`. Dieser Ordner wird nicht ins Repository committed, sondern bei GitHub Pages automatisch neu gebaut.

## GitHub Pages Deployment

Das Projekt enthält bereits einen Workflow unter:

```text
.github/workflows/deploy.yml
```

Einrichtung:

1. Repository auf GitHub öffnen.
2. **Settings → Pages** öffnen.
3. Bei **Build and deployment** als Source **GitHub Actions** auswählen.
4. Eine Änderung auf `main` pushen oder den Workflow manuell starten.

Die Vite-Konfiguration nutzt `base: './'`, damit Assets auch unter einer GitHub-Pages-Projekt-URL korrekt geladen werden.

## Projektdatei

Die gespeicherte JSON-Datei enthält unter anderem:

- Sheets und aktive Sheet-Auswahl
- Motive, Positionen, Größen, Rotation und Bilddaten
- Motivgruppen und Stückzahlen
- Preis- und Verbrauchswerte
- Hilfslinien- und Export-Einstellungen
- Auto-Arrange-Einstellungen
- Dark-Mode-Einstellung

## Export

Der ZIP-Export enthält:

```text
gang-sheet.png oder mehrere Sheet-PNGs
project.json
summary.json
summary.txt
```

Bei mehreren Sheets exportiert die App jedes Sheet als eigene PNG-Datei und legt alle Dateien gemeinsam ins ZIP.

## White-Underbase-Hinweis

Die White-Underbase-Funktion ist nur eine Vorschau. Die echte Weißunterlegung und Separation macht normalerweise das RIP oder die DTF-Drucksoftware.

## Tech Stack

- React
- Vite
- Konva / react-konva
- JSZip
- FileSaver
- IndexedDB
- GitHub Actions
- GitHub Pages

## Roadmap

Mögliche nächste Schritte:

- Lineal und Raster in cm/mm
- Snap-to-grid und Snap an andere Motive
- Zoom und Pan im Canvas
- Echte Alpha-Silhouette für White-Underbase statt Bounding-Box-Vorschau
- Bessere Nesting-Algorithmen
- Mehr Exportprofile für unterschiedliche RIPs
- Screenshot/GIF-Demo in der README
- Kleine Test-Suite für cm/mm/DPI-/Preisberechnungen

## Mitmachen

Issues und Pull Requests sind willkommen. Bitte lies vorher [CONTRIBUTING.md](CONTRIBUTING.md).

## Lizenz

MIT License. Details stehen in [LICENSE](LICENSE).
