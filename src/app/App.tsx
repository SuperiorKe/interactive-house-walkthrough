import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { houseSpec } from "../architecture/house";
import { validateHouseSpec } from "../architecture/validate";
import { MobileControls } from "../components/MobileControls";
import { PlayerController, type MobileInput } from "../navigation/PlayerController";
import { validateWalkthroughRoute } from "../navigation/validateRoute";
import { HouseScene, type LevelFilter } from "../scene/HouseScene";

type CameraView = "perspective" | "front" | "rear" | "left" | "right" | "top";

const cameraPositions: Record<CameraView, [number, number, number]> = {
  perspective: [28, 20, 31],
  front: [6, 10, -31],
  rear: [6, 10, 38],
  left: [-29, 10, 9],
  right: [35, 10, 9],
  top: [6, 43, 9],
};

function CameraInspector({ view }: { view: CameraView }) {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const appliedView = useRef<CameraView | null>(null);

  useFrame(() => {
    if (!controls.current || appliedView.current === view) return;
    camera.position.set(...cameraPositions[view]);
    camera.lookAt(6, 5, 9);
    controls.current.target.set(6, 5, 9);
    controls.current.update();
    appliedView.current = view;
  });

  return <OrbitControls ref={controls} makeDefault maxPolarAngle={Math.PI / 2.02} minDistance={6} maxDistance={75} />;
}

const levelChoices: Array<{ id: LevelFilter; label: string }> = [
  { id: "all", label: "All" },
  ...houseSpec.levels.map((level) => ({ id: level.id, label: level.label })),
];

const viewChoices: Array<{ id: CameraView; label: string }> = [
  { id: "perspective", label: "Orbit" },
  { id: "front", label: "Front" },
  { id: "rear", label: "Rear" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "top", label: "Top" },
];

function initialCameraView(): CameraView {
  const requestedView = new URLSearchParams(window.location.search).get("view");
  return viewChoices.find((choice) => choice.id === requestedView)?.id ?? "perspective";
}

export function App() {
  const [activeLevel, setActiveLevel] = useState<LevelFilter>("all");
  const [debug, setDebug] = useState(true);
  const [view, setView] = useState<CameraView>(initialCameraView);
  const [mode, setMode] = useState<"walkthrough" | "inspect">("walkthrough");
  const [pointerLocked, setPointerLocked] = useState(false);
  const mobileInput = useRef<MobileInput>({ forward: 0, strafe: 0, lookX: 0, lookY: 0 });
  const checks = validateHouseSpec(houseSpec);
  const allChecksPass = checks.every((check) => check.passed);
  const routeCheck = validateWalkthroughRoute();
  const onPointerLockChange = useCallback((locked: boolean) => setPointerLocked(locked), []);

  return (
    <main className="app-shell">
      <Canvas shadows camera={{ position: cameraPositions.perspective, fov: 38 }}>
        <color attach="background" args={["#d8e0e1"]} />
        <fog attach="fog" args={["#d8e0e1", 38, 90]} />
        <hemisphereLight args={["#f3f0e9", "#5c6c58", 2.2]} />
        <directionalLight position={[18, 26, -12]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} />
        <HouseScene activeLevel={mode === "walkthrough" ? "all" : activeLevel} debug={debug} />
        {mode === "walkthrough"
          ? <PlayerController mobileInput={mobileInput} onPointerLockStateChange={onPointerLockChange} />
          : <CameraInspector view={view} />}
        {debug && mode === "inspect" ? <gridHelper args={[60, 60, "#7a8b7b", "#b5c4b6"]} position={[6, 0.01, 9]} /> : null}
      </Canvas>

      {mode === "walkthrough" ? (
        <aside className="walkthrough-help" aria-label="Walkthrough controls">
          <p className="eyebrow">FIRST-PERSON WALKTHROUGH</p>
          <h1>Enter through the front gate</h1>
          <p>{pointerLocked ? "WASD / arrow keys move · mouse looks · Esc releases the mouse" : "Click the scene to capture the mouse, then use WASD or arrow keys."}</p>
          <p className="route-tip">Route: gate → drive → front door → stair core → upper floors → rear terrace/pool.</p>
          <p className={routeCheck.passed ? "route-status is-valid" : "route-status has-errors"}>{routeCheck.passed ? "Route geometry check passes" : `${routeCheck.failure} · ${routeCheck.reached.join(" → ")}`}</p>
          <button onClick={() => setMode("inspect")}>Inspect structure</button>
        </aside>
      ) : (
        <aside className="inspector" aria-label="Architectural inspector">
          <p className="eyebrow">ARCHITECTURAL BLOCKOUT</p>
          <h1>House shell inspector</h1>
          <p className="inspector-copy">Orbit view is retained for plan/elevation validation. Return to walkthrough to test the first-person path.</p>
          <section>
            <h2>Visible level</h2>
            <div className="button-grid">
              {levelChoices.map((choice) => (
                <button key={choice.id} className={activeLevel === choice.id ? "is-active" : ""} onClick={() => setActiveLevel(choice.id)}>
                  {choice.label}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2>Inspection view</h2>
            <div className="button-grid">
              {viewChoices.map((choice) => (
                <button key={choice.id} className={view === choice.id ? "is-active" : ""} onClick={() => setView(choice.id)}>
                  {choice.label}
                </button>
              ))}
            </div>
          </section>
          <label className="debug-toggle">
            <input type="checkbox" checked={debug} onChange={(event) => setDebug(event.target.checked)} />
            Structural edges, room labels and wall centerlines
          </label>
          <p className={`validation-status ${allChecksPass ? "is-valid" : "has-errors"}`}>
            {allChecksPass ? `${checks.length}/${checks.length} structural checks pass` : "Structural check needs review"}
          </p>
          {debug ? (
            <ul className="validation-list">
              {checks.map((check) => <li key={check.id}>{check.passed ? "✓" : "!"} {check.label}</li>)}
              <li>{routeCheck.passed ? "✓" : "!"} {routeCheck.passed ? `Walkthrough route reaches ${routeCheck.reached.at(-1)}` : routeCheck.failure}</li>
            </ul>
          ) : null}
          <button className="walkthrough-button" onClick={() => setMode("walkthrough")}>Return to walkthrough</button>
          <p className="legend"><span className="legend-wall" /> wall shell <span className="legend-glass" /> major glazing <span className="legend-stair" /> stair runs</p>
        </aside>
      )}
      {mode === "walkthrough" ? <MobileControls input={mobileInput} /> : null}
    </main>
  );
}
