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

## Lizenz

MIT
