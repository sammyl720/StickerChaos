import { describe, expect, it } from 'vitest';
import { DEFAULT_PROGRESS, parseProgress, unlockedAchievements, unlockedCosmetics } from '../src/state/progress';

describe('local progress', () => {
  it('round trips a versioned save and recovers from corrupt data', () => {
    const saved = {...structuredClone(DEFAULT_PROGRESS), completedLevels:[1,2], levelStars:{'1':3,'2':2}};
    expect(parseProgress(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
    const oldSave = structuredClone(saved);
    const oldSettings = oldSave.settings as Partial<typeof saved.settings>;
    delete oldSettings.graphicsQuality;
    expect(parseProgress(oldSave)).toEqual(saved);
    expect(parseProgress({bad:true})).toEqual(DEFAULT_PROGRESS);
    expect(parseProgress('garbage')).toEqual(DEFAULT_PROGRESS);
  });
  it('unlocks achievements and cosmetics from play, never from payment', () => {
    const progress = {...structuredClone(DEFAULT_PROGRESS), transfers:1, chickenTransforms:10, bounceCollisions:25, combinations:['a','b','c','d','e'], completedLevels:Array.from({length:20},(_,index)=>index+1),collectedGems:Array.from({length:20},(_,index)=>index+1),tinyWins:3};
    expect(unlockedAchievements(progress)).toHaveLength(6);
    expect(unlockedCosmetics(progress)).toContain('golden');
    expect(unlockedCosmetics(progress)).toContain('tiny-crown');
  });
});
