# Architectural QA Report

## Scope and method

Reviewed `reference/house-reference-board.jpg` against the data-driven model on 2026-09-13. The plans establish topology first; rear, left and right elevations establish the massing/opening language; the front and night renders establish gate, driveway and landscape composition. Measurements that are illegible at board resolution remain estimates.

## Corrected in this pass

1. The first-floor rear glass opening is now a full-height sliding door, not a high-sill window.
2. A real first-floor rear balcony slab now sits behind the rear glass guard. Its guard moved from the building wall line to the outside slab edge.
3. The existing first-floor side glazing now connects to a narrow, supported right-side balcony slab and glass guard.
4. Unsupported second-floor front/right guards were removed. The board supports balconies, but did not support those previously floating runs at their former locations.
5. Validation now verifies that every balcony guard starts and ends on a slab at its stated level.

These changes are encoded in `src/architecture/dimensions.ts` and `src/architecture/house.ts`; no navigation collider was widened or moved.

## Elevation and site QA

| Area | Finding | Status / action |
| --- | --- | --- |
| Front proportions | Three occupied levels, parapet roof and an asymmetric upper mass read consistently with the front/night imagery. Exact height calibration is not readable. | Retained; estimated scale remains in the assumptions register. |
| Front facade | Light render, dark masonry, vertical timber fields, dark frames and a recessed entry are all present. | Pass at reference-board fidelity. |
| Front windows / entry | The main entry, adjacent glazing and dark frames are represented; exact mullion schedule and door leaf proportions are not readable. | Retained as estimated openings. |
| Gate / driveway | Right-side drive, mixed slatted/timber gate and low boundary wall agree with the front imagery. | Pass; planting was kept below facade sight lines. |
| Rear massing | Ground pool-side sliders, a left-hand upper balcony and a timber-clad upper volume match the rear elevation’s primary composition. | Improved: rear balcony now has slab, door and guard alignment. |
| Rear pool relationship | Terrace and pool are directly behind the rear openings, separated by broad low steps/coping. | Pass at topological level; exact pool edge dimensions are unknown. |
| Left elevation / garage | Garage opening is on the left outer wall toward the front, with a broad dark door and material band. | Pass for elevation relationship; exact opening width remains estimated. |
| Right elevation | Side glazing and a supported first-floor side balcony now read as a coherent facade feature. | Partial: the reference’s tall stair-screen pattern is visible but its exact position and subdivision cannot be reliably transcribed. |

## Plan and circulation QA

| Area | Finding | Status / action |
| --- | --- | --- |
| Ground plan | Garage is front/left, living/dining occupies the main open zone, kitchen is rear, and the stair sits near the garage-side circulation. | Pass for adjacency and route; room dimensions are estimated. |
| First plan | Central stair arrival and bedroom/service partitions are represented. | Partial: the board’s individual first-floor room dimensions and door swings are illegible. |
| Second plan | Setback upper mass, master-suite zone, service/bath core and terrace relationship are represented. | Partial: partition extents remain estimated. |
| Continuous stair | Two connected flights align with slabs/landings and pass the programmatic route validation. | Pass. |
| Exterior circulation | Gate → drive → entry → stairs → rear slider → pool route is retained. | Pass; balcony additions add support only off the prescribed route. |

## Roof QA

The model has a flat slab, parapet and coping, matching the board’s flat-roof language. The roof plan appears to contain an L-shaped service/terrace arrangement, but the low-resolution hatch boundaries cannot distinguish roof finish zones from a changed outer footprint. The current upper rectangular roof footprint is therefore retained as an **ESTIMATED** mass rather than inventing a stepped roof perimeter.

## Remaining uncertainty

- Exact opening schedule: sill/head heights, mullion counts, door swings and hardware.
- Exact floor-to-floor heights, wall thicknesses and structural grid.
- Exact right-elevation stair screen geometry.
- Exact first/second-floor room dimensions, bath layouts and roof drainage/services.
- Landscape species and pool construction depth.

All unresolved items remain assumptions rather than being represented as measured facts. See `docs/ASSUMPTIONS.md` for change triggers.
