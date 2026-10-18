let context: AudioContext | null = null;
let musicTimer: number | null = null;
let musicStep = 0;
let musicPaused = false;
function getContext(): AudioContext | null {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch { return null; }
}
export type SoundName = 'peel' | 'attach' | 'invalid' | 'treasure' | 'gem' | 'goal' | 'win' | 'bounce';
const notes: Record<SoundName, [number, number, OscillatorType]> = {
  peel: [480, 0.10, 'triangle'], attach: [720, 0.16, 'sine'], invalid: [190, 0.2, 'sawtooth'], treasure: [880, 0.24, 'sine'], gem: [1180, 0.25, 'sine'], goal: [630, 0.23, 'triangle'], win: [990, 0.38, 'sine'], bounce: [360, 0.10, 'sine']
};
export function playSound(name: SoundName, volume: number): void {
  if (volume <= 0) return;
  const ctx = getContext(); if (!ctx) return;
  const [frequency, duration, type] = notes[name];
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (name === 'peel') oscillator.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + duration);
  if (name === 'win') oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + duration);
  gain.gain.setValueAtTime(Math.min(0.16, volume * 0.18), ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(); oscillator.stop(ctx.currentTime + duration);
}

const melodies = [
  [523,659,784,659,587,698,880,698],
  [392,523,587,784,392,523,698,784],
  [349,440,523,659,392,494,587,698],
  [440,587,740,880,494,659,784,988]
];
function musicNote(frequency: number, volume: number): void {
  const ctx = getContext(); if (!ctx || volume <= 0) return;
  const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
  oscillator.type = 'triangle'; oscillator.frequency.value = frequency;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume * .035), now + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .26);
  oscillator.connect(gain).connect(ctx.destination); oscillator.start(now); oscillator.stop(now + .27);
}
export function startMusic(world: number, volume: number): void {
  stopMusic(); musicStep = 0; musicPaused = false;
  if (volume <= 0) return;
  musicTimer = window.setInterval(() => {
    if (musicPaused) return;
    const melody = melodies[Math.max(0,Math.min(3,world-1))];
    musicNote(melody[musicStep % melody.length],volume);
    if (musicStep % 4 === 0) musicNote(melody[musicStep % melody.length] / 2,volume * .5);
    musicStep++;
  }, 315);
}
export function setMusicPaused(value: boolean): void { musicPaused = value; }
export function stopMusic(): void { if (musicTimer !== null) window.clearInterval(musicTimer); musicTimer = null; }
