// ============================================================================
// Beat Tap — pure game logic. No p5, no canvas, no DOM.
// Everything here is unit-testable in plain Node (see test/game.test.js).
// ============================================================================

// ---- Tunables (adjust these to change game feel) --------------------------

// Timing tiers, in ms of |offset| from the exact target beat.
export const TIERS = { perfect: 40, good: 90, ok: 140 };

// Outer edge of a hit. A tap further than this from any target is a miss
// and does NOT consume a target.
export const HIT_WINDOW = TIERS.ok;

// Points awarded per judgement.
export const POINTS = { perfect: 100, good: 50, ok: 20, miss: 0 };

// Allowed taps-per-compás (one compás = one 4/4 measure = 4 beats).
export const SUBDIVISIONS = [1, 2, 4];

// Config bounds for the menu.
export const BPM_MIN = 40;
export const BPM_MAX = 220;
export const MEASURES_MIN = 2;
export const MEASURES_MAX = 32;

// ---- Timing math ----------------------------------------------------------

export function beatMsFromBpm(bpm) {
  return 60000 / bpm;
}

// ms between consecutive targets for a given subdivision.
export function targetIntervalMs(bpm, perMeasure) {
  return (beatMsFromBpm(bpm) * 4) / perMeasure;
}

// Build the ordered list of target beats for a round.
// Each target: { id, time, hit, judgement }
export function buildTargets(bpm, perMeasure, measures) {
  const interval = targetIntervalMs(bpm, perMeasure);
  const count = perMeasure * measures;
  const targets = [];
  for (let i = 0; i < count; i++) {
    targets.push({ id: i, time: i * interval, hit: false, judgement: null });
  }
  return targets;
}

// ---- Judging --------------------------------------------------------------

// Map an absolute offset (ms) to a hit tier, or null if outside the window.
export function tierForOffset(absOffset) {
  if (absOffset <= TIERS.perfect) return 'perfect';
  if (absOffset <= TIERS.good) return 'good';
  if (absOffset <= TIERS.ok) return 'ok';
  return null;
}

// Judge a tap at tapMs against the target list.
// Mutates the matched target (sets hit=true, judgement) so it can't be reused.
// Returns { targetId, judgement, offset }.
// On an errant tap (nothing within HIT_WINDOW) returns
// { targetId: null, judgement: 'miss', offset: null } and consumes nothing.
export function judgeTap(tapMs, targets) {
  let best = null;
  let bestDist = Infinity;
  for (const t of targets) {
    if (t.hit) continue;
    const dist = Math.abs(tapMs - t.time);
    if (dist < bestDist) {
      bestDist = dist;
      best = t;
    }
  }

  const tier = best ? tierForOffset(bestDist) : null;
  if (!best || !tier) {
    return { targetId: null, judgement: 'miss', offset: null };
  }

  best.hit = true;
  best.judgement = tier;
  return { targetId: best.id, judgement: tier, offset: tapMs - best.time };
}

// Resolve targets whose window has fully passed without a tap.
// Marks them hit with judgement 'miss'. Returns the array of newly-missed ids.
export function resolveMisses(nowMs, targets) {
  const missed = [];
  for (const t of targets) {
    if (!t.hit && nowMs > t.time + HIT_WINDOW) {
      t.hit = true;
      t.judgement = 'miss';
      missed.push(t.id);
    }
  }
  return missed;
}

// ---- Scoring --------------------------------------------------------------

export function scoreFor(judgement) {
  return POINTS[judgement] ?? 0;
}

export function nextCombo(combo, judgement) {
  return judgement === 'miss' ? 0 : combo + 1;
}

// Total ms of a round (time of last target + the closing hit window).
export function roundDurationMs(bpm, perMeasure, measures) {
  const interval = targetIntervalMs(bpm, perMeasure);
  const count = perMeasure * measures;
  return (count - 1) * interval + HIT_WINDOW;
}

// Clamp helper for the menu controls.
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ---- Calibration ----------------------------------------------------------

// Default calibration shape used by the menu / sketch.
export const CALIBRATION = {
  bpm: 100,        // steady metronome for calibration
  leadInBeats: 2,  // beats to settle before we start sampling taps
  sampleBeats: 8,  // beats we actually measure
};

export function median(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Estimate the player's timing offset (ms) from a list of tap times against a
// steady metronome of period intervalMs. Positive = taps land AFTER the beat.
// Robust: snaps each tap to its nearest beat, drops taps further than half a
// beat away (clearly not aimed at any beat), returns the median.
export function calibrationOffset(tapMsList, intervalMs) {
  const offsets = tapMsList
    .map((t) => t - Math.round(t / intervalMs) * intervalMs)
    .filter((o) => Math.abs(o) <= intervalMs / 2);
  return offsets.length ? Math.round(median(offsets)) : 0;
}

// From the two calibration passes, derive how to run the game.
// - inputOffset: subtract from raw taps so a consistent player is centered.
//   The game is visually led, so we use the visual pass for input timing.
// - audioLeadMs: how much EARLIER to fire sound than the visual beat, so the
//   sound is *perceived* in sync with the animation. If audio is heard later
//   than visuals (audioOffset > visualOffset) we lead the sound by the gap.
export function deriveOffsets(visualOffset, audioOffset) {
  return {
    visualOffset,
    audioOffset,
    inputOffset: visualOffset,
    audioLeadMs: audioOffset - visualOffset,
  };
}
