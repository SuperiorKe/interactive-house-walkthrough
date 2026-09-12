# Assumptions Register

This register makes uncertainty explicit. `KNOWN` means the source directly supports it; `ESTIMATED` is a proportion/topology inference; `ASSUMED` is a reversible implementation choice; `UNKNOWN` must not be silently filled in.

## Coordinate and scale policy

| ID | Status | Decision / evidence | Change trigger |
| --- | --- | --- | --- |
| A-01 | ASSUMED | World axes are X = house left/right, Y = up, Z = front/rear. Finished ground-floor level is Y = 0. | Never change after scene code exists; transform imported references instead. |
| A-02 | ASSUMED | Local origin is the exterior front-left corner of the ground-floor envelope at Y = 0. The front is Z-negative and rear is Z-positive. | Change only before data/scene implementation if plan orientation is proven opposite. |
| A-03 | ASSUMED | Three.js units will be treated as metres, but no numeric building extent is approved yet. A single calibration parameter will control reference-to-world scale. | A readable dimensioned source or a verified site measurement. |
| A-04 | ESTIMATED | Plan drawing direction must be rotated, if necessary, to make the garage, entry, stair volume and rear pool elevation agree. | Orthographic shell validation. |

## Building and site

| ID | Status | Decision / evidence | Change trigger |
| --- | --- | --- | --- |
| B-01 | KNOWN | The building has three occupiable levels and a flat/parapet roof. | Only a superseding architectural drawing. |
| B-02 | ESTIMATED | The second floor is set back from part of the lower footprint, creating terrace/balcony space. | More legible plan/elevation material. |
| B-03 | KNOWN | Garage, primary entry, driveway and gate are on the front side; pool is at the rear. | Better orientation information. |
| B-04 | ASSUMED | The blockout uses 3.60 m floor-to-floor, 3.20 m clear wall height, 0.28 m slabs, 0.24 m exterior walls, 0.16 m interior walls and 0.60 m parapets. Navigation permits a 0.42 m maximum supported step at the provisional stair/landing transition. These are centralized in `src/architecture/dimensions.ts`, not read from blurry annotations. | Dimension source or cross-elevation calibration. |
| B-05 | ASSUMED | The drive is a usable pedestrian route from the gate to the entry even though the exact car turning geometry is unknown. | Site plan/dimensions. |
| B-06 | ESTIMATED | The initial lower envelope is 12.0 × 17.0 m. The second-floor mass is an inset 9.6 × 12.5 m rectangle, offset 2.4 m laterally and 3.2 m from the front. This produces the reference's stepped mass/terrace relationship, but is not a transcribed dimension. | Readable dimensions or elevation calibration. |
| B-07 | ASSUMED | Each blockout stair run has 18 steps at 0.20 m rise and 0.31 m tread, connecting the centrally defined floor elevations. It is a geometric continuity assumption, not a code-compliance claim. | Detailed stair drawing or dimensions. |
| B-08 | ESTIMATED | The site is proportioned to keep a lawn/front court beside a right-side driveway and a pool immediately rear of the terrace. Boundary, gate, driveway and pool sizes are placeholders in the same central dimensions file. | Site plan or reliable scaled reference. |

## Rooms, openings and circulation

| ID | Status | Decision / evidence | Change trigger |
| --- | --- | --- | --- |
| R-01 | KNOWN | Ground level contains a garage, stair, kitchen and open living/dining functions. | Higher-resolution plan may refine labels only. |
| R-02 | ESTIMATED | The first floor contains a stair landing, multiple bedrooms and bathroom/closet/service rooms. | Readable plan labels or room schedule. |
| R-03 | ESTIMATED | The second level contains a master-suite zone, at least one other bedroom, bath/service space and open terrace/balcony area. | Readable plan labels or room schedule. |
| R-04 | KNOWN | A continuous stair connects the levels. Its position is near the garage-side circulation on the ground plan and aligns to upper landings. | Detailed stair drawing. |
| R-05 | KNOWN | Major rear ground-floor openings face the pool; the garage has a broad vehicular opening. | Detailed elevations/opening schedule. |
| R-06 | UNKNOWN | Exact door swings, internal door widths, window head/sill heights and glazing subdivisions. | Enlarged plans/elevations. |
| R-07 | ESTIMATED | Broad upper side glazing is included where the side elevations visibly show windows/balcony openings. Its exact side, span, framing and sill heights remain adjustable opening tokens rather than measured facts. | Enlarged elevations or an opening schedule. |
| R-08 | ASSUMED | A 4.40 m second-floor stair-arrival portal is placed in the upper front wall so the visible stair core can reach the second-floor void without intersecting a solid wall. Its broad span represents the elevation's tall entry/stair feature; the neighbouring front window was shifted within the remaining facade span. | Detailed upper-floor stair/door drawing. |
| R-09 | ASSUMED | A 1.35 m first-floor landing and a shallow 0.60 m second-floor arrival landing bridge the stair runs to adjacent circulation slabs. They overlap terminal treads only enough to remove unsupported seams, without creating an artificial high platform above descending steps. They are inferred blockout connections, not measured slab extents. | Detailed second-floor plan/section. |
| R-10 | ASSUMED | The second-floor slab opening extends rearward over the stairwell core to the first-floor landing, while retaining the adjacent side circulation strip. This prevents an upper slab from occupying the main vertical circulation volume and keeps the two stair runs traversable as one core. | Detailed building section. |
| R-11 | ASSUMED | The first-to-second flight is an adjacent return run within the same stair core rather than a second stair occupying the ground-to-first run. A short first-floor hall opening connects the two flights. | Detailed stair plan/section. |

## Explicitly deferred choices

- Exact room dimensions, wall thicknesses, floor levels, stair rise/run and railing code compliance.
- Exact pool depth/edge detail, landscape species, lighting layout, drainage and roof build-up.
- Furniture/appliance models and their collision volumes.
- Any interpretation of blurry numeric annotations as precise metres.

## Rules for future assumptions

1. Add the value to a central specification token, not a scene component.
2. Give it an ID, status and source/reason here.
3. Preserve the prior value in a commit or review note when calibration changes it.
4. Prefer a coherent value corroborated by several orthographic views over a perspective-only match.
