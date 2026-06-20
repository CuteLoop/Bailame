# my-p5-app

A p5.js minigame for the **Bailame** Latin dance videogame project. Built with Vite (dev server + bundler) and tested with Vitest.

## Architecture rule (important)

- `src/shared/rhythm.js` — **pure logic only**. No p5, no canvas, no DOM. Everything here is unit-testable in plain Node.
- `src/mini1/main.js` — the p5 sketch (instance mode). Keep it thin: it reads input and draws, delegating all decisions to `shared/rhythm.js`.
- `test/` — Vitest specs that import from `src/shared/rhythm.js`.

When adding a feature, put the logic in `shared/rhythm.js` with a test, then wire it into the sketch.

## Commands

- `npm run dev` — start Vite dev server with live reload (http://localhost:5173)
- `npm test` — Vitest in watch mode
- `npm run test:run` — Vitest once (use this for CI / quick checks)
- `npm run build` — production build to `dist/`

## Debugging

- Browser/sketch: run `npm run dev`, then use the VSCode "Debug p5 sketch (Chrome)" launch config or browser devtools.
- Logic/tests: use the "Debug Vitest" launch config to set breakpoints in `shared/rhythm.js`.

## Audio & calibration (added)

- `src/shared/audio.js` — Web Audio engine. `playCowbell()` is an 808-style beep; this is where salsa instruments (clave, conga, timbal) get added later as more voices. Must be unlocked by a user gesture (`initAudio()` is called on first click/keypress).
- Calibration lives in the sketch as the `CALIBRATE` scene with two passes:
  - **visual** — pulse only, no sound → measures the player's input latency.
  - **audio** — beeps only, no beat visual → measures audio latency.
  - `shared/rhythm.js` `calibrationOffset()` + `deriveOffsets()` turn the two medians into `inputOffset` (subtracted from raw taps when judging) and `audioLeadMs` (how early to fire sound so it's perceived in sync with the animation).
