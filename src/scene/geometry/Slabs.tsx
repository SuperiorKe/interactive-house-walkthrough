import { DIM } from "../../architecture/dimensions";
import type { LevelSpec } from "../../architecture/schema";
import { Block } from "./Block";

type SlabsProps = {
  levels: LevelSpec[];
  activeLevel: string;
  debug: boolean;
};

export function Slabs({ levels, activeLevel, debug }: SlabsProps) {
  return (
    <>
      {levels
        .filter((level) => activeLevel === "all" || level.id === activeLevel)
        .flatMap((level) =>
          level.slabs.map((slab) => (
            <Block
              key={slab.id}
              position={[slab.x + slab.width / 2, level.elevation + DIM.construction.slabThickness / 2, slab.z + slab.depth / 2]}
              size={[slab.width, DIM.construction.slabThickness, slab.depth]}
              color={level.id === "roof" ? "#b7aaa0" : "#d8d1c6"}
              debug={debug}
            />
          )),
        )}
    </>
  );
}
