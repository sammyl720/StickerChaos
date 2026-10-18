# 🎮 STICKER CHAOS
## Complete Game Development Specification for Codex

**Project:** Sticker Chaos: Steal the Rules of Reality  
**Platform:** Mobile-first Progressive Web App (PWA)  
**Primary devices:** iPhone and iPod touch  
**Target audience:** Children approximately 7–13 years old  
**Genre:** Physics-based puzzle adventure / sandbox comedy  
**Art style:** Colorful, animated, playful 2D cartoon  
**Primary orientation:** Portrait  
**Game engine:** Phaser 4 + TypeScript  
**Development approach:** AI-assisted implementation using OpenAI Codex

### The vision

Build a highly entertaining mobile browser game where players can steal magical properties from objects and transfer them to other objects, creating surprising transformations, funny physics interactions, and inventive solutions to puzzles.

The main mechanic is **stealing and transferring the rules of reality**.

Players can make chickens enormous, turn rocks into bouncing balls, transform slow creatures into speed demons, and invent completely unexpected solutions to obstacles.

The game should feel like a polished commercial mobile game, not a technical demonstration.

### The development strategy

I recommend splitting development into two releases.

**Release 1: The complete single-player game**

- 20 fully playable levels across four themed worlds.
- Eight transferable magical sticker properties.
- Animated characters, enemies, obstacles, and treasures.
- A reusable physics and property interaction system.
- Puzzle-solving with multiple solutions where practical.
- Satisfying animations, sound effects, and particle effects.
- Character customization and collectible rewards.
- Saved progress, achievements, and unlockable content.
- Responsive mobile interface.
- Installable PWA with offline support.

**Release 2: The creativity and social expansion**

- Chaos Lab, a visual level editor.
- Custom challenges that can be shared with family.
- Family-only competitions.
- New sticker properties and combinations.
- Additional worlds and boss encounters.
- Optional asynchronous Chaos Battles.

The most important decision is to **avoid starting with accounts, databases, online multiplayer, or AI-generated content**. They add complexity without improving the fundamental game mechanic.

Codex should first build a genuinely fun, fully playable game that works entirely on one device.

For the technology, I recommend Phaser 4.2.1, a current stable Phaser 4 release, with its built-in Arcade Physics engine. Phaser supports the touch input and lightweight 2D physics needed for this design. [Phaser](https://phaser.io/download/release/v4.2.1?utm_source=chatgpt.com)

---

## 1. Core gameplay

### 1.1 The player character

The player controls a small, mischievous creature called the **Sticker Bandit**.

Appearance:
- Round, expressive cartoon body.
- Oversized eyes.
- Small arms and legs.
- A little backpack containing magical stickers.
- Comical facial expressions.
- Squash-and-stretch animations when moving or colliding.

The Bandit should feel alive, even when the player isn't interacting.

Idle animations might include blinking, looking around, scratching its head, or doing a little dance.

**Movement:** Top-down, with the character moving around an enclosed level.

Players can move using a virtual thumb joystick. Support tap-to-move as an alternative.

The player can interact with objects by tapping them.

### 1.2 The main gameplay loop

Each level follows a simple pattern:

1. Enter a colorful environment.
2. Encounter a ridiculous obstacle.
3. Identify objects containing magical stickers.
4. Steal and transfer stickers.
5. Watch the objects physically transform.
6. Experiment with the resulting interactions.
7. Collect the treasure.
8. Reach the exit and unlock the next level.

A typical level should take approximately 1–3 minutes, although players can experiment for as long as they like.

There should be no mandatory countdown timer.

### 1.3 The sticker interaction

This is the game's most important mechanic.

When the player taps an object with a sticker, a floating sticker icon appears above it.

For example:

**GIANT CHICKEN**

🏷️ BIG

The player can drag the BIG sticker from the chicken onto a nearby apple.

The transformation happens immediately.

The chicken shrinks to its normal size.

The apple grows dramatically.

The apple wobbles, shakes the screen slightly, and knocks aside nearby lightweight objects.

Both objects should react visually.

**Important implementation detail:** The sticker must actually modify the object's game properties. It cannot simply trigger a predetermined animation.

This will enable combinations and interactions that weren't explicitly programmed for each level.

### 1.4 Alternative interaction method

Dragging stickers should feel natural, but it can be frustrating on small screens.

Support a second interaction method:

1. Tap the source object.
2. Tap the sticker.
3. Tap the destination object.

Both methods must use exactly the same underlying transfer system.

When selecting a sticker, briefly pause enemy movement so players can choose a target comfortably.

---

# 2. The eight magical stickers

The initial game must include eight functional sticker properties.

| Sticker | Effect | Visual feedback |
|---|---|---|
| 🟣 BIG | Increases object size and collision radius | Object expands with a wobble |
| ⚡ FAST | Increases movement speed | Motion trails and speed lines |
| 🟡 BOUNCY | Causes objects to rebound from collisions | Elastic deformation |
| 🪨 HEAVY | Increases effective mass and pushing force | Ground cracks and impact effects |
| 🐜 TINY | Shrinks objects dramatically | Comical shrinking animation |
| 🪽 FLOATING | Allows objects to hover and cross designated hazards | Floating animation and shadow |
| 🧲 MAGNETIC | Attracts eligible nearby objects | Magnetic particles and attraction lines |
| 🧊 SLIPPERY | Greatly reduces friction | Sliding effects and skid trails |

## 2.1 Property combinations

Objects can hold up to three stickers simultaneously.

Effects should combine whenever feasible.

For example:

**BIG + BOUNCY**

A giant rubber chicken that bounces off walls and scatters nearby objects.

**FAST + SLIPPERY**

A turtle that accelerates quickly but struggles to stop.

**HEAVY + BOUNCY**

A heavy bouncing boulder that can knock down fragile obstacles.

**MAGNETIC + FLOATING**

A levitating object that collects nearby metallic treasures.

**BIG + HEAVY**

An enormous object capable of pushing heavy obstacles.

The architecture must support properties independently.

Do not manually program every possible sticker combination.

Instead, properties should update physical and behavioral attributes that naturally interact.

### 2.2 Property rules

Use these rules to keep the game predictable and manageable:

- An object can carry a maximum of three stickers.
- Duplicate stickers are prohibited.
- BIG and TINY are mutually exclusive.
- Stickers can only be transferred to eligible objects.
- Stickers must be transferred directly from a source to a destination.
- Transferring a sticker removes its effect from the source immediately.
- Each object has base properties restored when stickers are removed.
- Invalid transfers must give clear visual feedback.
- Every sticker operation must be reversible through an Undo button.

The first version should not have a permanent sticker inventory. This makes puzzle design and state management substantially easier.

### 2.3 Suggested physics implementation

Each interactive object should have base attributes such as:

```typescript
interface BaseObjectStats {
  radius: number;
  mass: number;
  speed: number;
  drag: number;
  restitution: number;
  pushForce: number;
  magneticRadius: number;
  canFloat: boolean;
}

type StickerType =
  | "BIG"
  | "FAST"
  | "BOUNCY"
  | "HEAVY"
  | "TINY"
  | "FLOATING"
  | "MAGNETIC"
  | "SLIPPERY";

interface GameEntity {
  id: string;
  type: string;
  baseStats: BaseObjectStats;
  stickers: StickerType[];
  maxStickers: number;
  canReceiveStickers: boolean;
  canDonateStickers: boolean;
}
```

Calculate effective attributes from an entity's base attributes and attached stickers.

Suggested initial modifiers:

| Property | Modifier |
|---|---|
| BIG | 1.8× radius |
| TINY | 0.55× radius |
| FAST | 1.9× movement speed |
| BOUNCY | Restitution approximately 0.85 |
| HEAVY | 4× effective mass |
| FLOATING | Hover state and hazard-crossing capability |
| MAGNETIC | Attraction radius of approximately 110 game units |
| SLIPPERY | Significantly reduced movement drag |

These numbers are starting points. Tune them through gameplay testing.

Phaser Arcade Physics handles basic collisions and movement, but it is not a full rigid-body physics simulator. Implement any specialized interactions, such as magnetic attraction, heavy-object impacts, and bounce impulses, as explicit game systems. [Phaser Documentation](https://docs.phaser.io/phaser/concepts/physics/arcade?utm_source=chatgpt.com)

### 2.4 Important edge cases

Codex must handle situations such as:

**Object grows into a wall**

The game must not crash or trap the player.

Try moving the transformed object to the nearest valid position. If that cannot be done, reject the transfer and play a harmless failure animation.

**A FAST sticker is attached to a stationary object**

The object should acquire a simple autonomous movement behavior or become launchable through interaction.

A FAST apple should not remain completely motionless.

**FLOATING and HEAVY coexist**

The object retains its increased mass but can hover.

While hovering, it cannot activate floor-pressure plates unless specifically lowered onto them.

**Multiple MAGNETIC objects**

Prevent infinite attraction loops and unstable oscillations by limiting attraction forces and velocities.

**The player gets trapped**

A Restart button must always be available.

---

# 3. The game worlds

The first release contains four themed worlds with five levels each.

Every world introduces new mechanics while reusing the same sticker engine.

## 🌳 World 1: Wobble Village

**Theme:** A cheerful cartoon village populated by ridiculous animals.

Visual elements:
- Colorful cottages.
- Smiling trees.
- Oversized mushrooms.
- Chickens, snails, turtles, and frogs.
- Wooden fences.
- Cartoon fruit and vegetables.

**Purpose:** Teach players the fundamental sticker mechanics.

| Level | Name | Challenge |
|---|---|---|
| 1 | The Giant Chicken | Remove BIG from a chicken blocking the exit and transfer it to an apple |
| 2 | Turbo Snail | Transfer FAST to a snail so it can activate a distant switch |
| 3 | Rubber Rock | Give a rock BOUNCY so it can ricochet into a target |
| 4 | The Floating Boulder | Transfer FLOATING to a boulder and move it across water |
| 5 | The Chicken King | Combine multiple sticker transfers to escape a giant chicken's arena |

### Level 1: Detailed implementation

**Scene:** A sunny village courtyard.

Objects:
- Player character.
- Giant chicken carrying BIG.
- Normal apple.
- Treasure chest.
- Exit gate.
- Walls forming a narrow exit corridor.

Initial state:

The chicken is too large to pass through the narrow corridor, effectively blocking the exit.

The apple is positioned in an open area.

Expected solution:

1. Player approaches the chicken.
2. Player taps its BIG sticker.
3. Player transfers BIG to the apple.
4. Chicken shrinks.
5. Apple becomes gigantic.
6. Exit corridor becomes accessible.
7. Player collects the treasure.
8. Player reaches the exit.

A short tutorial introduces the first sticker transfer.

The tutorial should be visual, using an animated finger and brief instructions.

Example:

**"Take BIG from the chicken!"**

Then:

**"Put BIG on the apple!"**

Finally:

**"Now grab the treasure!"**

The entire tutorial should require minimal reading.

### Level 5: First boss encounter

The Chicken King is an oversized chicken with multiple sticker properties.

The player must remove and redistribute the king's stickers to create a path toward the treasure.

The boss should respond with funny facial expressions when its properties are removed.

No complicated combat system is necessary.

---

## 🏎️ World 2: Turbo Town

**Theme:** A chaotic town filled with robots, cars, conveyor belts, and moving machinery.

Visual elements:
- Neon signs.
- Small robots.
- Traffic cones.
- Toy cars.
- Moving platforms.
- Conveyor belts.
- Mechanical doors.

**Purpose:** Introduce movement combinations and momentum.

| Level | Name | Challenge |
|---|---|---|
| 6 | Heavy Business | Use HEAVY to activate a pressure plate |
| 7 | Slippery Situation | Transfer SLIPPERY to move an object through a narrow course |
| 8 | Mouse-Sized Mission | Apply TINY to pass through a small opening |
| 9 | Apple Avalanche | Use BIG + BOUNCY to knock down a barrier |
| 10 | Turbo Trouble | Use FAST + SLIPPERY to send a turtle across a moving obstacle course |

Level 10 features a robot boss that moves quickly around an arena.

Players must steal its FAST sticker and use it to activate a mechanism that traps the robot.

---

## 🏰 World 3: Castle of Chaos

**Theme:** An absurd medieval castle inhabited by enchanted objects.

Visual elements:
- Cartoon knights.
- Animated suits of armor.
- Drawbridges.
- Moving statues.
- Floating platforms.
- Cannons and oversized rubber balls.

**Purpose:** Teach players to combine three properties and use their environment.

| Level | Name | Challenge |
|---|---|---|
| 11 | Magnetic Madness | Use MAGNETIC to collect keys through barriers |
| 12 | Across the Moat | Transfer FLOATING to move across a hazardous gap |
| 13 | Heavyweight Hero | Use BIG + HEAVY to push a large obstacle |
| 14 | Tiny Trouble | Make the player TINY to navigate a narrow passage |
| 15 | The Great Chicken Chase | Redirect a fast creature to trigger a castle mechanism |

The final level introduces a large animated knight.

Instead of fighting conventionally, players use sticker transfers to manipulate the knight's behavior.

---

## 🌌 World 4: Reality Factory

**Theme:** A surreal factory where magical stickers are manufactured.

Visual elements:
- Floating machines.
- Giant gears.
- Neon pipes.
- Rotating platforms.
- Gravity-defying objects.
- Animated sticker printers.

**Purpose:** Combine everything players have learned.

| Level | Name | Challenge |
|---|---|---|
| 16 | Slippery Slalom | Manipulate momentum to navigate moving obstacles |
| 17 | Magnet Mayhem | Use magnetic attraction while managing heavy objects |
| 18 | Bounce Castle | Create a BIG + BOUNCY object to trigger several switches |
| 19 | The Sticker Factory | Solve a multi-stage puzzle involving several sticker transfers |
| 20 | King Cluck Returns | Complete a three-stage final boss puzzle |

### Level 20: Final boss

The Chicken King returns inside a gigantic robotic chicken suit.

Initially, the boss has three properties:

**BIG + FAST + HEAVY**

The player must remove these properties in the correct sequence and transfer them to strategically placed objects.

Each successful action triggers a funny animation and changes the arena.

Example:

**Stage 1:** Transfer BIG from the robot to an apple, shrinking the boss.

**Stage 2:** Transfer FAST from the boss to a snail, which activates a switch.

**Stage 3:** Transfer HEAVY to a boulder, allowing it to trigger the final pressure plate.

The robot breaks apart into harmless cartoon pieces.

The defeated Chicken King emerges and waves a tiny white flag.

Confetti fills the screen.

The player unlocks a special golden Bandit costume.

**Design requirement:** Make this a celebratory puzzle encounter rather than a difficult combat challenge.

---

# 4. Game progression and rewards

Players should have several reasons to return beyond simply completing levels.

However, avoid gambling mechanics, manipulative rewards, or artificial pressure to keep playing.

## 4.1 Level progression

Each completed level awards 1–3 stars.

Suggested criteria:

- ⭐ Complete the level.
- ⭐⭐ Complete using no more than a specified number of sticker transfers.
- ⭐⭐⭐ Collect an optional hidden gem.

Additional stars can be earned by replaying levels.

The next level unlocks after the previous level is completed.

Do not require perfect scores to advance.

## 4.2 Character customization

Players can unlock cosmetic items.

Examples:

| Item | Unlock condition |
|---|---|
| Rainbow Hat | Finish World 1 |
| Robot Helmet | Finish World 2 |
| Knight Costume | Finish World 3 |
| Golden Bandit | Beat the final boss |
| Chicken Hat | Complete five chicken-themed challenges |
| Tiny Crown | Complete three levels while TINY |

Cosmetics should not provide competitive advantages.

## 4.3 Achievements

Include achievements such as:

- **First Sticker:** Complete the first transfer.
- **Chicken Whisperer:** Transform ten chickens.
- **Bounce Master:** Cause 25 bounce collisions.
- **Mad Scientist:** Discover five different sticker combinations.
- **Problem Solver:** Finish all 20 levels.
- **Treasure Hunter:** Collect every hidden gem.

Display achievements in a playful collection book.

Progress must persist after the browser closes.

## 4.4 Sticker discovery book

Build a collection screen containing every available property.

Each sticker should have:
- Animated icon.
- Short description.
- Example combinations.
- Discovery status.
- Associated achievement progress.

This provides a natural sense of exploration.

---

# 5. Visual and animation specifications

The visual presentation will be extremely important.

A technically functional game with primitive placeholder graphics will not deliver the intended experience.

The goal is a recognizable and charming cartoon world.

## 5.1 Art direction

**Style:** Modern, high-quality 2D cartoon with exaggerated expressions and soft, rounded shapes.

Think colorful animated children's television rather than retro pixel art.

Use:
- Saturated but harmonious colors.
- Smooth shapes.
- Soft shadows.
- Expressive animated eyes.
- Squash-and-stretch movement.
- Oversized environmental objects.
- Bright particle effects.
- Layered backgrounds.
- Smooth transitions between screens.

Avoid realistic graphics, violent imagery, and complicated 3D assets.

All original characters and assets must be suitable for commercial distribution.

## 5.2 Character animations

The Sticker Bandit needs:

| Animation | Description |
|---|---|
| Idle | Blinking, breathing, looking around |
| Walk | Bouncy movement with little footsteps |
| Celebrate | Jumping and cheering |
| Confused | Scratching head after invalid transfer |
| Damage | Comical wobble without graphic injury |
| Victory | Dancing while confetti falls |

Supporting creatures should have at least idle, movement, surprise, and reaction animations.

## 5.3 Sticker transformation effects

Each sticker needs a distinctive effect.

**BIG**

Object rapidly expands, slightly overshoots its target size, then settles.

**TINY**

Object compresses before shrinking with a small popping animation.

**FAST**

Colored speed trails appear behind the object.

**BOUNCY**

Object visibly squashes on impact and stretches while rebounding.

**HEAVY**

Ground shakes and a small dust cloud appears.

**FLOATING**

Object gently levitates with a shifting shadow beneath it.

**MAGNETIC**

Small particles travel toward the object.

**SLIPPERY**

Object slides with faint skid trails and sparkles.

Use the same animation system across all eligible objects.

## 5.4 Procedural graphics

Codex should implement a reusable cartoon graphics toolkit that can draw:

- Eyes and facial expressions.
- Rounded bodies.
- Outlines.
- Shadows.
- Stickers.
- Speech bubbles.
- Particle effects.
- Cartoon impact bursts.

If dedicated artwork is not available, use generated SVG and procedural Phaser graphics to create original, polished characters.

Do not leave temporary rectangles or circles masquerading as finished character designs.

---

# 6. Audio design

The game should feel lively and humorous.

### Background music

Each world has its own looping soundtrack.

| World | Musical style |
|---|---|
| Wobble Village | Cheerful cartoon adventure |
| Turbo Town | Playful electronic music |
| Castle of Chaos | Silly orchestral fantasy |
| Reality Factory | Energetic, whimsical electronic music |

### Sound effects

Include sounds for:

- Sticker peeling.
- Sticker attaching.
- Growing.
- Shrinking.
- Bouncing.
- Collisions.
- Collecting gems.
- Opening doors.
- Completing levels.
- Unlocking achievements.
- Boss reactions.

Sounds should be punchy and playful.

Use original or appropriately licensed sound effects.

The game must support muting music and effects separately.

**Mobile requirement:** Initialize or resume audio following a user gesture. Safari imposes restrictions on automatically starting audible media. [Apple Developer](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html?utm_source=chatgpt.com)

---

# 7. Mobile user interface

The game must be designed primarily for touchscreens.

Desktop support is useful, but it is secondary.

## 7.1 Home screen

The home screen should feature a large animated Sticker Bandit.

Main options:

**PLAY**

**MY BANDIT**

**STICKER BOOK**

**SETTINGS**

Include a playful, animated background.

The Play button should be the most prominent element.

No account registration should be required.

## 7.2 Level selection

Present the four game worlds as an interactive map.

Each world has five numbered levels.

Completed levels display stars.

Locked levels should be visually distinct.

Tapping an available level starts it immediately.

## 7.3 Gameplay screen

Portrait-mode layout:

```text
┌────────────────────────────┐
│  LEVEL 08       ⭐ ⭐ ☆    │
│                            │
│  Treasure: 💎 0/1          │
├────────────────────────────┤
│                            │
│                            │
│       GAME WORLD           │
│                            │
│        🐔                  │
│                            │
│    🏷️ BIG                  │
│                            │
│             🍎             │
│                            │
│      PLAYER                │
│                            │
│                            │
├────────────────────────────┤
│                            │
│  ↶ UNDO     ↻ RESTART      │
│                            │
│   JOYSTICK       PAUSE     │
└────────────────────────────┘
```

The actual game should be visually much richer.

### Interface requirements

- Portrait orientation by default.
- Responsive to different iPhone screen sizes.
- Respect safe-area insets and notches.
- Support older, smaller displays.
- Large touch targets, ideally at least 44 CSS pixels.
- Smooth touch interaction.
- No accidental page scrolling during gameplay.
- No accidental text selection.
- Automatically pause on application backgrounding.
- Resume cleanly when the application becomes active.

Use `touch-action` and browser event handling carefully to avoid interference with the game's controls.

A short vibration may be used for sticker transfers when supported, but the game must work perfectly without haptics.

## 7.4 Pause menu

Include:

- Resume.
- Restart level.
- Settings.
- Return to world map.

## 7.5 Settings

Include:

- Music volume.
- Sound effects volume.
- Reduced motion.
- Tap-to-move versus virtual joystick.
- Reset progress, with confirmation.
- Instructions.

---

# 8. Technical architecture

## 8.1 Recommended technology stack

| Layer | Technology |
|---|---|
| Programming language | TypeScript, strict mode |
| Frontend framework | React |
| Build tool | Vite |
| Game engine | Phaser 4.2.1 |
| Physics | Phaser Arcade Physics |
| Styling | Tailwind CSS |
| State management | Zustand for application state |
| Persistence | IndexedDB with a small typed storage adapter |
| PWA | Vite PWA plugin |
| Validation | Zod |
| Unit tests | Vitest |
| End-to-end tests | Playwright |
| Hosting | Netlify or Cloudflare Pages |

Use React for application navigation, menus, settings, and non-game UI.

Use Phaser for gameplay, physics, animations, and in-game interactions.

Do not place the real-time game loop inside React.

Avoid unnecessary dependencies.

## 8.2 Suggested project structure

```text
sticker-chaos/
│
├── public/
│   ├── icons/
│   ├── audio/
│   └── assets/
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── store.ts
│   │
│   ├── game/
│   │   ├── config.ts
│   │   ├── Game.ts
│   │   │
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── PreloadScene.ts
│   │   │   ├── GameScene.ts
│   │   │   ├── LevelCompleteScene.ts
│   │   │   └── BossScene.ts
│   │   │
│   │   ├── entities/
│   │   │   ├── Entity.ts
│   │   │   ├── Player.ts
│   │   │   ├── Creature.ts
│   │   │   ├── PhysicsObject.ts
│   │   │   └── Enemy.ts
│   │   │
│   │   ├── stickers/
│   │   │   ├── types.ts
│   │   │   ├── StickerEngine.ts
│   │   │   ├── StickerRegistry.ts
│   │   │   ├── EffectCalculator.ts
│   │   │   └── TransferValidator.ts
│   │   │
│   │   ├── systems/
│   │   │   ├── PhysicsSystem.ts
│   │   │   ├── InputSystem.ts
│   │   │   ├── CollisionSystem.ts
│   │   │   ├── AchievementSystem.ts
│   │   │   ├── ParticleSystem.ts
│   │   │   ├── AudioSystem.ts
│   │   │   └── UndoSystem.ts
│   │   │
│   │   ├── levels/
│   │   │   ├── LevelLoader.ts
│   │   │   ├── LevelValidator.ts
│   │   │   └── definitions/
│   │   │
│   │   └── graphics/
│   │       ├── CharacterRenderer.ts
│   │       ├── StickerRenderer.ts
│   │       └── EffectsRenderer.ts
│   │
│   ├── components/
│   │   ├── HomeScreen.tsx
│   │   ├── WorldMap.tsx
│   │   ├── GameHUD.tsx
│   │   ├── StickerBook.tsx
│   │   ├── CharacterCustomizer.tsx
│   │   └── SettingsMenu.tsx
│   │
│   ├── data/
│   │   ├── worlds.ts
│   │   ├── achievements.ts
│   │   └── cosmetics.ts
│   │
│   ├── storage/
│   │   ├── ProgressRepository.ts
│   │   └── IndexedDbAdapter.ts
│   │
│   └── tests/
│       ├── unit/
│       └── e2e/
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
└── SPEC.md
```

The exact structure can evolve, but keep the physics system, sticker logic, level definitions, and rendering concerns separate.

## 8.3 Sticker engine

The Sticker Engine is the foundation of the game.

It should be completely data-driven.

Responsibilities:

1. Register all available sticker types.
2. Determine which entities can receive stickers.
3. Validate attempted transfers.
4. Calculate modified attributes.
5. Apply and remove sticker effects.
6. Notify the physics and rendering systems.
7. Emit gameplay events.
8. Support undo and level restart.
9. Preserve deterministic behavior where possible.

Suggested API:

```typescript
interface StickerEngine {
  canTransfer(
    sourceId: string,
    targetId: string,
    sticker: StickerType
  ): boolean;

  transfer(
    sourceId: string,
    targetId: string,
    sticker: StickerType
  ): TransferResult;

  getEffectiveStats(
    entityId: string
  ): BaseObjectStats;

  undo(): boolean;

  resetLevel(): void;
}
```

A transfer should be atomic.

Either the source loses the sticker and the target receives it, or neither object changes.

Record transformations as undoable commands, including the positions and velocities necessary to restore a consistent game state.

## 8.4 Level definition format

All levels should be described using validated JSON or TypeScript configuration.

Do not hardcode an entire level inside a Phaser scene.

Example:

```json
{
  "id": "level-01",
  "name": "The Giant Chicken",
  "world": "wobble-village",
  "background": "village-day",
  "objective": {
    "type": "collect-and-exit",
    "treasureRequired": 1
  },
  "player": {
    "x": 50,
    "y": 500
  },
  "entities": [
    {
      "id": "chicken-1",
      "type": "chicken",
      "x": 320,
      "y": 500,
      "stickers": ["BIG"]
    },
    {
      "id": "apple-1",
      "type": "apple",
      "x": 100,
      "y": 300,
      "stickers": []
    }
  ]
}
```

This is illustrative, not the complete schema.

The production schema must also describe collision boundaries, treasure placement, exit regions, hazards, switches, tutorial steps, and victory conditions.

Each level must include at least one documented solution sequence.

Use Zod to validate definitions when loading them.

A malformed level should produce a useful development error rather than crash the application.

### Level solvability

**This is an important requirement.**

Codex must ensure all 20 levels are actually completable.

Do not generate 20 arbitrary maps and assume they work.

For each level:

- Define the intended solution.
- Specify the required sticker transfers.
- Ensure objects are reachable.
- Ensure the exit is accessible after solving the puzzle.
- Ensure transformations cannot permanently soft-lock the level.
- Verify collision boundaries.
- Include a Restart mechanism.

At least the first five levels should have automated end-to-end gameplay tests.

---

# 9. Enemy and object behavior

The game needs simple but entertaining AI.

Avoid building a complicated combat system.

### Creature behaviors

Implement reusable behavior types:

| Behavior | Description |
|---|---|
| Idle | Remains in position with idle animation |
| Wander | Moves randomly within a designated region |
| Patrol | Travels between predetermined points |
| Chase | Moves toward the player when nearby |
| Flee | Runs away from the player |
| Activate | Moves toward or interacts with a target |
| Stunned | Temporarily stops after a collision |

Sticker properties modify these behaviors.

Examples:

A FAST chicken with Wander should move much faster.

A TINY robot with Chase should become smaller without losing the ability to pursue the player.

A SLIPPERY creature should overshoot destinations because of its momentum.

A HEAVY creature should be harder to push.

### Moving objects

Not every object requires AI.

A rock may remain stationary until pushed.

A ball may move only through collisions.

An apple with FAST should become animated and mobile using a simple movement behavior.

Keep these interactions deterministic enough to support puzzle design.

---

# 10. Achievements and persistent progress

Use a versioned save format.

Example:

```typescript
interface GameProgress {
  version: number;

  completedLevels: string[];

  levelStars: Record<string, number>;

  collectedGems: string[];

  unlockedCosmetics: string[];

  selectedCosmetic: string;

  achievements: string[];

  stickerDiscoveries: StickerType[];

  settings: {
    musicVolume: number;
    effectsVolume: number;
    reducedMotion: boolean;
    controlMode: "joystick" | "tap";
  };
}
```

Requirements:

- Save after level completion.
- Save settings immediately.
- Save unlocked cosmetics.
- Restore progress after reopening.
- Handle corrupted save data gracefully.
- Migrate older save formats when necessary.
- Provide a reset-progress option.

The entire first release should function without a backend.

---

# 11. PWA requirements

The game should behave like an installed application when added to an iPhone Home Screen.

Requirements:

- Web app manifest.
- Portrait-oriented layout.
- High-quality app icons.
- Splash/loading screen.
- Offline caching.
- Service worker.
- Local progress persistence.
- HTTPS deployment.
- Graceful handling of network loss.
- No unnecessary permissions.
- No push notifications.

Apple supports Home Screen web apps, and service workers can provide offline capabilities. [WebKit](https://webkit.org/blog/13878/?utm_source=chatgpt.com)

### Older iPod touch compatibility

Older iPod touch devices may run substantially older Safari versions than current iPhones.

Target iOS 15 Safari as a compatibility baseline where practical.

Avoid relying on recent browser APIs without feature detection.

Include a lower-quality graphics mode that reduces particles and visual effects.

Test WebGL availability and provide a renderer fallback where supported.

Do not assume Phaser 4 compatibility with every older iPod without actual testing.

---

# 12. Quality and performance requirements

The game should feel polished and responsive.

### Performance targets

| Metric | Target |
|---|---|
| Target frame rate | 60 FPS on modern iPhones |
| Older device fallback | 30 FPS |
| Initial download | Preferably under 8 MB |
| Touch response | Immediate visual response |
| Resume after interruption | No lost progress |
| Level loading | Minimal visible delay |
| Offline mode | All 20 levels playable after assets are cached |

These are engineering goals, not guaranteed device capabilities.

Optimize:

- Sprite atlases.
- Texture reuse.
- Particle pooling.
- Entity updates.
- Collision detection.
- Sound memory usage.
- Asset compression.
- Scene transitions.

Support reduced-motion preferences by removing camera shake, limiting particle effects, and shortening nonessential animations.

---

# 13. Testing requirements

A game can compile successfully and still be broken.

Codex must test actual gameplay.

## 13.1 Unit testing

Use Vitest.

Required coverage includes:

- Sticker transfer validation.
- Property modifier calculations.
- Compound sticker effects.
- Invalid combinations.
- Maximum sticker capacity.
- Removing stickers.
- Undo operations.
- Level restart.
- Achievement unlocking.
- Save/load round trips.
- Save corruption handling.

## 13.2 Gameplay testing

Verify:

- Character movement works.
- Collisions behave consistently.
- Objects transform visibly.
- Physics bodies update after resizing.
- Treasure can be collected.
- Exit gates activate correctly.
- Enemies respect boundaries.
- Mobile touches work.
- Progress saves correctly.
- Pause and resume work.
- All level definitions validate.

## 13.3 End-to-end testing

Use Playwright.

Test at minimum:

1. Starting a new game.
2. Completing the first tutorial.
3. Transferring a sticker.
4. Undoing a transfer.
5. Restarting a level.
6. Completing a level.
7. Unlocking the next level.
8. Reopening the game and restoring progress.
9. Changing settings.
10. Playing with mobile viewport emulation.

Playwright mobile emulation is not a substitute for testing in Safari on an actual iPhone or iPod.

## 13.4 Visual testing

Codex must capture and inspect screenshots of:

- Home screen.
- World map.
- Tutorial.
- Active gameplay.
- Sticker transfer.
- Level completion.
- Character customization.
- Settings.

Check for clipped labels, inaccessible controls, misplaced UI elements, and overlapping objects.

---

# 14. Kid-friendly design requirements

Since the primary audience is children, the game should be enjoyable without exploiting their attention.

Requirements:

- No advertisements.
- No loot boxes.
- No gambling mechanics.
- No in-app purchases.
- No public chat.
- No personal-information collection.
- No mandatory account creation.
- No infinite reward loops.
- No pressure-based daily login streaks.
- No dark patterns.

Instead, focus on the intrinsic enjoyment of discovery, experimenting, creativity, and overcoming challenges.

Parents should be able to hand children the game without worrying about inappropriate user-generated content or accidental purchases.

---

# 15. Implementation phases for Codex

This is the order I would have Codex implement the game.

## Phase 1: Project foundation

Create the Vite, React, TypeScript, and Phaser application.

Implement:

- Application routing.
- Game initialization.
- Responsive game canvas.
- Loading scene.
- Home screen.
- Basic scene transitions.
- Persistent settings.
- PWA configuration.

**Completion requirement:** The game launches on desktop and mobile Safari, shows a polished home screen, and can load a basic playable scene.

## Phase 2: Core sticker mechanics

Implement:

- Game entity model.
- Sticker registry.
- Eight sticker effects.
- Sticker transfer validation.
- Touch and drag interactions.
- Physics attribute updates.
- Undo system.
- Restart system.
- Transformation animations.

**Completion requirement:** Players can freely transfer all eight properties between compatible objects in a testing sandbox.

This phase should include a developer-only testing scene containing a chicken, apple, turtle, robot, boulder, ball, and several obstacles.

## Phase 3: First playable world

Implement the first five levels.

Include:

- World 1 artwork.
- Tutorial.
- Treasure collection.
- Exit conditions.
- Stars.
- Level unlocking.
- Chicken King boss encounter.
- Saving progress.

**Completion requirement:** World 1 feels like a complete, polished mobile game.

Do not expand to the remaining worlds until this works properly.

## Phase 4: Complete all 20 levels

Implement Worlds 2, 3, and 4.

Add:

- Remaining environments.
- Additional creatures.
- More sophisticated puzzles.
- Boss mechanics.
- Level progression.
- Achievement tracking.

**Completion requirement:** All 20 levels are playable, solvable, and connected through the world map.

## Phase 5: Presentation and polish

Implement:

- Final character animations.
- Particle effects.
- Sound effects.
- Background music.
- UI animations.
- Cartoon collision reactions.
- Cosmetic customization.
- Sticker collection book.
- Accessibility settings.

**Completion requirement:** The game no longer looks or feels like a prototype.

## Phase 6: Production readiness

Complete:

- Automated tests.
- Performance optimization.
- Mobile testing.
- PWA offline behavior.
- Save data recovery.
- Responsive layout verification.
- Production build.
- Deployment configuration.
- README and developer documentation.

**Completion requirement:** A player can open the hosted game on an iPhone, play all 20 levels, close Safari, and return without losing progress.

---

# 16. Future expansion: Chaos Lab

The second release should introduce a visual level editor.

Players will be able to design their own challenges.

### Editor functionality

Players select a background and drag objects into a level.

They can place:
- Creatures.
- Apples.
- Rocks.
- Robots.
- Obstacles.
- Switches.
- Treasure.
- Exit gates.
- Magical stickers.

Players can assign stickers to objects.

They then test their level before sharing it.

### Sharing challenges

A simple approach is to serialize the level configuration into a compressed challenge code.

Example:

`CHAOS-A7K9-P2Q4`

The code is illustrative. A real implementation can use a versioned, encoded level format.

Other players enter the code to load the custom challenge.

This can work without a public database when the serialized level data fits within the code or shareable URL.

Longer levels may require a backend.

All imported levels must be validated against a strict schema and resource limits.

Do not execute arbitrary code from shared levels.

### Family challenges

Eventually, family members could compare:

- Level completion.
- Number of stickers used.
- Stars earned.
- Creative solutions.

No public messaging system is necessary.

If accounts or cloud saving are added later, implement proper authentication and database access controls. Supabase supports row-level security for that purpose. [Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com)

---

# 17. Definition of done

Codex should consider Release 1 finished only when all of the following are true:

- [ ] The game runs in a browser without installation.
- [ ] It behaves as an installable PWA.
- [ ] The entire UI works on mobile.
- [ ] The player can move and interact with objects.
- [ ] All eight stickers have working effects.
- [ ] Property combinations work.
- [ ] Stickers can be transferred by touch.
- [ ] Undo and Restart work.
- [ ] The game has 20 unique, complete levels.
- [ ] Every level has an achievable victory condition.
- [ ] The four worlds have distinct visual themes.
- [ ] Boss encounters are functional.
- [ ] Treasure and star systems work.
- [ ] Achievements and cosmetics work.
- [ ] Progress persists locally.
- [ ] The game works offline after installation and caching.
- [ ] Music and sound effects work.
- [ ] Audio can be muted.
- [ ] Reduced-motion support works.
- [ ] Unit and end-to-end tests pass.
- [ ] The production build succeeds.
- [ ] The application has been tested at mobile viewport sizes.
- [ ] No placeholder gameplay or nonfunctional menus remain.

---

# 18. The actual prompt to give Codex

Here is the instruction I would use to accompany the entire specification above.

Copy the specification and append this prompt:

```text
You are a senior game developer, gameplay engineer,
software architect, and UI/UX designer.

Your task is to build STICKER CHAOS, a complete,
polished, mobile-first, browser-based puzzle adventure
game.

The complete product specification is provided above.

Your objective is to IMPLEMENT THE APPLICATION,
not merely produce a plan, mockup, or prototype.

TECHNOLOGY REQUIREMENTS

- TypeScript with strict type checking
- React and Vite
- Phaser 4.2.1
- Phaser Arcade Physics
- Tailwind CSS
- Zustand for application state
- IndexedDB for persistent progress
- Zod for validation
- Vitest for unit testing
- Playwright for end-to-end testing
- PWA support with offline caching

PRIMARY GOAL

Produce a delightful and polished game that children
can play on their iPhones and iPod touch devices.

The unique selling point is the sticker mechanic:
players steal properties from objects and attach
them to other objects.

These properties must modify actual entity behavior,
physics, and appearance.

CRITICAL REQUIREMENTS

1. Build a functioning game, not a static demonstration.

2. Implement the complete reusable sticker engine.

3. Create eight functional sticker properties.

4. Support combinations and emergent interactions.

5. Build 20 fully playable and solvable levels.

6. Make the game mobile-first and touch-friendly.

7. Implement polished cartoon graphics and animations.

8. Include character customization, stars,
   achievements, and persistent progress.

9. Support PWA installation and offline gameplay.

10. Implement tests and a production build.

DEVELOPMENT RULES

- Begin by examining the existing repository.
- If the repository is empty, initialize the project.
- Create SPEC.md from the provided specification.
- Create an implementation plan with clear milestones.
- Implement the application incrementally.
- Maintain a working application throughout development.
- Use reusable, maintainable architecture.
- Keep gameplay logic independent from rendering.
- Avoid unnecessary dependencies.
- Avoid overengineering the backend.
- Do not introduce accounts or online services into MVP.
- Do not use copyrighted character assets.
- Do not leave TODO placeholders for critical features.
- Do not fake game functionality.
- Do not create level buttons that lead to unfinished scenes.

GRAPHICS REQUIREMENTS

The game must look visually appealing.

Use original cartoon graphics, animations,
expressive characters, rounded shapes, shadows,
particle effects, and polished UI.

If external artwork is unavailable, create polished
procedural or SVG-based artwork.

Simple debug shapes are acceptable during development
but must not be the final presentation.

GAMEPLAY REQUIREMENTS

Implement the sticker system as modular,
data-driven game mechanics.

The properties should interact through shared
physics attributes and behaviors.

Create a repeatable level-definition system.

Design each level with a documented solution.

Make interactions satisfying and understandable.

Prioritize responsive controls and funny animations.

Avoid excessive difficulty during the first levels.

TESTING REQUIREMENTS

After each milestone:

- Run TypeScript checks.
- Run linting.
- Run unit tests.
- Build the application.
- Verify gameplay functionality.
- Fix discovered errors.

Use Playwright to test mobile viewports
and capture screenshots for visual inspection.

Do not claim that iPhone Safari has been tested
unless actual Safari testing has been performed.

IMPLEMENTATION PRIORITY

Work in this order:

1. Project setup.
2. Game engine integration.
3. Entity and physics systems.
4. Sticker mechanics.
5. First playable tutorial.
6. Complete World 1.
7. Remaining levels and worlds.
8. Progression and cosmetics.
9. Visual and audio polish.
10. Testing and deployment.

IMPORTANT

Make reasonable design and technical decisions
without repeatedly asking for clarification.

Favor a finished, enjoyable game over unnecessary
architectural complexity.

When implementing a feature, ensure it works
end-to-end before moving to the next feature.

Do not substitute descriptions, mock interfaces,
or nonfunctional animations for real gameplay.

If the game cannot be completed in one execution
session, preserve working code, tests, and a precise
progress document so development can resume.

FINAL DELIVERABLES

- Complete application source code.
- All 20 working levels.
- Original or appropriately licensed game assets.
- Automated tests.
- PWA configuration.
- Production build configuration.
- README with installation instructions.
- Deployment instructions.
- Documentation of the sticker engine.

Begin implementation now.
```

---

## One additional recommendation

There's something I would emphasize to Codex even more strongly than the number of levels or the feature list.

**The physics interactions need to be genuinely funny.**

Imagine a nephew putting BIG and BOUNCY on a chicken.

The chicken grows to an absurd size, hits a wall, rebounds across the screen, crashes into a stack of apples, and sends them flying everywhere.

Its eyes spin, its tongue hangs out, and it makes a ridiculous squawking sound.

That's the kind of moment a kid will immediately want to show his brother.

A simple game with ten hilarious interactions can be more entertaining than a complicated game with hundreds of uninteresting ones.

**My suggestion:** Have Codex complete Phase 2's experimental sticker playground and the first five levels before committing heavily to the rest of the content. If transferring stickers already makes you laugh, you've got the foundation for something special.