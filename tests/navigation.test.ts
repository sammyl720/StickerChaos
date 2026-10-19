import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { findTapRoute } from '../src/game/navigation';
import { effectiveStats, StickerEngine } from '../src/game/stickerEngine';

describe('tap navigation', () => {
  it('can reach the treasure and exit on every solved level', () => {
    for (const level of LEVELS) {
      const engine = new StickerEngine(level.entities);
      for (const step of level.solution) expect(engine.transfer(step.source, step.target, step.sticker).ok).toBe(true);
      const player = engine.get('player')!;
      const stats = effectiveStats(player);
      const obstacles = engine.all().filter((entity) => entity.id !== 'player').map((entity) => ({
        x: entity.x, y: entity.y, radius: effectiveStats(entity).radius
      }));
      expect(findTapRoute(player, level.treasure, stats.radius, level.fixtures, level.goals.length, obstacles, stats.canFloat), `level ${level.number} treasure`).not.toBeNull();
      expect(findTapRoute(level.treasure, level.exit, stats.radius, level.fixtures, level.goals.length, obstacles, stats.canFloat), `level ${level.number} exit`).not.toBeNull();
    }
  });

  it('finds the narrow passage only after the giant chicken shrinks', () => {
    const level = LEVELS[0];
    const engine = new StickerEngine(level.entities);
    const obstacles = () => engine.all().filter((entity) => entity.id !== 'player').map((entity) => ({
      x: entity.x, y: entity.y, radius: effectiveStats(entity).radius
    }));
    expect(findTapRoute(level.treasure, level.exit, 18, level.fixtures, 1, obstacles(), false)).toBeNull();
    expect(engine.transfer('cluck', 'apple', 'BIG').ok).toBe(true);
    const route = findTapRoute(level.treasure, level.exit, 18, level.fixtures, 1, obstacles(), false);
    expect(route).not.toBeNull();
    expect(route!.some((point) => point.x > 144 && point.x < 154)).toBe(true);
  });

  it('routes a tiny player through the castle opening', () => {
    const level = LEVELS[13];
    expect(findTapRoute(level.treasure, level.exit, 18, level.fixtures, 1, [], false)).toBeNull();
    const route = findTapRoute(level.treasure, level.exit, 9.9, level.fixtures, 1, [], false);
    expect(route).not.toBeNull();
    expect(route!.some((point) => point.x > 190 && point.x < 200)).toBe(true);
  });

  it('does not route through a locked exit gate', () => {
    const level = LEVELS[19];
    expect(findTapRoute(level.treasure, level.exit, 18, level.fixtures, 0, [], false)).toBeNull();
    expect(findTapRoute(level.treasure, level.exit, 18, level.fixtures, 3, [], false)).not.toBeNull();
  });
});
