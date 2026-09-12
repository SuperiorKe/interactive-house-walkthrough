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
  const { boundary, boundaryThickness, driveway, entryApron, gate, pool, terrace } = site;
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
        color="#8a8b89"
        debug={debug}
      />
      <Block
        position={[entryApron.x + entryApron.width / 2, 0.01, entryApron.z + entryApron.depth / 2]}
        size={[entryApron.width, 0.06, entryApron.depth]}
        color="#8a8b89"
        debug={debug}
      />
      <Block
        position={[terrace.x + terrace.width / 2, 0.03, terrace.z + terrace.depth / 2]}
        size={[terrace.width, 0.06, terrace.depth]}
        color="#b9b1a6"
        debug={debug}
      />
      <Block
        position={[pool.x + pool.width / 2, -0.08, pool.z + pool.depth / 2]}
        size={[pool.width, 0.12, pool.depth]}
        color="#4e9fba"
        opacity={0.82}
        debug={debug}
      />
      {boundarySegment("boundary-left", boundary.x, boundary.z, boundaryThickness, boundary.depth, site, debug)}
      {boundarySegment("boundary-right", right - boundaryThickness, boundary.z, boundaryThickness, boundary.depth, site, debug)}
      {boundarySegment("boundary-rear", boundary.x, rear - boundaryThickness, boundary.width, boundaryThickness, site, debug)}
      {frontLeftWidth > 0 ? boundarySegment("boundary-front-left", boundary.x, boundary.z, frontLeftWidth, boundaryThickness, site, debug) : null}
      {frontRightWidth > 0 ? boundarySegment("boundary-front-right", gateRight, boundary.z, frontRightWidth, boundaryThickness, site, debug) : null}
      <Block
        position={[gate.x + gate.width / 2, site.boundaryHeight / 2, gate.z + gate.depth / 2]}
        size={[gate.width, site.boundaryHeight * 0.9, gate.depth]}
        color="#2f3837"
        debug={debug}
      />
    </>
  );
}
