import { describe, expect, it } from 'vitest';
import { BASE_STATS, type EntityDefinition } from '../src/game/model';
import { StickerEngine, effectiveStats } from '../src/game/stickerEngine';

const pieces: EntityDefinition[] = [
  { id: 'chicken', kind: 'chicken', x: 70, y: 140, stickers: ['BIG', 'BOUNCY'] },
  { id: 'apple', kind: 'apple', x: 280, y: 300, stickers: [] },
  { id: 'snail', kind: 'snail', x: 80, y: 400, stickers: ['TINY'] },
  { id: 'rock', kind: 'rock', x: 270, y: 440, stickers: ['HEAVY'] }
];

describe('sticker engine', () => {
  it('transfers atomically and recomputes base stats after removing stickers', () => {
    const engine = new StickerEngine(pieces);
    expect(engine.transfer('chicken', 'apple', 'BIG').ok).toBe(true);
    expect(engine.get('chicken')?.stickers).toEqual(['BOUNCY']);
    expect(engine.get('apple')?.stickers).toEqual(['BIG']);
    expect(engine.getStats('chicken')?.radius).toBe(BASE_STATS.chicken.radius);
    expect(engine.getStats('apple')?.radius).toBeCloseTo(BASE_STATS.apple.radius * 1.8);
  });
  it('combines independent property modifiers', () => {
    const stats = effectiveStats({ kind:'rock', stickers:['BIG','HEAVY','BOUNCY'] });
    expect(stats.radius).toBeCloseTo(BASE_STATS.rock.radius * 1.8);
    expect(stats.mass).toBeCloseTo(BASE_STATS.rock.mass * 1.6 * 4);
    expect(stats.restitution).toBeGreaterThanOrEqual(.85);
    expect(effectiveStats({kind:'apple',stickers:['FAST','SLIPPERY']}).drag).toBeLessThan(BASE_STATS.apple.drag / 4);
    expect(effectiveStats({kind:'rock',stickers:['FLOATING','HEAVY']}).canFloat).toBe(true);
  });
  it('rejects duplicate, opposite size, full capacity, and invalid source without mutation', () => {
    const engine = new StickerEngine(pieces);
    expect(engine.transfer('chicken','chicken','BIG')).toEqual({ok:false,reason:'same-object'});
    expect(engine.transfer('chicken','snail','BIG')).toEqual({ok:false,reason:'opposite-size'});
    expect(engine.transfer('chicken','apple','FAST')).toEqual({ok:false,reason:'not-owned'});
    expect(engine.transfer('chicken','apple','BIG').ok).toBe(true);
    expect(engine.transfer('chicken','apple','BOUNCY').ok).toBe(true);
    expect(engine.transfer('rock','apple','HEAVY').ok).toBe(true);
    expect(engine.transfer('snail','apple','TINY')).toEqual({ok:false,reason:'full'});
    expect(engine.get('snail')?.stickers).toEqual(['TINY']);
  });
  it('rejects growth when the placement check fails', () => {
    const engine = new StickerEngine(pieces, (_target,radius)=>radius<25);
    expect(engine.transfer('chicken','apple','BIG')).toEqual({ok:false,reason:'no-room'});
    expect(engine.undoCount).toBe(0);
  });
  it('undoes sticker and motion changes and restarts the whole level', () => {
    const engine = new StickerEngine(pieces);
    engine.updateMotion('chicken',100,150,5,4);
    expect(engine.transfer('chicken','apple','BIG').ok).toBe(true);
    engine.updateMotion('chicken',190,200,20,5);
    expect(engine.undo()).toBe(true);
    expect(engine.get('chicken')).toMatchObject({x:100,y:150,vx:5,vy:4,stickers:['BIG','BOUNCY']});
    expect(engine.get('apple')?.stickers).toEqual([]);
    engine.resetLevel();
    expect(engine.get('chicken')).toMatchObject({x:70,y:140,vx:0,stickers:['BIG','BOUNCY']});
    expect(engine.undo()).toBe(false);
  });
});
