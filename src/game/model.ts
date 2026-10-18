import { z } from 'zod';

export const StickerSchema = z.enum(['BIG', 'FAST', 'BOUNCY', 'HEAVY', 'TINY', 'FLOATING', 'MAGNETIC', 'SLIPPERY']);
export type StickerType = z.infer<typeof StickerSchema>;
export const STICKERS: StickerType[] = StickerSchema.options;

export const ENTITY_KINDS = ['bandit', 'chicken', 'apple', 'snail', 'rock', 'boulder', 'ball', 'turtle', 'robot', 'knight', 'key', 'frog', 'crate'] as const;
export type EntityKind = typeof ENTITY_KINDS[number];
export type Behavior = 'idle' | 'wander' | 'patrol' | 'chase' | 'flee' | 'activate';

export interface Stats {
  radius: number;
  mass: number;
  speed: number;
  drag: number;
  restitution: number;
  pushForce: number;
  magneticRadius: number;
  canFloat: boolean;
}

export interface EntityState {
  id: string;
  kind: EntityKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  stickers: StickerType[];
  maxStickers: number;
  canReceive: boolean;
  canDonate: boolean;
  behavior: Behavior;
}

export const EntitySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(ENTITY_KINDS),
  x: z.number().min(20).max(400),
  y: z.number().min(30).max(650),
  stickers: z.array(StickerSchema).max(3).default([]),
  behavior: z.enum(['idle', 'wander', 'patrol', 'chase', 'flee', 'activate']).default('idle'),
  canReceive: z.boolean().default(true),
  canDonate: z.boolean().default(true)
});
export type EntityDefinition = z.input<typeof EntitySchema>;

export const GoalSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  radius: z.number().default(38),
  targetId: z.string(),
  requires: z.array(StickerSchema).min(1).max(3),
  label: z.string()
});
export type Goal = z.infer<typeof GoalSchema>;

export const FixtureSchema = z.object({
  kind: z.enum(['wall', 'gate', 'conveyor', 'hazard']),
  x: z.number(), y: z.number(), w: z.number().positive(), h: z.number().positive(),
  opensAfter: z.number().int().nonnegative().optional(),
  dx: z.number().optional(), dy: z.number().optional()
});
export type Fixture = z.infer<typeof FixtureSchema>;

export const LevelSchema = z.object({
  number: z.number().int().min(1).max(20),
  name: z.string(),
  world: z.number().int().min(1).max(4),
  hint: z.string(),
  entities: z.array(EntitySchema).min(2),
  goals: z.array(GoalSchema).min(1),
  fixtures: z.array(FixtureSchema).default([]),
  bossId: z.string().optional(),
  treasure: z.object({ x: z.number(), y: z.number() }),
  gem: z.object({ x: z.number(), y: z.number() }),
  exit: z.object({ x: z.number(), y: z.number() }),
  par: z.number().int().positive(),
  solution: z.array(z.object({ source: z.string(), target: z.string(), sticker: StickerSchema })).min(1)
});
export type Level = z.infer<typeof LevelSchema>;

export const BASE_STATS: Record<EntityKind, Stats> = {
  bandit: { radius: 18, mass: 1, speed: 175, drag: 620, restitution: 0.12, pushForce: 90, magneticRadius: 0, canFloat: false },
  chicken: { radius: 24, mass: 1.4, speed: 50, drag: 420, restitution: 0.2, pushForce: 75, magneticRadius: 0, canFloat: false },
  apple: { radius: 18, mass: 0.7, speed: 44, drag: 400, restitution: 0.15, pushForce: 35, magneticRadius: 0, canFloat: false },
  snail: { radius: 19, mass: 1, speed: 32, drag: 480, restitution: 0.1, pushForce: 40, magneticRadius: 0, canFloat: false },
  rock: { radius: 21, mass: 2, speed: 36, drag: 440, restitution: 0.06, pushForce: 85, magneticRadius: 0, canFloat: false },
  boulder: { radius: 25, mass: 3, speed: 34, drag: 500, restitution: 0.05, pushForce: 120, magneticRadius: 0, canFloat: false },
  ball: { radius: 21, mass: 0.7, speed: 60, drag: 320, restitution: 0.65, pushForce: 55, magneticRadius: 0, canFloat: false },
  turtle: { radius: 22, mass: 1.4, speed: 37, drag: 450, restitution: 0.15, pushForce: 70, magneticRadius: 0, canFloat: false },
  robot: { radius: 23, mass: 2.2, speed: 62, drag: 500, restitution: 0.12, pushForce: 95, magneticRadius: 0, canFloat: false },
  knight: { radius: 28, mass: 2.8, speed: 42, drag: 500, restitution: 0.13, pushForce: 120, magneticRadius: 0, canFloat: false },
  key: { radius: 16, mass: 0.25, speed: 24, drag: 500, restitution: 0.05, pushForce: 15, magneticRadius: 0, canFloat: false },
  frog: { radius: 20, mass: 1, speed: 56, drag: 370, restitution: 0.35, pushForce: 55, magneticRadius: 0, canFloat: false },
  crate: { radius: 23, mass: 1.8, speed: 32, drag: 470, restitution: 0.05, pushForce: 95, magneticRadius: 0, canFloat: false }
};

export const STICKER_INFO: Record<StickerType, { icon: string; color: string; description: string; example: string }> = {
  BIG: { icon: '✦', color: '#9c70fa', description: 'Grow enormous and shove things aside.', example: 'BIG + BOUNCY = giant rubber chaos' },
  FAST: { icon: 'ϟ', color: '#ffbd33', description: 'Move in a speedy blur.', example: 'FAST + SLIPPERY = turbo slide' },
  BOUNCY: { icon: '●', color: '#f5d247', description: 'Spring away from bumps.', example: 'HEAVY + BOUNCY = mighty ricochet' },
  HEAVY: { icon: '◆', color: '#657389', description: 'Gain weight and pushing power.', example: 'BIG + HEAVY = colossal strength' },
  TINY: { icon: '✳', color: '#f889ad', description: 'Shrink to fit through little gaps.', example: 'TINY + FAST = tiny blur' },
  FLOATING: { icon: '☁', color: '#77c7fa', description: 'Hover over hazards and plates.', example: 'FLOATING + MAGNETIC = flying collector' },
  MAGNETIC: { icon: '∩', color: '#e780ed', description: 'Pull nearby metal objects close.', example: 'MAGNETIC + FLOATING = flying collector' },
  SLIPPERY: { icon: '◇', color: '#7edee7', description: 'Slide with very little friction.', example: 'FAST + SLIPPERY = turbo slide' }
};
