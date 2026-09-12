import { DIM, LEVEL_ELEVATION } from "./dimensions";
import type {
  FacadeSectionSpec,
  HouseSpec,
  InteriorFinishSpec,
  InteriorLightSpec,
  InteriorModuleSpec,
  ExteriorLightSpec,
  LandscapeBedSpec,
  LandscapePlantSpec,
  LevelId,
  LevelSpec,
  OpeningSpec,
  PlanRect,
  RailingSpec,
  RoofDetailSpec,
  WallSpec,
} from "./schema";

const { balconies, construction, house, interior, navigation, openings, site, stair } = DIM;

const outerFootprint: PlanRect = {
  id: "main-envelope",
  x: 0,
  z: 0,
  width: house.width,
  depth: house.depth,
};

const upperFootprint: PlanRect = {
  id: "second-envelope",
  ...house.secondFloor,
};

const stairVoid = {
  x: stair.x - stair.voidMargin,
  z: stair.z - stair.voidMargin,
  width: stair.width + stair.voidMargin * 2,
  depth: stair.run + stair.voidMargin * 2,
};

const secondStairLanding: PlanRect = {
  id: "second-stair-landing",
  x: stair.secondRunX - stair.width / 2,
  z: house.secondFloor.z,
  width: stair.width + stair.landing.rightExtension,
  depth: stair.landing.secondDepth,
};

const firstStairLanding: PlanRect = {
  id: "first-stair-landing",
  x: stair.x - stair.width / 2,
  z: stair.z + stair.run - stair.voidMargin,
  width: stair.width + stair.landing.rightExtension,
  depth: stair.landing.firstDepth,
};

const firstRearBalcony: PlanRect = {
  id: "first-rear-balcony",
  ...balconies.firstRear,
};

const firstRightBalcony: PlanRect = {
  id: "first-right-balcony",
  ...balconies.firstRight,
};

const secondStairwellVoid = {
  x: stairVoid.x,
  z: stairVoid.z,
  width: stair.secondRunX + stair.width / 2 - stairVoid.x,
  depth: firstStairLanding.z + firstStairLanding.depth - stairVoid.z,
};

function slabsAroundVoid(idPrefix: string, footprint: PlanRect, floorVoid: Omit<PlanRect, "id">): PlanRect[] {
  const voidLeft = Math.max(footprint.x, floorVoid.x);
  const voidFront = Math.max(footprint.z, floorVoid.z);
  const voidRight = Math.min(footprint.x + footprint.width, floorVoid.x + floorVoid.width);
  const voidRear = Math.min(footprint.z + footprint.depth, floorVoid.z + floorVoid.depth);
  const footprintRight = footprint.x + footprint.width;
  const footprintRear = footprint.z + footprint.depth;

  if (voidLeft >= voidRight || voidFront >= voidRear) {
    return [footprint];
  }

  return [
    { id: `${idPrefix}-front`, x: footprint.x, z: footprint.z, width: footprint.width, depth: voidFront - footprint.z },
    { id: `${idPrefix}-left`, x: footprint.x, z: voidFront, width: voidLeft - footprint.x, depth: voidRear - voidFront },
    { id: `${idPrefix}-right`, x: voidRight, z: voidFront, width: footprintRight - voidRight, depth: voidRear - voidFront },
    { id: `${idPrefix}-rear`, x: footprint.x, z: voidRear, width: footprint.width, depth: footprintRear - voidRear },
  ].filter((slab) => slab.width > 0 && slab.depth > 0);
}

function perimeterWalls(levelId: LevelId, footprint: PlanRect, baseElevation: number, height: number, role: WallSpec["role"] = "exterior"): WallSpec[] {
  const right = footprint.x + footprint.width;
  const rear = footprint.z + footprint.depth;
  const thickness = role === "interior"
    ? construction.interiorWallThickness
    : role === "parapet"
      ? construction.parapetThickness
      : construction.exteriorWallThickness;

  return [
    { id: `${levelId}-exterior-front`, levelId, start: { x: footprint.x, z: footprint.z }, end: { x: right, z: footprint.z }, baseElevation, height, thickness, role },
    { id: `${levelId}-exterior-right`, levelId, start: { x: right, z: footprint.z }, end: { x: right, z: rear }, baseElevation, height, thickness, role },
    { id: `${levelId}-exterior-rear`, levelId, start: { x: right, z: rear }, end: { x: footprint.x, z: rear }, baseElevation, height, thickness, role },
    { id: `${levelId}-exterior-left`, levelId, start: { x: footprint.x, z: rear }, end: { x: footprint.x, z: footprint.z }, baseElevation, height, thickness, role },
  ];
}

function interiorWall(id: string, levelId: LevelId, start: WallSpec["start"], end: WallSpec["end"], baseElevation: number): WallSpec {
  return {
    id,
    levelId,
    start,
    end,
    baseElevation,
    height: construction.clearWallHeight,
    thickness: construction.interiorWallThickness,
    role: "interior",
  };
}

const levels: LevelSpec[] = [
  { id: "ground", label: "Ground floor", elevation: LEVEL_ELEVATION.ground, slabs: [outerFootprint], visibleByDefault: true },
  { id: "first", label: "First floor", elevation: LEVEL_ELEVATION.first, slabs: [...slabsAroundVoid("first-slab", outerFootprint, stairVoid), firstStairLanding, firstRearBalcony, firstRightBalcony], visibleByDefault: true },
  { id: "second", label: "Second floor", elevation: LEVEL_ELEVATION.second, slabs: [...slabsAroundVoid("second-slab", upperFootprint, secondStairwellVoid), secondStairLanding], visibleByDefault: true },
  { id: "roof", label: "Roof mass", elevation: LEVEL_ELEVATION.roof, slabs: [upperFootprint], visibleByDefault: true },
];

const walls: WallSpec[] = [
  ...perimeterWalls("ground", outerFootprint, LEVEL_ELEVATION.ground + construction.slabThickness, construction.clearWallHeight),
  interiorWall("ground-garage-partition", "ground", { x: interior.garageWidth, z: 0 }, { x: interior.garageWidth, z: stair.z }, LEVEL_ELEVATION.ground + construction.slabThickness),
  interiorWall("ground-stair-rear", "ground", { x: interior.garageWidth, z: stair.z + stair.run }, { x: stair.x + stair.width, z: stair.z + stair.run }, LEVEL_ELEVATION.ground + construction.slabThickness),
  interiorWall("ground-kitchen-divider", "ground", { x: 0, z: house.depth - interior.kitchenDepth }, { x: stair.x, z: house.depth - interior.kitchenDepth }, LEVEL_ELEVATION.ground + construction.slabThickness),
  interiorWall("ground-kitchen-return", "ground", { x: stair.x, z: house.depth - interior.kitchenDepth }, { x: stair.x, z: house.depth }, LEVEL_ELEVATION.ground + construction.slabThickness),

  ...perimeterWalls("first", outerFootprint, LEVEL_ELEVATION.first + construction.slabThickness, construction.clearWallHeight),
  interiorWall("first-hall-west", "first", { x: interior.firstHallX, z: 10.1 }, { x: interior.firstHallX, z: house.depth }, LEVEL_ELEVATION.first + construction.slabThickness),
  interiorWall("first-north-bedroom", "first", { x: 0, z: 10.1 }, { x: interior.firstHallX, z: 10.1 }, LEVEL_ELEVATION.first + construction.slabThickness),
  interiorWall("first-east-bedroom", "first", { x: interior.firstHallX, z: 9.2 }, { x: house.width, z: 9.2 }, LEVEL_ELEVATION.first + construction.slabThickness),
  interiorWall("first-bath-core", "first", { x: 7.75, z: stair.z + stair.run }, { x: 7.75, z: 9.2 }, LEVEL_ELEVATION.first + construction.slabThickness),

  ...perimeterWalls("second", upperFootprint, LEVEL_ELEVATION.second + construction.slabThickness, construction.clearWallHeight),
  interiorWall("second-master-divider", "second", { x: upperFootprint.x, z: interior.secondSuiteZ }, { x: upperFootprint.x + upperFootprint.width, z: interior.secondSuiteZ }, LEVEL_ELEVATION.second + construction.slabThickness),
  interiorWall("second-bath-core", "second", { x: 6.8, z: upperFootprint.z }, { x: 6.8, z: interior.secondSuiteZ }, LEVEL_ELEVATION.second + construction.slabThickness),

  ...perimeterWalls("roof", upperFootprint, LEVEL_ELEVATION.roof + construction.slabThickness, construction.parapetHeight, "parapet"),
];

const opening = (id: string, wallId: string, kind: OpeningSpec["kind"], offset: number, width: number, height: number, sillHeight = 0): OpeningSpec => ({
  id,
  wallId,
  kind,
  offset,
  width,
  sillHeight,
  height,
  confidence: "ESTIMATED",
});

const majorOpenings: OpeningSpec[] = [
  opening("ground-entry", "ground-exterior-front", "door", openings.entry.offset, openings.entry.width, openings.entry.height),
  opening("ground-front-window", "ground-exterior-front", "window", openings.frontWindow.offset, openings.frontWindow.width, openings.frontWindow.height, openings.frontWindow.sill),
  opening("ground-garage", "ground-exterior-left", "garage-door", openings.garage.offset, openings.garage.width, openings.garage.height),
  opening("ground-rear-slider-west", "ground-exterior-rear", "sliding-door", openings.rearSliderWest.offset, openings.rearSliderWest.width, openings.rearSliderWest.height),
  opening("ground-rear-slider-east", "ground-exterior-rear", "sliding-door", openings.rearSliderEast.offset, openings.rearSliderEast.width, openings.rearSliderEast.height),
  opening("first-front-west", "first-exterior-front", "window", openings.firstFrontWindow.offset, openings.firstFrontWindow.width, openings.firstFrontWindow.height, openings.firstFrontWindow.sill),
  opening("first-front-east", "first-exterior-front", "window", openings.firstFrontWindowEast.offset, openings.firstFrontWindowEast.width, openings.firstFrontWindowEast.height, openings.firstFrontWindowEast.sill),
  opening("first-rear-east", "first-exterior-rear", "window", openings.firstRearWindow.offset, openings.firstRearWindow.width, openings.firstRearWindow.height, openings.firstRearWindow.sill),
  opening("first-rear-west", "first-exterior-rear", "sliding-door", openings.firstRearWindowWest.offset, openings.firstRearWindowWest.width, openings.firstRearWindowWest.height),
  opening("first-left", "first-exterior-left", "window", openings.firstLeftWindow.offset, openings.firstLeftWindow.width, openings.firstLeftWindow.height, openings.firstLeftWindow.sill),
  opening("first-right-glazing", "first-exterior-right", "sliding-door", openings.firstRightGlazing.offset, openings.firstRightGlazing.width, openings.firstRightGlazing.height),
  opening("second-stair-arrival", "second-exterior-front", "door", openings.stairArrival.offset, openings.stairArrival.width, openings.stairArrival.height),
  opening("second-front", "second-exterior-front", "window", openings.secondFrontWindow.offset, openings.secondFrontWindow.width, openings.secondFrontWindow.height, openings.secondFrontWindow.sill),
  opening("second-rear-slider", "second-exterior-rear", "sliding-door", openings.secondRearSlider.offset, openings.secondRearSlider.width, openings.secondRearSlider.height),
  opening("second-right", "second-exterior-right", "window", openings.secondRightWindow.offset, openings.secondRightWindow.width, openings.secondRightWindow.height, openings.secondRightWindow.sill),
];

// These panels only occupy opaque wall portions; the elevations show timber and
// dark masonry as articulated fields, not as material applied over glazing.
const facadeSections: FacadeSectionSpec[] = [
  { id: "ground-left-garage-header-stone", wallId: "ground-exterior-left", offset: 0.45, width: 10.7, bottom: 2.52, height: 0.68, material: "stone", confidence: "ESTIMATED" },
  { id: "first-front-west-sill-band", wallId: "first-exterior-front", offset: 0.4, width: 4.7, bottom: 0.18, height: 0.4, material: "stone", confidence: "ESTIMATED" },
  { id: "first-front-center-timber", wallId: "first-exterior-front", offset: 5.1, width: 1.75, bottom: 0, height: construction.clearWallHeight, material: "timber", confidence: "ESTIMATED" },
  { id: "first-front-east-sill-band", wallId: "first-exterior-front", offset: 7.1, width: 3.3, bottom: 0.18, height: 0.4, material: "stone", confidence: "ESTIMATED" },
  { id: "first-right-rear-stone", wallId: "first-exterior-right", offset: 4.5, width: 4.1, bottom: 0, height: construction.clearWallHeight, material: "stone", confidence: "ESTIMATED" },
  { id: "first-rear-west-timber", wallId: "first-exterior-rear", offset: 10.45, width: 1.25, bottom: 0, height: construction.clearWallHeight, material: "timber", confidence: "ESTIMATED" },
  { id: "second-front-timber-west", wallId: "second-exterior-front", offset: 5.4, width: 2.1, bottom: 0, height: construction.clearWallHeight, material: "timber", confidence: "ESTIMATED" },
  { id: "second-front-timber-east", wallId: "second-exterior-front", offset: 9.25, width: 0.55, bottom: 0, height: construction.clearWallHeight, material: "timber", confidence: "ESTIMATED" },
  { id: "second-rear-east-timber", wallId: "second-exterior-rear", offset: 0.15, width: 1.3, bottom: 0, height: construction.clearWallHeight, material: "timber", confidence: "ESTIMATED" },
  { id: "second-right-rear-stone", wallId: "second-exterior-right", offset: 4.35, width: 4.3, bottom: 0, height: construction.clearWallHeight, material: "stone", confidence: "ESTIMATED" },
];

const railings: RailingSpec[] = [
  { id: "first-rear-balcony-guard", levelId: "first", start: { x: balconies.firstRear.x, z: balconies.firstRear.z + balconies.firstRear.depth }, end: { x: balconies.firstRear.x + balconies.firstRear.width, z: balconies.firstRear.z + balconies.firstRear.depth }, baseElevation: LEVEL_ELEVATION.first + construction.slabThickness, height: construction.balconyRailHeight, confidence: "ESTIMATED" },
  { id: "first-rear-balcony-east-return", levelId: "first", start: { x: balconies.firstRear.x + balconies.firstRear.width, z: balconies.firstRear.z }, end: { x: balconies.firstRear.x + balconies.firstRear.width, z: balconies.firstRear.z + balconies.firstRear.depth }, baseElevation: LEVEL_ELEVATION.first + construction.slabThickness, height: construction.balconyRailHeight, confidence: "ESTIMATED" },
  { id: "first-right-balcony-guard", levelId: "first", start: { x: balconies.firstRight.x + balconies.firstRight.width, z: balconies.firstRight.z }, end: { x: balconies.firstRight.x + balconies.firstRight.width, z: balconies.firstRight.z + balconies.firstRight.depth }, baseElevation: LEVEL_ELEVATION.first + construction.slabThickness, height: construction.balconyRailHeight, confidence: "ESTIMATED" },
];

const roofDetails: RoofDetailSpec[] = [
  { id: "roof-parapet-cap", footprint: { id: "roof-cap", x: upperFootprint.x - 0.06, z: upperFootprint.z - 0.06, width: upperFootprint.width + 0.12, depth: upperFootprint.depth + 0.12 }, elevation: LEVEL_ELEVATION.roof + construction.slabThickness + construction.parapetHeight, thickness: 0.08, kind: "cap", confidence: "ESTIMATED" },
  { id: "rear-balcony-overhang", footprint: { id: "rear-overhang", x: 0, z: house.depth - 0.55, width: 5.85, depth: 0.7 }, elevation: LEVEL_ELEVATION.second - 0.2, thickness: 0.14, kind: "overhang", confidence: "ESTIMATED" },
];

// Interior modules deliberately remain visual-only. Their footprints are kept
// away from the route waypoints so furniture can be replaced without altering
// the navigation or collision source of truth.
const interiorFinishes: InteriorFinishSpec[] = [
  { id: "living-stone-floor", levelId: "ground", roomId: "ground-living", footprint: { id: "living-stone", x: 3.48, z: 0.32, width: 8.28, depth: 12.0 }, elevation: LEVEL_ELEVATION.ground + construction.slabThickness, material: "stone", confidence: "ESTIMATED" },
  { id: "kitchen-tile-floor", levelId: "ground", roomId: "ground-kitchen", footprint: { id: "kitchen-tile", x: 3.62, z: 12.48, width: 8.14, depth: 4.28 }, elevation: LEVEL_ELEVATION.ground + construction.slabThickness, material: "tile", confidence: "ESTIMATED" },
  { id: "children-oak-floor", levelId: "first", roomId: "first-bedrooms", footprint: { id: "children-oak", x: 0.3, z: 10.32, width: 4.85, depth: 6.4 }, elevation: LEVEL_ELEVATION.first + construction.slabThickness, material: "oak", confidence: "ESTIMATED" },
  { id: "master-walnut-floor", levelId: "second", roomId: "second-suite", footprint: { id: "master-walnut", x: 2.58, z: 10.42, width: 9.15, depth: 5.0 }, elevation: LEVEL_ELEVATION.second + construction.slabThickness, material: "walnut", confidence: "ESTIMATED" },
  { id: "bathroom-tile-floor", levelId: "second", roomId: "second-bathroom", footprint: { id: "bathroom-tile", x: 7.06, z: 3.55, width: 4.46, depth: 5.92 }, elevation: LEVEL_ELEVATION.second + construction.slabThickness, material: "tile", confidence: "ESTIMATED" },
];

const interiorModules: InteriorModuleSpec[] = [
  { id: "living-sofa", levelId: "ground", roomId: "ground-living", kind: "sofa", position: { x: 9.65, y: 0.28, z: 6.65 }, width: 2.55, depth: 1.02, height: 0.82, rotationY: Math.PI, material: "upholstery", confidence: "ESTIMATED" },
  { id: "living-armchair", levelId: "ground", roomId: "ground-living", kind: "armchair", position: { x: 6.82, y: 0.28, z: 6.25 }, width: 0.9, depth: 0.9, height: 0.82, rotationY: Math.PI / 2, material: "linen", confidence: "ESTIMATED" },
  { id: "living-coffee-table", levelId: "ground", roomId: "ground-living", kind: "coffee-table", position: { x: 8.45, y: 0.28, z: 5.58 }, width: 1.35, depth: 0.72, height: 0.42, material: "walnut", confidence: "ESTIMATED" },
  { id: "living-media-console", levelId: "ground", roomId: "ground-living", kind: "media-console", position: { x: 11.36, y: 0.28, z: 7.65 }, width: 0.38, depth: 2.35, height: 0.62, rotationY: Math.PI / 2, material: "walnut", confidence: "ESTIMATED" },
  { id: "dining-table", levelId: "ground", roomId: "ground-living", kind: "dining-table", position: { x: 9.9, y: 0.28, z: 10.55 }, width: 1.7, depth: 0.92, height: 0.76, material: "walnut", confidence: "ESTIMATED" },
  { id: "dining-chair-east", levelId: "ground", roomId: "ground-living", kind: "dining-chair", position: { x: 11.0, y: 0.28, z: 10.55 }, width: 0.46, depth: 0.5, height: 0.82, rotationY: -Math.PI / 2, material: "linen", confidence: "ESTIMATED" },
  { id: "dining-chair-west", levelId: "ground", roomId: "ground-living", kind: "dining-chair", position: { x: 8.8, y: 0.28, z: 10.55 }, width: 0.46, depth: 0.5, height: 0.82, rotationY: Math.PI / 2, material: "linen", confidence: "ESTIMATED" },
  { id: "kitchen-run", levelId: "ground", roomId: "ground-kitchen", kind: "kitchen-run", position: { x: 5.35, y: 0.28, z: 16.2 }, width: 3.1, depth: 0.62, height: 2.35, material: "oak", confidence: "ESTIMATED" },
  { id: "kitchen-island", levelId: "ground", roomId: "ground-kitchen", kind: "kitchen-island", position: { x: 6.45, y: 0.28, z: 14.18 }, width: 2.15, depth: 0.88, height: 0.92, material: "walnut", confidence: "ESTIMATED" },
  { id: "kitchen-pendant-left", levelId: "ground", roomId: "ground-kitchen", kind: "pendant", position: { x: 5.92, y: 3.16, z: 14.18 }, width: 0.24, depth: 0.24, height: 0.38, material: "brass", confidence: "ASSUMED" },
  { id: "kitchen-pendant-right", levelId: "ground", roomId: "ground-kitchen", kind: "pendant", position: { x: 6.98, y: 3.16, z: 14.18 }, width: 0.24, depth: 0.24, height: 0.38, material: "brass", confidence: "ASSUMED" },

  { id: "children-bed", levelId: "first", roomId: "first-bedrooms", kind: "bed", position: { x: 2.0, y: 3.88, z: 13.25 }, width: 1.4, depth: 2.05, height: 0.62, material: "linen", confidence: "ESTIMATED" },
  { id: "children-desk", levelId: "first", roomId: "first-bedrooms", kind: "desk", position: { x: 4.35, y: 3.88, z: 15.1 }, width: 0.68, depth: 1.2, height: 0.74, rotationY: Math.PI / 2, material: "oak", confidence: "ESTIMATED" },
  { id: "children-wardrobe", levelId: "first", roomId: "first-bedrooms", kind: "wardrobe", position: { x: 0.7, y: 3.88, z: 11.35 }, width: 0.58, depth: 1.8, height: 2.35, rotationY: Math.PI / 2, material: "oak", confidence: "ESTIMATED" },
  { id: "children-pendant", levelId: "first", roomId: "first-bedrooms", kind: "pendant", position: { x: 2.7, y: 6.82, z: 13.25 }, width: 0.22, depth: 0.22, height: 0.32, material: "brass", confidence: "ASSUMED" },

  { id: "master-bed", levelId: "second", roomId: "second-suite", kind: "bed", position: { x: 9.35, y: 7.48, z: 13.18 }, width: 2.35, depth: 2.12, height: 0.7, material: "linen", confidence: "ESTIMATED" },
  { id: "master-nightstand-east", levelId: "second", roomId: "second-suite", kind: "nightstand", position: { x: 10.9, y: 7.48, z: 14.15 }, width: 0.46, depth: 0.46, height: 0.48, material: "walnut", confidence: "ESTIMATED" },
  { id: "master-nightstand-west", levelId: "second", roomId: "second-suite", kind: "nightstand", position: { x: 7.8, y: 7.48, z: 14.15 }, width: 0.46, depth: 0.46, height: 0.48, material: "walnut", confidence: "ESTIMATED" },
  { id: "master-wardrobe", levelId: "second", roomId: "second-suite", kind: "wardrobe", position: { x: 3.15, y: 7.48, z: 13.75 }, width: 0.58, depth: 2.75, height: 2.4, rotationY: Math.PI / 2, material: "walnut", confidence: "ESTIMATED" },
  { id: "master-pendant-left", levelId: "second", roomId: "second-suite", kind: "pendant", position: { x: 8.1, y: 10.48, z: 13.85 }, width: 0.2, depth: 0.2, height: 0.32, material: "brass", confidence: "ASSUMED" },
  { id: "master-pendant-right", levelId: "second", roomId: "second-suite", kind: "pendant", position: { x: 10.6, y: 10.48, z: 13.85 }, width: 0.2, depth: 0.2, height: 0.32, material: "brass", confidence: "ASSUMED" },

  { id: "bathroom-vanity", levelId: "second", roomId: "second-bathroom", kind: "vanity", position: { x: 10.75, y: 7.48, z: 4.65 }, width: 0.58, depth: 1.8, height: 0.88, rotationY: Math.PI / 2, material: "oak", confidence: "ESTIMATED" },
  { id: "bathroom-shower", levelId: "second", roomId: "second-bathroom", kind: "shower", position: { x: 8.18, y: 7.48, z: 8.35 }, width: 1.55, depth: 1.35, height: 2.25, material: "glass", confidence: "ESTIMATED" },
  { id: "bathroom-toilet", levelId: "second", roomId: "second-bathroom", kind: "toilet", position: { x: 10.55, y: 7.48, z: 7.78 }, width: 0.6, depth: 0.72, height: 0.78, material: "tile", confidence: "ESTIMATED" },

  { id: "balcony-lounge", levelId: "first", roomId: "first-bedrooms", kind: "balcony-lounge", position: { x: 10.55, y: 3.88, z: 4.9 }, width: 1.35, depth: 0.72, height: 0.68, rotationY: Math.PI / 2, material: "linen", confidence: "ESTIMATED" },
  { id: "balcony-planter", levelId: "first", roomId: "first-bedrooms", kind: "planter", position: { x: 11.25, y: 3.88, z: 6.35 }, width: 0.45, depth: 0.45, height: 0.62, material: "charcoal", confidence: "ASSUMED" },
];

const interiorLights: InteriorLightSpec[] = [
  { id: "living-warm-wash", levelId: "ground", roomId: "ground-living", position: { x: 9.4, y: 3.1, z: 6.8 }, color: "#ffd6a1", intensity: 3.2, distance: 7.5, confidence: "ASSUMED" },
  { id: "kitchen-warm-task", levelId: "ground", roomId: "ground-kitchen", position: { x: 6.45, y: 3.0, z: 14.18 }, color: "#ffe0b5", intensity: 3.6, distance: 5.5, confidence: "ASSUMED" },
  { id: "children-warm-light", levelId: "first", roomId: "first-bedrooms", position: { x: 2.7, y: 6.65, z: 13.25 }, color: "#ffd9ad", intensity: 2.4, distance: 4.8, confidence: "ASSUMED" },
  { id: "stair-warm-wash", levelId: "first", roomId: "first-bedrooms", position: { x: 4.2, y: 6.7, z: 7.2 }, color: "#ffd5a0", intensity: 2.1, distance: 4.0, confidence: "ASSUMED" },
  { id: "master-warm-light", levelId: "second", roomId: "second-suite", position: { x: 9.35, y: 10.3, z: 13.45 }, color: "#ffd8a6", intensity: 3.1, distance: 6.0, confidence: "ASSUMED" },
  { id: "bathroom-warm-light", levelId: "second", roomId: "second-bathroom", position: { x: 9.55, y: 10.2, z: 6.3 }, color: "#fff0d2", intensity: 2.7, distance: 4.5, confidence: "ASSUMED" },
];

const landscapeBeds: LandscapeBedSpec[] = [
  { id: "front-garden-bed", footprint: { id: "front-garden-bed-footprint", x: -4.9, z: -8.45, width: 16.8, depth: 1.4 }, material: "mulch", confidence: "ESTIMATED" },
  { id: "driveway-planting-bed", footprint: { id: "driveway-planting-bed-footprint", x: 12.22, z: 1.1, width: 0.82, depth: 15.4 }, material: "mulch", confidence: "ESTIMATED" },
  { id: "pool-rear-bed", footprint: { id: "pool-rear-bed-footprint", x: -3.8, z: 25.0, width: 17.4, depth: 1.25 }, material: "mulch", confidence: "ESTIMATED" },
  { id: "pool-side-bed", footprint: { id: "pool-side-bed-footprint", x: -1.65, z: 18.25, width: 1.15, depth: 6.45 }, material: "gravel", confidence: "ESTIMATED" },
];

const landscapePlants: LandscapePlantSpec[] = [
  { id: "front-tree-west", kind: "tree", position: { x: -3.3, y: 0, z: -4.0 }, height: 4.6, spread: 1.45, confidence: "ESTIMATED" },
  { id: "front-tree-east", kind: "tree", position: { x: 11.75, y: 0, z: -4.35 }, height: 2.9, spread: 0.76, confidence: "ESTIMATED" },
  { id: "rear-tree-west", kind: "tree", position: { x: -2.7, y: 0, z: 24.9 }, height: 4.9, spread: 1.55, confidence: "ESTIMATED" },
  { id: "rear-tree-east", kind: "tree", position: { x: 13.0, y: 0, z: 25.1 }, height: 4.5, spread: 1.4, confidence: "ESTIMATED" },
  { id: "front-shrub-01", kind: "shrub", position: { x: -4.15, y: 0, z: -7.92 }, height: 0.52, spread: 0.62, confidence: "ESTIMATED" },
  { id: "front-shrub-02", kind: "shrub", position: { x: -2.5, y: 0, z: -7.85 }, height: 0.44, spread: 0.54, confidence: "ESTIMATED" },
  { id: "front-shrub-03", kind: "shrub", position: { x: -0.85, y: 0, z: -7.9 }, height: 0.58, spread: 0.64, confidence: "ESTIMATED" },
  { id: "front-shrub-04", kind: "shrub", position: { x: 0.95, y: 0, z: -7.82 }, height: 0.46, spread: 0.56, confidence: "ESTIMATED" },
  { id: "front-shrub-05", kind: "shrub", position: { x: 2.75, y: 0, z: -7.88 }, height: 0.54, spread: 0.62, confidence: "ESTIMATED" },
  { id: "front-shrub-06", kind: "shrub", position: { x: 4.55, y: 0, z: -7.86 }, height: 0.45, spread: 0.55, confidence: "ESTIMATED" },
  { id: "front-shrub-07", kind: "shrub", position: { x: 6.35, y: 0, z: -7.92 }, height: 0.55, spread: 0.63, confidence: "ESTIMATED" },
  { id: "front-shrub-08", kind: "shrub", position: { x: 8.15, y: 0, z: -7.84 }, height: 0.48, spread: 0.58, confidence: "ESTIMATED" },
  { id: "front-shrub-09", kind: "shrub", position: { x: 9.95, y: 0, z: -7.9 }, height: 0.52, spread: 0.61, confidence: "ESTIMATED" },
  { id: "drive-grass-01", kind: "grass", position: { x: 12.62, y: 0, z: 2.2 }, height: 0.76, spread: 0.42, confidence: "ESTIMATED" },
  { id: "drive-grass-02", kind: "grass", position: { x: 12.62, y: 0, z: 4.5 }, height: 0.65, spread: 0.36, confidence: "ESTIMATED" },
  { id: "drive-grass-03", kind: "grass", position: { x: 12.62, y: 0, z: 6.8 }, height: 0.78, spread: 0.42, confidence: "ESTIMATED" },
  { id: "drive-grass-04", kind: "grass", position: { x: 12.62, y: 0, z: 9.1 }, height: 0.68, spread: 0.38, confidence: "ESTIMATED" },
  { id: "drive-grass-05", kind: "grass", position: { x: 12.62, y: 0, z: 11.4 }, height: 0.8, spread: 0.44, confidence: "ESTIMATED" },
  { id: "drive-grass-06", kind: "grass", position: { x: 12.62, y: 0, z: 13.7 }, height: 0.7, spread: 0.4, confidence: "ESTIMATED" },
  { id: "rear-shrub-01", kind: "shrub", position: { x: -2.3, y: 0, z: 25.52 }, height: 0.65, spread: 0.72, confidence: "ESTIMATED" },
  { id: "rear-shrub-02", kind: "shrub", position: { x: 0.0, y: 0, z: 25.5 }, height: 0.48, spread: 0.6, confidence: "ESTIMATED" },
  { id: "rear-shrub-03", kind: "shrub", position: { x: 2.3, y: 0, z: 25.54 }, height: 0.62, spread: 0.7, confidence: "ESTIMATED" },
  { id: "rear-shrub-04", kind: "shrub", position: { x: 11.2, y: 0, z: 25.5 }, height: 0.58, spread: 0.64, confidence: "ESTIMATED" },
  { id: "rear-grass-01", kind: "grass", position: { x: -1.05, y: 0, z: 19.1 }, height: 0.78, spread: 0.42, confidence: "ESTIMATED" },
  { id: "rear-grass-02", kind: "grass", position: { x: -1.02, y: 0, z: 21.1 }, height: 0.64, spread: 0.36, confidence: "ESTIMATED" },
  { id: "rear-grass-03", kind: "grass", position: { x: -1.0, y: 0, z: 23.1 }, height: 0.75, spread: 0.42, confidence: "ESTIMATED" },
];

const exteriorLights: ExteriorLightSpec[] = [
  { id: "front-garden-light-west", kind: "bollard", position: { x: -2.8, y: 0, z: -7.1 }, height: 0.62, color: "#ffd3a0", intensity: 1.35, distance: 3.4, confidence: "ESTIMATED" },
  { id: "front-garden-light-center", kind: "bollard", position: { x: 3.1, y: 0, z: -7.08 }, height: 0.62, color: "#ffd3a0", intensity: 1.35, distance: 3.4, confidence: "ESTIMATED" },
  { id: "front-garden-light-east", kind: "bollard", position: { x: 9.5, y: 0, z: -7.08 }, height: 0.62, color: "#ffd3a0", intensity: 1.35, distance: 3.4, confidence: "ESTIMATED" },
  { id: "drive-light-01", kind: "bollard", position: { x: 12.9, y: 0, z: 3.1 }, height: 0.58, color: "#ffd3a0", intensity: 1.05, distance: 2.8, confidence: "ESTIMATED" },
  { id: "drive-light-02", kind: "bollard", position: { x: 12.9, y: 0, z: 10.3 }, height: 0.58, color: "#ffd3a0", intensity: 1.05, distance: 2.8, confidence: "ESTIMATED" },
  { id: "pool-light-west", kind: "bollard", position: { x: -0.3, y: 0, z: 20.0 }, height: 0.58, color: "#ffd9a8", intensity: 1.15, distance: 3.2, confidence: "ESTIMATED" },
  { id: "pool-light-east", kind: "bollard", position: { x: 12.3, y: 0, z: 23.2 }, height: 0.58, color: "#ffd9a8", intensity: 1.15, distance: 3.2, confidence: "ESTIMATED" },
  { id: "entry-wall-wash", kind: "wall-wash", position: { x: 7.25, y: 0.38, z: -0.18 }, height: 0.28, color: "#ffe0b4", intensity: 2.0, distance: 4.0, confidence: "ASSUMED" },
];

export const houseSpec: HouseSpec = {
  coordinateSystem: {
    frontAxis: "-z",
    groundElevation: LEVEL_ELEVATION.ground,
    origin: "Exterior front-left corner of the ground-floor envelope",
  },
  levels,
  walls,
  openings: majorOpenings,
  stairs: [
    { id: "ground-to-first", fromLevel: "ground", toLevel: "first", start: { x: stair.x, z: stair.z }, direction: { x: 0, z: 1 }, width: stair.width, tread: stair.tread, riser: stair.riser, stepCount: stair.steps, baseElevation: LEVEL_ELEVATION.ground + construction.slabThickness, guardSide: "right" },
    { id: "first-to-second", fromLevel: "first", toLevel: "second", start: { x: stair.secondRunX, z: stair.z + stair.run }, direction: { x: 0, z: -1 }, width: stair.width, tread: stair.tread, riser: stair.riser, stepCount: stair.steps, baseElevation: LEVEL_ELEVATION.first + construction.slabThickness, guardSide: "left" },
  ],
  facadeSections,
  railings,
  exteriorSteps: [
    { id: "front-entry-steps", start: { x: 8.275, z: -0.72 }, direction: { x: 0, z: 1 }, width: 2.15, tread: 0.24, riser: construction.exteriorRiser, stepCount: 2, baseElevation: 0, confidence: "ESTIMATED" },
    { id: "rear-terrace-steps", start: { x: 8.2, z: house.depth + 0.84 }, direction: { x: 0, z: -1 }, width: 3.25, tread: 0.3, riser: construction.exteriorRiser, stepCount: 2, baseElevation: 0, confidence: "ESTIMATED" },
  ],
  roofDetails,
  interiorFinishes,
  interiorModules,
  interiorLights,
  landscapeBeds,
  landscapePlants,
  exteriorLights,
  rooms: [
    { id: "ground-garage", levelId: "ground", label: "Garage", footprint: { id: "ground-garage-footprint", x: 0, z: 0, width: interior.garageWidth, depth: stair.z }, confidence: "KNOWN" },
    { id: "ground-living", levelId: "ground", label: "Living / entry", footprint: { id: "ground-living-footprint", x: interior.garageWidth, z: 0, width: house.width - interior.garageWidth, depth: house.depth - interior.kitchenDepth }, confidence: "ESTIMATED" },
    { id: "ground-kitchen", levelId: "ground", label: "Kitchen / dining", footprint: { id: "ground-kitchen-footprint", x: 0, z: house.depth - interior.kitchenDepth, width: house.width, depth: interior.kitchenDepth }, confidence: "KNOWN" },
    { id: "first-bedrooms", levelId: "first", label: "Bedroom floor", footprint: { ...outerFootprint, id: "first-bedrooms-footprint" }, confidence: "ESTIMATED" },
    { id: "second-suite", levelId: "second", label: "Master suite", footprint: { id: "second-suite-footprint", x: upperFootprint.x, z: interior.secondSuiteZ, width: upperFootprint.width, depth: upperFootprint.z + upperFootprint.depth - interior.secondSuiteZ }, confidence: "ESTIMATED" },
    { id: "second-bathroom", levelId: "second", label: "Upper bathroom", footprint: { id: "second-bathroom-footprint", x: 7.06, z: 3.55, width: 4.46, depth: 5.92 }, confidence: "ESTIMATED" },
  ],
  site: {
    boundary: { id: "site-boundary", x: site.x, z: site.z, width: site.width, depth: site.depth },
    driveway: { id: "driveway", ...site.driveway },
    entryApron: { id: "entry-apron", ...site.entryApron },
    pool: { id: "pool", ...site.pool },
    terrace: { id: "terrace", ...site.terrace },
    gate: { id: "front-gate", ...site.gate },
    boundaryHeight: site.boundaryHeight,
    boundaryThickness: site.boundaryThickness,
    gateSlattedWidth: site.gateSlattedWidth,
    gateTimberWidth: site.gateTimberWidth,
    gatePierWidth: site.gatePierWidth,
  },
  navigation: {
    ...navigation,
  },
};
