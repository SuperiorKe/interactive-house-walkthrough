import { Component, type ErrorInfo, type ReactNode } from "react";

type SceneErrorBoundaryProps = {
  children: ReactNode;
};

type SceneErrorBoundaryState = { hasError: boolean };

export class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Walkthrough rendering error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="scene-error" role="alert">
          <section>
            <p className="eyebrow">RENDERING UNAVAILABLE</p>
            <h1>We could not start the 3D walkthrough.</h1>
            <p>Try reloading the page. If this persists, use a current browser with WebGL enabled.</p>
            <button className="primary-action" onClick={() => window.location.reload()}>Reload walkthrough</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
