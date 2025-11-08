import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

type Props = {
  children: ReactNode;
  /** UI de repli personnalisée (optionnel) */
  fallback?: ReactNode;
  /** Callback quand on clique “Réessayer” (optionnel) */
  onReset?: () => void;
};

type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends Component<Props, State> {
  // (optionnel) on peut aussi mettre `override` ici selon ta version TS :
  // override state: State = { hasError: false, error: undefined };
  override state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  /** ⬅️ Ajout de `override` */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("💥 Erreur capturée par ErrorBoundary :", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  /** ⬅️ Ajout de `override` */
  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return (
        <div className="p-10 text-red-600 text-center">
          <h1 className="font-semibold mb-2">Une erreur s'est produite.</h1>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-2 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
