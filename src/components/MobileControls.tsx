import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { MobileInputRef } from "../navigation/PlayerController";

type MobileControlsProps = { input: MobileInputRef };

const movePadRadius = 42;
const moveDeadZone = 0.14;
const touchLookSensitivity = 0.0036;

export function MobileControls({ input }: MobileControlsProps) {
  const movePointer = useRef<number | null>(null);
  const lookPointer = useRef<number | null>(null);
  const lastLookPoint = useRef<{ x: number; y: number } | null>(null);
  const [stick, setStick] = useState({ x: 0, y: 0 });

  const updateMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const rawX = (event.clientX - (bounds.left + bounds.width / 2)) / movePadRadius;
    const rawY = (event.clientY - (bounds.top + bounds.height / 2)) / movePadRadius;
    const magnitude = Math.min(1, Math.hypot(rawX, rawY));
    const normalizedX = magnitude > 0 ? rawX / Math.hypot(rawX, rawY) : 0;
    const normalizedY = magnitude > 0 ? rawY / Math.hypot(rawX, rawY) : 0;
    const adjustedMagnitude = magnitude <= moveDeadZone ? 0 : (magnitude - moveDeadZone) / (1 - moveDeadZone);
    const x = normalizedX * adjustedMagnitude;
    const y = normalizedY * adjustedMagnitude;
    input.current.strafe = x;
    input.current.forward = -y;
    setStick({ x: x * movePadRadius, y: y * movePadRadius });
  };
  const endMove = () => {
    movePointer.current = null;
    input.current.strafe = 0;
    input.current.forward = 0;
    setStick({ x: 0, y: 0 });
  };
  const startLook = (event: PointerEvent<HTMLDivElement>) => {
    lookPointer.current = event.pointerId;
    lastLookPoint.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const updateLook = (event: PointerEvent<HTMLDivElement>) => {
    if (lookPointer.current !== event.pointerId || !lastLookPoint.current) return;
    input.current.lookX += (event.clientX - lastLookPoint.current.x) * touchLookSensitivity;
    input.current.lookY += (event.clientY - lastLookPoint.current.y) * touchLookSensitivity;
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
        <span className="touch-stick" style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }} />
        <span className="touch-label">MOVE</span>
      </div>
      <div className="touch-pad look-pad" onPointerDown={startLook} onPointerMove={updateLook} onPointerUp={() => { lookPointer.current = null; lastLookPoint.current = null; }} onPointerCancel={() => { lookPointer.current = null; lastLookPoint.current = null; }}>
        <span className="touch-label">LOOK</span>
      </div>
    </div>
  );
}
