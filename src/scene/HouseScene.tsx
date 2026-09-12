import { Html, Line } from "@react-three/drei";
import { houseSpec } from "../architecture/house";
import type { LevelId } from "../architecture/schema";
import { Site } from "./geometry/Site";
import { Slabs } from "./geometry/Slabs";
import { Stairs } from "./geometry/Stairs";
import { Walls } from "./geometry/Walls";

export type LevelFilter = "all" | LevelId;

type HouseSceneProps = {
  activeLevel: LevelFilter;
  debug: boolean;
};

function DebugRoomLabels({ activeLevel }: Pick<HouseSceneProps, "activeLevel">) {
  const rooms = houseSpec.rooms.filter((room) => activeLevel === "all" || room.levelId === activeLevel);

  return (
    <>
      {rooms.map((room) => (
        <Html
          key={room.id}
          position={[
            room.footprint.x + room.footprint.width / 2,
            houseSpec.levels.find((level) => level.id === room.levelId)!.elevation + 0.45,
            room.footprint.z + room.footprint.depth / 2,
          ]}
          center
          distanceFactor={16}
          style={{ pointerEvents: "none" }}
        >
          <span className="room-label">{room.label}</span>
        </Html>
      ))}
    </>
  );
}

function DebugOutline({ activeLevel }: Pick<HouseSceneProps, "activeLevel">) {
  const walls = houseSpec.walls.filter((wall) => activeLevel === "all" || wall.levelId === activeLevel);
  return (
    <>
      {walls.map((wall) => (
        <Line
          key={`${wall.id}-centerline`}
          points={[
            [wall.start.x, wall.baseElevation + wall.height + 0.02, wall.start.z],
            [wall.end.x, wall.baseElevation + wall.height + 0.02, wall.end.z],
          ]}
          color="#f5cf70"
          lineWidth={1}
        />
      ))}
    </>
  );
}

export function HouseScene({ activeLevel, debug }: HouseSceneProps) {
  return (
    <group>
      <Site site={houseSpec.site} debug={debug} />
      <Slabs levels={houseSpec.levels} activeLevel={activeLevel} debug={debug} />
      <Walls walls={houseSpec.walls} openings={houseSpec.openings} activeLevel={activeLevel} debug={debug} />
      <Stairs stairs={houseSpec.stairs} activeLevel={activeLevel} debug={debug} />
      {debug ? <DebugOutline activeLevel={activeLevel} /> : null}
      {debug ? <DebugRoomLabels activeLevel={activeLevel} /> : null}
    </group>
  );
}
