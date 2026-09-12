import { useLayoutEffect, useMemo, useRef } from "react";
import { InstancedMesh, Matrix4, Object3D } from "three";
import type { ExteriorLightSpec, LandscapeBedSpec, LandscapePlantSpec } from "../../architecture/schema";
import { Block } from "./Block";

type LandscapingProps = {
  beds: LandscapeBedSpec[];
  plants: LandscapePlantSpec[];
  lights: ExteriorLightSpec[];
  debug: boolean;
};

type InstanceMeshProps = { plants: LandscapePlantSpec[]; type: "trunk" | "canopy" | "shrub" | "grass"; lowPower: boolean };

function PlantInstances({ plants, type, lowPower }: InstanceMeshProps) {
  const mesh = useRef<InstancedMesh>(null);
  const matrix = useMemo(() => new Matrix4(), []);
  const object = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    plants.forEach((plant, index) => {
      const y = type === "trunk"
        ? plant.height * 0.26
        : type === "canopy"
          ? plant.height * 0.7
          : type === "shrub"
            ? plant.height * 0.42
            : plant.height * 0.48;
      const verticalScale = type === "trunk"
        ? plant.height * 0.52
        : type === "canopy"
          ? plant.height * 0.42
          : type === "shrub"
            ? plant.height * 0.84
            : plant.height * 0.96;
      object.position.set(plant.position.x, plant.position.y + y, plant.position.z);
      object.scale.set(plant.spread, verticalScale, plant.spread);
      object.updateMatrix();
      mesh.current!.setMatrixAt(index, object.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [matrix, object, plants, type]);

  if (!plants.length) return null;
  const material = type === "trunk" ? "#65442d" : type === "canopy" ? "#365d43" : type === "shrub" ? "#4d7b4f" : "#7d9a57";
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, plants.length]} castShadow={!lowPower} receiveShadow>
      {type === "trunk" ? <cylinderGeometry args={[0.22, 0.3, 1, 7]} /> : type === "grass" ? <coneGeometry args={[0.58, 1, 6]} /> : <sphereGeometry args={[0.62, 9, 7]} />}
      <meshStandardMaterial color={material} roughness={0.88} />
    </instancedMesh>
  );
}

function ExteriorLights({ lights, debug, intensityScale, maxLights }: { lights: ExteriorLightSpec[]; debug: boolean; intensityScale: number; maxLights?: number }) {
  return (
    <>
      {lights.slice(0, maxLights).map((light) => (
        <group key={light.id} position={[light.position.x, light.position.y, light.position.z]}>
          {light.kind === "bollard" ? (
            <>
              <Block position={[0, light.height * 0.4, 0]} size={[0.11, light.height * 0.8, 0.11]} color="#27302f" roughness={0.32} metalness={0.7} debug={debug} />
              <Block position={[0, light.height * 0.83, 0]} size={[0.17, light.height * 0.16, 0.17]} color="#f1c889" emissive={light.color} emissiveIntensity={1.8 * intensityScale} roughness={0.25} metalness={0.2} debug={debug} />
            </>
          ) : (
            <Block position={[0, light.height / 2, 0]} size={[0.12, light.height, 0.08]} color="#3a3935" emissive={light.color} emissiveIntensity={1.4 * intensityScale} roughness={0.4} metalness={0.5} debug={debug} />
          )}
          <pointLight position={[0, light.height, 0]} color={light.color} intensity={light.intensity * intensityScale} distance={light.distance} decay={2} />
        </group>
      ))}
    </>
  );
}

export function Landscaping({ beds, plants, lights, debug, exteriorLightScale = 1, lowPower = false, renderLights = true }: LandscapingProps & { exteriorLightScale?: number; lowPower?: boolean; renderLights?: boolean }) {
  const trees = plants.filter((plant) => plant.kind === "tree");
  const shrubs = plants.filter((plant) => plant.kind === "shrub");
  const grasses = plants.filter((plant) => plant.kind === "grass");

  return (
    <>
      {beds.map((bed) => (
        <Block
          key={bed.id}
          position={[bed.footprint.x + bed.footprint.width / 2, 0.022, bed.footprint.z + bed.footprint.depth / 2]}
          size={[bed.footprint.width, 0.044, bed.footprint.depth]}
          color={bed.material === "mulch" ? "#5a4534" : "#9c988e"}
          roughness={0.94}
          debug={debug}
        />
      ))}
      <PlantInstances plants={trees} type="trunk" lowPower={lowPower} />
      <PlantInstances plants={trees} type="canopy" lowPower={lowPower} />
      <PlantInstances plants={shrubs} type="shrub" lowPower={lowPower} />
      <PlantInstances plants={grasses} type="grass" lowPower={lowPower} />
      {renderLights ? <ExteriorLights lights={lights} debug={debug} intensityScale={exteriorLightScale} maxLights={lowPower ? 4 : undefined} /> : null}
    </>
  );
}
