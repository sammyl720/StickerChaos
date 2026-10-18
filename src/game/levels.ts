import { LevelSchema, type EntityDefinition, type Level, type StickerType } from './model';

interface Piece { id: string; kind: EntityDefinition['kind']; stickers?: StickerType[]; behavior?: EntityDefinition['behavior']; x?: number; y?: number }
interface Puzzle { name: string; hint: string; pieces: Piece[]; goals: { target: string; requires: StickerType[]; label: string; x?: number; y?: number }[]; solution: { source: string; target: string; sticker: StickerType }[] }

const puzzles: Puzzle[] = [
  { name: 'The Giant Chicken', hint: 'Peel BIG from the chicken. Give it to the apple!', pieces: [{ id: 'cluck', kind: 'chicken', stickers: ['BIG'], x: 196, y: 119 }, { id: 'apple', kind: 'apple', x: 294, y: 275 }], goals: [{ target: 'apple', requires: ['BIG'], label: 'GIANT APPLE' }], solution: [{ source: 'cluck', target: 'apple', sticker: 'BIG' }] },
  { name: 'Turbo Snail', hint: 'A speedy snail can wake the garden switch.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['FAST'] }, { id: 'snail', kind: 'snail', behavior: 'activate' }], goals: [{ target: 'snail', requires: ['FAST'], label: 'TURBO SWITCH', x: 294, y: 142 }], solution: [{ source: 'robot', target: 'snail', sticker: 'FAST' }] },
  { name: 'Rubber Rock', hint: 'Give the rock a bounce and watch it spring.', pieces: [{ id: 'ball', kind: 'ball', stickers: ['BOUNCY'] }, { id: 'rock', kind: 'rock' }], goals: [{ target: 'rock', requires: ['BOUNCY'], label: 'BOUNCE PAD', x: 294, y: 150 }], solution: [{ source: 'ball', target: 'rock', sticker: 'BOUNCY' }] },
  { name: 'The Floating Boulder', hint: 'A hovering boulder can pass the pond.', pieces: [{ id: 'frog', kind: 'frog', stickers: ['FLOATING'] }, { id: 'boulder', kind: 'boulder', behavior: 'activate', x: 235, y: 270 }], goals: [{ target: 'boulder', requires: ['FLOATING'], label: 'POND PASS', x: 235, y: 425 }], solution: [{ source: 'frog', target: 'boulder', sticker: 'FLOATING' }] },
  { name: 'The Chicken King', hint: 'Shrink the king, then build a giant rubber rock.', pieces: [{ id: 'king', kind: 'chicken', stickers: ['BIG', 'BOUNCY'], x: 90, y: 237 }, { id: 'rock', kind: 'rock' }], goals: [{ target: 'rock', requires: ['BIG', 'BOUNCY'], label: 'ROYAL SWITCH' }], solution: [{ source: 'king', target: 'rock', sticker: 'BIG' }, { source: 'king', target: 'rock', sticker: 'BOUNCY' }] },
  { name: 'Heavy Business', hint: 'A heavy crate can press the factory plate.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['HEAVY'] }, { id: 'crate', kind: 'crate' }], goals: [{ target: 'crate', requires: ['HEAVY'], label: 'WEIGHT PLATE' }], solution: [{ source: 'robot', target: 'crate', sticker: 'HEAVY' }] },
  { name: 'Slippery Situation', hint: 'Make the ball slick enough to slide.', pieces: [{ id: 'turtle', kind: 'turtle', stickers: ['SLIPPERY'] }, { id: 'ball', kind: 'ball' }], goals: [{ target: 'ball', requires: ['SLIPPERY'], label: 'SLIDE COURSE' }], solution: [{ source: 'turtle', target: 'ball', sticker: 'SLIPPERY' }] },
  { name: 'Mouse-Sized Mission', hint: 'Shrink the crate to fit the tiny doorway.', pieces: [{ id: 'snail', kind: 'snail', stickers: ['TINY'] }, { id: 'crate', kind: 'crate' }], goals: [{ target: 'crate', requires: ['TINY'], label: 'TINY DOOR' }], solution: [{ source: 'snail', target: 'crate', sticker: 'TINY' }] },
  { name: 'Apple Avalanche', hint: 'A huge bouncing ball makes the barrier wobble.', pieces: [{ id: 'chicken', kind: 'chicken', stickers: ['BIG'] }, { id: 'robot', kind: 'robot', stickers: ['BOUNCY'], x: 85, y: 380 }, { id: 'ball', kind: 'ball' }], goals: [{ target: 'ball', requires: ['BIG', 'BOUNCY'], label: 'BARRIER' }], solution: [{ source: 'chicken', target: 'ball', sticker: 'BIG' }, { source: 'robot', target: 'ball', sticker: 'BOUNCY' }] },
  { name: 'Turbo Trouble', hint: 'Take FAST from the robot and make a slippery turbo turtle.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['FAST'] }, { id: 'crate', kind: 'crate', stickers: ['SLIPPERY'], x: 85, y: 380 }, { id: 'turtle', kind: 'turtle', behavior: 'activate' }], goals: [{ target: 'turtle', requires: ['FAST', 'SLIPPERY'], label: 'TURBO TRACK', x: 294, y: 158 }], solution: [{ source: 'robot', target: 'turtle', sticker: 'FAST' }, { source: 'crate', target: 'turtle', sticker: 'SLIPPERY' }] },
  { name: 'Magnetic Madness', hint: 'A magnetic key can tug the lock open.', pieces: [{ id: 'knight', kind: 'knight', stickers: ['MAGNETIC'] }, { id: 'key', kind: 'key' }, { id: 'crate', kind: 'crate', x: 245, y: 340 }], goals: [{ target: 'key', requires: ['MAGNETIC'], label: 'MAGNET LOCK' }], solution: [{ source: 'knight', target: 'key', sticker: 'MAGNETIC' }] },
  { name: 'Across the Moat', hint: 'Help the frog float above the moat.', pieces: [{ id: 'chicken', kind: 'chicken', stickers: ['FLOATING'] }, { id: 'frog', kind: 'frog', behavior: 'activate', x: 235, y: 270 }], goals: [{ target: 'frog', requires: ['FLOATING'], label: 'MOAT', x: 235, y: 425 }], solution: [{ source: 'chicken', target: 'frog', sticker: 'FLOATING' }] },
  { name: 'Heavyweight Hero', hint: 'Make the boulder BIG and HEAVY.', pieces: [{ id: 'knight', kind: 'knight', stickers: ['BIG'] }, { id: 'crate', kind: 'crate', stickers: ['HEAVY'], x: 85, y: 380 }, { id: 'boulder', kind: 'boulder' }], goals: [{ target: 'boulder', requires: ['BIG', 'HEAVY'], label: 'DRAWBRIDGE' }], solution: [{ source: 'knight', target: 'boulder', sticker: 'BIG' }, { source: 'crate', target: 'boulder', sticker: 'HEAVY' }] },
  { name: 'Tiny Trouble', hint: 'Borrow TINY, then sneak yourself to the little door.', pieces: [{ id: 'snail', kind: 'snail', stickers: ['TINY'] }, { id: 'ball', kind: 'ball' }], goals: [{ target: 'player', requires: ['TINY'], label: 'LITTLE DOOR' }], solution: [{ source: 'snail', target: 'player', sticker: 'TINY' }] },
  { name: 'The Great Chicken Chase', hint: 'A speedy chicken will ring the castle bell.', pieces: [{ id: 'knight', kind: 'knight', stickers: ['FAST'] }, { id: 'chicken', kind: 'chicken', behavior: 'activate' }], goals: [{ target: 'chicken', requires: ['FAST'], label: 'CASTLE BELL', x: 294, y: 155 }], solution: [{ source: 'knight', target: 'chicken', sticker: 'FAST' }] },
  { name: 'Slippery Slalom', hint: 'Send the turtle sliding through the factory.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['SLIPPERY'] }, { id: 'turtle', kind: 'turtle' }], goals: [{ target: 'turtle', requires: ['SLIPPERY'], label: 'SLALOM', x: 294, y: 165 }], solution: [{ source: 'robot', target: 'turtle', sticker: 'SLIPPERY' }] },
  { name: 'Magnet Mayhem', hint: 'A heavy magnet can pull the factory gears.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['MAGNETIC'] }, { id: 'crate', kind: 'crate', stickers: ['HEAVY'], x: 85, y: 380 }, { id: 'key', kind: 'key', x: 275, y: 344 }, { id: 'boulder', kind: 'boulder', x: 294, y: 270 }], goals: [{ target: 'boulder', requires: ['MAGNETIC', 'HEAVY'], label: 'GEAR LOCK' }], solution: [{ source: 'robot', target: 'boulder', sticker: 'MAGNETIC' }, { source: 'crate', target: 'boulder', sticker: 'HEAVY' }] },
  { name: 'Bounce Castle', hint: 'Give the ball a giant springy surprise.', pieces: [{ id: 'chicken', kind: 'chicken', stickers: ['BIG'] }, { id: 'robot', kind: 'robot', stickers: ['BOUNCY'], x: 85, y: 380 }, { id: 'ball', kind: 'ball' }], goals: [{ target: 'ball', requires: ['BIG', 'BOUNCY'], label: 'TRIPLE SWITCH', x: 294, y: 155 }], solution: [{ source: 'chicken', target: 'ball', sticker: 'BIG' }, { source: 'robot', target: 'ball', sticker: 'BOUNCY' }] },
  { name: 'The Sticker Factory', hint: 'Power all three machines with different sticker tricks.', pieces: [{ id: 'robot', kind: 'robot', stickers: ['FAST'], y: 165 }, { id: 'frog', kind: 'frog', stickers: ['FLOATING'], x: 85, y: 290 }, { id: 'knight', kind: 'knight', stickers: ['MAGNETIC'], x: 85, y: 415 }, { id: 'snail', kind: 'snail', x: 300, y: 165 }, { id: 'rock', kind: 'rock', x: 300, y: 290 }, { id: 'key', kind: 'key', x: 300, y: 415 }], goals: [{ target: 'snail', requires: ['FAST'], label: 'TURBO PRINTER' }, { target: 'rock', requires: ['FLOATING'], label: 'HOVER PRINTER' }, { target: 'key', requires: ['MAGNETIC'], label: 'MAGNET PRINTER' }], solution: [{ source: 'robot', target: 'snail', sticker: 'FAST' }, { source: 'frog', target: 'rock', sticker: 'FLOATING' }, { source: 'knight', target: 'key', sticker: 'MAGNETIC' }] },
  { name: 'King Cluck Returns', hint: 'Steal BIG, FAST, then HEAVY from the robot king!', pieces: [{ id: 'king', kind: 'robot', stickers: ['BIG', 'FAST', 'HEAVY'], x: 85, y: 270 }, { id: 'apple', kind: 'apple', x: 300, y: 165 }, { id: 'snail', kind: 'snail', x: 300, y: 290 }, { id: 'boulder', kind: 'boulder', x: 300, y: 415 }], goals: [{ target: 'apple', requires: ['BIG'], label: 'BIG SWITCH' }, { target: 'snail', requires: ['FAST'], label: 'FAST SWITCH' }, { target: 'boulder', requires: ['HEAVY'], label: 'HEAVY PLATE' }], solution: [{ source: 'king', target: 'apple', sticker: 'BIG' }, { source: 'king', target: 'snail', sticker: 'FAST' }, { source: 'king', target: 'boulder', sticker: 'HEAVY' }] }
];

export const WORLD_NAMES = ['Wobble Village', 'Turbo Town', 'Castle of Chaos', 'Reality Factory'] as const;
export const WORLD_ICONS = ['🌳', '⚙️', '🏰', '✨'] as const;

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
    return { id: `goal-${goalIndex}`, x: goal.x ?? target.x, y: goal.y ?? target.y, radius: goal.target === 'player' ? 42 : 35, targetId: goal.target, requires: goal.requires, label: goal.label };
  });
  return LevelSchema.parse({
    number: index + 1, name: puzzle.name, world, hint: puzzle.hint,
    entities, goals,
    treasure: { x: 77, y: 502 },
    gem: { x: index % 2 === 0 ? 333 : 55, y: 105 },
    exit: { x: 195, y: 62 },
    par: puzzle.solution.length,
    solution: puzzle.solution
  });
}

export const LEVELS: Level[] = puzzles.map(buildLevel);
export function getLevel(number: number): Level { const level = LEVELS[number - 1]; if (!level) throw new Error(`Unknown level ${number}`); return level; }
