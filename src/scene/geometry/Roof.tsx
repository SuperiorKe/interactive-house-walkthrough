import type { RoofDetailSpec } from "../../architecture/schema";
import { Block } from "./Block";

type RoofProps = { details: RoofDetailSpec[]; activeLevel: string; debug: boolean };

export function Roof({ details, activeLevel, debug }: RoofProps) {
  if (activeLevel !== "all" && activeLevel !== "roof") return null;
  return (
    <>
      {details.map((detail) => (
        <Block
          key={detail.id}
          position={[detail.footprint.x + detail.footprint.width / 2, detail.elevation + detail.thickness / 2, detail.footprint.z + detail.footprint.depth / 2]}
          size={[detail.footprint.width, detail.thickness, detail.footprint.depth]}
          color={detail.kind === "cap" ? "#625f5b" : "#8c7f72"}
          roughness={0.72}
          metalness={0.08}
          debug={debug}
        />
      ))}
    </>
  );
}
