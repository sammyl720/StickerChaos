import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { LevelSchema } from '../src/game/model';
import { StickerEngine } from '../src/game/stickerEngine';

describe('all 20 level definitions', () => {
  it('have distinct names and valid, achievable sticker goals', () => {
    expect(LEVELS).toHaveLength(20);
    expect(new Set(LEVELS.map((level)=>level.name)).size).toBe(20);
    for(const level of LEVELS) {
      expect(LevelSchema.safeParse(level).success, `invalid level ${level.number}`).toBe(true);
      const engine = new StickerEngine(level.entities);
      for(const step of level.solution) expect(engine.transfer(step.source,step.target,step.sticker), `${level.number}: ${step.sticker}`).toMatchObject({ok:true});
      for(const goal of level.goals) {
        const entity = engine.get(goal.targetId)!;
        expect(goal.requires.every((sticker)=>entity.stickers.includes(sticker)), `${level.number}: ${goal.label}`).toBe(true);
        const distance = Math.hypot(entity.x-goal.x,entity.y-goal.y);
        if (distance > goal.radius) {
          expect(distance, `${level.number}: ${goal.label} unreachable`).toBeLessThan(240);
          expect(entity.behavior === 'activate' || entity.stickers.includes('BOUNCY') || entity.stickers.includes('SLIPPERY'), `${level.number}: ${goal.label} cannot move`).toBe(true);
        }
      }
    }
  });
});
