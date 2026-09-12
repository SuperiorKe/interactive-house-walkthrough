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
  rooms: RoomSpec[];
  site: SiteSpec;
  navigation: NavigationSpec;
};
