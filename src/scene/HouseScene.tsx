import { Html, Line } from "@react-three/drei";
import { houseSpec } from "../architecture/house";
import type { LevelId } from "../architecture/schema";
import { ExteriorSteps } from "./geometry/ExteriorSteps";
import { Facade } from "./geometry/Facade";
import { InteriorLighting } from "./geometry/InteriorLighting";
import { Interiors } from "./geometry/Interiors";
import { Landscaping } from "./geometry/Landscaping";
import { Railings } from "./geometry/Railings";
import { Roof } from "./geometry/Roof";
import { Site } from "./geometry/Site";
import { Slabs } from "./geometry/Slabs";
import { Stairs } from "./geometry/Stairs";
import { Walls } from "./geometry/Walls";

export type LevelFilter = "all" | LevelId;
export type Presentation = "day" | "evening";

type HouseSceneProps = {
  activeLevel: LevelFilter;
  debug: boolean;
  presentation: Presentation;
  lowPower: boolean;
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

export function HouseScene({ activeLevel, debug, presentation, lowPower }: HouseSceneProps) {
  const isEvening = presentation === "evening";
  return (
    <group>
      <Site site={houseSpec.site} debug={debug} />
      <Slabs levels={houseSpec.levels} activeLevel={activeLevel} debug={debug} />
      <Walls walls={houseSpec.walls} openings={houseSpec.openings} activeLevel={activeLevel} debug={debug} />
      <Facade sections={houseSpec.facadeSections} walls={houseSpec.walls} activeLevel={activeLevel} debug={debug} />
      <Stairs stairs={houseSpec.stairs} activeLevel={activeLevel} debug={debug} />
      <Railings railings={houseSpec.railings} activeLevel={activeLevel} debug={debug} />
      <ExteriorSteps steps={houseSpec.exteriorSteps} debug={debug} />
      <Roof details={houseSpec.roofDetails} activeLevel={activeLevel} debug={debug} />
      <Interiors finishes={houseSpec.interiorFinishes} modules={houseSpec.interiorModules} activeLevel={activeLevel} debug={debug} />
      <InteriorLighting lights={houseSpec.interiorLights} activeLevel={activeLevel} intensityScale={isEvening ? 1.2 : 0.32} maxLights={lowPower ? 4 : undefined} enabled={!lowPower || isEvening} />
      <Landscaping beds={houseSpec.landscapeBeds} plants={houseSpec.landscapePlants} lights={houseSpec.exteriorLights} exteriorLightScale={isEvening ? 1.45 : 0.12} lowPower={lowPower} renderLights={isEvening} debug={debug} />
      {debug ? <DebugOutline activeLevel={activeLevel} /> : null}
      {debug ? <DebugRoomLabels activeLevel={activeLevel} /> : null}
    </group>
  );
}
