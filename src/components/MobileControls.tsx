import { useRef } from "react";
import type { PointerEvent } from "react";
import type { MobileInputRef } from "../navigation/PlayerController";

type MobileControlsProps = { input: MobileInputRef };

const movePadRadius = 42;

export function MobileControls({ input }: MobileControlsProps) {
  const movePointer = useRef<number | null>(null);
  const lookPointer = useRef<number | null>(null);
  const lastLookPoint = useRef<{ x: number; y: number } | null>(null);

  const updateMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - (bounds.left + bounds.width / 2)) / movePadRadius));
    const y = Math.max(-1, Math.min(1, (event.clientY - (bounds.top + bounds.height / 2)) / movePadRadius));
    input.current.strafe = x;
    input.current.forward = -y;
  };
  const endMove = () => {
    movePointer.current = null;
    input.current.strafe = 0;
    input.current.forward = 0;
  };
  const startLook = (event: PointerEvent<HTMLDivElement>) => {
    lookPointer.current = event.pointerId;
    lastLookPoint.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const updateLook = (event: PointerEvent<HTMLDivElement>) => {
    if (lookPointer.current !== event.pointerId || !lastLookPoint.current) return;
    input.current.lookX += (event.clientX - lastLookPoint.current.x) * 0.006;
    input.current.lookY += (event.clientY - lastLookPoint.current.y) * 0.006;
    lastLookPoint.current = { x: event.clientX, y: event.clientY };
  };

  return (
    <div className="mobile-controls" aria-label="Touch controls">
      <div
        className="touch-pad move-pad"
        onPointerDown={(event) => { movePointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); updateMove(event); }}
        onPointerMove={(event) => { if (movePointer.current === event.pointerId) updateMove(event); }}
        onPointerUp={endMove}
        onPointerCancel={endMove}
      >
        <span>MOVE</span>
      </div>
      <div className="touch-pad look-pad" onPointerDown={startLook} onPointerMove={updateLook} onPointerUp={() => { lookPointer.current = null; lastLookPoint.current = null; }} onPointerCancel={() => { lookPointer.current = null; lastLookPoint.current = null; }}>
        <span>LOOK</span>
      </div>
    </div>
  );
}
