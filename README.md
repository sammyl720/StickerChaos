# Sticker Chaos

Sticker Chaos is a mobile-first puzzle adventure about peeling magical properties from one cartoon object and attaching them to another. It has 20 levels across four worlds, eight independently composable stickers, local progress, unlockable costumes, achievements, and offline PWA support. There are no accounts, ads, purchases, or online features.

The full product brief is in [SPEC.md](SPEC.md). [PLAN.md](PLAN.md) tracks the build milestones.

## Run

Use Node.js 22.13+ or 24+ and npm 10+.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. In a level, tap an object and one of its sticker badges, then tap another object. You can also drag a badge onto its new home. Use the joystick or choose tap-to-move in Settings; arrow keys and WASD work on desktop. Collect the present, light the switches, and reach the exit. Undo and Restart are always available.

## Checks

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Playwright runs Chromium at desktop and emulated iPhone viewports, plus WebKit at iPhone 13 and compact 320×568 sizes. This is not a substitute for actual Safari testing on an iPhone or iPod touch.

## Sticker engine

Gameplay rules live in `src/game/stickerEngine.ts`, separate from the Phaser scene. Every entity starts with base radius, mass, speed, drag, restitution, push force, magnet range, and float capability. The eight stickers modify those values independently. `transfer` validates ownership, duplicate and incompatible size stickers, capacity, recipient eligibility, and growth room before changing either entity. It stores a pre-transfer snapshot for Undo. Restart restores the level definition. Phaser applies the resulting attributes to Arcade physics bodies; custom scene systems handle magnetism, impacts, autonomous FAST movement, and hazard repulsion.

Levels are validated with Zod in `src/game/levels.ts`. Each has a documented transfer sequence, switch requirements, physical fixtures, treasure, optional gem, and exit. Switches can require sticker properties, actual mass, movement speed, or magnetic reach. The two final puzzles open staged gates in order. The level tests apply every documented sequence, check its goals, and verify that the player can reach the treasure and exit after solving the puzzle.

## Saving and offline play

A versioned save is written immediately to localStorage and mirrored to IndexedDB. This keeps a change made just before a reload while retaining a second local copy. Invalid saved data falls back to a clean save. The PWA service worker precaches the production app and assets. After one successful online load, the game can be launched offline on the same device.

## Deployment

Run `npm run build` and publish the generated `dist/` directory to any HTTPS static host, such as Netlify or Cloudflare Pages. The included `netlify.toml` sets the build command and output directory. Use the host's normal SPA fallback if adding URL routes later; the current app uses client-side screen state and requires no backend.

## Compatibility and scope

The app targets portrait mobile browsers and includes Phaser's Canvas/WebGL selection, a lower graphics mode that uses Canvas and fewer visual effects, reduced motion, touch controls, and a compact layout for smaller screens. Settings are available from the home screen and pause menu. Browser automation covers desktop Chromium, emulated iPhone Chromium, mobile WebKit, and compact mobile WebKit. Actual iPhone and older iPod Safari behavior must be checked on those devices before a production launch. Character art and audio are original procedural assets.
