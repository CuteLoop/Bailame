import { describe, it, expect } from 'vitest';
import {
  beatMsFromBpm,
  targetIntervalMs,
  buildTargets,
  tierForOffset,
  judgeTap,
  resolveMisses,
  scoreFor,
  nextCombo,
  roundDurationMs,
  clamp,
  HIT_WINDOW,
} from '../src/shared/rhythm.js';

describe('timing math', () => {
  it('converts bpm to beat ms', () => {
    expect(beatMsFromBpm(120)).toBe(500);
    expect(beatMsFromBpm(60)).toBe(1000);
  });

  it('computes target interval per subdivision', () => {
    expect(targetIntervalMs(120, 4)).toBe(500); // every beat
    expect(targetIntervalMs(120, 2)).toBe(1000); // beats 1 & 3
    expect(targetIntervalMs(120, 1)).toBe(2000); // beat 1 only
  });
});

describe('buildTargets', () => {
  it('produces perMeasure * measures targets spaced by the interval', () => {
    const t = buildTargets(120, 2, 8);
    expect(t).toHaveLength(16);
    expect(t[0].time).toBe(0);
    expect(t[1].time).toBe(1000);
    expect(t.every((x) => x.hit === false && x.judgement === null)).toBe(true);
  });
});

describe('tierForOffset', () => {
  it('maps offsets to tiers', () => {
    expect(tierForOffset(0)).toBe('perfect');
    expect(tierForOffset(40)).toBe('perfect');
    expect(tierForOffset(70)).toBe('good');
    expect(tierForOffset(120)).toBe('ok');
    expect(tierForOffset(200)).toBe(null);
  });
});

describe('judgeTap', () => {
  it('rates a dead-on tap as perfect and consumes the target', () => {
    const targets = buildTargets(120, 2, 4); // spacing 1000
    const r = judgeTap(1000, targets);
    expect(r.judgement).toBe('perfect');
    expect(r.targetId).toBe(1);
    expect(targets[1].hit).toBe(true);
  });

  it('rates an offset within the ok band as ok', () => {
    const targets = buildTargets(120, 2, 4);
    const r = judgeTap(1000 + 120, targets);
    expect(r.judgement).toBe('ok');
  });

  it('an errant tap is a miss and consumes no target', () => {
    const targets = buildTargets(120, 2, 4);
    const r = judgeTap(500, targets); // 500ms from both 0 and 1000, > HIT_WINDOW
    expect(r.judgement).toBe('miss');
    expect(r.targetId).toBe(null);
    expect(targets.every((t) => !t.hit)).toBe(true);
  });

  it('a second tap near a consumed target finds the next nearest', () => {
    const targets = buildTargets(120, 4, 4); // spacing 500
    judgeTap(500, targets); // consumes target id 1
    const r = judgeTap(520, targets); // nearest unhit is id 2 at 1000 -> miss (480 away)
    expect(r.targetId).not.toBe(1);
  });
});

describe('resolveMisses', () => {
  it('marks passed, untapped targets as miss', () => {
    const targets = buildTargets(120, 2, 4); // 0,1000,2000,...
    const missed = resolveMisses(1000 + HIT_WINDOW + 1, targets);
    expect(missed).toEqual([0, 1]);
    expect(targets[0].judgement).toBe('miss');
  });

  it('does not touch targets still within their window', () => {
    const targets = buildTargets(120, 2, 4);
    const missed = resolveMisses(50, targets);
    expect(missed).toEqual([]);
  });
});

describe('scoring & combo', () => {
  it('scores per tier', () => {
    expect(scoreFor('perfect')).toBe(100);
    expect(scoreFor('good')).toBe(50);
    expect(scoreFor('ok')).toBe(20);
    expect(scoreFor('miss')).toBe(0);
  });

  it('combo increments on hit, resets on miss', () => {
    expect(nextCombo(3, 'perfect')).toBe(4);
    expect(nextCombo(3, 'miss')).toBe(0);
  });
});

describe('helpers', () => {
  it('roundDurationMs spans to the last target plus window', () => {
    expect(roundDurationMs(120, 1, 2)).toBe(2000 + HIT_WINDOW);
  });

  it('clamp bounds values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

import { median, calibrationOffset, deriveOffsets } from '../src/shared/rhythm.js';

describe('calibration', () => {
  it('median handles odd and even counts', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBe(0);
  });

  it('calibrationOffset finds a consistent late offset', () => {
    const interval = 600;
    // taps near beats 1..4, each ~50ms late
    const taps = [600 + 50, 1200 + 48, 1800 + 52, 2400 + 50];
    expect(calibrationOffset(taps, interval)).toBe(50);
  });

  it('calibrationOffset ignores wild taps beyond half a beat', () => {
    const interval = 600;
    const taps = [600 + 40, 1200 + 40, 2000 /* garbage, 200 off */];
    expect(calibrationOffset(taps, interval)).toBe(40);
  });

  it('deriveOffsets builds input + audio-lead from the two passes', () => {
    const d = deriveOffsets(60, 95);
    expect(d.inputOffset).toBe(60);
    expect(d.audioLeadMs).toBe(35);
  });
});
