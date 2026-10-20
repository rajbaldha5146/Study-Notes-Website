import { Loader2 } from "lucide-react";

/**
 * Unified loading component for the entire app.
 *
 * Variants:
 *   - "page"    (default) — Full centered spinner with message, used for page loads
 *   - "spinner" — Small inline spinner, used inside buttons or inline contexts
 *   - "skeleton" — Pulsing skeleton block (pass width/height via className)
 */
export default function Loader({ variant = "page", message = "Loading...", className = "" }) {
  if (variant === "skeleton") {
    return <div className={`skeleton ${className}`} />;
  }

  if (variant === "spinner") {
    return (
      <Loader2
        className={`animate-spin ${className || "h-4 w-4"}`}
        style={{ color: "var(--accent)" }}
      />
    );
  }

  // Default: "page" — centered full-width spinner
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin mb-4"
        style={{
          borderColor: "var(--border-default)",
          borderTopColor: "var(--accent)",
        }}
      />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {message}
      </p>
    </div>
  );
}
