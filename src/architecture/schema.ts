export type Confidence = "KNOWN" | "ESTIMATED" | "ASSUMED" | "UNKNOWN";

export type Point2 = { x: number; z: number };

export type PlanRect = Point2 & {
  id: string;
  width: number;
  depth: number;
};

export type LevelId = "ground" | "first" | "second" | "roof";

export type OpeningKind = "door" | "garage-door" | "window" | "sliding-door";

export type WallRole = "exterior" | "interior" | "parapet";

export type FacadeMaterial = "render" | "timber" | "stone";

export type InteriorMaterial = "oak" | "walnut" | "stone" | "tile" | "upholstery" | "linen" | "charcoal" | "brass" | "glass";

export type InteriorModuleKind =
  | "sofa"
  | "armchair"
  | "coffee-table"
  | "media-console"
  | "dining-table"
  | "dining-chair"
  | "kitchen-run"
  | "kitchen-island"
  | "bed"
  | "nightstand"
  | "wardrobe"
  | "desk"
  | "vanity"
  | "shower"
  | "toilet"
  | "balcony-lounge"
  | "planter"
  | "pendant";

export type Point3 = Point2 & { y: number };

export type LevelSpec = {
  id: LevelId;
  label: string;
  elevation: number;
  slabs: PlanRect[];
  visibleByDefault: boolean;
};

export type WallSpec = {
  id: string;
  levelId: LevelId;
  start: Point2;
  end: Point2;
  baseElevation: number;
  height: number;
  thickness: number;
  role: WallRole;
};

export type OpeningSpec = {
  id: string;
  wallId: string;
  kind: OpeningKind;
  offset: number;
  width: number;
  sillHeight: number;
  height: number;
  confidence: Confidence;
};

export type StairSpec = {
  id: string;
  fromLevel: LevelId;
  toLevel: LevelId;
  start: Point2;
  direction: Point2;
  width: number;
  tread: number;
  riser: number;
  stepCount: number;
  baseElevation: number;
  guardSide: "left" | "right" | "none";
};

export type FacadeSectionSpec = {
  id: string;
  wallId: string;
  offset: number;
  width: number;
  bottom: number;
  height: number;
  material: FacadeMaterial;
  confidence: Confidence;
};

export type RailingSpec = {
  id: string;
  levelId: LevelId;
  start: Point2;
  end: Point2;
  baseElevation: number;
  height: number;
  confidence: Confidence;
};

export type ExteriorStepSpec = {
  id: string;
  start: Point2;
  direction: Point2;
  width: number;
  tread: number;
  riser: number;
  stepCount: number;
  baseElevation: number;
  confidence: Confidence;
};

export type RoofDetailSpec = {
  id: string;
  footprint: PlanRect;
  elevation: number;
  thickness: number;
  kind: "cap" | "overhang";
  confidence: Confidence;
};

export type InteriorFinishSpec = {
  id: string;
  levelId: Exclude<LevelId, "roof">;
  roomId: string;
  footprint: PlanRect;
  elevation: number;
  material: Extract<InteriorMaterial, "oak" | "walnut" | "stone" | "tile">;
  confidence: Confidence;
};

export type InteriorModuleSpec = {
  id: string;
  levelId: Exclude<LevelId, "roof">;
  roomId: string;
  kind: InteriorModuleKind;
  position: Point3;
  width: number;
  depth: number;
  height: number;
  rotationY?: number;
  material: InteriorMaterial;
  confidence: Confidence;
};

export type InteriorLightSpec = {
  id: string;
  levelId: Exclude<LevelId, "roof">;
  roomId: string;
  position: Point3;
  color: string;
  intensity: number;
  distance: number;
  confidence: Confidence;
};

export type LandscapeMaterial = "mulch" | "gravel";

export type LandscapeBedSpec = {
  id: string;
  footprint: PlanRect;
  material: LandscapeMaterial;
  confidence: Confidence;
};

export type LandscapePlantKind = "tree" | "shrub" | "grass";

export type LandscapePlantSpec = {
  id: string;
  kind: LandscapePlantKind;
  position: Point3;
  height: number;
  spread: number;
  confidence: Confidence;
};

export type ExteriorLightSpec = {
  id: string;
  kind: "bollard" | "wall-wash";
  position: Point3;
  height: number;
  color: string;
  intensity: number;
  distance: number;
  confidence: Confidence;
};

export type RoomSpec = {
  id: string;
  levelId: Exclude<LevelId, "roof">;
  label: string;
  footprint: PlanRect;
  confidence: Confidence;
};

export type SiteSpec = {
  boundary: PlanRect;
  driveway: PlanRect;
  entryApron: PlanRect;
  pool: PlanRect;
  terrace: PlanRect;
  gate: PlanRect;
  boundaryHeight: number;
  boundaryThickness: number;
  gateSlattedWidth: number;
  gateTimberWidth: number;
  gatePierWidth: number;
};

export type NavigationSpec = {
  spawn: { x: number; y: number; z: number };
  playerHeight: number;
  playerRadius: number;
  moveSpeed: number;
  gravity: number;
  maximumStepHeight: number;
  route: ReadonlyArray<{ id: string; x: number; z: number }>;
};

export type HouseSpec = {
  coordinateSystem: {
    frontAxis: "-z";
    groundElevation: number;
    origin: string;
  };
  levels: LevelSpec[];
  walls: WallSpec[];
  openings: OpeningSpec[];
  stairs: StairSpec[];
  facadeSections: FacadeSectionSpec[];
  railings: RailingSpec[];
  exteriorSteps: ExteriorStepSpec[];
  roofDetails: RoofDetailSpec[];
  interiorFinishes: InteriorFinishSpec[];
  interiorModules: InteriorModuleSpec[];
  interiorLights: InteriorLightSpec[];
  landscapeBeds: LandscapeBedSpec[];
  landscapePlants: LandscapePlantSpec[];
  exteriorLights: ExteriorLightSpec[];
  rooms: RoomSpec[];
  site: SiteSpec;
  navigation: NavigationSpec;
};
