import type { ReactNode } from "react";
import type { InteriorFinishSpec, InteriorModuleSpec } from "../../architecture/schema";
import { Block } from "./Block";

type InteriorsProps = {
  finishes: InteriorFinishSpec[];
  modules: InteriorModuleSpec[];
  activeLevel: string;
  debug: boolean;
};

const finishMaterials = {
  oak: { color: "#a87346", roughness: 0.58, metalness: 0.02 },
  walnut: { color: "#633e29", roughness: 0.56, metalness: 0.02 },
  stone: { color: "#c7bdb0", roughness: 0.88, metalness: 0 },
  tile: { color: "#aca79f", roughness: 0.7, metalness: 0.02 },
} as const;

const moduleMaterials = {
  oak: "#a87346",
  walnut: "#633e29",
  stone: "#c7bdb0",
  tile: "#d5d0c7",
  upholstery: "#b4aa9d",
  linen: "#d4c9b9",
  charcoal: "#293130",
  brass: "#b68a54",
  glass: "#b7d4d4",
} as const;

function piece(key: string, position: [number, number, number], size: [number, number, number], color: string, debug: boolean, opacity = 1, roughness = 0.65, metalness = 0.03) {
  return <Block key={key} position={position} size={size} color={color} opacity={opacity} roughness={roughness} metalness={metalness} castShadow={false} debug={debug} />;
}

function tableLegs(id: string, width: number, depth: number, height: number, color: string, debug: boolean) {
  return [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ].map(([x, z], index) => piece(`${id}-leg-${index}`, [x * (width / 2 - 0.08), height / 2, z * (depth / 2 - 0.08)], [0.07, height, 0.07], color, debug, 1, 0.36, 0.5));
}

function renderModule(module: InteriorModuleSpec, debug: boolean): ReactNode[] {
  const { id, width: w, depth: d, height: h } = module;
  const wood = moduleMaterials[module.material];
  const dark = moduleMaterials.charcoal;
  const fabric = module.material === "linen" ? moduleMaterials.linen : moduleMaterials.upholstery;

  switch (module.kind) {
    case "sofa":
      return [
        piece(`${id}-base`, [0, h * 0.24, 0], [w, h * 0.48, d * 0.92], fabric, debug),
        piece(`${id}-back`, [0, h * 0.66, d * 0.38], [w, h * 0.5, d * 0.18], fabric, debug),
        piece(`${id}-arm-left`, [-w * 0.45, h * 0.47, 0], [w * 0.1, h * 0.56, d * 0.84], fabric, debug),
        piece(`${id}-arm-right`, [w * 0.45, h * 0.47, 0], [w * 0.1, h * 0.56, d * 0.84], fabric, debug),
        piece(`${id}-cushion-left`, [-w * 0.21, h * 0.52, -d * 0.08], [w * 0.34, h * 0.13, d * 0.56], "#c8bdae", debug),
        piece(`${id}-cushion-right`, [w * 0.21, h * 0.52, -d * 0.08], [w * 0.34, h * 0.13, d * 0.56], "#c8bdae", debug),
      ];
    case "armchair":
      return [
        piece(`${id}-seat`, [0, h * 0.28, 0], [w, h * 0.56, d * 0.86], fabric, debug),
        piece(`${id}-back`, [0, h * 0.68, d * 0.31], [w, h * 0.52, d * 0.2], fabric, debug),
        piece(`${id}-arm-left`, [-w * 0.43, h * 0.5, 0], [w * 0.12, h * 0.5, d * 0.76], fabric, debug),
        piece(`${id}-arm-right`, [w * 0.43, h * 0.5, 0], [w * 0.12, h * 0.5, d * 0.76], fabric, debug),
      ];
    case "coffee-table":
      return [
        piece(`${id}-top`, [0, h * 0.83, 0], [w, h * 0.14, d], wood, debug, 1, 0.45, 0.08),
        ...tableLegs(id, w, d, h * 0.76, dark, debug),
      ];
    case "media-console":
      return [
        piece(`${id}-body`, [0, h * 0.48, 0], [w, h * 0.7, d], wood, debug),
        piece(`${id}-top`, [0, h * 0.86, 0], [w + 0.03, h * 0.08, d + 0.05], "#c5b8a8", debug, 1, 0.5),
        piece(`${id}-screen`, [w * 0.57, h * 1.38, 0], [0.025, h * 0.92, d * 0.62], "#171b1c", debug, 1, 0.22, 0.28),
      ];
    case "dining-table":
      return [
        piece(`${id}-top`, [0, h * 0.94, 0], [w, h * 0.1, d], wood, debug, 1, 0.4, 0.12),
        ...tableLegs(id, w, d, h * 0.9, dark, debug),
      ];
    case "dining-chair":
      return [
        piece(`${id}-seat`, [0, h * 0.48, 0], [w, h * 0.12, d], fabric, debug),
        piece(`${id}-back`, [0, h * 0.75, d * 0.38], [w, h * 0.52, d * 0.1], fabric, debug),
        ...tableLegs(id, w, d, h * 0.44, dark, debug),
      ];
    case "kitchen-run":
      return [
        piece(`${id}-lower-cabinets`, [0, h * 0.18, 0], [w, h * 0.36, d], wood, debug),
        piece(`${id}-counter`, [0, h * 0.39, 0], [w + 0.08, h * 0.06, d + 0.1], "#c9c1b6", debug, 1, 0.36, 0.06),
        piece(`${id}-backsplash`, [0, h * 0.62, d * 0.42], [w, h * 0.38, 0.04], "#77736d", debug, 1, 0.75),
        piece(`${id}-upper-cabinets`, [0, h * 0.83, d * 0.27], [w, h * 0.28, d * 0.43], wood, debug),
      ];
    case "kitchen-island":
      return [
        piece(`${id}-base`, [0, h * 0.43, 0], [w * 0.86, h * 0.86, d * 0.82], wood, debug),
        piece(`${id}-stone-top`, [0, h * 0.9, 0], [w, h * 0.1, d], "#c9c1b6", debug, 1, 0.32, 0.05),
      ];
    case "bed":
      return [
        piece(`${id}-frame`, [0, h * 0.17, 0], [w, h * 0.34, d], wood, debug),
        piece(`${id}-mattress`, [0, h * 0.42, -d * 0.04], [w * 0.94, h * 0.28, d * 0.88], fabric, debug),
        piece(`${id}-headboard`, [0, h * 0.84, d * 0.42], [w, h * 1.05, d * 0.12], wood, debug),
        piece(`${id}-pillow-left`, [-w * 0.22, h * 0.61, d * 0.2], [w * 0.33, h * 0.14, d * 0.28], "#e3d8ca", debug),
        piece(`${id}-pillow-right`, [w * 0.22, h * 0.61, d * 0.2], [w * 0.33, h * 0.14, d * 0.28], "#e3d8ca", debug),
      ];
    case "nightstand":
      return [
        piece(`${id}-body`, [0, h * 0.44, 0], [w, h * 0.78, d], wood, debug),
        piece(`${id}-top`, [0, h * 0.86, 0], [w + 0.04, h * 0.08, d + 0.04], "#c9c1b6", debug),
      ];
    case "wardrobe":
      return [
        piece(`${id}-body`, [0, h / 2, 0], [w, h, d], wood, debug),
        piece(`${id}-reveal`, [0, h / 2, -d * 0.51], [0.025, h * 0.92, d * 0.04], dark, debug, 1, 0.35, 0.38),
      ];
    case "desk":
      return [
        piece(`${id}-top`, [0, h * 0.93, 0], [w, h * 0.1, d], wood, debug),
        ...tableLegs(id, w, d, h * 0.9, dark, debug),
      ];
    case "vanity":
      return [
        piece(`${id}-cabinet`, [0, h * 0.4, 0], [w, h * 0.8, d], wood, debug),
        piece(`${id}-counter`, [0, h * 0.84, 0], [w + 0.07, h * 0.1, d + 0.08], "#d1cbc2", debug),
        piece(`${id}-mirror`, [0, h * 1.53, d * 0.42], [w * 0.82, h * 0.92, 0.035], "#80949a", debug, 0.5, 0.13, 0.28),
      ];
    case "shower":
      return [
        piece(`${id}-tray`, [0, 0.05, 0], [w, 0.1, d], "#d4d0c8", debug),
        piece(`${id}-glass-front`, [0, h / 2, -d / 2], [w, h, 0.025], moduleMaterials.glass, debug, 0.3, 0.08, 0.22),
        piece(`${id}-glass-side`, [-w / 2, h / 2, 0], [0.025, h, d], moduleMaterials.glass, debug, 0.3, 0.08, 0.22),
        piece(`${id}-header`, [0, h - 0.04, -d / 2], [w, 0.06, 0.06], dark, debug, 1, 0.28, 0.68),
      ];
    case "toilet":
      return [
        piece(`${id}-base`, [0, h * 0.24, 0], [w * 0.66, h * 0.48, d * 0.65], "#ece9e1", debug),
        piece(`${id}-tank`, [0, h * 0.66, d * 0.22], [w, h * 0.36, d * 0.32], "#ece9e1", debug),
      ];
    case "balcony-lounge":
      return [
        piece(`${id}-seat`, [0, h * 0.3, 0], [w, h * 0.6, d], fabric, debug),
        piece(`${id}-back`, [0, h * 0.7, d * 0.35], [w, h * 0.5, d * 0.16], fabric, debug),
        piece(`${id}-frame`, [0, h * 0.08, 0], [w * 1.04, h * 0.1, d * 1.04], dark, debug, 1, 0.28, 0.7),
      ];
    case "planter":
      return [
        piece(`${id}-pot`, [0, h * 0.22, 0], [w, h * 0.44, d], dark, debug, 1, 0.5, 0.24),
        piece(`${id}-foliage`, [0, h * 0.67, 0], [w * 0.82, h * 0.9, d * 0.82], "#4f7456", debug, 1, 0.88),
      ];
    case "pendant":
      return [
        piece(`${id}-cord`, [0, h * 0.18, 0], [0.025, h * 0.64, 0.025], dark, debug, 1, 0.3, 0.7),
        piece(`${id}-shade`, [0, -h * 0.17, 0], [w, h * 0.34, d], wood, debug, 1, 0.3, 0.4),
      ];
  }
}

export function Interiors({ finishes, modules, activeLevel, debug }: InteriorsProps) {
  return (
    <>
      {finishes
        .filter((finish) => activeLevel === "all" || finish.levelId === activeLevel)
        .map((finish) => {
          const material = finishMaterials[finish.material];
          return <Block key={finish.id} position={[finish.footprint.x + finish.footprint.width / 2, finish.elevation + 0.012, finish.footprint.z + finish.footprint.depth / 2]} size={[finish.footprint.width, 0.024, finish.footprint.depth]} color={material.color} roughness={material.roughness} metalness={material.metalness} castShadow={false} debug={debug} />;
        })}
      {modules
        .filter((module) => activeLevel === "all" || module.levelId === activeLevel)
        .map((module) => (
          <group key={module.id} position={[module.position.x, module.position.y, module.position.z]} rotation={[0, module.rotationY ?? 0, 0]}>
            {renderModule(module, debug)}
          </group>
        ))}
    </>
  );
}
