# Contributing

Danke, dass du den DTF Gang Sheet Builder verbessern möchtest.

## Lokales Setup

```bash
npm install
npm run dev
```

Vor einem Pull Request bitte prüfen:

```bash
npm run build
```

## Pull-Request-Regeln

- Keine Build-Ordner wie `dist/` committen.
- Keine `node_modules/` committen.
- Keine API-Keys, Tokens oder `.env`-Dateien committen.
- UI-Texte möglichst klar und verständlich halten.
- Neue Berechnungslogik bevorzugt in `src/lib/` auslagern.
- Große UI-Komponenten nach Möglichkeit in kleinere Komponenten teilen.

## Gute Issue-Beschreibungen

Bitte schreibe bei Bugs:

- Browser und Betriebssystem
- Schritte zum Reproduzieren
- Erwartetes Verhalten
- Tatsächliches Verhalten
- Screenshot oder kurze Bildschirmaufnahme, falls möglich

## Feature-Ideen

Gute Features für dieses Projekt sind vor allem Dinge, die DTF-Druckshops im Alltag helfen: bessere Platzierung, klare Kosten, sichere Exporte und weniger manuelle Arbeit.
