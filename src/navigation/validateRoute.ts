import { houseSpec } from "../architecture/house";
import { resolvePlayerMovement, walkableFloorHeight } from "./collisions";

export type RouteCheck = {
  passed: boolean;
  reached: string[];
  failure?: string;
};

const TEST_STEP_LENGTH = 0.08;
const ARRIVAL_TOLERANCE = 0.12;

export function validateWalkthroughRoute(): RouteCheck {
  let position = { ...houseSpec.navigation.spawn };
  const reached = ["front-gate"];

  for (const waypoint of houseSpec.navigation.route) {
    const remainingDistance = () => Math.hypot(waypoint.x - position.x, waypoint.z - position.z);
    const steps = Math.ceil(remainingDistance() / TEST_STEP_LENGTH);

    for (let index = 0; index < steps; index += 1) {
      const distance = remainingDistance();
      if (distance < ARRIVAL_TOLERANCE) break;
      const scale = Math.min(TEST_STEP_LENGTH / distance, 1);
      const requested = {
        x: position.x + (waypoint.x - position.x) * scale,
        z: position.z + (waypoint.z - position.z) * scale,
      };
      const horizontal = resolvePlayerMovement(requested, position.y);
      const supportHeight = walkableFloorHeight(horizontal, position.y);
      if (supportHeight === Number.NEGATIVE_INFINITY || supportHeight < position.y - houseSpec.navigation.maximumStepHeight) {
        return { passed: false, reached, failure: `Lost walkable support before ${waypoint.id} at ${horizontal.x.toFixed(2)}, ${horizontal.z.toFixed(2)} (y ${position.y.toFixed(2)})` };
      }
      position = { x: horizontal.x, y: supportHeight, z: horizontal.z };
    }

    if (remainingDistance() > ARRIVAL_TOLERANCE) {
      return { passed: false, reached, failure: `Blocked before ${waypoint.id}` };
    }
    reached.push(`${waypoint.id}@${position.y.toFixed(2)}`);
  }

  return { passed: true, reached };
}
