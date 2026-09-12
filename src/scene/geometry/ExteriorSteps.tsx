import type { ExteriorStepSpec } from "../../architecture/schema";
import { Block } from "./Block";

type ExteriorStepsProps = { steps: ExteriorStepSpec[]; debug: boolean };

export function ExteriorSteps({ steps, debug }: ExteriorStepsProps) {
  return (
    <>
      {steps.flatMap((stair) =>
        Array.from({ length: stair.stepCount }, (_, index) => {
          const rise = stair.riser * (index + 1);
          const runOffset = stair.tread * (index + 0.5);
          const x = stair.start.x + stair.direction.x * runOffset;
          const z = stair.start.z + stair.direction.z * runOffset;
          const alongX = Math.abs(stair.direction.x) > Math.abs(stair.direction.z);
          return (
            <Block
              key={`${stair.id}-${index}`}
              position={[x, stair.baseElevation + rise / 2, z]}
              size={alongX ? [stair.tread, rise, stair.width] : [stair.width, rise, stair.tread]}
              color="#bcb4a9"
              roughness={0.86}
              debug={debug}
            />
          );
        }),
      )}
    </>
  );
}
