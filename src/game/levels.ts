import { LevelSchema, type EntityDefinition, type Fixture, type Level, type StickerType } from './model';

interface Piece { id: string; kind: EntityDefinition['kind']; stickers?: StickerType[]; behavior?: EntityDefinition['behavior']; x?: number; y?: number }
interface Puzzle { name: string; hint: string; pieces: Piece[]; goals: { target: string; requires: StickerType[]; label: string; x?: number; y?: number; minMass?: number; minSpeed?: number; minMagneticRadius?: number }[]; solution: { source: string; target: string; sticker: StickerType }[] }

const puzzles: Puzzle[] = [
  { name: 'The Giant Chicken', hint: 'Peel BIG from the chicken. Give it to the apple!', pieces: [{ id: 'cluck', kind: 'chicken', stickers: ['BIG'], x: 196, y: 119 }, { id: 'apple', kind: 'apple', x: 294, y: 275 }], goals: [{ target: 'apple', requires: ['BIG'], label: 'GIANT APPLE' }], solution: [{ source: 'cluck', target: 'apple', sticker: 'BIG' }] },
  { name: 'Turbo Snail', hint: 'A speedy snail can wake the garden switch.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['FAST'] }, { id: 'snail', kind: 'snail', behavior: 'activate' }], goals: [{ target: 'snail', requires: ['FAST'], label: 'TURBO SWITCH', x: 294, y: 142, minSpeed: 25 }], solution: [{ source: 'robot', target: 'snail', sticker: 'FAST' }] },
  { name: 'Rubber Rock', hint: 'Give the rock a bounce and watch it spring.', pieces: [{ id: 'ball', kind: 'ball', stickers: ['BOUNCY'] }, { id: 'rock', kind: 'rock' }], goals: [{ target: 'rock', requires: ['BOUNCY'], label: 'BOUNCE PAD', x: 294, y: 150, minSpeed: 80 }], solution: [{ source: 'ball', target: 'rock', sticker: 'BOUNCY' }] },
  { name: 'The Floating Boulder', hint: 'A hovering boulder can pass the pond.', pieces: [{ id: 'frog', kind: 'frog', stickers: ['FLOATING'] }, { id: 'boulder', kind: 'boulder', behavior: 'activate', x: 235, y: 270 }], goals: [{ target: 'boulder', requires: ['FLOATING'], label: 'POND PASS', x: 235, y: 425 }], solution: [{ source: 'frog', target: 'boulder', sticker: 'FLOATING' }] },
  { name: 'The Chicken King', hint: 'Shrink the king, then build a giant rubber rock.', pieces: [{ id: 'king', kind: 'chicken', stickers: ['BIG', 'BOUNCY'], behavior: 'flee', x: 90, y: 237 }, { id: 'rock', kind: 'rock' }], goals: [{ target: 'rock', requires: ['BIG', 'BOUNCY'], label: 'ROYAL SWITCH' }], solution: [{ source: 'king', target: 'rock', sticker: 'BIG' }, { source: 'king', target: 'rock', sticker: 'BOUNCY' }] },
  { name: 'Heavy Business', hint: 'A heavy crate can press the factory plate.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['HEAVY'] }, { id: 'crate', kind: 'crate' }], goals: [{ target: 'crate', requires: ['HEAVY'], label: 'WEIGHT PLATE', minMass: 6 }], solution: [{ source: 'robot', target: 'crate', sticker: 'HEAVY' }] },
  { name: 'Slippery Situation', hint: 'Make the ball slick enough to slide up the narrow course.', pieces: [{ id: 'turtle', kind: 'turtle', stickers: ['SLIPPERY'] }, { id: 'ball', kind: 'ball' }], goals: [{ target: 'ball', requires: ['SLIPPERY'], label: 'SLIDE COURSE', x: 294, y: 150, minSpeed: 70 }], solution: [{ source: 'turtle', target: 'ball', sticker: 'SLIPPERY' }] },
  { name: 'Mouse-Sized Mission', hint: 'Shrink the crate to slip through the tiny doorway.', pieces: [{ id: 'snail', kind: 'snail', stickers: ['TINY'] }, { id: 'crate', kind: 'crate', behavior: 'activate' }], goals: [{ target: 'crate', requires: ['TINY'], label: 'TINY DOOR', x: 294, y: 155 }], solution: [{ source: 'snail', target: 'crate', sticker: 'TINY' }] },
  { name: 'Apple Avalanche', hint: 'Launch a huge bouncing ball into the barrier switch.', pieces: [{ id: 'chicken', kind: 'chicken', stickers: ['BIG'] }, { id: 'robot', kind: 'robot', stickers: ['BOUNCY'], x: 85, y: 380 }, { id: 'ball', kind: 'ball' }], goals: [{ target: 'ball', requires: ['BIG', 'BOUNCY'], label: 'BARRIER', x: 294, y: 205, minSpeed: 100 }], solution: [{ source: 'chicken', target: 'ball', sticker: 'BIG' }, { source: 'robot', target: 'ball', sticker: 'BOUNCY' }] },
  { name: 'Turbo Trouble', hint: 'Steal FAST from the giant robot and send the slippery turtle to its trap switch.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['BIG', 'FAST'], behavior: 'chase' }, { id: 'crate', kind: 'crate', stickers: ['SLIPPERY'], x: 85, y: 380 }, { id: 'turtle', kind: 'turtle', behavior: 'activate' }], goals: [{ target: 'turtle', requires: ['FAST', 'SLIPPERY'], label: 'TURBO TRACK', x: 294, y: 158 }], solution: [{ source: 'robot', target: 'turtle', sticker: 'FAST' }, { source: 'crate', target: 'turtle', sticker: 'SLIPPERY' }] },
  { name: 'Magnetic Madness', hint: 'Send a magnetic key through the narrow lock channel.', pieces: [{ id: 'knight', kind: 'knight', stickers: ['MAGNETIC'] }, { id: 'key', kind: 'key', behavior: 'activate' }, { id: 'crate', kind: 'crate', x: 245, y: 340 }], goals: [{ target: 'key', requires: ['MAGNETIC'], label: 'MAGNET LOCK', x: 294, y: 155, minMagneticRadius: 100 }], solution: [{ source: 'knight', target: 'key', sticker: 'MAGNETIC' }] },
  { name: 'Across the Moat', hint: 'Help the frog float above the moat.', pieces: [{ id: 'chicken', kind: 'chicken', stickers: ['FLOATING'] }, { id: 'frog', kind: 'frog', behavior: 'activate', x: 235, y: 270 }], goals: [{ target: 'frog', requires: ['FLOATING'], label: 'MOAT', x: 235, y: 425 }], solution: [{ source: 'chicken', target: 'frog', sticker: 'FLOATING' }] },
  { name: 'Heavyweight Hero', hint: 'Make the boulder BIG and HEAVY.', pieces: [{ id: 'knight', kind: 'knight', stickers: ['BIG'] }, { id: 'crate', kind: 'crate', stickers: ['HEAVY'], x: 85, y: 380 }, { id: 'boulder', kind: 'boulder' }], goals: [{ target: 'boulder', requires: ['BIG', 'HEAVY'], label: 'DRAWBRIDGE', minMass: 15 }], solution: [{ source: 'knight', target: 'boulder', sticker: 'BIG' }, { source: 'crate', target: 'boulder', sticker: 'HEAVY' }] },
  { name: 'Tiny Trouble', hint: 'Borrow TINY, then sneak yourself to the little door.', pieces: [{ id: 'snail', kind: 'snail', stickers: ['TINY'] }, { id: 'ball', kind: 'ball' }], goals: [{ target: 'player', requires: ['TINY'], label: 'LITTLE DOOR' }], solution: [{ source: 'snail', target: 'player', sticker: 'TINY' }] },
  { name: 'The Great Chicken Chase', hint: 'Take FAST from the giant knight and send the chicken to ring the castle bell.', pieces: [{ id: 'knight', kind: 'knight', stickers: ['BIG', 'FAST'] }, { id: 'chicken', kind: 'chicken', behavior: 'activate' }], goals: [{ target: 'chicken', requires: ['FAST'], label: 'CASTLE BELL', x: 294, y: 155 }], solution: [{ source: 'knight', target: 'chicken', sticker: 'FAST' }] },
  { name: 'Slippery Slalom', hint: 'Send the turtle sliding through the factory.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['SLIPPERY'] }, { id: 'turtle', kind: 'turtle' }], goals: [{ target: 'turtle', requires: ['SLIPPERY'], label: 'SLALOM', x: 294, y: 165, minSpeed: 80 }], solution: [{ source: 'robot', target: 'turtle', sticker: 'SLIPPERY' }] },
  { name: 'Magnet Mayhem', hint: 'A heavy magnet can pull the factory gears.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['MAGNETIC'] }, { id: 'crate', kind: 'crate', stickers: ['HEAVY'], x: 85, y: 380 }, { id: 'key', kind: 'key', x: 275, y: 344 }, { id: 'boulder', kind: 'boulder', x: 294, y: 270 }], goals: [{ target: 'boulder', requires: ['MAGNETIC', 'HEAVY'], label: 'GEAR LOCK', minMass: 10, minMagneticRadius: 100 }], solution: [{ source: 'robot', target: 'boulder', sticker: 'MAGNETIC' }, { source: 'crate', target: 'boulder', sticker: 'HEAVY' }] },
  { name: 'Bounce Castle', hint: 'Give the ball a giant springy surprise.', pieces: [{ id: 'chicken', kind: 'chicken', stickers: ['BIG'] }, { id: 'robot', kind: 'robot', stickers: ['BOUNCY'], x: 85, y: 380 }, { id: 'ball', kind: 'ball' }], goals: [{ target: 'ball', requires: ['BIG', 'BOUNCY'], label: 'TRIPLE SWITCH', x: 294, y: 155, minSpeed: 100 }], solution: [{ source: 'chicken', target: 'ball', sticker: 'BIG' }, { source: 'robot', target: 'ball', sticker: 'BOUNCY' }] },
  { name: 'The Sticker Factory', hint: 'Power all three machines with different sticker tricks.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['FAST'], y: 165 }, { id: 'frog', kind: 'frog', stickers: ['FLOATING'], x: 85, y: 290 }, { id: 'knight', kind: 'knight', stickers: ['MAGNETIC'], x: 85, y: 415 }, { id: 'snail', kind: 'snail', x: 300, y: 165 }, { id: 'rock', kind: 'rock', x: 300, y: 290 }, { id: 'key', kind: 'key', x: 300, y: 415 }], goals: [{ target: 'snail', requires: ['FAST'], label: 'TURBO PRINTER' }, { target: 'rock', requires: ['FLOATING'], label: 'HOVER PRINTER' }, { target: 'key', requires: ['MAGNETIC'], label: 'MAGNET PRINTER' }], solution: [{ source: 'robot', target: 'snail', sticker: 'FAST' }, { source: 'frog', target: 'rock', sticker: 'FLOATING' }, { source: 'knight', target: 'key', sticker: 'MAGNETIC' }] },
  { name: 'King Cluck Returns', hint: 'Steal BIG, FAST, then HEAVY from the robot king!', pieces: [{ id: 'king', kind: 'robot', stickers: ['BIG', 'FAST', 'HEAVY'], x: 85, y: 270 }, { id: 'apple', kind: 'apple', x: 300, y: 165 }, { id: 'snail', kind: 'snail', x: 300, y: 290 }, { id: 'boulder', kind: 'boulder', x: 300, y: 415 }], goals: [{ target: 'apple', requires: ['BIG'], label: 'BIG SWITCH' }, { target: 'snail', requires: ['FAST'], label: 'FAST SWITCH' }, { target: 'boulder', requires: ['HEAVY'], label: 'HEAVY PLATE', minMass: 10 }], solution: [{ source: 'king', target: 'apple', sticker: 'BIG' }, { source: 'king', target: 'snail', sticker: 'FAST' }, { source: 'king', target: 'boulder', sticker: 'HEAVY' }] }
];

export const WORLD_NAMES = ['Wobble Village', 'Turbo Town', 'Castle of Chaos', 'Reality Factory'] as const;
export const WORLD_ICONS = ['🌳', '⚙️', '🏰', '✨'] as const;

const wall = (x: number, y: number, w: number, h: number, opensAfter?: number): Fixture => ({ kind: 'wall', x, y, w, h, opensAfter });
const gate = (y: number, opensAfter: number): Fixture => ({ kind: 'gate', x: 195, y, w: 360, h: 16, opensAfter });
const conveyor = (x: number, y: number, w: number, dx: number, dy = 0): Fixture => ({ kind: 'conveyor', x, y, w, h: 27, dx, dy });
const hazard = (x: number, y: number, w: number): Fixture => ({ kind: 'hazard', x, y, w, h: 43 });
const platform = (x: number, y: number, w: number, range: number, period: number): Fixture => ({ kind: 'platform', x, y, w, h: 24, range, period });

// Each arena has its own physical route. Gates retract when their linked switch count is reached.
const fixturesByLevel: Fixture[][] = [
  [wall(118, 121, 16, 130), wall(272, 121, 16, 130)],
  [wall(161, 375, 22, 102), wall(230, 375, 22, 102), conveyor(270, 430, 150, 85), gate(175, 1)],
  [wall(240, 218, 15, 100), wall(351, 218, 15, 100), gate(126, 1)],
  [hazard(195, 358, 170), wall(100, 355, 12, 82), wall(290, 355, 12, 82), gate(180, 1)],
  [wall(60, 350, 15, 105), wall(333, 350, 15, 105), gate(164, 1)],
  [conveyor(200, 383, 180, -80), wall(135, 345, 15, 94), gate(175, 1)],
  [wall(243, 222, 16, 115), wall(349, 222, 16, 115), conveyor(177, 404, 135, 95), gate(115, 1)],
  [wall(148, 210, 260, 16, 1), wall(340, 210, 60, 16, 1), gate(128, 1)],
  [wall(236, 288, 14, 82), wall(352, 288, 14, 82), gate(158, 1)],
  [conveyor(204, 332, 225, -120), platform(188, 421, 95, 76, 2600), wall(225, 246, 18, 80), gate(175, 1)],
  [wall(149, 210, 255, 16, 1), wall(344, 210, 50, 16, 1), gate(126, 1)],
  [hazard(195, 358, 163), wall(113, 360, 13, 87), gate(173, 1)],
  [wall(195, 354, 124, 18), wall(289, 434, 18, 90), gate(168, 1)],
  [wall(96, 202, 174, 31), wall(294, 202, 174, 31)],
  [wall(177, 367, 20, 125), wall(236, 367, 20, 125), gate(170, 1)],
  [conveyor(195, 353, 250, 115), platform(196, 430, 104, 70, 2900), wall(116, 270, 14, 92), gate(130, 1)],
  [wall(170, 365, 125, 16), conveyor(287, 440, 130, -75), gate(168, 1)],
  [wall(228, 307, 17, 126), wall(359, 307, 13, 126), gate(170, 1)],
  [conveyor(195, 344, 255, 105), gate(236, 1), gate(145, 3)],
  [gate(377, 1), gate(241, 2), gate(127, 3), conveyor(238, 452, 145, -70)]
];

function buildLevel(puzzle: Puzzle, index: number): Level {
  const world = Math.floor(index / 5) + 1;
  const entities: EntityDefinition[] = [
    { id: 'player', kind: 'bandit', x: 193, y: 495, stickers: [], behavior: 'idle', canDonate: true, canReceive: true },
    ...puzzle.pieces.map((piece, pieceIndex) => ({
      id: piece.id, kind: piece.kind,
      x: piece.x ?? (pieceIndex < 2 ? (pieceIndex === 0 ? 86 : 294) : 294),
      y: piece.y ?? (pieceIndex < 2 ? 270 : 380),
      stickers: piece.stickers ?? [],
      behavior: piece.behavior ?? 'idle'
    }))
  ];
  const goals = puzzle.goals.map((goal, goalIndex) => {
    const target = entities.find((entity) => entity.id === goal.target)!;
    return { id: `goal-${goalIndex}`, x: goal.x ?? target.x, y: goal.y ?? target.y, radius: goal.target === 'player' ? 42 : 35, targetId: goal.target, requires: goal.requires, label: goal.label, minMass: goal.minMass, minSpeed: goal.minSpeed, minMagneticRadius: goal.minMagneticRadius };
  });
  return LevelSchema.parse({
    number: index + 1, name: puzzle.name, world, hint: puzzle.hint,
    entities, goals, fixtures: fixturesByLevel[index],
    bossId: ({ 4: 'king', 9: 'robot', 14: 'knight', 19: 'king' } as Record<number, string>)[index],
    goalOrder: index === 18 || index === 19 ? 'sequential' : 'any',
    treasure: { x: 77, y: 502 },
    gem: { x: index % 2 === 0 ? 333 : 55, y: 105 },
    exit: { x: 195, y: 62 },
    par: puzzle.solution.length,
    solution: puzzle.solution
  });
}

export const LEVELS: Level[] = puzzles.map(buildLevel);
export function getLevel(number: number): Level { const level = LEVELS[number - 1]; if (!level) throw new Error(`Unknown level ${number}`); return level; }
