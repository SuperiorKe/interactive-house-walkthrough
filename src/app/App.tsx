import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACESFilmicToneMapping } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { houseSpec } from "../architecture/house";
import { validateHouseSpec } from "../architecture/validate";
import { MobileControls } from "../components/MobileControls";
import { SceneErrorBoundary } from "../components/SceneErrorBoundary";
import { Landing, WalkthroughHud } from "../components/WalkthroughHud";
import { PlayerController, type MobileInput } from "../navigation/PlayerController";
import { validateWalkthroughRoute } from "../navigation/validateRoute";
import { HouseScene, type LevelFilter, type Presentation } from "../scene/HouseScene";

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

function useCompactRenderer() {
  const query = "(pointer: coarse), (max-width: 760px)";
  const [compact, setCompact] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
}

function WebglFallback({ onUnavailable }: { onUnavailable: () => void }) {
  useEffect(() => onUnavailable(), [onUnavailable]);
  return <div className="webgl-fallback" role="alert">This walkthrough needs a browser with WebGL enabled.</div>;
}

export function App() {
  const [activeLevel, setActiveLevel] = useState<LevelFilter>("all");
  const [debug, setDebug] = useState(false);
  const [view, setView] = useState<CameraView>(initialCameraView);
  const [mode, setMode] = useState<"walkthrough" | "inspect">("walkthrough");
  const [pointerLocked, setPointerLocked] = useState(false);
  const [presentation, setPresentation] = useState<Presentation>("day");
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneUnavailable, setSceneUnavailable] = useState(false);
  const [started, setStarted] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [location, setLocation] = useState("Front gate");
  const compactRenderer = useCompactRenderer();
  const mobileInput = useRef<MobileInput>({ forward: 0, strafe: 0, lookX: 0, lookY: 0 });
  const checks = validateHouseSpec(houseSpec);
  const allChecksPass = checks.every((check) => check.passed);
  const routeCheck = validateWalkthroughRoute();
  const onPointerLockChange = useCallback((locked: boolean) => setPointerLocked(locked), []);
  const onLocationChange = useCallback((nextLocation: string) => setLocation(nextLocation), []);
  const markSceneUnavailable = useCallback(() => setSceneUnavailable(true), []);
  const resetPosition = useCallback(() => setResetToken((current) => current + 1), []);
  const isEvening = presentation === "evening";
  const palette = isEvening
    ? { background: "#101a25", fogNear: 24, fogFar: 76, sky: "#263d52", ground: "#152019", hemisphere: 0.55, ambient: 0.16, sun: 0.72, sunColor: "#a9c4e4", exposure: 0.88 }
    : { background: "#d8e4e5", fogNear: 42, fogFar: 98, sky: "#f4f0e8", ground: "#5d705b", hemisphere: 2.05, ambient: 0.38, sun: 3.1, sunColor: "#fff0d8", exposure: 1.05 };

  return (
    <SceneErrorBoundary>
      <main className="app-shell">
        <Canvas
          shadows={compactRenderer ? "basic" : "soft"}
          dpr={compactRenderer ? [1, 1] : [1, 1.5]}
          camera={{ position: cameraPositions.perspective, fov: 38 }}
          gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: palette.exposure }}
          onCreated={() => setSceneReady(true)}
          fallback={<WebglFallback onUnavailable={markSceneUnavailable} />}
        >
          <color attach="background" args={[palette.background]} />
          <fog attach="fog" args={[palette.background, palette.fogNear, palette.fogFar]} />
          <hemisphereLight args={[palette.sky, palette.ground, palette.hemisphere]} />
          <ambientLight intensity={palette.ambient} color={isEvening ? "#697e9a" : "#fff7eb"} />
          <directionalLight position={isEvening ? [-18, 25, -12] : [18, 26, -12]} color={palette.sunColor} intensity={palette.sun} castShadow shadow-mapSize={[compactRenderer ? 1024 : 2048, compactRenderer ? 1024 : 2048]} shadow-bias={-0.00025} shadow-normalBias={0.028} shadow-camera-left={-32} shadow-camera-right={32} shadow-camera-top={32} shadow-camera-bottom={-32} />
          <HouseScene activeLevel={mode === "walkthrough" ? "all" : activeLevel} debug={debug} presentation={presentation} lowPower={compactRenderer} />
          {mode === "walkthrough" && started
            ? <PlayerController mobileInput={mobileInput} onPointerLockStateChange={onPointerLockChange} onLocationChange={onLocationChange} compactControls={compactRenderer} resetToken={resetToken} />
            : <CameraInspector view={view} />}
          {debug && mode === "inspect" ? <gridHelper args={[60, 60, "#7a8b7b", "#b5c4b6"]} position={[6, 0.01, 9]} /> : null}
        </Canvas>

        {started ? <div className="presentation-toggle" aria-label="Presentation mode">
          <span>Light</span>
          <button className={!isEvening ? "is-active" : ""} onClick={() => setPresentation("day")}>Day</button>
          <button className={isEvening ? "is-active" : ""} onClick={() => setPresentation("evening")}>Evening</button>
        </div> : null}

        {!started ? <Landing sceneReady={sceneReady} sceneUnavailable={sceneUnavailable} onStart={() => setStarted(true)} /> : null}

        {started && mode === "walkthrough" ? (
          <WalkthroughHud
            compact={compactRenderer}
            location={location}
            pointerLocked={pointerLocked}
            onInspect={() => setMode("inspect")}
            onReset={resetPosition}
          />
        ) : started && mode === "inspect" ? (
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
        ) : null}
        {started && mode === "walkthrough" ? <MobileControls input={mobileInput} /> : null}
      </main>
    </SceneErrorBoundary>
  );
}
