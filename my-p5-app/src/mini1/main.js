import p5 from 'p5';
import {
  buildTargets,
  targetIntervalMs,
  beatMsFromBpm,
  judgeTap,
  resolveMisses,
  scoreFor,
  nextCombo,
  roundDurationMs,
  clamp,
  calibrationOffset,
  deriveOffsets,
  CALIBRATION,
  SUBDIVISIONS,
  BPM_MIN,
  BPM_MAX,
  MEASURES_MIN,
  MEASURES_MAX,
  HIT_WINDOW,
} from '../shared/rhythm.js';
import { initAudio, playCowbell } from '../shared/audio.js';

// ============================================================================
// Beat Tap — p5 sketch (presentation + input). Logic lives in game.js.
// ============================================================================

const W = 560;
const H = 700;
const LOOKAHEAD = 1100; // ms an approaching ring is visible before its beat

const C = {
  bg0: '#1a0f2e',
  bg1: '#2d1240',
  ink: '#f4ecff',
  dim: '#9b88c4',
  pink: '#ff3d8b',
  cyan: '#37e0d8',
  gold: '#ffd54a',
  green: '#6ee87a',
  orange: '#ff9d42',
  red: '#ff5a6e',
};

const JUDGE_COLOR = { perfect: C.cyan, good: C.green, ok: C.orange, miss: C.red };

new p5((p) => {
  // ---- state ----
  let scene = 'MENU'; // MENU | CALIBRATE | PLAYING | RESULTS
  let cfg = {
    bpm: 120,
    perMeasure: 2,
    measures: 8,
    muted: false,
    // calibration (filled by the CALIBRATE scene)
    calibrated: false,
    visualOffset: 0,
    audioOffset: 0,
    inputOffset: 0, // subtracted from raw taps when judging
    audioLeadMs: 0, // how much earlier to fire sound than the visual beat
  };
  let round = null;
  let stats = null;
  let flash = null;
  let cal = null; // calibration session
  let paused = false; // PLAYING pause state
  let pauseAt = 0; // millis() when paused (to shift the clock on resume)
  let buttons = [];

  p.setup = () => {
    const c = p.createCanvas(W, H);
    c.parent('app');
    p.textFont('Verdana');
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = () => {
    backdrop();
    if (scene === 'MENU') drawMenu();
    else if (scene === 'CALIBRATE') drawCalibrate();
    else if (scene === 'PLAYING') drawPlaying();
    else drawResults();
  };

  function backdrop() {
    for (let y = 0; y < H; y++) {
      p.stroke(p.lerpColor(p.color(C.bg0), p.color(C.bg1), y / H));
      p.line(0, y, W, y);
    }
    p.noStroke();
  }

  // ---- MENU ---------------------------------------------------------------
  function drawMenu() {
    buttons = [];

    title('BEAT TAP', 74);
    label('Tap SPACE on the beat', 106, C.dim, 15);

    stepper('BPM', cfg.bpm, 176, () => setBpm(cfg.bpm - 5), () => setBpm(cfg.bpm + 5));

    label('TAPS PER COMPÁS', 232, C.dim, 13);
    const segW = 90;
    const gap = 14;
    const totalW = SUBDIVISIONS.length * segW + (SUBDIVISIONS.length - 1) * gap;
    let sx = W / 2 - totalW / 2;
    for (const s of SUBDIVISIONS) {
      segBtn(String(s), sx, 250, segW, 56, cfg.perMeasure === s, () => (cfg.perMeasure = s));
      sx += segW + gap;
    }

    stepper('MEASURES', cfg.measures, 372, () => setMeasures(cfg.measures - 1), () => setMeasures(cfg.measures + 1));

    const interval = Math.round(targetIntervalMs(cfg.bpm, cfg.perMeasure));
    const total = cfg.perMeasure * cfg.measures;
    label(total + ' taps  ·  one every ' + interval + ' ms', 422, C.dim, 13);

    // Calibration status / suggestion
    if (cfg.calibrated) {
      label('Calibrated  ·  input ' + signed(cfg.inputOffset) + 'ms  ·  audio lead ' + cfg.audioLeadMs + 'ms', 452, C.green, 12);
    } else {
      const pulse = 0.6 + 0.4 * Math.sin(p.millis() / 300);
      label('Tip: calibrate first so the beats feel right', 452, applyAlpha(C.gold, pulse), 13);
    }

    bigButton(cfg.calibrated ? 'RE-CALIBRATE' : 'CALIBRATE', 484, C.cyan, startCalibration, true);
    bigButton('START  >', 558, C.pink, start);

    // mute toggle (small)
    smallToggle(cfg.muted ? 'SOUND OFF' : 'SOUND ON', W / 2 - 70, 632, 140, 30, !cfg.muted, () => (cfg.muted = !cfg.muted));
    label('keys:  <- ->  bpm   1 / 2 / 4  taps   C calibrate   ENTER start', 678, C.dim, 11);
  }

  function setBpm(v) { cfg.bpm = clamp(v, BPM_MIN, BPM_MAX); }
  function setMeasures(v) { cfg.measures = clamp(v, MEASURES_MIN, MEASURES_MAX); }
  function signed(n) { return (n >= 0 ? '+' : '') + n; }

  // ---- CALIBRATION --------------------------------------------------------
  // Two passes: VISUAL (no sound, tap to the pulse) then AUDIO (no beat visual,
  // tap to the beeps). We measure the median tap offset in each and derive how
  // to shift input judging and sound scheduling.
  function startCalibration() {
    initAudio();
    cal = newCalPhase('visual');
    scene = 'CALIBRATE';
  }

  function newCalPhase(phase) {
    return {
      phase, // 'visual' | 'audio' | 'done'
      startMs: p.millis(),
      interval: beatMsFromBpm(CALIBRATION.bpm),
      taps: [],
      soundIdx: 0,
      visualOffset: cal ? cal.visualOffset : 0,
      audioOffset: cal ? cal.audioOffset : 0,
    };
  }

  function calTotalBeats() { return CALIBRATION.leadInBeats + CALIBRATION.sampleBeats; }

  function drawCalibrate() {
    buttons = [];
    const cx = W / 2;
    const cy = 300;

    if (cal.phase === 'done') {
      drawCalDone(cx);
      return;
    }

    const now = p.millis() - cal.startMs;
    const interval = cal.interval;
    const beatsDone = now / interval;
    const remaining = Math.max(0, calTotalBeats() - Math.floor(beatsDone));

    const isVisual = cal.phase === 'visual';
    title(isVisual ? 'CALIBRATE · VISUAL' : 'CALIBRATE · SOUND', 90);
    label(
      isVisual ? 'Tap SPACE with the flashing circle (no sound)'
               : 'Look away if you like — tap SPACE on each beep',
      130, C.dim, 14
    );

    if (isVisual) {
      // beat-synced pulse, NO sound
      const phase = (now % interval) / interval;
      const swell = Math.max(0, 1 - phase * 5);
      p.noStroke();
      p.fill(applyAlpha(C.cyan, 0.15 + swell * 0.6));
      p.circle(cx, cy, 90 + swell * 130);
      p.noFill(); p.stroke(255, 255, 255, 70); p.strokeWeight(3);
      p.circle(cx, cy, 90); p.noStroke();
    } else {
      // AUDIO pass: play beeps, show NO beat-synced animation
      while (cal.soundIdx <= calTotalBeats() && now >= cal.soundIdx * interval) {
        if (!cfg.muted) playCowbell();
        cal.soundIdx++;
      }
      p.noFill(); p.stroke(255, 255, 255, 50); p.strokeWeight(3);
      p.circle(cx, cy, 150);
      p.circle(cx, cy, 90);
      p.fill(C.dim); p.noStroke(); p.textSize(15);
      p.text('LISTEN', cx, cy);
    }

    // progress
    label('beats left: ' + remaining + '    taps: ' + sampleTapCount(), 400, C.dim, 13);
    progressBar(clamp(beatsDone / calTotalBeats(), 0, 1));
    label('ESC to cancel', H - 36, C.dim, 12);

    // advance when the pass is over
    if (now >= calTotalBeats() * interval) finishCalPhase();
  }

  function sampleTapCount() {
    const cut = (CALIBRATION.leadInBeats - 0.5) * cal.interval;
    return cal.taps.filter((t) => t > cut).length;
  }

  function finishCalPhase() {
    const cut = (CALIBRATION.leadInBeats - 0.5) * cal.interval;
    const sampled = cal.taps.filter((t) => t > cut);
    const offset = calibrationOffset(sampled, cal.interval);
    if (cal.phase === 'visual') {
      cal.visualOffset = offset;
      const next = newCalPhase('audio');
      next.visualOffset = offset;
      cal = next;
    } else {
      cal.audioOffset = offset;
      cal.phase = 'done';
      const d = deriveOffsets(cal.visualOffset, cal.audioOffset);
      cfg = { ...cfg, ...d, calibrated: true };
    }
  }

  function drawCalDone(cx) {
    title('CALIBRATED', 110);
    const rows = [
      ['Visual tap offset', signed(cfg.visualOffset) + ' ms'],
      ['Audio tap offset', signed(cfg.audioOffset) + ' ms'],
      ['-> Input correction', signed(cfg.inputOffset) + ' ms'],
      ['-> Sound lead', cfg.audioLeadMs + ' ms'],
    ];
    let y = 200;
    for (const r of rows) {
      p.textAlign(p.LEFT, p.CENTER); p.fill(C.dim); p.textSize(16);
      p.text(r[0], 110, y);
      p.textAlign(p.RIGHT, p.CENTER); p.fill(C.ink);
      p.text(r[1], W - 110, y);
      y += 46;
    }
    p.textAlign(p.CENTER, p.CENTER);
    label('Sound fires ' + cfg.audioLeadMs + 'ms before the visual so they feel synced', y + 14, C.dim, 12);
    bigButton('DONE', H - 200, C.pink, () => (scene = 'MENU'));
    bigButton('REDO', H - 124, C.cyan, startCalibration, true);
  }

  // ---- PLAYING ------------------------------------------------------------
  function start() {
    initAudio();
    round = {
      startMs: p.millis(),
      duration: roundDurationMs(cfg.bpm, cfg.perMeasure, cfg.measures),
      targets: buildTargets(cfg.bpm, cfg.perMeasure, cfg.measures),
      soundIdx: 0,
    };
    stats = { score: 0, combo: 0, bestCombo: 0, counts: { perfect: 0, good: 0, ok: 0, miss: 0 } };
    flash = null;
    paused = false;
    scene = 'PLAYING';
  }

  function drawPlaying() {
    buttons = [];
    // frozen clock while paused so the round time doesn't advance
    const now = paused ? pauseAt - round.startMs : p.millis() - round.startMs;
    const effNow = now - cfg.inputOffset; // calibrated input timeline for judging

    if (!paused) {
      // beep on each beat, fired audioLeadMs early so it's perceived in sync
      while (
        round.soundIdx < round.targets.length &&
        now >= round.targets[round.soundIdx].time - cfg.audioLeadMs
      ) {
        if (!cfg.muted) playCowbell();
        round.soundIdx++;
      }

      // auto-miss using the calibrated timeline
      for (const id of resolveMisses(effNow, round.targets)) {
        void id;
        register({ judgement: 'miss' });
      }
    }

    const cx = W / 2;
    const cy = 320;
    const hitR = 96;
    const interval = targetIntervalMs(cfg.bpm, cfg.perMeasure);

    const phase = (now % interval) / interval;
    const swell = Math.max(0, 1 - phase * 5);

    p.noFill(); p.strokeWeight(3); p.stroke(255, 255, 255, 60);
    p.circle(cx, cy, hitR * 2);
    p.noStroke(); p.fill(255, 255, 255, 12 + swell * 30);
    p.circle(cx, cy, hitR * 1.7);

    // approaching rings (drawn on the real visual timeline)
    for (const t of round.targets) {
      const dt = t.time - now;
      if (dt > LOOKAHEAD || dt < -HIT_WINDOW) continue;
      if (t.hit && t.judgement === 'miss') continue;
      const k = clamp(1 - dt / LOOKAHEAD, 0, 1);
      const r = hitR + (1 - k) * 240;
      p.noFill(); p.strokeWeight(3);
      const col = p.color(t.hit ? JUDGE_COLOR[t.judgement] : C.cyan);
      col.setAlpha(t.hit ? 120 : 90 + k * 120);
      p.stroke(col);
      p.circle(cx, cy, r * 2);
    }

    if (flash) {
      const age = now - flash.t;
      if (age < 480) {
        p.fill(applyAlpha(JUDGE_COLOR[flash.judgement], 1 - age / 480));
        p.textStyle(p.BOLD); p.textSize(34);
        p.text(flash.judgement.toUpperCase(), cx, cy);
        p.textStyle(p.NORMAL);
      }
    }

    hud(stats);
    progressBar(clamp(now / round.duration, 0, 1));
    label('SPACE beat   ·   P pause   ·   M mute', H - 28, C.dim, 12);

    if (paused) {
      drawPauseOverlay();
      return;
    }

    if (now >= round.duration) {
      stats.bestCombo = Math.max(stats.bestCombo, stats.combo);
      scene = 'RESULTS';
    }
  }

  function togglePause() {
    if (paused) {
      // resume: push start forward by how long we were paused
      round.startMs += p.millis() - pauseAt;
      paused = false;
    } else {
      pauseAt = p.millis();
      paused = true;
    }
  }

  function drawPauseOverlay() {
    p.noStroke(); p.fill(10, 6, 18, 205); p.rect(0, 0, W, H);
    title('PAUSED', 230);
    bigButton('RESUME', 310, C.pink, togglePause);
    bigButton('RESTART', 386, C.cyan, start, true);
    bigButton('QUIT TO MENU', 462, C.cyan, () => { paused = false; scene = 'MENU'; }, true);
    label('P or ESC to resume', H - 60, C.dim, 12);
  }

  function register(r) {
    stats.score += scoreFor(r.judgement);
    stats.combo = nextCombo(stats.combo, r.judgement);
    stats.bestCombo = Math.max(stats.bestCombo, stats.combo);
    stats.counts[r.judgement] = (stats.counts[r.judgement] || 0) + 1;
    flash = { judgement: r.judgement, t: p.millis() - round.startMs };
  }

  function hud(s) {
    p.textAlign(p.LEFT, p.CENTER); p.fill(C.ink); p.textSize(15);
    p.text('SCORE', 44, 52);
    p.textStyle(p.BOLD); p.textSize(30);
    p.text(String(s.score).padStart(4, '0'), 44, 80); p.textStyle(p.NORMAL);

    p.textAlign(p.RIGHT, p.CENTER); p.fill(C.gold); p.textSize(15);
    p.text('COMBO', W - 44, 52);
    p.textStyle(p.BOLD); p.textSize(30);
    p.text('x' + s.combo, W - 44, 80); p.textStyle(p.NORMAL);
    p.textAlign(p.CENTER, p.CENTER);
  }

  // ---- RESULTS ------------------------------------------------------------
  function drawResults() {
    buttons = [];
    title('RESULTS', 96);

    const total = round.targets.length;
    const c = stats.counts;
    const hits = c.perfect + c.good + c.ok;
    const acc = total ? Math.round((hits / total) * 100) : 0;

    label('SCORE', 168, C.dim, 14);
    p.fill(C.ink); p.textStyle(p.BOLD); p.textSize(54);
    p.text(String(stats.score), W / 2, 208); p.textStyle(p.NORMAL);

    const rows = [
      ['PERFECT', c.perfect, C.cyan],
      ['GOOD', c.good, C.green],
      ['OK', c.ok, C.orange],
      ['MISS', c.miss, C.red],
    ];
    let y = 290;
    for (const row of rows) {
      p.textAlign(p.LEFT, p.CENTER); p.fill(row[2]); p.textSize(18);
      p.text(row[0], 130, y);
      p.textAlign(p.RIGHT, p.CENTER); p.fill(C.ink);
      p.text(String(row[1]), W - 130, y);
      y += 44;
    }
    p.textAlign(p.CENTER, p.CENTER);
    label('ACCURACY  ' + acc + '%      BEST COMBO  x' + stats.bestCombo, y + 16, C.gold, 16);

    bigButton('PLAY AGAIN', H - 200, C.pink, start);
    bigButton('MENU', H - 124, C.cyan, () => (scene = 'MENU'), true);
  }

  // ---- input --------------------------------------------------------------
  p.keyPressed = () => {
    initAudio(); // unlock audio on first gesture
    if (scene === 'MENU') {
      if (p.keyCode === p.LEFT_ARROW) setBpm(cfg.bpm - 5);
      else if (p.keyCode === p.RIGHT_ARROW) setBpm(cfg.bpm + 5);
      else if (p.key === '1') cfg.perMeasure = 1;
      else if (p.key === '2') cfg.perMeasure = 2;
      else if (p.key === '4') cfg.perMeasure = 4;
      else if (p.keyCode === p.UP_ARROW) setMeasures(cfg.measures + 1);
      else if (p.keyCode === p.DOWN_ARROW) setMeasures(cfg.measures - 1);
      else if (p.key === 'c' || p.key === 'C') startCalibration();
      else if (p.key === 'm' || p.key === 'M') cfg.muted = !cfg.muted;
      else if (p.keyCode === p.ENTER || p.key === ' ') start();
    } else if (scene === 'CALIBRATE') {
      if (p.key === ' ') { if (cal.phase !== 'done') cal.taps.push(p.millis() - cal.startMs); }
      else if (p.keyCode === p.ESCAPE) scene = 'MENU';
    } else if (scene === 'PLAYING') {
      if (p.key === 'p' || p.key === 'P' || p.keyCode === p.ESCAPE) togglePause();
      else if (p.key === ' ') {
        if (!paused) register(judgeTap(p.millis() - round.startMs - cfg.inputOffset, round.targets));
      } else if (p.key === 'm' || p.key === 'M') cfg.muted = !cfg.muted;
    } else if (scene === 'RESULTS') {
      if (p.keyCode === p.ENTER || p.key === ' ') start();
      else if (p.keyCode === p.ESCAPE) scene = 'MENU';
    }
    return false;
  };

  // Unified pointer press, used by both mouse and touch.
  function pointerPress() {
    for (const b of buttons) {
      if (p.mouseX >= b.x && p.mouseX <= b.x + b.w && p.mouseY >= b.y && p.mouseY <= b.y + b.h) {
        b.action();
        return;
      }
    }
    // no button hit -> treat as a gameplay / calibration tap (mobile-friendly)
    if (scene === 'PLAYING') {
      if (!paused) register(judgeTap(p.millis() - round.startMs - cfg.inputOffset, round.targets));
    } else if (scene === 'CALIBRATE') {
      if (cal && cal.phase !== 'done') cal.taps.push(p.millis() - cal.startMs);
    }
  }

  p.mousePressed = () => { initAudio(); pointerPress(); };
  // touch: same as a press, and return false to block scroll / zoom / double-tap
  p.touchStarted = () => { initAudio(); pointerPress(); return false; };

  // ---- UI primitives ------------------------------------------------------
  function title(txt, y) {
    p.fill(C.pink); p.textStyle(p.BOLD); p.textSize(46);
    p.text(txt, W / 2, y); p.textStyle(p.NORMAL);
  }
  function label(txt, y, col, size) { p.fill(col); p.textSize(size); p.text(txt, W / 2, y); }

  function progressBar(prog) {
    p.noStroke(); p.fill(255, 255, 255, 30); p.rect(40, H - 56, W - 80, 8, 4);
    p.fill(C.pink); p.rect(40, H - 56, (W - 80) * prog, 8, 4);
  }

  function stepper(name, value, y, onMinus, onPlus) {
    label(name, y - 30, C.dim, 13);
    p.fill(C.ink); p.textStyle(p.BOLD); p.textSize(40);
    p.text(String(value), W / 2, y + 4); p.textStyle(p.NORMAL);
    roundBtn('-', W / 2 - 150, y - 26, 56, 56, onMinus);
    roundBtn('+', W / 2 + 94, y - 26, 56, 56, onPlus);
  }

  function roundBtn(txt, x, y, w, h, action) {
    const hot = hover(x, y, w, h);
    p.fill(hot ? 255 : 220, hot ? 80 : 60, 140, hot ? 200 : 120);
    p.rect(x, y, w, h, 12);
    p.fill(C.ink); p.textSize(28); p.text(txt, x + w / 2, y + h / 2 - 2);
    buttons.push({ x, y, w, h, action });
  }

  function segBtn(txt, x, y, w, h, active, action) {
    p.fill(active ? p.color(C.cyan) : p.color(255, 255, 255, 20));
    p.rect(x, y, w, h, 12);
    p.fill(active ? C.bg0 : C.ink); p.textStyle(p.BOLD); p.textSize(24);
    p.text(txt, x + w / 2, y + h / 2); p.textStyle(p.NORMAL);
    buttons.push({ x, y, w, h, action });
  }

  function smallToggle(txt, x, y, w, h, on, action) {
    p.fill(on ? p.color(C.green) : p.color(255, 255, 255, 24));
    p.rect(x, y, w, h, 8);
    p.fill(on ? C.bg0 : C.dim); p.textSize(13); p.text(txt, x + w / 2, y + h / 2);
    buttons.push({ x, y, w, h, action });
  }

  function bigButton(txt, y, col, action, outline) {
    const w = 280;
    const h = 60;
    const x = W / 2 - w / 2;
    const hot = hover(x, y, w, h);
    if (outline) {
      p.noFill(); p.stroke(col); p.strokeWeight(2); p.rect(x, y, w, h, 14); p.noStroke();
      p.fill(col);
    } else {
      p.fill(col); p.rect(x, y, w, h, 14); p.fill(C.bg0);
    }
    p.textStyle(p.BOLD); p.textSize(22);
    p.text(txt, W / 2, y + h / 2 + (hot ? 1 : 0)); p.textStyle(p.NORMAL);
    buttons.push({ x, y, w, h, action });
  }

  function hover(x, y, w, h) {
    return p.mouseX >= x && p.mouseX <= x + w && p.mouseY >= y && p.mouseY <= y + h;
  }

  function applyAlpha(hex, a) {
    const col = p.color(hex);
    col.setAlpha(a * 255);
    return col;
  }
});
