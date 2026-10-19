import type { Fixture } from './model';

export function platformPosition(fixture: Fixture, elapsed: number): number {
  return fixture.x + Math.sin(elapsed * Math.PI * 2 / (fixture.period ?? 3000)) * (fixture.range ?? 0);
}
