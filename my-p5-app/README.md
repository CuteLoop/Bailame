# Bailame — minigames

A collection of small p5.js minigames for a Latin dance videogame. Each minigame
is numbered (`mini1`, `mini2`, …) and lives in its own folder; shared engine code
(rhythm logic, audio) lives in `src/shared/` so every mini can reuse it.

## Table of contents

- [Minigames](#minigames)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Shared modules](#shared-modules)
- [Commands](#commands)
- [Debugging](#debugging)
- [Mobile](#mobile)
- [Deploy (GitHub Pages)](#deploy-github-pages)
- [Adding a new minigame](#adding-a-new-minigame)

## Minigames

| #     | Name     | Folder       | Docs                                   | Status |
| ----- | -------- | ------------ | -------------------------------------- | ------ |
| mini1 | Beat Tap | `src/mini1/` | [mini1/README.md](src/mini1/README.md) | Playable MVP |

> Each minigame's README documents its mechanics, controls, calibration, pause/
> mute/menus, module map and function reference.

## Quick start

```bash
npm install      # first time only
npm run dev      # play at http://localhost:5173 (loads mini1)
npm test         # run the test suite
```

Node 20+ required.

## Project structure

```
my-p5-app/
├── index.html              # entry; currently loads src/mini1/main.js
├── src/
│   ├── mini1/
│   │   ├── main.js         # mini1 interface logic (p5 sketch)
│   │   └── README.md       # mini1 documentation
│   └── shared/             # reusable across all minis
│       ├── rhythm.js       # pure timing/judging/scoring/calibration logic
│       └── audio.js        # Web Audio engine (cowbell now, salsa later)
├── test/
│   └── rhythm.test.js      # unit tests for shared/rhythm.js
├── docs/
│   └── MVP-blueprint.md    # original design spec
├── .vscode/                # debug launch configs
├── CLAUDE.md / AGENTS.md   # context for coding agents
└── package.json
```

**Where things live:** interface/presentation logic is per-mini in
`src/mini1/main.js`; reusable game logic is in `src/shared/rhythm.js`; sound is in
`src/shared/audio.js`.

## Shared modules

- **`src/shared/rhythm.js`** — pure, framework-free rhythm engine: beat math,
  target generation, tap judging, scoring/combo, and calibration math. Fully
  unit-tested; safe to import from any mini.
- **`src/shared/audio.js`** — Web Audio synthesis. `playCowbell()` today; salsa
  instruments (clave, conga, timbal) get added here as more voices.

See [mini1/README.md → Reusability notes](src/mini1/README.md#reusability-notes)
for what is shared today and what should be extracted next (UI primitives,
palette, the calibration scene) to make new minis cheaper to build.

## Commands

| Command            | What it does                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | dev server with live reload               |
| `npm test`         | tests in watch mode                       |
| `npm run test:run` | tests once (CI)                           |
| `npm run build`    | production build into `dist/`             |
| `npm run preview`  | serve the production build locally        |

## Debugging

- Sketch in the browser: `npm run dev`, then the VSCode "Debug p5 sketch (Chrome)"
  launch config (or browser devtools).
- Logic/tests: the "Debug Vitest" launch config sets breakpoints in
  `src/shared/rhythm.js`.

## Adding a new minigame

1. Create `src/mini2/main.js` (copy `mini1/main.js` as a starting point).
2. Import `rhythm.js` and `audio.js` from `../shared/`.
3. Point `index.html` at the mini you want to run (or add a chooser later).
4. Add a `src/mini2/README.md` and a row to the [Minigames](#minigames) table.

## Mobile

The game runs on phones in the browser — p5.js has touch built in, so no extra
library is needed. A tap anywhere acts like SPACE, buttons are tappable, the
canvas CSS-scales to fit any screen (keeping its aspect ratio), and audio unlocks
on the first tap (required by iOS Safari). Scroll / zoom / double-tap are blocked
so taps feel like a game rather than a web page.

## Deploy (GitHub Pages)

Deployment is automated by `.github/workflows/deploy.yml` (at the repo root): on
every push to `main` it builds `my-p5-app` and publishes `dist/` to GitHub Pages.

One-time setup on GitHub: **Settings → Pages → Build and deployment → Source:
GitHub Actions**. After the first run the game is live at
`https://<your-user>.github.io/<repo>/` — paste that link into WhatsApp /
Instagram / Messenger and friends play on their phones.

`vite.config.js` uses `base: './'` (relative asset URLs), so the same build also
works at a domain root if you later move to Cloudflare Pages or Netlify.
