import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { X, Smartphone, ArrowRight } from "lucide-react";

const TOAST_KEY = "notemaster_app_toast_shown_v1";

export default function AppDownloadToast() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't show toast if already on the download page
    if (location.pathname === "/download" || location.pathname === "/mobile") return;

    // Check if shown in current session
    if (sessionStorage.getItem(TOAST_KEY)) return;

    sessionStorage.setItem(TOAST_KEY, "true");

    const timer = setTimeout(() => {
      toast.custom(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              navigate("/download");
            }}
            className={`flex items-center gap-3 p-3 rounded-xl shadow-2xl cursor-pointer transition-all duration-300 group ${
              t.visible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-95"
            }`}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              maxWidth: "360px",
              boxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* QR thumbnail */}
            <div className="w-10 h-10 rounded-lg p-0.5 bg-white flex-shrink-0 flex items-center justify-center shadow-sm">
              <img
                src="/notemaster-qr.png"
                alt="QR"
                className="w-full h-full object-contain rounded"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--accent-light)] flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  NoteMaster for Android
                </span>
              </div>
              <p className="text-[11px] truncate text-[var(--text-muted)] mt-0.5">
                Tap to view QR & download the APK
              </p>
            </div>

            {/* Arrow & Close */}
            <div className="flex items-center gap-1 pl-1">
              <div className="p-1 rounded text-[var(--accent)] group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
                }}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ),
        {
          duration: 9000,
          position: "bottom-right",
        }
      );
    }, 1200);

    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return null;
}
