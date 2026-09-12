import { DIM } from "../../architecture/dimensions";
import type { StairSpec } from "../../architecture/schema";
import { Block } from "./Block";

type StairsProps = {
  stairs: StairSpec[];
  activeLevel: string;
  debug: boolean;
};

export function Stairs({ stairs, activeLevel, debug }: StairsProps) {
  return (
    <>
      {stairs
        .filter((stair) => activeLevel === "all" || stair.fromLevel === activeLevel || stair.toLevel === activeLevel)
        .flatMap((stair) =>
          Array.from({ length: stair.stepCount }, (_, index) => {
            const rise = stair.riser * (index + 1);
            const runOffset = stair.tread * (index + 0.5);
            const x = stair.start.x + stair.direction.x * runOffset;
            const z = stair.start.z + stair.direction.z * runOffset;
            const alongX = Math.abs(stair.direction.x) > Math.abs(stair.direction.z);
            const size: [number, number, number] = alongX
              ? [stair.tread, rise, stair.width]
              : [stair.width, rise, stair.tread];

            return (
              <Block
                key={`${stair.id}-step-${index}`}
                position={[x, stair.baseElevation + rise / 2, z]}
                size={size}
                color="#9a7653"
                debug={debug}
              />
            );
          }),
        )}
      {debug ? <axesHelper args={[DIM.construction.storeyHeight]} position={[DIM.stair.x, DIM.construction.slabThickness, DIM.stair.z]} /> : null}
    </>
  );
}
