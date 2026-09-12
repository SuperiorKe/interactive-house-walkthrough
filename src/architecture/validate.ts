import { DIM } from "./dimensions";
import type { HouseSpec, LevelId, WallSpec } from "./schema";

const TOLERANCE = 0.001;

const wallLength = (wall: WallSpec) => Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z);

export type ArchitectureCheck = {
  id: string;
  label: string;
  passed: boolean;
};

export function validateHouseSpec(spec: HouseSpec): ArchitectureCheck[] {
  const levels = new Map(spec.levels.map((level) => [level.id, level]));
  const walls = new Map(spec.walls.map((wall) => [wall.id, wall]));
  const expectedWallBase = (levelId: LevelId) => levels.get(levelId)?.elevation ?? Number.NaN;

  return [
    {
      id: "level-order",
      label: "Floor elevations increase from ground to roof",
      passed: spec.levels.every((level, index) => index === 0 || level.elevation > spec.levels[index - 1].elevation),
    },
    {
      id: "vertical-walls",
      label: "Wall bases align with their floor slabs",
      passed: spec.walls.every((wall) => Math.abs(wall.baseElevation - (expectedWallBase(wall.levelId) + DIM.construction.slabThickness)) < TOLERANCE),
    },
    {
      id: "stairs",
      label: "Each stair rise meets its destination floor",
      passed: spec.stairs.every((stair) => {
        const destination = levels.get(stair.toLevel);
        return Boolean(destination) && Math.abs(stair.baseElevation + stair.riser * stair.stepCount - (destination!.elevation + DIM.construction.slabThickness)) < TOLERANCE;
      }),
    },
    {
      id: "openings-fit",
      label: "Major openings fit within their host walls",
      passed: spec.openings.every((opening) => {
        const wall = walls.get(opening.wallId);
        if (!wall) return false;
        return opening.offset >= 0 && opening.offset + opening.width <= wallLength(wall) + TOLERANCE && opening.sillHeight + opening.height <= wall.height + TOLERANCE;
      }),
    },
    {
      id: "room-levels",
      label: "All room footprints reference an existing floor",
      passed: spec.rooms.every((room) => levels.has(room.levelId)),
    },
    {
      id: "site-placement",
      label: "Terrace and pool are behind the house envelope",
      passed: spec.site.terrace.z >= DIM.house.depth && spec.site.pool.z >= spec.site.terrace.z,
    },
  ];
}
