# Contributing

Thanks for helping improve DTF Gang Sheet Builder. Bug reports, print-workflow feedback, documentation improvements and pull requests are welcome.

## Local setup

Requirements: Node.js 22+ and npm.

```bash
git clone https://github.com/SLP-DEV1/DTF-Gang-Sheet-Builder.git
cd DTF-Gang-Sheet-Builder
npm ci
npm run dev
```

## Before opening a pull request

Run the same checks used by CI:

```bash
npm run check
```

For UI changes, also test the affected workflow manually in a browser and attach a screenshot or short recording when it helps reviewers understand the change.

## Project conventions

- Do not commit `dist/`, `node_modules/`, secrets, tokens or local environment files.
- Keep production calculations in `src/lib/` whenever practical so they remain easy to test.
- Add a regression test when fixing a deterministic calculation or packing bug.
- Prefer focused components over continuously growing `App.jsx`.
- Keep file/project compatibility in mind when changing saved JSON structures.
- Preserve the local-first privacy model; new network dependencies should have a clear reason and discussion first.
- Keep user-facing text concise and production-oriented.

## Good bug reports

Please include:

- browser and operating system
- steps to reproduce
- expected behavior
- actual behavior
- a minimal sample project/artwork description when relevant
- screenshot or short screen recording when useful

Do not upload artwork you do not have permission to share publicly.

## Good feature requests

The most valuable ideas are features that reduce repetitive work in real DTF production: better nesting, safer export/preflight, faster sizing and quantity workflows, reliable project recovery, and clear cost calculations.

Check [ROADMAP.md](ROADMAP.md) before starting a large feature so effort is not duplicated.

## Sprache / Language

Issues and pull requests can be written in **English or German**. English is preferred for reusable technical documentation so the project remains accessible internationally.
