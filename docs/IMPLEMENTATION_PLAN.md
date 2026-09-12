# Implementation Plan

## Repository finding

This directory is a reference/build pack, not an application repository. It has no `package.json`, lockfile, `src/`, `public/`, Vite configuration, or existing runtime dependencies. No application scaffold is created in this reconnaissance task.

When implementation is authorized, create a Vite React + TypeScript project and add only the rendering dependencies needed for the first vertical slice: `three`, `@react-three/fiber`, `@react-three/drei`, and their TypeScript types where required. Add a physics library only after simple architectural collision proves insufficient.

## Proposed source layout

```text
src/
  app/
    App.tsx                    # Canvas shell, loading/error UI, debug mode
    sceneSettings.ts           # renderer/camera/environment configuration
  architecture/
    schema.ts                  # data types and confidence/source metadata
    house.ts                   # one composed HouseSpec
    dimensions.ts              # all calibration tokens and named ratios
    levels.ts                  # level elevations and slabs
    rooms.ts                   # semantic room footprints / labels
    walls.ts                   # exterior/interior wall centerlines or segments
    openings.ts                # doors, windows, sliding-door definitions
    stairs.ts                  # stair runs and landing definitions
    roof.ts                    # roof/parapet footprint and voids
    site.ts                    # gate, drive, boundary, pool, terrain zones
    materials.ts               # material roles, not renderer instances
  scene/
    HouseScene.tsx             # assembles generators from HouseSpec
    geometry/
      Slabs.tsx
      Walls.tsx
      Openings.tsx
      Stairs.tsx
      Site.tsx
    materials/
      materialFactory.ts
    debug/
      PlanOverlay.tsx
      RoomLabels.tsx
      ValidationCameras.tsx
  navigation/
    PlayerController.tsx       # pointer lock, keyboard/touch input
    collisions.ts              # derives simple blockers from architecture
    spawn.ts                   # front-gate spawn point
  components/
    WalkthroughHud.tsx
    MobileControls.tsx
  styles/
    app.css
  main.tsx
```

`reference/` and `docs/` remain alongside the application for traceability. External assets, if later approved, belong in `public/assets/` or `src/assets/`; they must not become the source of truth for the shell.

## Data-driven model

The source of truth is a typed `HouseSpec`, with rendering and collision both derived from it. Semantic IDs are permanent even when labels or dimensions change.

```ts
type Confidence = "KNOWN" | "ESTIMATED" | "ASSUMED" | "UNKNOWN";

type Evidence<T> = {
  value: T;
  confidence: Confidence;
  source: string; // board panel or assumption-register ID
};

type Footprint = { x: number; z: number; width: number; depth: number };

type LevelSpec = {
  id: "ground" | "first" | "second" | "roof";
  elevation: number;
  slabs: Footprint[];
};

type RoomSpec = {
  id: string;
  levelId: LevelSpec["id"];
  label: string;
  footprint: Footprint;
  kind: "living" | "dining" | "kitchen" | "garage" | "bedroom" |
        "bath" | "stair" | "landing" | "terrace" | "service";
  evidence: Evidence<true>;
};

type WallSpec = {
  id: string;
  levelId: LevelSpec["id"];
  start: { x: number; z: number };
  end: { x: number; z: number };
  heightToken: string;
  thicknessToken: string;
  role: "exterior" | "interior" | "parapet";
};

type OpeningSpec = {
  id: string;
  wallId: string;
  kind: "door" | "garage-door" | "window" | "sliding-door";
  offset: number;
  widthToken: string;
  sillHeightToken?: string;
  heightToken: string;
  evidence: Evidence<true>;
};

type HouseSpec = {
  coordinateSystem: { frontAxis: "-z"; groundElevation: 0 };
  scale: { referenceToWorld: Evidence<number> };
  levels: LevelSpec[];
  rooms: RoomSpec[];
  walls: WallSpec[];
  openings: OpeningSpec[];
  stairs: StairSpec[];
  site: SiteSpec;
};
```

The final `StairSpec` and `SiteSpec` must use the same patterns: plan-space geometry, named dimensional tokens, semantic IDs and evidence. Meshes should not own independent dimensions. Openings are cut from their host wall during geometry generation, rather than placed as decorative planes over a solid wall. Collision volumes are generated from the wall/slab/stair geometry inputs and exclude portal openings.

## Dimensional strategy

1. Keep plan coordinates in local X/Z and elevations in Y, in world units treated as metres.
2. Store every adjustable magnitude in `dimensions.ts`, grouped into global construction tokens, level tokens and named architectural spans.
3. Set `referenceToWorld` from an approved anchor only. Until then, represent the plan with relative proportions and mark every provisional value `ESTIMATED` or `ASSUMED`.
4. Derive neighbouring room boundaries from shared wall segments. Do not give two adjacent rooms independently guessed edges.
5. Validate visual proportions against all orthographic reference panels before changing a token. Never turn an unreadable annotation into a precise value.

## Smallest vertical-slice MVP

The first runnable slice should prove a coherent data-to-walkthrough pipeline, not complete the house:

1. A browser canvas renders a simple site strip with front gate, driveway and ground-level shell in neutral materials.
2. It derives the garage, primary entry, living/dining circulation, one major rear glazed opening and its pool-side terrace from `HouseSpec`.
3. A continuous, data-defined stair reaches a first-floor landing mass; only the landing and one adjacent placeholder room are needed at this point.
4. Pointer-lock WASD navigation starts outside the front gate and uses simple wall/slab/stair collision so the user can enter, cross the ground floor and climb the stair without crossing walls or falling through floors.
5. Debug top/front/rear/side cameras and room/wall IDs make discrepancies inspectable before materials or furniture are added.

This is intentionally smaller than the product MVP in `ARCHITECTURE.md`. It tests the hard architectural seams—site-to-entry route, openings, multi-level alignment, stairs and collision—while keeping all geometry replaceable after calibration.

## Delivery sequence after authorization

1. Scaffold the application and make an empty R3F scene runnable.
2. Implement `schema.ts`, a deliberately incomplete `HouseSpec`, and debug plan rendering.
3. Build the vertical slice above and validate it from orthographic views.
4. Complete the three-level shell, roof, major openings, site boundary, driveway and pool.
5. Reconcile plans/elevations; only then add rails, frames, facade layers and interior partitions.
6. Add representative interiors, landscape, lighting, mobile controls and performance work in that order.

## Acceptance checks for the vertical slice

- Updating a footprint/wall token moves rendered geometry and collision together.
- The player reaches the front door from the gate, passes through the intended opening, reaches the stair and can arrive at the first-level landing.
- The player cannot traverse major walls, the closed garage wall or floor edges.
- Top/front/rear/left/right debug views reveal no known contradiction with the board before any visual polish begins.

## Walkthrough technical decisions

- Navigation uses a kinematic capsule approximation: a 2D player radius with a
  feet elevation and player height, rather than a physics-engine dependency.
- Collision boxes are generated from architectural wall segments and the site
  boundary. Door and sliding-door portals are removed from their host wall
  blockers; windows and the garage door remain solid.
- Walkable height is derived from site ground, slabs and every data-defined
  stair tread. A maximum-step rule snaps the player across normal steps and
  stair descents while unsupported large drops remain governed by gravity.
- The front gate is rendered closed in the simple blockout but is an open
  pedestrian collision gap, allowing the documented spawn-to-drive route.
- `validateWalkthroughRoute()` simulates the defined gate → entry → stair →
  upper floor → rear/pool route in small collision-aware steps and reports its
  result in inspector debug mode.
