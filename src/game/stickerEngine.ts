import { BASE_STATS, type EntityDefinition, type EntityState, type Stats, type StickerType } from './model';

export type TransferError = 'missing-source' | 'missing-target' | 'same-object' | 'not-owned' | 'not-eligible' | 'duplicate' | 'full' | 'opposite-size' | 'no-room';
export type TransferResult = { ok: true; source: EntityState; target: EntityState } | { ok: false; reason: TransferError };
export type PlacementCheck = (target: EntityState, nextRadius: number) => boolean;

function clone(entity: EntityState): EntityState { return { ...entity, stickers: [...entity.stickers] }; }

export function effectiveStats(entity: Pick<EntityState, 'kind' | 'stickers'>): Stats {
  const stats = { ...BASE_STATS[entity.kind] };
  for (const sticker of entity.stickers) {
    switch (sticker) {
      case 'BIG': stats.radius *= 1.8; stats.mass *= 1.6; stats.pushForce *= 1.35; break;
      case 'TINY': stats.radius *= 0.55; stats.mass *= 0.5; break;
      case 'FAST': stats.speed *= 1.9; break;
      case 'BOUNCY': stats.restitution = Math.max(stats.restitution, 0.85); break;
      case 'HEAVY': stats.mass *= 4; stats.pushForce *= 2.3; break;
      case 'FLOATING': stats.canFloat = true; break;
      case 'MAGNETIC': stats.magneticRadius = 110; break;
      case 'SLIPPERY': stats.drag *= 0.12; break;
    }
  }
  return stats;
}

export class StickerEngine {
  private readonly initial: EntityState[];
  private entities = new Map<string, EntityState>();
  private history: EntityState[][] = [];
  readonly maxUndo = 30;

  constructor(definitions: EntityDefinition[], private placementCheck?: PlacementCheck) {
    this.initial = definitions.map((definition) => ({
      ...definition,
      vx: 0, vy: 0,
      stickers: [...(definition.stickers ?? [])],
      behavior: definition.behavior ?? 'idle',
      canReceive: definition.canReceive ?? true,
      canDonate: definition.canDonate ?? true,
      maxStickers: 3
    }));
    this.resetLevel();
  }

  get(id: string): EntityState | undefined { const value = this.entities.get(id); return value && clone(value); }
  all(): EntityState[] { return [...this.entities.values()].map(clone); }
  getStats(id: string): Stats | undefined { const entity = this.entities.get(id); return entity && effectiveStats(entity); }
  get undoCount(): number { return this.history.length; }

  updateMotion(id: string, x: number, y: number, vx: number, vy: number): void {
    const entity = this.entities.get(id);
    if (entity) Object.assign(entity, { x, y, vx, vy });
  }

  validate(sourceId: string, targetId: string, sticker: StickerType): TransferError | null {
    const source = this.entities.get(sourceId);
    const target = this.entities.get(targetId);
    if (!source) return 'missing-source';
    if (!target) return 'missing-target';
    if (sourceId === targetId) return 'same-object';
    if (!source.canDonate || !source.stickers.includes(sticker)) return 'not-owned';
    if (!target.canReceive) return 'not-eligible';
    if (target.stickers.includes(sticker)) return 'duplicate';
    if (target.stickers.length >= target.maxStickers) return 'full';
    if ((sticker === 'BIG' && target.stickers.includes('TINY')) || (sticker === 'TINY' && target.stickers.includes('BIG'))) return 'opposite-size';
    const radius = effectiveStats({ ...target, stickers: [...target.stickers, sticker] }).radius;
    if (this.placementCheck && !this.placementCheck(target, radius)) return 'no-room';
    return null;
  }

  transfer(sourceId: string, targetId: string, sticker: StickerType): TransferResult {
    const reason = this.validate(sourceId, targetId, sticker);
    if (reason) return { ok: false, reason };
    this.history.push(this.all());
    if (this.history.length > this.maxUndo) this.history.shift();
    const source = this.entities.get(sourceId)!;
    const target = this.entities.get(targetId)!;
    source.stickers = source.stickers.filter((value) => value !== sticker);
    target.stickers.push(sticker);
    return { ok: true, source: clone(source), target: clone(target) };
  }

  undo(): boolean {
    const last = this.history.pop();
    if (!last) return false;
    this.entities = new Map(last.map((entity) => [entity.id, clone(entity)]));
    return true;
  }

  resetLevel(): void {
    this.entities = new Map(this.initial.map((entity) => [entity.id, clone(entity)]));
    this.history = [];
  }
}
