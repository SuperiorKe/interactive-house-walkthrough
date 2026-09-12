type LandingProps = {
  sceneUnavailable: boolean;
  sceneReady: boolean;
  onStart: () => void;
};

type WalkthroughHudProps = {
  compact: boolean;
  location: string;
  pointerLocked: boolean;
  onInspect: () => void;
  onReset: () => void;
};

export function Landing({ sceneUnavailable, sceneReady, onStart }: LandingProps) {
  return (
    <section className="landing-overlay" aria-label="Walkthrough introduction">
      <div className="landing-card">
        <p className="eyebrow">ARCHITECTURAL WALKTHROUGH</p>
        <h1>Explore the residence at your own pace.</h1>
        <p>Walk from the front gate through the living spaces, stair core and pool terrace. Use the inspector whenever you want to compare the model’s structure.</p>
        <div className="landing-features" aria-label="Walkthrough highlights">
          <span>First person</span>
          <span>Day / evening</span>
          <span>Mobile ready</span>
        </div>
        <button className="primary-action" onClick={onStart} disabled={!sceneReady}>
          {sceneReady ? "Begin walkthrough" : sceneUnavailable ? "WebGL unavailable" : "Preparing scene…"}
        </button>
        <p className="landing-note">{sceneUnavailable ? "Use a current browser with WebGL enabled, then reload this page." : "Desktop: click, then use WASD and mouse. Mobile: use the on-screen MOVE and LOOK controls."}</p>
      </div>
    </section>
  );
}

export function WalkthroughHud({ compact, location, pointerLocked, onInspect, onReset }: WalkthroughHudProps) {
  return (
    <aside className="walkthrough-hud" aria-label="Walkthrough controls">
      <div className="hud-heading">
        <div>
          <p className="eyebrow">RESIDENCE WALKTHROUGH</p>
          <strong>{location}</strong>
        </div>
        <span className="location-dot" aria-hidden="true" />
      </div>
      <p className="hud-instruction">
        {compact
          ? "Use MOVE to walk and LOOK to turn."
          : pointerLocked
            ? "WASD / arrows move · mouse looks · Esc releases"
            : "Click the scene, then use WASD / arrows and mouse."}
      </p>
      <div className="hud-actions">
        <button onClick={onReset}>Reset position</button>
        <button onClick={onInspect}>Inspect structure</button>
      </div>
      <details className="controls-details">
        <summary>Route & controls</summary>
        <p>Gate → drive → entry → stair core → upper floors → pool terrace.</p>
      </details>
    </aside>
  );
}
