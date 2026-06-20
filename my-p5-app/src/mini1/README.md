# mini1 — Beat Tap

A rhythm minigame: pick a tempo (BPM) and how many taps per *compás*, then press
**SPACE** on each beat. Taps are judged against a timing tolerance, with a sound
(cowbell) on every beat. First minigame of the **Bailame** Latin dance project.

## Table of contents

- [How to play](#how-to-play)
- [Controls](#controls)
- [Game mechanics](#game-mechanics)
- [Calibration](#calibration)
- [Pause, mute & menus](#pause-mute--menus)
- [Mobile / touch](#mobile--touch)
- [Module map (where each part lives)](#module-map-where-each-part-lives)
- [Function reference](#function-reference)
- [Reusability notes](#reusability-notes)

---

## How to play

1. Run the dev server from the project root: `npm run dev`, open http://localhost:5173.
2. On the **menu**, set **BPM**, **taps per compás** (1, 2 or 4) and **measures** (length).
3. (Recommended) press **Calibrate** first — see [Calibration](#calibration).
4. Press **Start**. A center ring is your target; cyan rings fly inward and a
   cowbell sounds on each beat.
5. Press **SPACE** the instant a ring reaches the center / the beep hits.
6. At the end you get a **results** screen: tier counts, accuracy and best combo.

## Controls

| Context  | Input            | Action                          |
| -------- | ---------------- | ------------------------------- |
| Menu     | `←` / `→`        | BPM −5 / +5                     |
| Menu     | `1` / `2` / `4`  | taps per compás                 |
| Menu     | `↑` / `↓`        | measures + / −                  |
| Menu     | `C`              | open calibration                |
| Menu     | `M`              | toggle sound                    |
| Menu     | `ENTER` / `SPACE`| start                           |
| Playing  | `SPACE`          | tap on the beat                 |
| Playing  | `P` / `ESC`      | pause / resume                  |
| Playing  | `M`              | toggle sound                    |
| Calibrate| `SPACE`          | tap (visual or audio pass)      |
| Calibrate| `ESC`            | cancel back to menu             |
| Results  | `ENTER` / `SPACE`| play again                      |
| Results  | `ESC`            | back to menu                    |

All buttons are also clickable with the mouse.

## Game mechanics

**Timing.** One *compás* = one 4/4 measure = 4 beats.

```
beatMs   = 60000 / bpm
targetMs = beatMs * 4 / perMeasure   // gap between the beats you tap
```

| Taps per compás | Beats hit | At 120 BPM |
| --------------- | --------- | ---------- |
| 1               | 1         | 2000 ms    |
| 2               | 1 & 3     | 1000 ms    |
| 4               | 1,2,3,4   | 500 ms     |

Targets are generated up front as a list of timestamps (`buildTargets`).

**Tolerance tiers** (ms from the exact beat, in `rhythm.js > TIERS`):

| Tier    | Window   | Points |
| ------- | -------- | ------ |
| PERFECT | ≤ 40 ms  | 100    |
| GOOD    | ≤ 90 ms  | 50     |
| OK      | ≤ 140 ms | 20     |
| MISS    | > 140 ms | 0      |

`HIT_WINDOW` (140 ms) is the outer edge. A tap beyond it from any beat is a
miss that **does not** consume a target. A beat you never tap auto-misses once
its window passes. Combo increases on any hit and resets to 0 on a miss.

## Calibration

Two short passes at a steady 100 BPM remove input/output lag so beats feel right.

1. **Visual pass** — a circle pulses, **no sound**. Tap with the pulse. Measures
   how late/early you tap relative to what you *see* (your input latency).
2. **Audio pass** — beeps play, **no beat animation**. Tap with each beep.
   Measures your timing relative to what you *hear* (includes audio output lag).

Each pass takes the **median** tap offset (`calibrationOffset`, wild taps beyond
half a beat are dropped). `deriveOffsets` then produces:

- **`inputOffset`** = visual offset — subtracted from every raw tap when judging,
  so a consistently-late player gets centered. (The game is visually led.)
- **`audioLeadMs`** = audioOffset − visualOffset — how much **earlier** the
  cowbell fires than the visual beat, so sound is *perceived* in sync with the
  animation.

Both feed straight into the PLAYING scene. The menu shows the calibrated values
and a pulsing tip until you've calibrated.

## Pause, mute & menus

- **Scenes / menus** (state machine in `main.js`): `MENU → CALIBRATE → PLAYING → RESULTS`.
  `scene` holds the current one; `p.draw` dispatches to the matching `draw*()`.
- **Pause** (`P` or `ESC` while playing): freezes the clock by reading a frozen
  `now = pauseAt - round.startMs`, and skips sound + miss-resolution while paused.
  On resume, `round.startMs` is shifted forward by the paused duration so timing
  stays exact. The overlay offers **Resume / Restart / Quit to Menu**.
- **Mute** (`M`, or the SOUND ON/OFF toggle on the menu): `cfg.muted` gates every
  `playCowbell()` call. State persists across scenes for the session.

## Module map (where each part lives)

```
my-p5-app/
├── index.html                 # entry; loads src/mini1/main.js
├── src/
│   ├── mini1/
│   │   ├── main.js            # INTERFACE LOGIC for mini1 (this game)
│   │   └── README.md          # this file
│   └── shared/                # REUSABLE across all minis
│       ├── rhythm.js          # GAME LOGIC: pure timing/judging/scoring/calibration
│       └── audio.js           # AUDIO ENGINE: cowbell now, salsa instruments later
└── test/
    └── rhythm.test.js         # unit tests for rhythm.js
```

- **Interface logic** → `src/mini1/main.js`. p5 sketch: scenes, drawing,
  input handling, UI widgets, sound triggering, pause. Mini-specific.
- **Game logic** → `src/shared/rhythm.js`. Pure functions, no p5/DOM, unit-tested.
- **Audio** → `src/shared/audio.js`. Web Audio synthesis.

## Function reference

### `src/shared/rhythm.js` (pure, reusable)

| Export | Purpose |
| ------ | ------- |
| `beatMsFromBpm(bpm)` | ms per beat |
| `targetIntervalMs(bpm, perMeasure)` | ms between tapped beats |
| `buildTargets(bpm, perMeasure, measures)` | array of `{id,time,hit,judgement}` |
| `tierForOffset(absOffset)` | `'perfect'｜'good'｜'ok'｜null` |
| `judgeTap(tapMs, targets)` | judges a tap, consumes nearest unhit target |
| `resolveMisses(nowMs, targets)` | auto-miss passed, untapped beats |
| `scoreFor(judgement)` | points for a tier |
| `nextCombo(combo, judgement)` | combo + 1, or 0 on miss |
| `roundDurationMs(bpm, perMeasure, measures)` | total round length |
| `clamp(v, min, max)` | bound a value |
| `median(values)` | median (for calibration) |
| `calibrationOffset(taps, intervalMs)` | robust median tap offset |
| `deriveOffsets(visualOffset, audioOffset)` | `{inputOffset, audioLeadMs, ...}` |
| Constants | `TIERS, HIT_WINDOW, POINTS, SUBDIVISIONS, BPM_MIN/MAX, MEASURES_MIN/MAX, CALIBRATION` |

### `src/shared/audio.js` (reusable)

| Export | Purpose |
| ------ | ------- |
| `initAudio()` | create/resume the AudioContext (call on a user gesture) |
| `audioNowMs()` | audio clock in ms |
| `isAudioReady()` | context running? |
| `playCowbell(whenMs?, gain?)` | 808-style cowbell beep |
| `playTick(whenMs?)` | quieter cowbell (accents / lead-in) |

### `src/mini1/main.js` (internal, mini-specific)

Scene draws `drawMenu / drawCalibrate / drawPlaying / drawResults`; flow
`start / startCalibration / finishCalPhase / togglePause / register`; UI
primitives `title / label / stepper / roundBtn / segBtn / smallToggle /
bigButton / progressBar / hover / applyAlpha`. State: `scene, cfg, round,
stats, cal, paused`.

## Reusability notes

**Already reusable** (import from `shared/` in any future `mini2`, `mini3`, …):

- `rhythm.js` — fully generic rhythm/timing/judging/calibration engine.
- `audio.js` — the sound engine; extend with salsa voices (clave, conga, timbal)
  as new functions beside `playCowbell`.

**Not yet reusable — currently inline in `main.js`.** To share across minis,
extract these (suggested, not yet done):

- **UI primitives** (`title, label, stepper, roundBtn, segBtn, smallToggle,
  bigButton, progressBar, hover`) → `src/shared/ui.js`, as functions that take
  the p5 instance `p` plus a `buttons` array.
- **Palette** (`C`, `JUDGE_COLOR`) → `src/shared/palette.js`.
- **Scene/state machine** and the **CALIBRATE scene UI** → a `src/shared/`
  module, so every mini gets calibration + menus for free and only writes its
  own gameplay scene.

Until then, a new mini can copy `mini1/main.js` as a starting point and import
`rhythm.js` + `audio.js` from `shared/`.

## Mobile / touch

Works on phones with no extra p5 plugin. `touchStarted()` and `mousePressed()`
both route through one `pointerPress()` helper: it hit-tests the on-screen
buttons first, otherwise counts as a beat tap (PLAYING) or a calibration tap
(CALIBRATE). `touchStarted` returns `false` to block the browser's scroll/zoom/
double-tap. The canvas keeps its fixed 560×700 design resolution and is
CSS-scaled to the screen in `index.html`, so all layout math stays unchanged.
Audio unlocks on the first tap via `initAudio()` (needed on iOS Safari).
