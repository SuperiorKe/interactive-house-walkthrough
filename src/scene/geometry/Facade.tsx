import type { FacadeSectionSpec, WallSpec } from "../../architecture/schema";
import { Block } from "./Block";

type FacadeProps = {
  sections: FacadeSectionSpec[];
  walls: WallSpec[];
  activeLevel: string;
  debug: boolean;
};

const materials = {
  render: { color: "#d4cec3", roughness: 0.84, metalness: 0 },
  timber: { color: "#8d5b35", roughness: 0.55, metalness: 0.03 },
  stone: { color: "#706961", roughness: 0.9, metalness: 0 },
} as const;

function sectionBlock(section: FacadeSectionSpec, wall: WallSpec, debug: boolean) {
  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.z - wall.start.z;
  const length = Math.hypot(dx, dz);
  const vx = dx / length;
  const vz = dz / length;
  const centerOffset = section.offset + section.width / 2;
  const x = wall.start.x + vx * centerOffset;
  const z = wall.start.z + vz * centerOffset;
  const alongX = Math.abs(vx) > Math.abs(vz);
  const finish = materials[section.material];
  const pieces = [
    <Block
      key={section.id}
      position={[x, wall.baseElevation + section.bottom + section.height / 2, z]}
      size={alongX ? [section.width, section.height, wall.thickness + 0.018] : [wall.thickness + 0.018, section.height, section.width]}
      color={finish.color}
      roughness={finish.roughness}
      metalness={finish.metalness}
      debug={debug}
    />,
  ];

  if (section.material === "timber") {
    const battenCount = Math.max(1, Math.floor(section.width / 0.28));
    for (let index = 1; index < battenCount; index += 1) {
      const battenOffset = section.offset + (section.width * index) / battenCount;
      const battenX = wall.start.x + vx * battenOffset;
      const battenZ = wall.start.z + vz * battenOffset;
      pieces.push(
        <Block
          key={`${section.id}-batten-${index}`}
          position={[battenX, wall.baseElevation + section.bottom + section.height / 2, battenZ]}
          size={alongX ? [0.025, section.height, wall.thickness + 0.034] : [wall.thickness + 0.034, section.height, 0.025]}
          color="#5c3924"
          roughness={0.65}
          debug={debug}
        />,
      );
    }
  } else if (section.material === "stone") {
    const jointCount = Math.max(1, Math.floor(section.height / 0.34));
    for (let index = 1; index < jointCount; index += 1) {
      const y = wall.baseElevation + section.bottom + (section.height * index) / jointCount;
      pieces.push(
        <Block
          key={`${section.id}-joint-${index}`}
          position={[x, y, z]}
          size={alongX ? [section.width, 0.022, wall.thickness + 0.034] : [wall.thickness + 0.034, 0.022, section.width]}
          color="#4e4b47"
          roughness={0.92}
          debug={debug}
        />,
      );
    }
  }
  return pieces;
}

export function Facade({ sections, walls, activeLevel, debug }: FacadeProps) {
  const wallById = new Map(walls.map((wall) => [wall.id, wall]));
  return (
    <>
      {sections.flatMap((section) => {
        const wall = wallById.get(section.wallId);
        if (!wall || (activeLevel !== "all" && wall.levelId !== activeLevel)) return [];
        return sectionBlock(section, wall, debug);
      })}
    </>
  );
}
