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
  const color = opening.kind === "garage-door" ? "#333a38" : isGlass ? "#8eb9c5" : "#70482d";
  const opacity = isGlass ? 0.58 : 1;

  return (
    <Block
      key={opening.id}
      position={[center.x, wall.baseElevation + opening.sillHeight + opening.height / 2, center.z]}
      size={alongX ? [opening.width, opening.height, thickness] : [thickness, opening.height, opening.width]}
      color={color}
      opacity={opacity}
      roughness={isGlass ? 0.07 : 0.62}
      metalness={isGlass ? 0.08 : 0.08}
      transmission={isGlass ? 0.16 : 0}
      debug={debug}
    />
  );
}

function openingPart(wall: WallSpec, opening: OpeningSpec, offset: number, length: number, bottom: number, height: number, id: string, debug: boolean) {
  const vector = wallVector(wall);
  const center = pointOnWall(wall, opening.offset + offset + length / 2);
  const alongX = Math.abs(vector.x) > Math.abs(vector.z);
  return (
    <Block
      key={id}
      position={[center.x, wall.baseElevation + bottom + height / 2, center.z]}
      size={alongX ? [length, height, 0.085] : [0.085, height, length]}
      color="#202927"
      roughness={0.32}
      metalness={0.68}
      debug={debug}
    />
  );
}

function openingFrames(wall: WallSpec, opening: OpeningSpec, debug: boolean) {
  const frame = 0.065;
  const parts: ReactNode[] = [
    openingPart(wall, opening, 0, frame, opening.sillHeight, opening.height, `${opening.id}-frame-left`, debug),
    openingPart(wall, opening, opening.width - frame, frame, opening.sillHeight, opening.height, `${opening.id}-frame-right`, debug),
    openingPart(wall, opening, 0, opening.width, opening.sillHeight, frame, `${opening.id}-frame-bottom`, debug),
    openingPart(wall, opening, 0, opening.width, opening.sillHeight + opening.height - frame, frame, `${opening.id}-frame-top`, debug),
  ];

  if (opening.kind === "door") {
    parts.push(
      openingPart(wall, opening, opening.width * 0.79, 0.035, opening.sillHeight + opening.height * 0.37, 0.44, `${opening.id}-pull`, debug),
    );
  } else if (opening.kind === "garage-door") {
    const slatCount = 7;
    for (let index = 1; index < slatCount; index += 1) {
      parts.push(openingPart(wall, opening, frame, opening.width - frame * 2, opening.sillHeight + (opening.height * index) / slatCount, 0.035, `${opening.id}-slat-${index}`, debug));
    }
  } else {
    const divisions = opening.kind === "sliding-door" ? 2 : Math.max(2, Math.round(opening.width / 1.15));
    for (let index = 1; index < divisions; index += 1) {
      const offset = (opening.width * index) / divisions - frame / 2;
      parts.push(openingPart(wall, opening, offset, frame, opening.sillHeight, opening.height, `${opening.id}-mullion-${index}`, debug));
    }
  }
  return parts;
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
            segments.push(openingFrames(wall, opening, debug));
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
