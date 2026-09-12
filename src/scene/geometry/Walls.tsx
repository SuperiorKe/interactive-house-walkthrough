import type { ReactNode } from "react";
import type { OpeningSpec, WallSpec } from "../../architecture/schema";
import { Block } from "./Block";

type WallsProps = {
  walls: WallSpec[];
  openings: OpeningSpec[];
  activeLevel: string;
  debug: boolean;
};

type Vector2 = { x: number; z: number };

function wallVector(wall: WallSpec): Vector2 {
  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.z - wall.start.z;
  const length = Math.hypot(dx, dz);
  return { x: dx / length, z: dz / length };
}

function wallLength(wall: WallSpec): number {
  return Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z);
}

function pointOnWall(wall: WallSpec, offset: number): Vector2 {
  const vector = wallVector(wall);
  return { x: wall.start.x + vector.x * offset, z: wall.start.z + vector.z * offset };
}

function segmentBox(wall: WallSpec, offset: number, length: number, bottom: number, height: number, color: string, debug: boolean, id: string) {
  const vector = wallVector(wall);
  const center = pointOnWall(wall, offset + length / 2);
  const alongX = Math.abs(vector.x) > Math.abs(vector.z);

  return (
    <Block
      key={id}
      position={[center.x, bottom + height / 2, center.z]}
      size={alongX ? [length, height, wall.thickness] : [wall.thickness, height, length]}
      color={color}
      debug={debug}
    />
  );
}

function openingInsert(wall: WallSpec, opening: OpeningSpec, debug: boolean) {
  const vector = wallVector(wall);
  const center = pointOnWall(wall, opening.offset + opening.width / 2);
  const alongX = Math.abs(vector.x) > Math.abs(vector.z);
  const isGlass = opening.kind === "window" || opening.kind === "sliding-door";
  const thickness = isGlass ? 0.055 : wall.thickness * 0.66;
  const color = opening.kind === "garage-door" ? "#333a38" : isGlass ? "#789fb0" : "#70482d";
  const opacity = isGlass ? 0.46 : 1;

  return (
    <Block
      key={opening.id}
      position={[center.x, wall.baseElevation + opening.sillHeight + opening.height / 2, center.z]}
      size={alongX ? [opening.width, opening.height, thickness] : [thickness, opening.height, opening.width]}
      color={color}
      opacity={opacity}
      debug={debug}
    />
  );
}

export function Walls({ walls, openings, activeLevel, debug }: WallsProps) {
  return (
    <>
      {walls
        .filter((wall) => activeLevel === "all" || wall.levelId === activeLevel)
        .flatMap((wall) => {
          const wallOpenings = openings
            .filter((opening) => opening.wallId === wall.id)
            .sort((a, b) => a.offset - b.offset);
          const color = wall.role === "parapet" ? "#a2978d" : wall.role === "interior" ? "#c6c0b7" : "#b8aa9b";
          const segments: ReactNode[] = [];
          let cursor = 0;

          wallOpenings.forEach((opening) => {
            const before = opening.offset - cursor;
            if (before > 0) {
              segments.push(segmentBox(wall, cursor, before, wall.baseElevation, wall.height, color, debug, `${wall.id}-${cursor}`));
            }
            if (opening.sillHeight > 0) {
              segments.push(segmentBox(wall, opening.offset, opening.width, wall.baseElevation, opening.sillHeight, color, debug, `${opening.id}-sill`));
            }
            const headerBottom = wall.baseElevation + opening.sillHeight + opening.height;
            const headerHeight = wall.height - opening.sillHeight - opening.height;
            if (headerHeight > 0) {
              segments.push(segmentBox(wall, opening.offset, opening.width, headerBottom, headerHeight, color, debug, `${opening.id}-header`));
            }
            segments.push(openingInsert(wall, opening, debug));
            cursor = opening.offset + opening.width;
          });

          const remaining = wallLength(wall) - cursor;
          if (remaining > 0) {
            segments.push(segmentBox(wall, cursor, remaining, wall.baseElevation, wall.height, color, debug, `${wall.id}-end`));
          }
          return segments;
        })}
    </>
  );
}
