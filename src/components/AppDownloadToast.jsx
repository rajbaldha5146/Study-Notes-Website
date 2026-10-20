import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Smartphone, ArrowRight, Download } from "lucide-react";

export default function AppDownloadToast() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't show toast if user is already on the download page
    if (location.pathname === "/download" || location.pathname === "/mobile") {
      setVisible(false);
      return;
    }

    // Check if dismissed in this browser session
    const isDismissed = sessionStorage.getItem("notemaster_app_toast_dismissed");
    if (isDismissed) {
      return;
    }

    // Show toast after 800ms
    const timer = setTimeout(() => {
      setVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  const handleDismiss = (e) => {
    e?.stopPropagation();
    setVisible(false);
    sessionStorage.setItem("notemaster_app_toast_dismissed", "true");
  };

  const handleOpenDownload = () => {
    handleDismiss();
    navigate("/download");
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      onClick={handleOpenDownload}
      className="fixed bottom-5 right-5 z-[9999] max-w-sm w-[calc(100vw-2.5rem)] rounded-2xl shadow-2xl p-3.5 flex items-center gap-3.5 cursor-pointer transition-all duration-300 hover:scale-[1.02] border group"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border-default)",
        boxShadow: "0 20px 40px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-subtle)",
      }}
    >
      {/* Mini QR code preview */}
      <div
        className="w-12 h-12 rounded-xl p-1 flex-shrink-0 flex items-center justify-center shadow-sm"
        style={{ background: "#ffffff" }}
      >
        <img
          src="/notemaster-qr.png"
          alt="QR Code"
          className="w-full h-full object-contain rounded"
        />
      </div>

      {/* Info text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
            style={{
              background: "rgba(224, 144, 80, 0.15)",
              color: "var(--accent-light)",
            }}
          >
            Android App
          </span>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            v1.0.0
          </span>
        </div>
        <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
          NoteMaster Mobile APK
        </h4>
        <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
          Tap to view QR & install on phone →
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer flex-shrink-0"
        title="Dismiss"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
}
