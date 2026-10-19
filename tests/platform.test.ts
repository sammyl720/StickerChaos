import { expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { platformPosition } from '../src/game/platform';

it('moves course platforms back and forth within their travel range', () => {
  for (const number of [10, 16]) {
    const fixture = LEVELS[number - 1].fixtures.find((item) => item.kind === 'platform')!;
    const period = fixture.period!;
    expect(platformPosition(fixture, 0)).toBeCloseTo(fixture.x);
    expect(platformPosition(fixture, period / 4)).toBeCloseTo(fixture.x + fixture.range!);
    expect(platformPosition(fixture, period / 2)).toBeCloseTo(fixture.x);
    expect(platformPosition(fixture, period * 3 / 4)).toBeCloseTo(fixture.x - fixture.range!);
  }
});
