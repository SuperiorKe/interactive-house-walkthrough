import { houseSpec } from "../architecture/house";
import { DIM } from "../architecture/dimensions";
import type { OpeningSpec, PlanRect, Point2, WallSpec } from "../architecture/schema";

export type CollisionBox = {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
};

type WalkableSurface = {
  id: string;
  footprint: PlanRect;
  height: number;
};

type CirclePosition = Point2;

const EPSILON = 0.0001;

function wallLength(wall: WallSpec) {
  return Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z);
}

function isPortal(opening: OpeningSpec) {
  return opening.sillHeight === 0 && (opening.kind === "door" || opening.kind === "sliding-door");
}

function pointOnWall(wall: WallSpec, offset: number): Point2 {
  const length = wallLength(wall);
  return {
    x: wall.start.x + ((wall.end.x - wall.start.x) / length) * offset,
    z: wall.start.z + ((wall.end.z - wall.start.z) / length) * offset,
  };
}

function wallSegmentCollider(wall: WallSpec, startOffset: number, length: number, id: string): CollisionBox {
  const start = pointOnWall(wall, startOffset);
  const end = pointOnWall(wall, startOffset + length);
  const halfThickness = wall.thickness / 2;

  return {
    id,
    minX: Math.min(start.x, end.x) - halfThickness,
    maxX: Math.max(start.x, end.x) + halfThickness,
    minZ: Math.min(start.z, end.z) - halfThickness,
    maxZ: Math.max(start.z, end.z) + halfThickness,
    minY: wall.baseElevation,
    maxY: wall.baseElevation + wall.height,
  };
}

function wallColliders(wall: WallSpec): CollisionBox[] {
  const portals = houseSpec.openings
    .filter((opening) => opening.wallId === wall.id && isPortal(opening))
    .sort((left, right) => left.offset - right.offset);
  const segments: CollisionBox[] = [];
  let cursor = 0;

  portals.forEach((portal) => {
    if (portal.offset - cursor > EPSILON) {
      segments.push(wallSegmentCollider(wall, cursor, portal.offset - cursor, `${wall.id}-${cursor}`));
    }
    cursor = portal.offset + portal.width;
  });

  const remainder = wallLength(wall) - cursor;
  if (remainder > EPSILON) {
    segments.push(wallSegmentCollider(wall, cursor, remainder, `${wall.id}-end`));
  }
  return segments;
}

function siteBoundaryColliders(): CollisionBox[] {
  const { boundary, boundaryHeight, boundaryThickness, gate } = houseSpec.site;
  const right = boundary.x + boundary.width;
  const rear = boundary.z + boundary.depth;
  const gateRight = gate.x + gate.width;
  const box = (id: string, minX: number, maxX: number, minZ: number, maxZ: number): CollisionBox => ({ id, minX, maxX, minZ, maxZ, minY: 0, maxY: boundaryHeight });

  return [
    box("site-boundary-left", boundary.x, boundary.x + boundaryThickness, boundary.z, rear),
    box("site-boundary-right", right - boundaryThickness, right, boundary.z, rear),
    box("site-boundary-rear", boundary.x, right, rear - boundaryThickness, rear),
    box("site-boundary-front-left", boundary.x, gate.x, boundary.z, boundary.z + boundaryThickness),
    box("site-boundary-front-right", gateRight, right, boundary.z, boundary.z + boundaryThickness),
  ];
}

export const architectureColliders = [
  ...houseSpec.walls.flatMap(wallColliders),
  ...siteBoundaryColliders(),
];

const siteSurface: WalkableSurface = {
  id: "site-ground",
  footprint: houseSpec.site.boundary,
  height: houseSpec.coordinateSystem.groundElevation,
};

const entryApronSurface: WalkableSurface = {
  id: "entry-apron",
  footprint: houseSpec.site.entryApron,
  height: houseSpec.coordinateSystem.groundElevation,
};

const terraceSurface: WalkableSurface = {
  id: "rear-terrace",
  footprint: houseSpec.site.terrace,
  height: DIM.construction.slabThickness,
};

const slabSurfaces: WalkableSurface[] = houseSpec.levels.flatMap((level) =>
  level.slabs.map((slab) => ({
    id: `${level.id}-${slab.id}`,
    footprint: slab,
    height: level.elevation + DIM.construction.slabThickness,
  })),
);

function insideFootprint(position: CirclePosition, footprint: PlanRect) {
  return position.x >= footprint.x && position.x <= footprint.x + footprint.width && position.z >= footprint.z && position.z <= footprint.z + footprint.depth;
}

function stairHeightAt(position: CirclePosition) {
  const heights: number[] = [];
  houseSpec.stairs.forEach((stair) => {
    const perpendicular = { x: -stair.direction.z, z: stair.direction.x };
    const relative = { x: position.x - stair.start.x, z: position.z - stair.start.z };
    const along = relative.x * stair.direction.x + relative.z * stair.direction.z;
    const across = relative.x * perpendicular.x + relative.z * perpendicular.z;
    const run = stair.tread * stair.stepCount;

    if (along >= 0 && along <= run && Math.abs(across) <= stair.width / 2) {
      const stepIndex = Math.min(stair.stepCount - 1, Math.floor(along / stair.tread));
      heights.push(stair.baseElevation + stair.riser * (stepIndex + 1));
    }
  });
  return heights;
}

export function walkableFloorHeight(position: CirclePosition, currentFeetY: number) {
  const maximumReachableHeight = currentFeetY + houseSpec.navigation.maximumStepHeight;
  const platformHeights = [siteSurface, entryApronSurface, terraceSurface, ...slabSurfaces]
    .filter((surface) => insideFootprint(position, surface.footprint))
    .map((surface) => surface.height);
  const candidates = [...platformHeights, ...stairHeightAt(position)]
    .filter((height) => height <= maximumReachableHeight + EPSILON);

  return candidates.length ? Math.max(...candidates) : Number.NEGATIVE_INFINITY;
}

function verticallyOverlaps(collider: CollisionBox, feetY: number, playerHeight: number) {
  return feetY < collider.maxY - EPSILON && feetY + playerHeight > collider.minY + EPSILON;
}

function resolveCircleAgainstBox(position: CirclePosition, radius: number, box: CollisionBox): CirclePosition {
  const closestX = Math.max(box.minX, Math.min(position.x, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(position.z, box.maxZ));
  const dx = position.x - closestX;
  const dz = position.z - closestZ;
  const distanceSquared = dx * dx + dz * dz;

  if (distanceSquared >= radius * radius) return position;
  if (distanceSquared > EPSILON) {
    const distance = Math.sqrt(distanceSquared);
    const scale = (radius - distance) / distance;
    return { x: position.x + dx * scale, z: position.z + dz * scale };
  }

  const exits = [
    { axis: "x" as const, value: box.minX - radius - position.x, magnitude: Math.abs(position.x - box.minX) },
    { axis: "x" as const, value: box.maxX + radius - position.x, magnitude: Math.abs(box.maxX - position.x) },
    { axis: "z" as const, value: box.minZ - radius - position.z, magnitude: Math.abs(position.z - box.minZ) },
    { axis: "z" as const, value: box.maxZ + radius - position.z, magnitude: Math.abs(box.maxZ - position.z) },
  ].sort((left, right) => left.magnitude - right.magnitude);
  const nearestExit = exits[0];
  return nearestExit.axis === "x"
    ? { ...position, x: position.x + nearestExit.value }
    : { ...position, z: position.z + nearestExit.value };
}

export function resolvePlayerMovement(requested: CirclePosition, feetY: number) {
  let resolved = requested;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    architectureColliders.forEach((collider) => {
      if (verticallyOverlaps(collider, feetY, houseSpec.navigation.playerHeight)) {
        resolved = resolveCircleAgainstBox(resolved, houseSpec.navigation.playerRadius, collider);
      }
    });
  }
  return resolved;
}
