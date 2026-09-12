import { Edges } from "@react-three/drei";

type BlockProps = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  opacity?: number;
  debug?: boolean;
};

export function Block({ position, size, color, opacity = 1, debug = false }: BlockProps) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.78} metalness={0.04} />
      {debug ? <Edges color="#141915" threshold={15} /> : null}
    </mesh>
  );
}
