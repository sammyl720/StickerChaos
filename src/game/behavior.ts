import { effectiveStats } from './stickerEngine';
import type { EntityState } from './model';

interface Point { x: number; y: number }

/** Returns a commanded velocity, or null when physics should carry the object. */
export function creatureVelocity(entity: EntityState, home: Point, player: Point, elapsed: number, stunned: boolean): Point | null {
  if (stunned || entity.behavior === 'stunned') return {x: 0, y: 0};
  const speed = effectiveStats(entity).speed;
  const toward = (target: Point, multiplier = 1): Point => {
    const dx = target.x - entity.x, dy = target.y - entity.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 5) return {x: 0, y: 0};
    return {x: dx / distance * speed * multiplier, y: dy / distance * speed * multiplier};
  };
  if (entity.behavior === 'chase' || entity.behavior === 'flee') {
    const dx = player.x - entity.x, dy = player.y - entity.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 155 || distance < 1) return {x: 0, y: 0};
    const direction = entity.behavior === 'chase' ? 1 : -1;
    return {x: direction * dx / distance * speed * .75, y: direction * dy / distance * speed * .75};
  }
  if (entity.behavior === 'wander') {
    const phase = elapsed * .00065 + entity.id.length;
    return toward({x: home.x + Math.cos(phase) * 42, y: home.y + Math.sin(phase * .8) * 38}, .55);
  }
  if (entity.behavior === 'patrol') return toward({x: home.x + Math.sin(elapsed * .001) * 58, y: home.y}, .7);
  if (entity.behavior === 'idle' && entity.stickers.includes('FAST')) {
    const phase = elapsed * .001 + entity.id.length;
    return {x: Math.cos(phase * .9) * speed * .55, y: Math.sin(phase * 1.15) * speed * .55};
  }
  return null;
}
