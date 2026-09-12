import type { SiteSpec } from "../../architecture/schema";
import { Block } from "./Block";

type SiteProps = {
  site: SiteSpec;
  debug: boolean;
};

function boundarySegment(id: string, x: number, z: number, width: number, depth: number, site: SiteSpec, debug: boolean) {
  return (
    <Block
      key={id}
      position={[x + width / 2, site.boundaryHeight / 2, z + depth / 2]}
      size={[width, site.boundaryHeight, depth]}
      color="#e1dbd0"
      debug={debug}
    />
  );
}

export function Site({ site, debug }: SiteProps) {
  const { boundary, boundaryThickness, driveway, entryApron, gate, pool, terrace, gateSlattedWidth, gateTimberWidth, gatePierWidth } = site;
  const rear = boundary.z + boundary.depth;
  const right = boundary.x + boundary.width;
  const gateRight = gate.x + gate.width;
  const frontLeftWidth = gate.x - boundary.x;
  const frontRightWidth = right - gateRight;

  return (
    <>
      <Block
        position={[boundary.x + boundary.width / 2, -0.12, boundary.z + boundary.depth / 2]}
        size={[boundary.width, 0.24, boundary.depth]}
        color="#6e8667"
      />
      <Block
        position={[driveway.x + driveway.width / 2, 0.01, driveway.z + driveway.depth / 2]}
        size={[driveway.width, 0.06, driveway.depth]}
        color="#8f918d"
        debug={debug}
      />
      {Array.from({ length: 14 }, (_, index) => (
        <Block
          key={`drive-joint-${index}`}
          position={[driveway.x + driveway.width / 2, 0.043, driveway.z + 1.05 + index * 1.92]}
          size={[driveway.width - 0.18, 0.012, 0.035]}
          color="#737671"
          roughness={0.85}
          debug={debug}
        />
      ))}
      <Block
        position={[entryApron.x + entryApron.width / 2, 0.01, entryApron.z + entryApron.depth / 2]}
        size={[entryApron.width, 0.06, entryApron.depth]}
        color="#8a8b89"
        debug={debug}
      />
      <Block
        position={[terrace.x + terrace.width / 2, 0.14, terrace.z + terrace.depth / 2]}
        size={[terrace.width, 0.28, terrace.depth]}
        color="#b9b1a6"
        debug={debug}
      />
      {Array.from({ length: 6 }, (_, index) => (
        <Block
          key={`terrace-joint-${index}`}
          position={[terrace.x + 0.55 + index * 1.82, 0.286, terrace.z + terrace.depth / 2]}
          size={[0.028, 0.012, terrace.depth - 0.08]}
          color="#8c877f"
          roughness={0.85}
          debug={debug}
        />
      ))}
      <Block position={[pool.x + pool.width / 2, 0.045, pool.z - 0.16]} size={[pool.width + 0.42, 0.09, 0.24]} color="#d5cec2" roughness={0.75} debug={debug} />
      <Block position={[pool.x + pool.width / 2, 0.045, pool.z + pool.depth + 0.16]} size={[pool.width + 0.42, 0.09, 0.24]} color="#d5cec2" roughness={0.75} debug={debug} />
      <Block position={[pool.x - 0.16, 0.045, pool.z + pool.depth / 2]} size={[0.24, 0.09, pool.depth]} color="#d5cec2" roughness={0.75} debug={debug} />
      <Block position={[pool.x + pool.width + 0.16, 0.045, pool.z + pool.depth / 2]} size={[0.24, 0.09, pool.depth]} color="#d5cec2" roughness={0.75} debug={debug} />
      <Block
        position={[pool.x + pool.width / 2, -0.1, pool.z + pool.depth / 2]}
        size={[pool.width - 0.08, 0.13, pool.depth - 0.08]}
        color="#3d99b6"
        opacity={0.86}
        roughness={0.12}
        metalness={0.16}
        debug={debug}
      />
      {boundarySegment("boundary-left", boundary.x, boundary.z, boundaryThickness, boundary.depth, site, debug)}
      {boundarySegment("boundary-right", right - boundaryThickness, boundary.z, boundaryThickness, boundary.depth, site, debug)}
      {boundarySegment("boundary-rear", boundary.x, rear - boundaryThickness, boundary.width, boundaryThickness, site, debug)}
      {frontLeftWidth > 0 ? boundarySegment("boundary-front-left", boundary.x, boundary.z, frontLeftWidth, boundaryThickness, site, debug) : null}
      {frontRightWidth > 0 ? boundarySegment("boundary-front-right", gateRight, boundary.z, frontRightWidth, boundaryThickness, site, debug) : null}
      <Block position={[gate.x + gate.width / 2, 0.23, gate.z + gate.depth / 2]} size={[gate.width, 0.46, gate.depth + 0.02]} color="#e1dbd0" debug={debug} />
      <Block position={[gate.x + gateSlattedWidth + gatePierWidth / 2, site.boundaryHeight / 2, gate.z + gate.depth / 2]} size={[gatePierWidth, site.boundaryHeight, gate.depth + 0.03]} color="#ded7cc" debug={debug} />
      <Block position={[gate.x + gateSlattedWidth + gatePierWidth + gateTimberWidth / 2, site.boundaryHeight * 0.56, gate.z + gate.depth / 2]} size={[gateTimberWidth, site.boundaryHeight * 0.88, gate.depth + 0.035]} color="#87522f" roughness={0.58} debug={debug} />
      {Array.from({ length: 11 }, (_, index) => (
        <Block
          key={`gate-slat-${index}`}
          position={[gate.x + 0.18 + index * ((gateSlattedWidth - 0.36) / 10), site.boundaryHeight * 0.61, gate.z - 0.012]}
          size={[0.11, site.boundaryHeight * 0.54, 0.06]}
          color="#293231"
          roughness={0.3}
          metalness={0.72}
          debug={debug}
        />
      ))}
      {Array.from({ length: 15 }, (_, index) => (
        <Block
          key={`gate-timber-batten-${index}`}
          position={[gate.x + gateSlattedWidth + gatePierWidth + 0.14 + index * ((gateTimberWidth - 0.28) / 14), site.boundaryHeight * 0.56, gate.z - 0.025]}
          size={[0.028, site.boundaryHeight * 0.88, 0.06]}
          color="#5c3823"
          roughness={0.62}
          debug={debug}
        />
      ))}
    </>
  );
}
