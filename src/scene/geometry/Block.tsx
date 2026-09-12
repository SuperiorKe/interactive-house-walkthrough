import { Edges } from "@react-three/drei";

type BlockProps = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  opacity?: number;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transmission?: number;
  ior?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  debug?: boolean;
};

export function Block({ position, size, color, opacity = 1, roughness = 0.78, metalness = 0.04, emissive = "#000000", emissiveIntensity = 0, transmission = 0, ior = 1.45, castShadow = true, receiveShadow = true, debug = false }: BlockProps) {
  const isPhysicalGlass = transmission > 0;
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      {isPhysicalGlass ? (
        <meshPhysicalMaterial color={color} transparent opacity={opacity} roughness={roughness} metalness={metalness} transmission={transmission} ior={ior} thickness={0.06} depthWrite={false} />
      ) : (
        <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={roughness} metalness={metalness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      )}
      {debug ? <Edges color="#141915" threshold={15} /> : null}
    </mesh>
  );
}
