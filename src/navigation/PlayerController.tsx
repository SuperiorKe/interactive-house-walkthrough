import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
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
  onLocationChange: (location: string) => void;
  compactControls: boolean;
  resetToken: number;
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

function describeLocation({ x, y, z }: { x: number; y: number; z: number }) {
  if (y >= 6.5) return z > 10 ? "Upper floor · rear rooms" : "Upper floor · master suite";
  if (y >= 3.2) {
    if (x > 11.8 && z < 5) return "First floor · side balcony";
    if (z > 16.8) return "First floor · rear balcony";
    if (x < 5.8 && z < 9.7) return "Stair core";
    return "First floor";
  }
  if (z < 0) return "Front court";
  if (z > 18) return "Pool terrace";
  if (x < 5.5 && z > 2.5 && z < 9.5) return "Stair core";
  return "Ground floor";
}

export function PlayerController({ mobileInput, onPointerLockStateChange, onLocationChange, compactControls, resetToken }: PlayerControllerProps) {
  const { camera, gl } = useThree();
  const pressed = useRef(new Set<string>());
  const position = useRef({ ...houseSpec.navigation.spawn });
  const verticalVelocity = useRef(0);
  const yaw = useRef(Math.PI);
  const pitch = useRef(0);
  const pointerLocked = useRef(false);
  const lastLocation = useRef("");

  const publishLocation = useCallback(() => {
    const nextLocation = describeLocation(position.current);
    if (nextLocation === lastLocation.current) return;
    lastLocation.current = nextLocation;
    onLocationChange(nextLocation);
  }, [onLocationChange]);

  useEffect(() => {
    const element = gl.domElement;
    camera.rotation.order = "YXZ";
    (camera as PerspectiveCamera).fov = compactControls ? 76 : 72;
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
  }, [camera, compactControls, gl, onPointerLockStateChange]);

  useEffect(() => {
    position.current = { ...houseSpec.navigation.spawn };
    verticalVelocity.current = 0;
    yaw.current = Math.PI;
    pitch.current = 0;
    mobileInput.current = { forward: 0, strafe: 0, lookX: 0, lookY: 0 };
    camera.position.set(position.current.x, position.current.y + houseSpec.navigation.playerHeight, position.current.z);
    camera.rotation.set(pitch.current, yaw.current, 0);
    lastLocation.current = "";
    publishLocation();
  }, [camera, mobileInput, publishLocation, resetToken]);

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
    const travel = houseSpec.navigation.moveSpeed * (compactControls ? 0.9 : 1) * delta;
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
    publishLocation();
  });

  return null;
}
