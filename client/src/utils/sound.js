// 外部音源を使わず、Web Audio APIで短い効果音を都度合成する。
let audioCtx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(ctx, freq, startTime, duration, type = 'sine', gainPeak = 0.15) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playDrawSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 620, now, 0.07, 'triangle', 0.1);
  tone(ctx, 840, now + 0.05, 0.07, 'triangle', 0.07);
}

export function playYakuSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(ctx, freq, now + i * 0.09, 0.2, 'sine', 0.14);
  });
}

export function playPassSound() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 320, ctx.currentTime, 0.1, 'sine', 0.06);
}

export function playErrorSound() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 170, ctx.currentTime, 0.22, 'sawtooth', 0.09);
}
