import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Smartphone,
  Download,
  ArrowRight,
  QrCode,
  Sparkles,
} from "lucide-react";

const APK_BUILD_URL =
  "https://expo.dev/accounts/dummy_dummy_by_raj/projects/notemaster-mobile/builds/81c31ef8-ba7a-4a55-9fad-ddf993693c1d";

const SESSION_KEY = "notemaster_app_popup_seen_v1";
const LOCAL_KEY = "notemaster_app_popup_dismissed_v1";

export default function AppDownloadBannerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Never show popup if already on the download page
    if (location.pathname === "/download") return;

    // Check if dismissed permanently or seen in current session
    const permanentlyDismissed = localStorage.getItem(LOCAL_KEY);
    const sessionSeen = sessionStorage.getItem(SESSION_KEY);

    if (permanentlyDismissed || sessionSeen) return;

    // Small delay (900ms) after page load so it appears gracefully
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    }, 900);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isOpen || location.pathname === "/download") return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismissForever = () => {
    localStorage.setItem(LOCAL_KEY, "true");
    setIsOpen(false);
  };

  const handleNavigateToDownload = () => {
    setIsOpen(false);
    navigate("/download");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10 transition-all border animate-scale-up"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
          color: "var(--text-primary)",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(224, 144, 80, 0.15)",
              color: "var(--accent-light)",
              border: "1px solid rgba(224, 144, 80, 0.3)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>New: Android App Available</span>
          </span>
        </div>

        {/* Modal Title & Desc */}
        <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
          NoteMaster on Android 📱
        </h3>
        <p
          className="text-xs sm:text-sm leading-relaxed mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          Read notes, review interview questions, and browse hierarchical folders
          seamlessly on your phone with real-time cloud sync.
        </p>

        {/* QR Code and Highlights preview card */}
        <div
          className="rounded-xl p-3.5 mb-5 flex items-center gap-4"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            className="p-1.5 rounded-lg flex-shrink-0"
            style={{ background: "#ffffff" }}
          >
            <img
              src="/notemaster-qr.png"
              alt="QR Code"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-light)] mb-1">
              <QrCode className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Instant QR Install</span>
            </div>
            <p
              className="text-[11px] leading-snug mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Scan with your phone's camera to immediately download and install the
              standalone APK.
            </p>
            <div
              className="text-[10px] font-mono"
              style={{ color: "var(--text-secondary)" }}
            >
              v1.0.0 • No Play Store required
            </div>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleNavigateToDownload}
            className="btn-primary flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Smartphone className="w-4 h-4" />
            <span>View Download Page & QR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={APK_BUILD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-focus)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Direct APK</span>
          </a>
        </div>

        {/* Footer: Dismiss options */}
        <div className="mt-4 pt-3 flex items-center justify-between text-[11px]">
          <button
            onClick={handleDismissForever}
            className="hover:underline cursor-pointer"
            style={{ color: "var(--text-muted)" }}
          >
            Don't show again
          </button>

          <button
            onClick={handleClose}
            className="font-medium hover:underline cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
