# Interactive 3D House — Architectural Reconstruction & Product Context

## 1. Product definition

Build a browser-based, first-person 3D walkthrough of the house shown in `reference/house-reference-board.jpg`.

The user experience:

- Start outside the front gate.
- Walk along the driveway into the property.
- Enter the house.
- Explore the ground floor.
- Use the staircase to reach upper floors.
- Explore bedrooms, bathrooms, circulation areas and balcony spaces.
- Reach the backyard/pool area.
- The experience should feel like walking through a coherent house, not viewing disconnected renders.

Primary requirement:

> Architectural believability and dimensional consistency are more important than photorealism.

Target platforms:

- Desktop browser first.
- Mobile browser supported.
- Architecture should be reusable if a future VR/mobile/desktop-native version is created.

## 2. Reference hierarchy

The reference board contains:

1. Front elevation + landscaping
2. Rear elevation
3. Left elevation
4. Right elevation
5. Ground floor plan
6. First floor plan
7. Second floor plan
8. Roof plan
9. Living room reference
10. Kitchen reference
11. Master bedroom references
12. Children's bedroom reference
13. Bathroom reference
14. Staircase reference
15. Balcony reference
16. Backyard/pool reference
17. Night-time exterior reference

Use these sources with this priority:

### Highest priority: floor plans
Use floor plans to establish:
- room topology
- room adjacency
- circulation
- staircase location
- approximate footprint
- placement of major openings where visible

### Second: elevations
Use elevations to establish:
- exterior massing
- floor-to-floor proportions
- facade composition
- window/door placement
- balconies
- roof form
- exterior materials

### Third: interior references
Use these to establish:
- interior design language
- materials
- furniture style
- lighting mood
- finishes

### Fourth: landscaping references
Use these for:
- driveway
- gate/boundary
- garden
- pool
- planting
- exterior lighting

## 3. Accuracy policy

The supplied image is the best available reference and some dimensions/text are too low-resolution to read reliably.

Therefore never pretend an uncertain measurement is exact.

Every important architectural value should conceptually be classified as:

- `KNOWN` — directly readable/strongly established by the reference.
- `ESTIMATED` — inferred from visible dimensions/proportions.
- `ASSUMED` — chosen because the reference does not provide enough information.
- `UNKNOWN` — genuinely unresolved.

When exact dimensions are unavailable, choose coherent architectural proportions and document the assumption.

Do NOT optimize for matching a single perspective image if that creates contradictions with the floor plans/elevations.

## 4. Core engineering principle

Separate architecture from rendering.

The architectural model is the source of truth.

Recommended conceptual layers:

```text
architectural specification
        ↓
procedural/model geometry
        ↓
materials + furniture
        ↓
scene/environment
        ↓
navigation/collision
        ↓
browser UI
```

A change to a room dimension should not require manually rebuilding unrelated parts of the application.

## 5. Recommended stack

Preferred initial stack:

- React
- TypeScript
- Three.js
- React Three Fiber
- Drei where useful
- Vite
- CSS/Tailwind only if useful for UI
- GLTF/GLB for externally authored assets where appropriate

Keep dependencies reasonable.

Do not introduce a heavy game engine unless a concrete requirement makes it necessary.

## 6. Architecture representation

Create a structured source of truth, for example:

```text
src/
  architecture/
    house.ts
    floors.ts
    rooms.ts
    openings.ts
    stairs.ts
    materials.ts
    site.ts
```

The exact organization may differ, but the architecture must be data-driven.

Conceptual example:

```ts
type Room = {
  id: string;
  floor: number;
  name: string;
  bounds: {
    x: number;
    z: number;
    width: number;
    depth: number;
  };
  ceilingHeight: number;
};

type Opening = {
  id: string;
  type: "door" | "window" | "sliding-door";
  wallId: string;
  position: number;
  width: number;
  height: number;
};

type Floor = {
  level: number;
  elevation: number;
  rooms: Room[];
};
```

Do not copy this blindly. Design the model cleanly.

## 7. Coordinate system

Use a consistent world coordinate system.

Recommended:

- X = left/right
- Y = vertical/elevation
- Z = front/back
- Ground level = Y 0

Choose one clear house origin and document it.

The entire building should be constructed relative to this origin.

## 8. Reconstruction strategy

### Phase A — Reference inspection

Before substantial coding:

1. Inspect the entire reference image.
2. Identify all floors.
3. Identify rooms visible in each plan.
4. Identify stairs and major circulation.
5. Identify major doors/windows.
6. Identify exterior massing.
7. Identify uncertain dimensions.
8. Produce a reconstruction notes file.

Do not immediately generate a polished scene.

### Phase B — Architectural blockout

Build only:

- ground slab
- floor slabs
- exterior walls
- major interior walls
- stairs
- roof mass
- major doors/windows
- site boundary
- driveway
- pool

Use simple materials.

Goal: verify geometry.

### Phase C — Validation

Render/check the blockout from:

- front
- rear
- left
- right
- top

Compare against the reference board.

Fix contradictions before adding detail.

### Phase D — Architectural detailing

Add:

- window frames
- glass
- doors
- balcony rails
- facade sections
- roof details
- garage
- boundary wall
- exterior steps

### Phase E — Interior

Add representative:

- living room
- dining area
- kitchen
- bedrooms
- bathrooms
- staircase
- balcony

Use the reference images as style guides.

Do not obsess over tiny decorative objects during the first pass.

### Phase F — Environment

Add:

- lawn
- landscaping
- driveway
- gate
- pool
- backyard
- trees/plants
- exterior lights

### Phase G — Walkthrough

Implement:

- first-person camera
- mouse look
- keyboard movement
- touch controls
- collision
- gravity
- stairs
- sensible player height
- spawn point outside front gate

The user must be able to traverse the house naturally.

## 9. Navigation requirements

Initial desktop controls:

- WASD / arrow keys for movement
- mouse for looking
- pointer lock if appropriate
- escape exits pointer lock

Mobile:

- virtual joystick or equivalent movement control
- touch-look area
- simple UI
- avoid tiny controls

Player should not:

- walk through walls
- fall through floors
- pass through major furniture
- become stuck on ordinary stairs

Use simple, robust collision before attempting sophisticated physics.

## 10. Scene performance

Target a smooth browser experience.

Prefer:

- reusable geometry
- instancing for repeated plants/lights
- compressed textures where practical
- reasonable polygon counts
- lazy loading for optional assets
- GLB for external 3D assets
- avoid enormous texture files

Do not sacrifice architectural correctness just to chase visual effects.

## 11. Visual direction

The reference suggests a contemporary warm-modern house:

- large glazing
- warm wood
- stone/concrete surfaces
- dark metal elements
- clean lines
- warm indirect lighting
- restrained furniture
- landscaped exterior
- premium but not excessively ornate

Use this as a visual language, not as a reason to invent architecture.

## 12. Important distinction: model vs. image

Do not solve the task by creating a single 3D-looking image.

The deliverable is a genuine 3D scene with:

- spatial geometry
- depth
- floors
- walls
- openings
- camera movement
- collisions
- navigable rooms

AI-generated textures/renders can be used as supporting assets, but they are not substitutes for the architectural model.

## 13. Unknowns and assumptions

The reference board does not provide a complete, machine-readable architectural specification.

Therefore:

- record important assumptions in `docs/ASSUMPTIONS.md`
- use plausible dimensions where necessary
- keep dimensions centralized
- make assumptions easy to change
- never scatter magic numbers throughout rendering code

If a measurement is uncertain, prefer a coherent model that matches multiple views over a locally perfect but globally inconsistent measurement.

## 14. Development philosophy

Build vertically, not all at once.

Recommended milestones:

1. Empty web scene
2. Site + house footprint
3. Multi-floor shell
4. Stairs + openings
5. Basic walkthrough
6. Architectural detailing
7. Interior furnishing
8. Landscaping
9. Lighting/polish
10. Mobile optimization

At every milestone the application should remain runnable.

## 15. Definition of done for the first meaningful MVP

A user can:

1. Load the website.
2. See the house from outside.
3. Start at the front gate.
4. Walk to the front door.
5. Enter the house.
6. Move through the ground floor.
7. Find and climb the stairs.
8. Explore at least the major upper-floor spaces.
9. Walk onto the balcony where applicable.
10. Reach the backyard/pool.
11. Move without walking through major walls.
12. Use the experience on desktop.
13. Use a functional simplified control system on mobile.

The house does not need final photorealism at this stage.

## 16. Non-goals for MVP

Do NOT initially spend significant time on:

- photorealistic characters
- multiplayer
- VR
- complex physics
- procedural destruction
- advanced AI NPCs
- voice assistants
- multiplayer networking
- perfect furniture reproduction
- cinematic cutscenes

These can come later.

## 17. Quality bar

The most important question at each stage is:

> Does this make the digital house more structurally correct, more navigable, or more faithful to the reference?

If not, defer it.

