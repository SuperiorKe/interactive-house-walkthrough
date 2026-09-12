import { DIM, LEVEL_ELEVATION } from "./dimensions";
import type {
  HouseSpec,
  LevelId,
  LevelSpec,
  OpeningSpec,
  PlanRect,
  WallSpec,
} from "./schema";

const { construction, house, interior, navigation, openings, site, stair } = DIM;

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
  { id: "first", label: "First floor", elevation: LEVEL_ELEVATION.first, slabs: [...slabsAroundVoid("first-slab", outerFootprint, stairVoid), firstStairLanding], visibleByDefault: true },
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
  opening("first-rear-west", "first-exterior-rear", "window", openings.firstRearWindowWest.offset, openings.firstRearWindowWest.width, openings.firstRearWindowWest.height, openings.firstRearWindowWest.sill),
  opening("first-left", "first-exterior-left", "window", openings.firstLeftWindow.offset, openings.firstLeftWindow.width, openings.firstLeftWindow.height, openings.firstLeftWindow.sill),
  opening("first-right-glazing", "first-exterior-right", "sliding-door", openings.firstRightGlazing.offset, openings.firstRightGlazing.width, openings.firstRightGlazing.height),
  opening("second-stair-arrival", "second-exterior-front", "door", openings.stairArrival.offset, openings.stairArrival.width, openings.stairArrival.height),
  opening("second-front", "second-exterior-front", "window", openings.secondFrontWindow.offset, openings.secondFrontWindow.width, openings.secondFrontWindow.height, openings.secondFrontWindow.sill),
  opening("second-rear-slider", "second-exterior-rear", "sliding-door", openings.secondRearSlider.offset, openings.secondRearSlider.width, openings.secondRearSlider.height),
  opening("second-right", "second-exterior-right", "window", openings.secondRightWindow.offset, openings.secondRightWindow.width, openings.secondRightWindow.height, openings.secondRightWindow.sill),
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
    { id: "ground-to-first", fromLevel: "ground", toLevel: "first", start: { x: stair.x, z: stair.z }, direction: { x: 0, z: 1 }, width: stair.width, tread: stair.tread, riser: stair.riser, stepCount: stair.steps, baseElevation: LEVEL_ELEVATION.ground + construction.slabThickness },
    { id: "first-to-second", fromLevel: "first", toLevel: "second", start: { x: stair.secondRunX, z: stair.z + stair.run }, direction: { x: 0, z: -1 }, width: stair.width, tread: stair.tread, riser: stair.riser, stepCount: stair.steps, baseElevation: LEVEL_ELEVATION.first + construction.slabThickness },
  ],
  rooms: [
    { id: "ground-garage", levelId: "ground", label: "Garage", footprint: { id: "ground-garage-footprint", x: 0, z: 0, width: interior.garageWidth, depth: stair.z }, confidence: "KNOWN" },
    { id: "ground-living", levelId: "ground", label: "Living / entry", footprint: { id: "ground-living-footprint", x: interior.garageWidth, z: 0, width: house.width - interior.garageWidth, depth: house.depth - interior.kitchenDepth }, confidence: "ESTIMATED" },
    { id: "ground-kitchen", levelId: "ground", label: "Kitchen / dining", footprint: { id: "ground-kitchen-footprint", x: 0, z: house.depth - interior.kitchenDepth, width: house.width, depth: interior.kitchenDepth }, confidence: "KNOWN" },
    { id: "first-bedrooms", levelId: "first", label: "Bedroom floor", footprint: { ...outerFootprint, id: "first-bedrooms-footprint" }, confidence: "ESTIMATED" },
    { id: "second-suite", levelId: "second", label: "Master suite", footprint: { id: "second-suite-footprint", x: upperFootprint.x, z: interior.secondSuiteZ, width: upperFootprint.width, depth: upperFootprint.z + upperFootprint.depth - interior.secondSuiteZ }, confidence: "ESTIMATED" },
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
  },
  navigation: {
    ...navigation,
  },
};
