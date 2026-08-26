# DTF Gang Sheet Builder

[![CI](https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder/actions/workflows/ci.yml/badge.svg)](https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder/actions/workflows/deploy.yml/badge.svg)](https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder/actions/workflows/deploy.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![Local first](https://img.shields.io/badge/privacy-local--first-success.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)

A free, open-source **DTF (Direct-to-Film) gang sheet builder** that runs entirely in your browser. Arrange transparent PNG designs, auto-pack them across one or more sheets, check print quality and spacing, estimate costs, and export print-ready PNG/ZIP files.

**No account. No upload server. No API key. Your artwork stays in your browser.**

[![Open Live Demo](https://img.shields.io/badge/Open-Live_Demo-1f6feb?style=for-the-badge)](https://slp-dev1.github.io/DTF-Gang-Sheet-Builder/)

> The current application UI is German. The repository documentation is English-first so the project is easier to discover and contribute to internationally.

## Why this project?

Most gang-sheet tools are tied to a store, SaaS account, subscription, or upload workflow. This project is intentionally different: it is a lightweight local-first tool that a small print shop, creator, or hobby printer can open and use immediately.

It is useful for:

- DTF print shops preparing roll layouts
- creators producing transfers in-house
- small businesses that want a private offline-style workflow
- developers looking for an open-source React/Konva print-layout project

## Highlights

| Area | What it can do |
| --- | --- |
| Artwork | Multi-PNG upload, drag & drop, clipboard paste, duplicate, delete and transparency trimming |
| Layout | Move, scale, rotate, multi-select, alignment and configurable spacing |
| Auto arrange | Size sorting, optional 90° rotation and automatic distribution across multiple sheets |
| Sheet presets | 56 cm roll, 60 cm roll, A4, A3 and custom sizes |
| Preflight | Effective-DPI warnings, edge checks, overlaps, collisions and minimum-gap checks |
| Production | Optional cut/gap guides, 300-DPI PNG metadata and multi-sheet ZIP export |
| Costing | Material/area pricing, labor, hourly rate, margin and minimum price |
| Consumption | Film length, powder and ink estimates based on occupied artwork area |
| Projects | JSON save/load plus local IndexedDB autosave and restore |
| Privacy | Artwork is processed locally in the browser; no login, database or API keys |

## Quick workflow

1. Open the [live demo](https://slp-dev1.github.io/DTF-Gang-Sheet-Builder/).
2. Drop in transparent PNG designs.
3. Select a roll/sheet preset or enter a custom size.
4. Set quantities and physical print sizes in centimeters.
5. Run **Auto Arrange**.
6. Review DPI, spacing and placement warnings.
7. Export a PNG, all sheets as PNGs, or a ZIP project package.

## Export format

A ZIP export contains the rendered sheet PNG files plus project and production summaries:

```text
01-sheet-name.png
02-sheet-name.png
project.json
summary.json
summary.txt
```

PNG exports include physical-resolution metadata for the configured DPI (300 DPI by default).

## Local-first privacy

Artwork is loaded with browser APIs and stored only in the current browser/project data. The application does not require a backend, account, database, analytics key or image-upload API.

Autosaves are stored locally in IndexedDB and can be removed from the UI at any time.

## Install locally

Requirements: **Node.js 22+** and npm.

```bash
git clone https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder.git
cd DTF-Gang-Sheet-Builder
npm ci
npm run dev
```

Vite will print the local development URL, usually `http://localhost:5173/`.

### Quality checks

```bash
npm test
npm run build
```

Or run both:

```bash
npm run check
```

The test suite uses Node's built-in test runner, so no extra test framework is required.

## Tech stack

- React 18
- Vite 6
- Konva / react-konva
- JSZip
- FileSaver
- IndexedDB
- GitHub Actions
- GitHub Pages

Core calculations live in `src/lib/` so packing, geometry, placement, units, pricing and consumption logic can be tested separately from the React UI.

## Current limitations

- Input artwork is PNG-focused.
- White-underbase display is a preview aid, not RIP separation.
- The browser must hold export-sized canvases in memory; very large sheets can be memory intensive.
- Auto-arrange is a practical shelf-packing strategy, not yet a true irregular alpha-shape nesting engine.

## Roadmap

See [ROADMAP.md](ROADMAP.md). High-value next steps include:

- zoom, pan, rulers and snapping
- stronger nesting/packing strategies
- additional print/RIP export profiles
- more automated tests around project import/export
- English/German UI localization
- a short demo GIF or screenshot gallery

## Contributing

Bug reports, feature ideas and pull requests are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md).

If you are contributing code, please run:

```bash
npm run check
```

before opening a pull request.

## Security

Please do not publish sensitive security reports in a public issue. See [SECURITY.md](SECURITY.md).

## Deutsche Kurzbeschreibung

Der DTF Gang Sheet Builder ist ein kostenloses, browserbasiertes Tool zum Anordnen transparenter PNG-Motive auf DTF-Druckflächen. Motive können automatisch verteilt, auf mehrere Sheets aufgeteilt, auf DPI und Abstände geprüft sowie als PNG oder ZIP exportiert werden. Die Verarbeitung findet lokal im Browser statt.

## License

MIT License. See [LICENSE](LICENSE).

---

If this project saves you time in production, consider giving it a **star**. It helps other DTF makers and print shops discover the project.
