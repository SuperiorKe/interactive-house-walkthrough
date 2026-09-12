# Build Strategy

## Goal

Produce a real navigable 3D representation of the supplied house reference.

## Recommended repository structure

```text
house-3d/
├── reference/
│   └── house-reference-board.jpg
├── docs/
│   ├── ARCHITECTURE.md
│   ├── RECONSTRUCTION_NOTES.md
│   ├── ASSUMPTIONS.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── QA_REPORT.md
├── public/
├── src/
│   ├── architecture/
│   ├── scene/
│   ├── navigation/
│   ├── components/
│   ├── assets/
│   └── app/
├── package.json
└── README.md
```

The exact structure may change if Codex has a better reason.

## Architectural source of truth

Avoid this:

```text
Wall.jsx
Wall2.jsx
Wall3.jsx
Wall4.jsx
```

Prefer:

```text
house specification
      ↓
geometry generators
      ↓
rendered walls
```

The same principle applies to floors, openings, stairs and rooms.

## Why procedural geometry is appropriate initially

The reference is an architectural board, not a finished 3D asset.

Procedural geometry allows:

- dimensions to be changed
- walls to remain consistent
- rooms to remain connected
- collision to derive from architecture
- the model to be regenerated
- future BIM/CAD-like workflows

External GLB assets are appropriate for things such as:

- furniture
- plants
- decorative objects
- appliances

They are less appropriate as the primary representation of the building shell during the initial reconstruction.

## Measurement strategy

Because the reference dimensions are difficult to read, establish one or more scale anchors.

If no reliable absolute dimension exists:

1. choose a reasonable architectural assumption
2. document it
3. use relative proportions consistently
4. make the assumption easy to replace

Never mix unrelated guessed scales.

## Collision strategy

Start simple.

Possible MVP approach:

- architectural walls represented by simple collision volumes
- floors by planes/boxes
- stairs by carefully designed walkable surfaces or simple step volumes
- major furniture collision only where necessary

Avoid complex physics until it provides clear value.

## Navigation strategy

Start at the front gate.

The default route should be naturally discoverable.

Possible future features:

- floor map
- room labels
- teleport/floor selector
- guided tour
- measurement mode
- first/third-person toggle

These are secondary to physical walking.

## Visual strategy

First:

```text
geometry → correct
```

Then:

```text
materials → coherent
```

Then:

```text
lighting → convincing
```

Then:

```text
decor → polished
```

Do not reverse this order.

## Success metric

A person familiar with the reference board should be able to enter the virtual house and say:

> “Yes, this is the same house.”

even before the model reaches photorealistic quality.
