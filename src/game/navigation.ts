import type { Fixture } from './model';

export interface Point { x: number; y: number }
export interface RoundObstacle extends Point { radius: number }

// Four pixels preserve the four-pixel-wide center line of the castle's tiny doorway.
const STEP = 4;

/** Find waypoints that keep the whole player body clear of walls and other objects. */
export function findTapRoute(
  start: Point,
  destination: Point,
  radius: number,
  fixtures: Fixture[],
  activeGoals: number,
  obstacles: RoundObstacle[],
  canFloat: boolean
): Point[] | null {
  const minX = 12 + radius, maxX = 378 - radius;
  const minY = 34 + radius, maxY = 608 - radius;
  const columns = Math.floor((maxX - minX) / STEP) + 1;
  const rows = Math.floor((maxY - minY) / STEP) + 1;
  const solids = fixtures.filter((fixture) =>
    (fixture.kind === 'wall' || fixture.kind === 'gate' || (fixture.kind === 'hazard' && !canFloat))
    && (fixture.opensAfter === undefined || activeGoals < fixture.opensAfter)
  );
  const clear = ({x, y}: Point): boolean => {
    if (x < minX || x > maxX || y < minY || y > maxY) return false;
    if (obstacles.some((obstacle) => Math.hypot(x - obstacle.x, y - obstacle.y) < radius + obstacle.radius + 1)) return false;
    return solids.every((fixture) => {
      const dx = Math.max(Math.abs(x - fixture.x) - fixture.w / 2, 0);
      const dy = Math.max(Math.abs(y - fixture.y) - fixture.h / 2, 0);
      return Math.hypot(dx, dy) >= radius + 1;
    });
  };
  const lineClear = (a: Point, b: Point): boolean => {
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    for (let step = 0; step <= Math.ceil(distance / 4); step++) {
      const t = step / Math.max(1, Math.ceil(distance / 4));
      if (!clear({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t})) return false;
    }
    return true;
  };
  if (clear(destination) && lineClear(start, destination)) return [destination];

  const total = columns * rows;
  const blocked = new Uint8Array(total);
  const point = (cell: number): Point => ({x: minX + (cell % columns) * STEP, y: minY + Math.floor(cell / columns) * STEP});
  for (let cell = 0; cell < total; cell++) if (!clear(point(cell))) blocked[cell] = 1;
  const nearest = (p: Point): number => {
    let best = -1, distance = Infinity;
    for (let cell = 0; cell < total; cell++) {
      if (blocked[cell]) continue;
      const here = point(cell);
      const d = (p.x - here.x) ** 2 + (p.y - here.y) ** 2;
      if (d < distance) { best = cell; distance = d; }
    }
    return best;
  };
  const origin = nearest(start), goal = nearest(destination);
  if (origin < 0 || goal < 0) return null;
  const visited = new Uint8Array(total);
  const previous = new Int32Array(total).fill(-1);
  const queue = new Int32Array(total);
  let head = 0, tail = 0;
  queue[tail++] = origin; visited[origin] = 1;
  const directions = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]] as const;
  while (head < tail && !visited[goal]) {
    const cell = queue[head++];
    const x = cell % columns, y = Math.floor(cell / columns);
    for (const [dx, dy] of directions) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= columns || ny < 0 || ny >= rows) continue;
      const next = ny * columns + nx;
      if (blocked[next] || visited[next]) continue;
      if (dx && dy && (blocked[y * columns + nx] || blocked[ny * columns + x])) continue;
      visited[next] = 1; previous[next] = cell; queue[tail++] = next;
    }
  }
  if (!visited[goal]) return null;
  const cells: number[] = [];
  for (let cell = goal; cell !== origin; cell = previous[cell]) cells.push(cell);
  cells.reverse();
  const raw = [start, ...cells.map(point)];
  if (clear(destination)) raw.push(destination);
  const route: Point[] = [];
  for (let index = 0; index < raw.length - 1;) {
    let next = raw.length - 1;
    while (next > index + 1 && !lineClear(raw[index], raw[next])) next--;
    route.push(raw[next]); index = next;
  }
  return route;
}
