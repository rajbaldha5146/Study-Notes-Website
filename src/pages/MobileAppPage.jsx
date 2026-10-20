import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  QrCode,
  Smartphone,
  CheckCircle2,
  Code2,
  FolderTree,
  Zap,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const APK_BUILD_URL =
  "https://expo.dev/accounts/dummy_dummy_by_raj/projects/notemaster-mobile/builds/81c31ef8-ba7a-4a55-9fad-ddf993693c1d";

export default function MobileAppPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APK_BUILD_URL);
    setCopied(true);
    toast.success("Download link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="min-h-screen text-[var(--text-primary)]"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Top Navigation */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{
          background: "rgba(20, 17, 15, 0.85)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/app"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="NoteMaster"
              className="w-6 h-6 rounded-md object-cover ring-1 ring-[var(--border-default)]"
            />
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              NoteMaster Mobile
            </span>
          </div>

          <a
            href={APK_BUILD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs flex items-center gap-1.5"
            style={{ padding: "0.4rem 0.85rem" }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(224, 144, 80, 0.12)",
              color: "var(--accent-light)",
              border: "1px solid rgba(224, 144, 80, 0.3)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Android Release • v1.0.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            NoteMaster in Your Pocket
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Access all 360+ notes, interview Q&As, and hierarchical notebooks on
            your Android device with real-time cloud synchronization.
          </p>
        </div>

        {/* Hero Download Card (QR + Direct Button) */}
        <div
          className="rounded-2xl p-6 sm:p-10 mb-16 shadow-2xl relative overflow-hidden"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: "var(--accent)" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: High-Res QR Code */}
            <div className="md:col-span-5 flex flex-col items-center text-center">
              <div
                className="p-4 rounded-2xl shadow-xl transition-transform hover:scale-[1.02]"
                style={{
                  background: "#ffffff",
                  border: "2px solid var(--border-default)",
                }}
              >
                <img
                  src="/notemaster-qr.png"
                  alt="Scan QR code to download NoteMaster Android APK"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-[var(--accent-light)]">
                <QrCode className="w-4 h-4" />
                <span>Scan with your phone's camera</span>
              </div>
              <p
                className="text-[11px] mt-1 max-w-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Instantly opens the APK download link on your mobile browser.
              </p>
            </div>

            {/* Right: APK Details & Actions */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#4ade80",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  }}
                >
                  Ready to Install
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Android APK • Build #2
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                NoteMaster Android APK
              </h2>

              <p
                className="text-xs sm:text-sm leading-relaxed mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Engineered natively for smooth study sessions. Includes responsive
                markdown tables, multi-level folder exploration, syntax code
                copying, and hardware back button flow.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <a
                  href={APK_BUILD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download NoteMaster APK</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
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
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>Copy Download Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Metadata Badges */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <div>
                  <div
                    className="text-[10px] font-mono uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Version
                  </div>
                  <div className="text-xs font-bold mt-0.5">1.0.0 (Build 2)</div>
                </div>

                <div>
                  <div
                    className="text-[10px] font-mono uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    OS Requirement
                  </div>
                  <div className="text-xs font-bold mt-0.5">Android 8.0+</div>
                </div>

                <div>
                  <div
                    className="text-[10px] font-mono uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Package Size
                  </div>
                  <div className="text-xs font-bold mt-0.5">~64 MB</div>
                </div>

                <div>
                  <div
                    className="text-[10px] font-mono uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    License
                  </div>
                  <div className="text-xs font-bold mt-0.5 text-emerald-400">
                    Free • Personal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mb-16">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-center mb-8">
            Why Use the Android Mobile App?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="p-5 rounded-xl transition-all"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{
                  background: "rgba(224, 144, 80, 0.15)",
                  color: "var(--accent-light)",
                }}
              >
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm mb-1.5">Infinite Scroll Feed</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Loads 20 notes at a time and automatically fetches the next batch as
                you read. Effortless browsing across 360+ notes.
              </p>
            </div>

            <div
              className="p-5 rounded-xl transition-all"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60a5fa",
                }}
              >
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm mb-1.5">Syntax Highlighting</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Code blocks with colored syntax for JavaScript, Python, C#, and
                TypeScript, plus a 1-tap clipboard copy button.
              </p>
            </div>

            <div
              className="p-5 rounded-xl transition-all"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#c084fc",
                }}
              >
                <FolderTree className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm mb-1.5">Nested Folders Tree</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Organize subfolders hierarchically with branch indicators. Tap to
                dive deep and use your phone back gesture to navigate back.
              </p>
            </div>

            <div
              className="p-5 rounded-xl transition-all"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm mb-1.5">Real-time Cloud Sync</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Any note you write, edit, or star on your laptop is synced
                instantaneously to your phone via our MongoDB API.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Installation Guide */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Smartphone className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-lg font-bold">How to Install on Android</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                }}
              >
                1
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Download the APK</h4>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Scan the QR code with your phone or tap the Download button. The
                  browser will download the standalone APK file.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                }}
              >
                2
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Allow Unknown Sources</h4>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  If Android warns that the file is from an external source, tap{" "}
                  <strong>Settings</strong> and toggle on <em>"Allow from this source"</em>.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                }}
              >
                3
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Install & Sign In</h4>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Tap <strong>Install</strong>. Once installed, launch NoteMaster
                  and log in using your existing email & password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
