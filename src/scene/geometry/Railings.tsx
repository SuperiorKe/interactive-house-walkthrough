import type { RailingSpec } from "../../architecture/schema";
import { Block } from "./Block";

type RailingsProps = {
  railings: RailingSpec[];
  activeLevel: string;
  debug: boolean;
};

export function Railings({ railings, activeLevel, debug }: RailingsProps) {
  return (
    <>
      {railings
        .filter((railing) => activeLevel === "all" || railing.levelId === activeLevel)
        .flatMap((railing) => {
          const dx = railing.end.x - railing.start.x;
          const dz = railing.end.z - railing.start.z;
          const length = Math.hypot(dx, dz);
          const alongX = Math.abs(dx) > Math.abs(dz);
          const centerX = (railing.start.x + railing.end.x) / 2;
          const centerZ = (railing.start.z + railing.end.z) / 2;
          const glassLength = Math.max(0.1, length - 0.16);
          const parts = [
            <Block key={`${railing.id}-glass`} position={[centerX, railing.baseElevation + railing.height / 2, centerZ]} size={alongX ? [glassLength, railing.height - 0.12, 0.035] : [0.035, railing.height - 0.12, glassLength]} color="#a7c9d0" opacity={0.34} roughness={0.1} metalness={0.28} debug={debug} />,
            <Block key={`${railing.id}-top`} position={[centerX, railing.baseElevation + railing.height, centerZ]} size={alongX ? [length + 0.08, 0.055, 0.065] : [0.065, 0.055, length + 0.08]} color="#202927" roughness={0.3} metalness={0.72} debug={debug} />,
          ];
          [railing.start, railing.end].forEach((point, index) => parts.push(
            <Block key={`${railing.id}-post-${index}`} position={[point.x, railing.baseElevation + railing.height / 2, point.z]} size={[0.065, railing.height, 0.065]} color="#202927" roughness={0.3} metalness={0.72} debug={debug} />,
          ));
          return parts;
        })}
    </>
  );
}
