# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- Pull-request CI for Node 22 with automated tests and production builds
- Regression tests for packing, placement, unit conversion and consumption calculations
- Dependabot configuration for npm and GitHub Actions updates
- Pull request template and dedicated project roadmap
- English-first project documentation and improved website metadata for discoverability

### Fixed

- Auto Arrange can no longer expand an earlier shelf into a later shelf and create overlapping placements
- Empty sheets no longer report full-sheet powder and ink consumption when no artwork is present

### Changed

- Expanded package keywords for DTF, print-shop, prepress and local-first discovery
- Contributing guide now documents the automated quality checks and local-first project conventions

## [0.2.0] - GitHub-ready Release

### Added

- Schnellstart-Panel mit Workflow und Tastenkürzeln
- Motivgrößen-Presets im Objekt-Panel
- Multi-Sheet ZIP-Export mit separaten PNGs pro Sheet
- Projektweite `summary.json` und `summary.txt` im ZIP bei mehreren Sheets
- Meta-Tags und Web-App-Manifest für GitHub Pages
- CONTRIBUTING, SECURITY und Issue Templates

### Changed

- Auto Arrange arbeitet jetzt nur auf dem aktiven Sheet und verschiebt keine Motive anderer Sheets mehr versehentlich
- Auto Arrange verteilt Überlauf automatisch auf neue Sheets
- GitHub README deutlich erweitert und public-tauglich gemacht
- Deutsche UI-Texte an mehreren Stellen mit korrekten Umlauten verbessert
- CSS-Variablen für Sheet Tabs ergänzt

### Fixed

- Undefined CSS custom properties in den Sheet Tabs
- ZIP-Export war vorher auf das aktuell aktive Sheet beschränkt

## [0.1.0] - Initial MVP

### Added

- PNG Upload
- Canvas Editor
- Auto Arrange
- Preisrechner
- Verbrauchsrechner
- Motivliste
- ZIP-Export
- Dark Mode
- Projekt speichern/laden
- GitHub Pages Workflow
