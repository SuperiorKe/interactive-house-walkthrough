import type { InteriorLightSpec } from "../../architecture/schema";

type InteriorLightingProps = { lights: InteriorLightSpec[]; activeLevel: string; intensityScale: number; maxLights?: number; enabled?: boolean };

export function InteriorLighting({ lights, activeLevel, intensityScale, maxLights, enabled = true }: InteriorLightingProps) {
  if (!enabled || intensityScale <= 0) return null;
  return (
    <>
      {lights
        .filter((light) => activeLevel === "all" || light.levelId === activeLevel)
        .slice(0, maxLights)
        .map((light) => (
          <pointLight
            key={light.id}
            position={[light.position.x, light.position.y, light.position.z]}
            color={light.color}
            intensity={light.intensity * intensityScale}
            distance={light.distance}
            decay={2}
          />
        ))}
    </>
  );
}
