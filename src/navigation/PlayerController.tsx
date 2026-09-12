import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { PerspectiveCamera } from "three";
import { houseSpec } from "../architecture/house";
import { resolvePlayerMovement, walkableFloorHeight } from "./collisions";

export type MobileInput = {
  forward: number;
  strafe: number;
  lookX: number;
  lookY: number;
};

export type MobileInputRef = MutableRefObject<MobileInput>;

type PlayerControllerProps = {
  mobileInput: MobileInputRef;
  onPointerLockStateChange: (locked: boolean) => void;
};

const keyBindings: Record<string, "forward" | "backward" | "left" | "right"> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

export function PlayerController({ mobileInput, onPointerLockStateChange }: PlayerControllerProps) {
  const { camera, gl } = useThree();
  const pressed = useRef(new Set<string>());
  const position = useRef({ ...houseSpec.navigation.spawn });
  const verticalVelocity = useRef(0);
  const yaw = useRef(Math.PI);
  const pitch = useRef(0);
  const pointerLocked = useRef(false);

  useEffect(() => {
    const element = gl.domElement;
    camera.rotation.order = "YXZ";
    (camera as PerspectiveCamera).fov = 72;
    camera.updateProjectionMatrix();
    camera.position.set(position.current.x, position.current.y + houseSpec.navigation.playerHeight, position.current.z);
    camera.rotation.set(pitch.current, yaw.current, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (keyBindings[event.code]) event.preventDefault();
      pressed.current.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => pressed.current.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (!pointerLocked.current) return;
      yaw.current -= event.movementX * 0.0022;
      pitch.current = Math.max(-1.45, Math.min(1.45, pitch.current - event.movementY * 0.0022));
    };
    const handlePointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement === element;
      onPointerLockStateChange(pointerLocked.current);
    };
    const requestPointerLock = () => {
      if (!pointerLocked.current) element.requestPointerLock();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    element.addEventListener("click", requestPointerLock);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      element.removeEventListener("click", requestPointerLock);
      if (document.pointerLockElement === element) document.exitPointerLock();
    };
  }, [camera, gl, onPointerLockStateChange]);

  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, 0.05);
    const input = mobileInput.current;
    yaw.current -= input.lookX;
    pitch.current = Math.max(-1.45, Math.min(1.45, pitch.current - input.lookY));
    input.lookX = 0;
    input.lookY = 0;

    const forward = (pressed.current.has("KeyW") || pressed.current.has("ArrowUp") ? 1 : 0)
      - (pressed.current.has("KeyS") || pressed.current.has("ArrowDown") ? 1 : 0)
      + input.forward;
    const strafe = (pressed.current.has("KeyD") || pressed.current.has("ArrowRight") ? 1 : 0)
      - (pressed.current.has("KeyA") || pressed.current.has("ArrowLeft") ? 1 : 0)
      + input.strafe;
    const inputLength = Math.hypot(forward, strafe);
    const normalizedForward = inputLength > 1 ? forward / inputLength : forward;
    const normalizedStrafe = inputLength > 1 ? strafe / inputLength : strafe;
    const forwardX = -Math.sin(yaw.current);
    const forwardZ = -Math.cos(yaw.current);
    const rightX = Math.cos(yaw.current);
    const rightZ = -Math.sin(yaw.current);
    const travel = houseSpec.navigation.moveSpeed * delta;
    const requested = {
      x: position.current.x + (forwardX * normalizedForward + rightX * normalizedStrafe) * travel,
      z: position.current.z + (forwardZ * normalizedForward + rightZ * normalizedStrafe) * travel,
    };
    const horizontal = resolvePlayerMovement(requested, position.current.y);
    const supportHeight = walkableFloorHeight(horizontal, position.current.y);

    verticalVelocity.current -= houseSpec.navigation.gravity * delta;
    let nextFeetY = position.current.y + verticalVelocity.current * delta;
    if (
      supportHeight !== Number.NEGATIVE_INFINITY
      && supportHeight >= position.current.y - houseSpec.navigation.maximumStepHeight
    ) {
      nextFeetY = supportHeight;
      verticalVelocity.current = 0;
    }
    if (nextFeetY < -8) {
      position.current = { ...houseSpec.navigation.spawn };
      verticalVelocity.current = 0;
    } else {
      position.current = { x: horizontal.x, y: nextFeetY, z: horizontal.z };
    }

    camera.position.set(position.current.x, position.current.y + houseSpec.navigation.playerHeight, position.current.z);
    camera.rotation.set(pitch.current, yaw.current, 0);
  });

  return null;
}
