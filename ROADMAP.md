# Roadmap

This roadmap is intentionally practical. The goal is to make DTF Gang Sheet Builder more reliable for real production first, then improve workflow speed and nesting quality.

## Reliability and preflight

- Expand regression coverage for packing, project import/export, DPI and pricing calculations.
- Validate imported project data more defensively before applying it to the editor.
- Add clearer handling for artwork that cannot physically fit on the selected sheet.
- Add browser-level smoke tests for upload → arrange → export workflows.

## Editor workflow

- Zoom and pan without changing print dimensions.
- Rulers in mm/cm and configurable grid.
- Snap to grid, sheet edges and nearby artwork.
- Better keyboard shortcuts and discoverability.
- More predictable multi-select distribution and alignment.
- English/German UI localization.

## Nesting and production

- Improve the current shelf-packing strategy with stronger rectangle nesting heuristics.
- Explore alpha/silhouette-aware nesting for irregular transparent artwork.
- Add reusable production presets for common roll widths and RIP workflows.
- Add optional bleed/outline workflows where they are technically appropriate.
- Improve large-sheet export memory behavior and progress feedback.

## Project and export workflow

- Stronger project schema validation and migration tests.
- Import/export presets.
- Better summary reports for multi-sheet jobs.
- Optional printable job sheet with quantities, dimensions and cost summary.

## Project presentation

- Add a short demo GIF and screenshot gallery to the README.
- Publish tagged releases with concise release notes.
- Keep CI green on every pull request.

Contributions are welcome. For large changes, open a feature request first so the implementation direction can be discussed before significant work is duplicated.
