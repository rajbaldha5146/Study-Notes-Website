import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents entire app from crashing when a component fails
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "var(--bg-base)" }}
        >
          <div
            className="max-w-md w-full rounded-xl p-8 text-center"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <AlertTriangle
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: "var(--danger)" }}
            />
            <h1
              className="font-serif text-2xl font-normal tracking-tight mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh Page
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary
                  className="cursor-pointer text-xs transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  Error Details (Dev Only)
                </summary>
                <pre
                  className="mt-2 text-xs p-3 rounded-lg overflow-auto max-h-48 font-mono"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--danger)",
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
