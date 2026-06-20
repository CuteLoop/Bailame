// ============================================================================
// Audio — a small Web Audio engine. For now: an 808-style cowbell "beep".
// Later we'll add salsa percussion (clave, conga, timbal) as more voices here.
// ============================================================================

let ctx = null;

// Must be called from a user gesture (click / keypress) or the browser blocks it.
export function initAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Current audio clock in ms (Web Audio runs in seconds).
export function audioNowMs() {
  return ctx ? ctx.currentTime * 1000 : 0;
}

export function isAudioReady() {
  return !!ctx && ctx.state === 'running';
}

// Classic 808 cowbell: two detuned square waves through a bandpass, with a
// fast-attack / short-decay amplitude envelope.
// whenMs: schedule time in the audio clock (ms). 0/undefined = play now.
export function playCowbell(whenMs = 0, gain = 0.6) {
  if (!ctx) initAudio();
  const t = whenMs > 0 ? whenMs / 1000 : ctx.currentTime;
  const decay = 0.32;

  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 640;
  band.Q.value = 2.2;

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.002);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  band.connect(amp);
  amp.connect(ctx.destination);

  for (const f of [540, 800]) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = f;
    osc.connect(band);
    osc.start(t);
    osc.stop(t + decay);
  }
}

// A softer click for the metronome lead-in / accents (reuses cowbell quieter).
export function playTick(whenMs = 0) {
  playCowbell(whenMs, 0.28);
}
