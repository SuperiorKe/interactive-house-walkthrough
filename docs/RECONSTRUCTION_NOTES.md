# Reconstruction Notes

## Source reviewed

`reference/house-reference-board.jpg` is a 1536 × 858 composite board. It contains a front landscaping image, rear/left/right elevations, plans for the ground, first, second and roof levels, and style-reference renders. Its plan labels are partly legible; its dimension strings are not readable enough to use as measurements.

The plan panels are the authority for spatial topology. Elevations establish the visible envelope and the images below the plans establish material and landscape intent. Perspective renders are not treated as measurements.

## Confident observations

### Levels and massing

| Item | Confidence | Observation |
| --- | --- | --- |
| Storeys | KNOWN | There are ground, first and second-floor plans, plus a roof plan. |
| General form | KNOWN | The house is a contemporary, predominantly rectilinear, three-storey residence with stepped/set-back upper massing. |
| Roof | KNOWN | The roof plan and elevations show a flat/parapet roof rather than a pitched roof. Its footprint steps around an upper-level void/setback. |
| Rear amenity | KNOWN | A linear swimming pool sits immediately behind the rear ground-floor terrace/glazing. |
| Front site | KNOWN | The front has a perimeter wall, vehicular sliding gate, pedestrian/entry zone, long paved driveway and landscaped lawn. |
| Facade language | KNOWN | Large glazing, warm timber-like cladding, stone/concrete-like cladding, pale render, and dark metal/grey garage elements recur across views. |
| Vertical feature | KNOWN | The front/right side includes a tall, visually distinct stair/entry volume with vertical framing or fins. |

### Ground floor topology

The ground plan clearly labels a kitchen at one end and living/dining functions through the principal open area. A one-car garage is at the front-side corner of the footprint. A stair is adjacent to the garage-side circulation. The main open rooms connect rather than being isolated cells. A small enclosed service/entry compartment occurs near the front/garage circulation. The ground-floor rear facade has several large glazed openings to the terrace and pool according to the rear elevation.

### First-floor topology

The first-floor plan has a central landing/circulation spine reached by the stair. It serves several rooms labelled as bedrooms, with attached/shared bathroom or closet-sized rooms. The exact count and whether every small room is a bathroom, wardrobe, or utility cannot be determined from the raster.

### Second-floor topology

The second floor is smaller than the lower envelope. It contains the stair arrival, a large master-suite-labelled zone, at least one additional bedroom-labelled zone, a small bathroom-sized compartment, and a substantial open terrace/balcony/setback area. This matches the stepped exterior massing.

### Openings and exterior

- The garage door is a wide horizontal opening on the left elevation.
- The entry door is separate from the garage and visually emphasized at the front/right stair-volume side.
- The rear ground level has multiple wide sliding-door/glazed bays facing the pool.
- Upper levels have broad, nearly square glazed bays and at least one balcony with a glass or slender-metal guard.
- The visible second-floor/balcony facade has a deep horizontal overhang.

## Orientation working convention

The board does not mark north. For the reconstruction, **front** means the gate/driveway/primary-entry side shown in the large front image; **rear** means the pool side shown in the rear elevation. The printed-plan edge corresponding to this convention is still **ESTIMATED** and must be reconciled while validating the shell against elevations. No geographic north is implied.

## Important ambiguities

| Topic | Status | Handling |
| --- | --- | --- |
| Printed dimensions | UNKNOWN | Do not transcribe or infer exact values. Obtain a higher-resolution plan/CAD/PDF if dimensional fidelity is needed. |
| Plan orientation/north | UNKNOWN | Use the front/rear convention above internally; keep a `planRotation` parameter until confirmed. |
| Exact room names/counts upstairs | PARTLY UNKNOWN | Use stable neutral IDs (`bedroom-1`, `bath-1`) initially; retain display labels separately. |
| Door swings and small openings | UNKNOWN | Model only clearly visible major access openings in the first blockout. |
| Wall/slab thicknesses and ceiling heights | UNKNOWN | Centralize assumptions; never encode them into mesh components. |
| Pool, boundary and driveway dimensions | UNKNOWN | Match relative placement and access route first. |
| Roof drainage, parapet details and concealed plant | UNKNOWN | Represent only the visible flat roof/parapet mass in the initial shell. |
| Interior furniture placement | UNKNOWN | The images establish a warm-modern language only; furnishings are deferred. |

## Validation order

1. Calibrate the lower footprint and garage/entry relationship from plans and side elevations.
2. Align the stair core through all three storeys.
3. Match upper-level setbacks, balcony and rear glazed bays to elevations.
4. Place pool, terrace, driveway and gates relative to the confirmed shell.
5. Add room partitions and major interior openings.

At every stage, compare orthographic front, rear, left, right and top views to the corresponding board panel. A local resemblance to a perspective render does not override a plan/elevation conflict.
