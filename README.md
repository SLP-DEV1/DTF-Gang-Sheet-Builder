# DTF Gang Sheet Builder

Browserbasierte React + Vite App zum Erstellen von DTF-Gang-Sheets aus transparenten PNG-Dateien.

## Funktionen

- PNG Upload mit mehreren Dateien gleichzeitig
- Transparente Motive frei platzieren, skalieren, drehen, duplizieren und löschen
- Sheet-Größe in cm mit DPI-basierter Pixelberechnung
- Auto Arrange von links nach rechts mit einstellbarem Abstand
- Export als transparentes PNG in berechneter Pixelgröße
- Projekt als JSON speichern und wieder laden
- Läuft vollständig lokal im Browser, ohne Backend, Datenbank oder API Keys

## Installation

```bash
npm install
npm run dev
```

Danach die lokale Vite-Adresse im Browser öffnen.

## Production Build

```bash
npm run build
npm run preview
```

## GitHub Pages

Das Projekt enthält bereits einen GitHub-Actions-Workflow für GitHub Pages.

Nach dem Push zu GitHub:

1. Repository auf GitHub öffnen
2. **Settings → Pages** öffnen
3. Bei **Build and deployment** als Source **GitHub Actions** wählen
4. Danach erneut auf `main` pushen oder den Workflow manuell starten

Die Vite-Konfiguration nutzt `base: './'`, damit die gebauten Assets auch auf einer GitHub-Pages-Projekt-URL korrekt geladen werden.

## Nutzung

1. Sheet-Breite, Höhe und DPI einstellen.
2. Transparente PNG-Dateien hochladen.
3. Motive auf dem Canvas auswählen und bearbeiten.
4. Optional mit Auto Arrange automatisch anordnen.
5. Als PNG exportieren oder Projekt als JSON speichern.

## Roadmap

- Kollisionsprüfung und visuelle Platzierungswarnungen
- Snap-to-grid und Hilfslinien
- Mehrere Sheet-Vorlagen
- Objektliste mit Ebenensteuerung
- Exakter Größeneditor in cm/mm pro Motiv
- Export-Vorschau vor dem Download
- Warnung bei zu großen Sheets im Browser
- Besseres Nesting mit optionaler Rotation

## Lizenz

MIT
