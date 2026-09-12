import { DIM } from "./dimensions";
import type { HouseSpec, LevelId, WallSpec } from "./schema";

const TOLERANCE = 0.001;

const wallLength = (wall: WallSpec) => Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z);

const containsPoint = (footprint: { x: number; z: number; width: number; depth: number }, point: { x: number; z: number }) => (
  point.x >= footprint.x - TOLERANCE
  && point.x <= footprint.x + footprint.width + TOLERANCE
  && point.z >= footprint.z - TOLERANCE
  && point.z <= footprint.z + footprint.depth + TOLERANCE
);

const touchesFootprint = (footprint: { x: number; z: number; width: number; depth: number }, point: { x: number; z: number }) => containsPoint({
  x: footprint.x - TOLERANCE,
  z: footprint.z - TOLERANCE,
  width: footprint.width + TOLERANCE * 2,
  depth: footprint.depth + TOLERANCE * 2,
}, point);

export type ArchitectureCheck = {
  id: string;
  label: string;
  passed: boolean;
};

export function validateHouseSpec(spec: HouseSpec): ArchitectureCheck[] {
  const levels = new Map(spec.levels.map((level) => [level.id, level]));
  const walls = new Map(spec.walls.map((wall) => [wall.id, wall]));
  const rooms = new Map(spec.rooms.map((room) => [room.id, room]));
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
      id: "facade-sections-fit",
      label: "Facade sections fit their host exterior walls",
      passed: spec.facadeSections.every((section) => {
        const wall = walls.get(section.wallId);
        return Boolean(wall)
          && wall!.role === "exterior"
          && section.offset >= 0
          && section.width > 0
          && section.offset + section.width <= wallLength(wall!) + TOLERANCE
          && section.bottom >= 0
          && section.height > 0
          && section.bottom + section.height <= wall!.height + TOLERANCE;
      }),
    },
    {
      id: "railing-geometry",
      label: "Balcony guards are level, positive-height edge runs",
      passed: spec.railings.every((railing) => {
        const level = levels.get(railing.levelId);
        return Boolean(level)
          && Math.hypot(railing.end.x - railing.start.x, railing.end.z - railing.start.z) > TOLERANCE
          && railing.height > 0
          && railing.baseElevation >= level!.elevation + DIM.construction.slabThickness - TOLERANCE;
      }),
    },
    {
      id: "railing-support",
      label: "Balcony guards terminate on a slab edge at their level",
      passed: spec.railings.every((railing) => {
        const level = levels.get(railing.levelId);
        return Boolean(level)
          && level!.slabs.some((slab) => touchesFootprint(slab, railing.start) && touchesFootprint(slab, railing.end));
      }),
    },
    {
      id: "roof-details",
      label: "Roof caps and overhangs have positive plan geometry",
      passed: spec.roofDetails.every((detail) => detail.footprint.width > 0 && detail.footprint.depth > 0 && detail.thickness > 0),
    },
    {
      id: "room-levels",
      label: "All room footprints reference an existing floor",
      passed: spec.rooms.every((room) => levels.has(room.levelId)),
    },
    {
      id: "interior-finishes",
      label: "Interior finishes stay within their identified rooms",
      passed: spec.interiorFinishes.every((finish) => {
        const room = rooms.get(finish.roomId);
        return Boolean(room)
          && room!.levelId === finish.levelId
          && containsPoint(room!.footprint, finish.footprint)
          && containsPoint(room!.footprint, { x: finish.footprint.x + finish.footprint.width, z: finish.footprint.z + finish.footprint.depth });
      }),
    },
    {
      id: "interior-modules",
      label: "Furniture modules belong to valid rooms and remain non-structural",
      passed: spec.interiorModules.every((module) => {
        const room = rooms.get(module.roomId);
        return Boolean(room)
          && room!.levelId === module.levelId
          && containsPoint(room!.footprint, module.position)
          && module.width > 0
          && module.depth > 0
          && module.height > 0;
      }),
    },
    {
      id: "interior-lights",
      label: "Warm interior lights are assigned to valid rooms",
      passed: spec.interiorLights.every((light) => {
        const room = rooms.get(light.roomId);
        return Boolean(room)
          && room!.levelId === light.levelId
          && containsPoint(room!.footprint, light.position)
          && light.intensity > 0
          && light.distance > 0;
      }),
    },
    {
      id: "site-placement",
      label: "Terrace and pool are behind the house envelope",
      passed: spec.site.terrace.z >= DIM.house.depth && spec.site.pool.z >= spec.site.terrace.z,
    },
    {
      id: "landscape-placement",
      label: "Landscape beds, plants and lights remain within the property",
      passed: [
        ...spec.landscapeBeds.flatMap((bed) => [
          { x: bed.footprint.x, z: bed.footprint.z },
          { x: bed.footprint.x + bed.footprint.width, z: bed.footprint.z + bed.footprint.depth },
        ]),
        ...spec.landscapePlants.map((plant) => plant.position),
        ...spec.exteriorLights.map((light) => light.position),
      ].every((point) => containsPoint(spec.site.boundary, point)),
    },
    {
      id: "exterior-lighting",
      label: "Exterior lights have positive height, range and intensity",
      passed: spec.exteriorLights.every((light) => light.height > 0 && light.intensity > 0 && light.distance > 0),
    },
  ];
}
