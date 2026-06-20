# MVP Blueprint — Beat Tap

A minimal rhythm minigame: pick a **BPM** and a **subdivision** (1, 2, or 4 taps per *compás*), then press **SPACE** on each target beat. Each tap is judged against a timing **tolerance**.

This doc is the spec to code against. It follows the project's split: pure logic in `src/game.js` (unit-tested), thin p5 sketch in `src/main.js`.

---

## 1. Core concepts & timing math

A *compás* here is one 4/4 measure = 4 beats.

```
beatMs     = 60000 / bpm              // ms per beat
measureMs  = beatMs * 4               // ms per compás
targetMs   = beatMs * 4 / perMeasure  // ms between targets
```

`perMeasure` is the chosen subdivision and is one of `1 | 2 | 4`:

| perMeasure | Targets land on beats | Interval (`targetMs`) | At 120 BPM |
| ---------- | --------------------- | --------------------- | ---------- |
| 1          | 1                     | `4 * beatMs`          | 2000 ms    |
| 2          | 1, 3                  | `2 * beatMs`          | 1000 ms    |
| 4          | 1, 2, 3, 4            | `1 * beatMs`          | 500 ms     |

So **target #n** (0-indexed) occurs at `t = n * targetMs` ms after the song clock starts.

### Tolerance

One tunable window, split into tiers (ms from the exact target):

```
PERFECT : |offset| <= 40
GOOD    : |offset| <= 90
OK      : |offset| <= 140      // = HIT_WINDOW, the outer edge of a hit
MISS    : |offset| >  140  (or no tap before the target's window closes)
```

These are starting values — expose them as constants so you can tune by feel.

---

## 2. Data model

```js
// Config chosen on the menu screen
config = {
  bpm: 120,
  perMeasure: 2,        // 1 | 2 | 4
  measures: 8,          // how long the round lasts
}

// Derived at round start
round = {
  startMs,              // clock() value when play began
  targets: [            // generated up front
    { id: 0, time: 0,    hit: false, judgement: null },
    { id: 1, time: 1000, hit: false, judgement: null },
    ...
  ],
}

// Running state
state = {
  score: 0,
  combo: 0,
  bestCombo: 0,
  counts: { perfect: 0, good: 0, ok: 0, miss: 0 },
}
```

`targets.length = perMeasure * measures`.

---

## 3. Pure functions to implement in `game.js`

Keep these free of p5/DOM so Vitest can drive them directly.

```js
beatMsFromBpm(bpm)                  -> number
targetIntervalMs(bpm, perMeasure)   -> number
buildTargets(bpm, perMeasure, measures) -> Target[]   // times only, hit=false

// Judge a single tap time against the target list.
// Returns { targetId, judgement, offset } or { judgement: 'miss', targetId: null }.
judgeTap(tapMs, targets)            -> { targetId, judgement, offset }

scoreFor(judgement)                 -> number          // perfect 100 / good 50 / ok 20 / miss 0
nextCombo(combo, judgement)         -> number          // +1 on hit, reset to 0 on miss
```

### `judgeTap` algorithm

1. Find the **nearest unhit target** to `tapMs` (binary search or linear over a small list).
2. `offset = tapMs - target.time`.
3. If `|offset| > HIT_WINDOW` → return a `miss` (do **not** consume a target; it was an errant tap).
4. Otherwise map `|offset|` to PERFECT/GOOD/OK, mark that target `hit = true`, store its judgement, return it.

Edge rule: one tap can resolve at most one target, and one target can be resolved by at most one tap (the `hit` flag enforces this).

### Auto-miss

A target the player never tapped must still count as a miss. Resolve this in the **update loop**, not in `judgeTap`: when `now > target.time + HIT_WINDOW` and `!target.hit`, mark it `judgement = 'miss'`, reset combo.

---

## 4. Game loop (`main.js`, p5 instance mode)

States: `MENU → PLAYING → RESULTS`.

```
setup():
  create canvas, set defaults (bpm, perMeasure)

draw():
  switch state:
    MENU:    draw config UI (bpm +/-, subdivision 1/2/4, Start)
    PLAYING: now = clock() - round.startMs
             - resolve auto-misses for passed targets
             - draw the beat pulse + upcoming-target indicator
             - draw HUD: score, combo, last judgement
             - if now > last target time + HIT_WINDOW -> state = RESULTS
    RESULTS: show counts, score, bestCombo, "play again"

keyPressed():
  if SPACE and PLAYING:
    now = clock() - round.startMs
    r = judgeTap(now, round.targets)
    apply r -> score/combo/counts, flash feedback
```

### Clock choice

Use one monotonic clock for both target generation and judging. `p.millis()` is fine for the MVP. (When you add music, switch to the audio element's `currentTime * 1000` so visuals/judging stay locked to the track — design the code so swapping `clock()` is a one-line change.)

---

## 5. Visual feedback (minimum)

- A **pulse circle** that swells exactly on each target time (drives the player's eye).
- A short **flash / label** showing the last judgement (PERFECT / GOOD / OK / MISS) with a color per tier.
- **Combo counter** and **score** in the HUD.
- Optional but cheap: a thin approaching marker (ring shrinking toward the center) so taps aren't purely audio-memory.

No audio is required for the MVP — visual beat is enough to prove the loop. Add a click/metronome sound next.

---

## 6. Build order (suggested commits)

1. `game.js`: `beatMsFromBpm`, `targetIntervalMs`, `buildTargets` + tests.
2. `game.js`: `judgeTap`, `scoreFor`, `nextCombo` + tests (cover perfect/good/ok/miss and the "errant tap doesn't consume a target" case).
3. `main.js`: PLAYING state with a fixed bpm/perMeasure, pulse circle, SPACE judging, HUD.
4. Auto-miss resolution in the update loop + RESULTS screen.
5. MENU screen to pick bpm and subdivision; wire Start/Replay.
6. Polish: judgement colors, combo flash, approaching marker.

Steps 1–2 are fully testable headless (`npm run test:run`); steps 3+ you debug live with `npm run dev`.

---

## 7. Test cases to write first (`test/game.test.js`)

- `beatMsFromBpm(120) === 500`; `targetIntervalMs(120, 4) === 500`, `(120, 1) === 2000`.
- `buildTargets(120, 2, 8)` has length 16, first time 0, spacing 1000.
- Tap exactly on a target → `perfect`, that target's `hit` becomes true.
- Tap at offset 100 ms (within OK, outside GOOD) → `ok`.
- Tap at offset 300 ms → `miss`, **no** target consumed.
- Two taps near the same target → second one finds the *next* nearest, not the already-hit one.
- `nextCombo`: increments on hit, resets to 0 on miss.

---

## 8. Tunables (one place, top of `game.js`)

```js
export const TIERS = { perfect: 40, good: 90, ok: 140 };
export const HIT_WINDOW = TIERS.ok;
export const POINTS = { perfect: 100, good: 50, ok: 20, miss: 0 };
export const SUBDIVISIONS = [1, 2, 4];
```

That's the whole MVP. Once the loop feels right, the natural next steps are audio sync (swap `clock()` to the track) and a results/score screen worth sharing on the site.
