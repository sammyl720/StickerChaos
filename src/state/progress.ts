import { create } from 'zustand';
import { z } from 'zod';
import type { StickerType } from '../game/model';

const SettingsSchema = z.object({ musicVolume: z.number().min(0).max(1), effectsVolume: z.number().min(0).max(1), reducedMotion: z.boolean(), controlMode: z.enum(['joystick', 'tap']) });
const ProgressSchema = z.object({
  version: z.literal(1),
  completedLevels: z.array(z.number().int().min(1).max(20)),
  levelStars: z.record(z.string(), z.number().int().min(1).max(3)),
  collectedGems: z.array(z.number().int().min(1).max(20)),
  unlockedCosmetics: z.array(z.string()),
  selectedCosmetic: z.string(),
  achievements: z.array(z.string()),
  stickerDiscoveries: z.array(z.enum(['BIG', 'FAST', 'BOUNCY', 'HEAVY', 'TINY', 'FLOATING', 'MAGNETIC', 'SLIPPERY'])),
  transfers: z.number().int().nonnegative(),
  chickenTransforms: z.number().int().nonnegative(),
  bounceCollisions: z.number().int().nonnegative(),
  combinations: z.array(z.string()),
  tinyWins: z.number().int().nonnegative(),
  settings: SettingsSchema
});
export type GameProgress = z.infer<typeof ProgressSchema>;
export type GameSettings = GameProgress['settings'];

export const DEFAULT_PROGRESS: GameProgress = {
  version: 1, completedLevels: [], levelStars: {}, collectedGems: [],
  unlockedCosmetics: ['classic'], selectedCosmetic: 'classic', achievements: [], stickerDiscoveries: [],
  transfers: 0, chickenTransforms: 0, bounceCollisions: 0, combinations: [], tinyWins: 0,
  settings: { musicVolume: 0.35, effectsVolume: 0.7, reducedMotion: false, controlMode: 'joystick' }
};

const DATABASE = 'sticker-chaos-progress';
const freshProgress = (): GameProgress => JSON.parse(JSON.stringify(DEFAULT_PROGRESS)) as GameProgress;
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) { reject(new Error('IndexedDB unavailable')); return; }
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('save');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function readStored(): Promise<unknown> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('save', 'readonly');
    const request = transaction.objectStore('save').get('progress');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}
async function writeStored(value: GameProgress): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('save', 'readwrite');
    transaction.objectStore('save').put(value, 'progress');
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
export function parseProgress(input: unknown): GameProgress {
  const result = ProgressSchema.safeParse(input);
  return result.success ? result.data : freshProgress();
}
export function unlockedAchievements(progress: GameProgress): string[] {
  const unlocked = [...progress.achievements];
  const add = (condition: boolean, id: string) => { if (condition && !unlocked.includes(id)) unlocked.push(id); };
  add(progress.transfers >= 1, 'first-sticker');
  add(progress.chickenTransforms >= 10, 'chicken-whisperer');
  add(progress.bounceCollisions >= 25, 'bounce-master');
  add(progress.combinations.length >= 5, 'mad-scientist');
  add(progress.completedLevels.length === 20, 'problem-solver');
  add(progress.collectedGems.length === 20, 'treasure-hunter');
  return unlocked;
}
export function unlockedCosmetics(progress: GameProgress): string[] {
  const unlocked = [...progress.unlockedCosmetics];
  const add = (condition: boolean, id: string) => { if (condition && !unlocked.includes(id)) unlocked.push(id); };
  add(progress.completedLevels.some((number) => number >= 5), 'rainbow');
  add(progress.completedLevels.some((number) => number >= 10), 'robot');
  add(progress.completedLevels.some((number) => number >= 15), 'knight');
  add(progress.completedLevels.includes(20), 'golden');
  add(progress.chickenTransforms >= 5, 'chicken');
  add(progress.tinyWins >= 3, 'tiny-crown');
  return unlocked;
}

interface ProgressStore {
  ready: boolean;
  progress: GameProgress;
  load: () => Promise<void>;
  setSettings: (patch: Partial<GameSettings>) => void;
  recordTransfer: (sticker: StickerType, sourceKind: string, resultingStickers: StickerType[]) => void;
  recordBounce: () => void;
  completeLevel: (number: number, stars: number, gem: boolean, tiny: boolean) => void;
  selectCosmetic: (id: string) => void;
  reset: () => void;
}
function commit(progress: GameProgress): GameProgress {
  progress.achievements = unlockedAchievements(progress);
  progress.unlockedCosmetics = unlockedCosmetics(progress);
  void writeStored(progress).catch(() => { try { localStorage.setItem(DATABASE, JSON.stringify(progress)); } catch { /* storage may be disabled */ } });
  return progress;
}
export const useProgress = create<ProgressStore>((set, get) => ({
  ready: false,
  progress: freshProgress(),
  load: async () => {
    let raw: unknown;
    try { raw = await readStored(); } catch { try { raw = JSON.parse(localStorage.getItem(DATABASE) || 'null'); } catch { raw = null; } }
    set({ progress: parseProgress(raw), ready: true });
  },
  setSettings: (patch) => set({ progress: commit({ ...get().progress, settings: { ...get().progress.settings, ...patch } }) }),
  recordTransfer: (sticker, sourceKind, resultingStickers) => {
    const old = get().progress;
    const discoveries = [...new Set([...old.stickerDiscoveries, sticker])];
    const combination = resultingStickers.length >= 2 ? [...resultingStickers].sort().join('+') : null;
    set({ progress: commit({ ...old, transfers: old.transfers + 1, chickenTransforms: old.chickenTransforms + (sourceKind === 'chicken' ? 1 : 0), stickerDiscoveries: discoveries, combinations: combination ? [...new Set([...old.combinations, combination])] : old.combinations }) });
  },
  recordBounce: () => { const old = get().progress; set({ progress: commit({ ...old, bounceCollisions: old.bounceCollisions + 1 }) }); },
  completeLevel: (number, stars, gem, tiny) => {
    const old = get().progress;
    set({ progress: commit({ ...old, completedLevels: [...new Set([...old.completedLevels, number])], levelStars: { ...old.levelStars, [number]: Math.max(stars, old.levelStars[number] ?? 0) }, collectedGems: gem ? [...new Set([...old.collectedGems, number])] : old.collectedGems, tinyWins: old.tinyWins + (tiny ? 1 : 0) }) });
  },
  selectCosmetic: (id) => { const old = get().progress; if (old.unlockedCosmetics.includes(id)) set({ progress: commit({ ...old, selectedCosmetic: id }) }); },
  reset: () => set({ progress: commit(freshProgress()) })
}));
