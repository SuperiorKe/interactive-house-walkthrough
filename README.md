# Interactive Residence Walkthrough

A browser-based architectural walkthrough built with React, TypeScript, Vite and React Three Fiber. It is a data-driven reconstruction of the supplied reference board: the model supports first-person exploration, touch controls, a daylight/evening presentation, and a separate architectural inspection view.

## Run locally

Requirements: Node.js 20 or newer and npm.

From a clean checkout:

```bash
npm ci
npm run dev
```

Open the local address printed by Vite (normally `http://localhost:5173`). For a production-style local check:

```bash
npm run build
npm run preview
```

`npm run build` runs the TypeScript project build before generating the deployable `dist/` directory.

## Controls

- Desktop: select **Begin walkthrough**, click the scene, then use `WASD` or arrow keys to move and the mouse to look. `Esc` releases the mouse.
- Touch devices: use the on-screen **MOVE** pad to walk and **LOOK** pad to turn.
- **Reset position** returns to the documented front-gate spawn point.
- **Inspect structure** opens orbit, elevation and level controls intended for checking the model.
- **Day / Evening** changes the lightweight lighting presentation without changing the architectural geometry.

The location label is an orientation aid, not indoor GPS. It reports broad zones such as the front court, stair core, upper floor, and pool terrace.

## Project structure

```text
src/
  app/             application composition and renderer settings
  architecture/    authoritative dimensions, schema, house specification and validation
  components/      product UI, touch controls and UI error boundary
  navigation/      player controller, collision volumes and route validation
  scene/           React Three Fiber geometry, materials, lighting and environment
reference/         supplied architectural reference board
docs/              assumptions, QA findings and performance decisions
```

The source of truth is `src/architecture/`. Scene components and navigation are derived from its house specification; do not add isolated measurements directly to mesh or collision code.

## Modifying dimensions

1. Update named values in [`src/architecture/dimensions.ts`](src/architecture/dimensions.ts).
2. Update the dependent spec entries in [`src/architecture/house.ts`](src/architecture/house.ts) when the change affects rooms, openings, floors, stairs, roof, or exterior elements.
3. Keep the types in [`src/architecture/schema.ts`](src/architecture/schema.ts) aligned if the new element needs data that is not represented yet.
4. Run `npm run build`, then use **Inspect structure** and the walkthrough route to verify floor alignment, openings, stairs and collision.

That workflow keeps rendering, collision, validation and route checks consistent.

## Known assumptions

The reference board does not fully specify every dimension, concealed structure, material, or rear/side opening. Assumptions and their reasons are recorded in [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md); the current comparison and unresolved uncertainty are in [`docs/QA_REPORT.md`](docs/QA_REPORT.md). Performance choices for browser and mobile use are documented in [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md).

## Deployment

This is a static Vite application. A deployment service only needs to run:

```bash
npm ci
npm run build
```

Publish the resulting `dist/` directory. On Netlify, Vercel, Cloudflare Pages, GitHub Pages, or an equivalent static host, use `npm run build` as the build command and `dist` as the publish/output directory.

The application has no server API and no client-side routes, so no SPA rewrite rule is required. Deploying below a subpath requires setting Vite's `base` option in [`vite.config.ts`](vite.config.ts) to that subpath before building (for example, `base: "/residence/"`).

## Validation before handoff

Run `npm run build`. Then check the launch screen, desktop pointer-lock movement, reset action, inspector return path, touch controls at a narrow viewport, and the documented walkthrough route: front gate → driveway → entry → stairs → upper floor → rear terrace/pool.
