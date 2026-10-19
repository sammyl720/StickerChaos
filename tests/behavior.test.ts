import { describe, expect, it } from 'vitest';
import { creatureVelocity } from '../src/game/behavior';
import { EntitySchema, type Behavior, type EntityState } from '../src/game/model';

const actor = (behavior: Behavior, stickers: EntityState['stickers'] = []): EntityState => ({
  id: 'actor', kind: 'robot', x: 100, y: 100, vx: 0, vy: 0,
  stickers, behavior, maxStickers: 3, canReceive: true, canDonate: true
});

describe('creature behaviors', () => {
  it('chases and flees only when the player is nearby', () => {
    const home = {x:100,y:100};
    const player = {x:160,y:100};
    expect(creatureVelocity(actor('chase'),home,player,0,false)!.x).toBeGreaterThan(0);
    expect(creatureVelocity(actor('flee'),home,player,0,false)!.x).toBeLessThan(0);
    expect(creatureVelocity(actor('chase'),home,{x:300,y:100},0,false)).toEqual({x:0,y:0});
    expect(creatureVelocity(actor('chase',['FAST']),home,player,0,false)!.x).toBeGreaterThan(creatureVelocity(actor('chase'),home,player,0,false)!.x);
  });

  it('supports bounded wander, patrol, and temporary stun', () => {
    const home = {x:100,y:100}, player = {x:160,y:100};
    expect(creatureVelocity(actor('wander'),home,player,1000,false)).not.toEqual({x:0,y:0});
    expect(creatureVelocity(actor('patrol'),home,player,1000,false)!.y).toBe(0);
    expect(creatureVelocity(actor('chase'),home,player,1000,true)).toEqual({x:0,y:0});
    expect(EntitySchema.parse({id:'stunned',kind:'robot',x:100,y:100,behavior:'stunned'}).behavior).toBe('stunned');
    expect(creatureVelocity(actor('stunned'),home,player,1000,false)).toEqual({x:0,y:0});
  });
});
