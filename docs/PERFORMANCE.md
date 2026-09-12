# Walkthrough Performance Decisions

## Baseline priorities

The walkthrough targets an ordinary modern phone without weakening desktop navigation or architectural readability. Profiling should begin with browser frame time and GPU timing; this project has no downloaded models or texture assets, so transfer size is currently dominated by the JavaScript bundle rather than image payloads.

## Highest-impact decisions

1. Debug geometry is off by default. The inspector can still enable edges, labels and centerlines, but the walkthrough no longer creates an `Edges` helper for every block or multiple DOM labels.
2. Repeated planting remains four instanced meshes (tree trunks, canopies, shrubs and grass), avoiding a draw call for every plant.
3. Compact devices use a 1× device-pixel-ratio budget, basic shadows and a 1024 × 1024 directional shadow map. Desktop remains soft-shadowed at up to 1.5× DPR with a 2048 × 2048 map.
4. Loose furniture and finish overlays do not cast shadows. Architectural masses remain shadow casters, preserving the spatial cues that matter most.
5. Day mode does not create exterior point lights. On compact devices, interior point lights are deferred until Evening mode and both interior/exterior light counts are capped.

## Mobile controls and camera

- The left control uses radial normalization plus a small dead zone, preventing diagonal over-speed and accidental drift.
- The right touch area is a larger rounded look zone; its sensitivity is lower than the previous direct pixel mapping.
- Compact devices use a slightly wider 76° FOV and a 10% slower movement multiplier. Mouse look, keyboard movement, desktop FOV and desktop movement remain unchanged.
- Safe-area insets and coarse-pointer sizing keep controls usable on notched phones.

## Loading and assets

- The landing action remains disabled until the renderer is created. If WebGL is unavailable, the page keeps its explanatory launch state and presents a browser-capability message instead of allowing an unusable walkthrough to start.
- There are no runtime texture downloads. Materials use procedural color/roughness/metalness values, avoiding texture decode memory and oversized image transfers.
- Future texture assets should be compressed, power-of-two where mipmaps help, and limited to 1K for broad material maps unless a visible close-range surface requires more.

## Follow-up measurement

Before adding more content, verify first-frame time and sustained FPS on a representative Android/iOS browser in Day and Evening modes. If either falls below target, reduce light count and shadow distance before simplifying architecture or navigation.
