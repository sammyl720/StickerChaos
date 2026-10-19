import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { LevelSchema, type Fixture, type Level } from '../src/game/model';
import { effectiveStats, StickerEngine } from '../src/game/stickerEngine';

function canReach(level: Level, start: {x:number;y:number}, goal: {x:number;y:number}, radius: number, opened: number, extra?: {x:number;y:number;r:number}): boolean {
  const solids = level.fixtures.filter((fixture) => (fixture.kind === 'wall' || fixture.kind === 'gate') && (fixture.opensAfter === undefined || fixture.opensAfter > opened));
  const width = 79, height = 125;
  const free = (x:number,y:number): boolean => {
    if (x-radius<12 || x+radius>378 || y-radius<34 || y+radius>608) return false;
    if (extra && Math.hypot(x-extra.x,y-extra.y)<radius+extra.r) return false;
    return !solids.some((fixture: Fixture) => {
      const dx=Math.max(Math.abs(x-fixture.x)-fixture.w/2,0);
      const dy=Math.max(Math.abs(y-fixture.y)-fixture.h/2,0);
      return Math.hypot(dx,dy)<radius;
    });
  };
  const queue: [number,number][] = [[Math.round(start.x/5),Math.round(start.y/5)]];
  const visited = new Set<number>();
  for(let head=0;head<queue.length;head++) {
    const [gx,gy]=queue[head], key=gy*width+gx;
    if(visited.has(key)) continue;
    visited.add(key);
    const x=gx*5,y=gy*5;
    if(!free(x,y)) continue;
    if(Math.hypot(x-goal.x,y-goal.y)<22) return true;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx=gx+dx,ny=gy+dy;
      if(nx>=0 && nx<width && ny>=0 && ny<height && !visited.has(ny*width+nx)) queue.push([nx,ny]);
    }
  }
  return false;
}

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
        const stats = effectiveStats(entity);
        if (goal.minMass !== undefined) expect(stats.mass, `${level.number}: ${goal.label} too light`).toBeGreaterThanOrEqual(goal.minMass);
        if (goal.minMagneticRadius !== undefined) expect(stats.magneticRadius, `${level.number}: ${goal.label} not magnetic`).toBeGreaterThanOrEqual(goal.minMagneticRadius);
        const distance = Math.hypot(entity.x-goal.x,entity.y-goal.y);
        if (distance > goal.radius) {
          expect(distance, `${level.number}: ${goal.label} unreachable`).toBeLessThan(240);
          expect(entity.behavior === 'activate' || entity.stickers.includes('BOUNCY') || entity.stickers.includes('SLIPPERY'), `${level.number}: ${goal.label} cannot move`).toBe(true);
        }
      }
    }
  });
  it('leave a traversable route from treasure to exit after the documented solution', () => {
    for(const level of LEVELS) {
      const engine = new StickerEngine(level.entities);
      for(const step of level.solution) expect(engine.transfer(step.source,step.target,step.sticker).ok).toBe(true);
      const player = engine.get('player')!;
      const radius = effectiveStats(player).radius;
      const chicken = level.number===1 ? engine.get('cluck')! : null;
      const obstacle = chicken ? {x:chicken.x,y:chicken.y,r:effectiveStats(chicken).radius} : undefined;
      expect(canReach(level,player,level.treasure,radius,level.goals.length,obstacle),`level ${level.number} treasure blocked`).toBe(true);
      expect(canReach(level,level.treasure,level.exit,radius,level.goals.length,obstacle),`level ${level.number} exit blocked`).toBe(true);
    }
  });
  it('requires shrinking to pass the two narrow passages', () => {
    const first=LEVELS[0], chicken=first.entities.find((entity)=>entity.id==='cluck')!;
    expect(canReach(first,first.treasure,first.exit,18,1,{x:chicken.x,y:chicken.y,r:43.2})).toBe(false);
    expect(canReach(first,first.treasure,first.exit,18,1,{x:chicken.x,y:chicken.y,r:24})).toBe(true);
    const tiny=LEVELS[13];
    expect(canReach(tiny,tiny.treasure,tiny.exit,18,1)).toBe(false);
    expect(canReach(tiny,tiny.treasure,tiny.exit,9.9,1)).toBe(true);
  });
});
