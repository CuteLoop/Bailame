# Agent guide (Codex / VSCode agents / others)

This file mirrors `CLAUDE.md` so any coding agent has the same context.

## What this is
A p5.js minigame (Vite + Vitest) for the Bailame Latin dance project.

## Layout
- `src/shared/rhythm.js` — pure, testable logic. No p5 / DOM here.
- `src/mini1/main.js` — thin p5 sketch (instance mode): input + drawing only.
- `test/*.test.js` — Vitest specs importing `src/shared/rhythm.js`.

## How to run
- Dev server: `npm run dev`
- Tests (once): `npm run test:run`
- Tests (watch): `npm test`
- Build: `npm run build`

## Conventions
- Add logic to `shared/rhythm.js` with a matching test before wiring it into the sketch.
- Keep functions pure where possible so they can be tested without a browser.
- ES modules (`"type": "module"`). Node 20+.
