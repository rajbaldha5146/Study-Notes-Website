import { Link } from "react-router-dom";
import {
  ArrowRight, Folder, Upload, Share2, Search,
  Lock, Code, GripVertical, CheckCircle2, BookOpen, Smartphone,
} from "lucide-react";

export default function LandingPage() {
  const problems = [
    { problem: "Notes scattered everywhere?", solution: "One focused vault for all markdown docs" },
    { problem: "Clunky bloated tools slowing you down?", solution: "Instant keyboard-first writing flow" },
    { problem: "Can't find critical code or snippets?", solution: "Full-text heading and content search" },
  ];

  const features = [
    { icon: Folder, title: "Structured Folders", description: "Organize notebooks and nested subfolders with drag-and-drop hierarchy." },
    { icon: Code, title: "Markdown Studio", description: "Dual split-pane and live preview with instant syntax highlighting." },
    { icon: BookOpen, title: "Serif Reading Mode", description: "Distraction-free night reading with scroll tracking and Table of Contents." },
    { icon: Upload, title: "Bulk Markdown Import", description: "Drag and drop entire folders of .md files. Migrate your knowledge in seconds." },
    { icon: Share2, title: "Seamless Sharing", description: "Create secure public links for single notes or entire folder directories." },
    { icon: Search, title: "Global Instant Search", description: "Search by note titles, markdown headings, or keywords in milliseconds." },
    { icon: GripVertical, title: "Visual Reordering", description: "Freely rearrange notes and folders with smooth drag handles." },
    { icon: Lock, title: "Encrypted & Private", description: "Your notes belong to you. Secure JWT-based isolation." },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Top Navigation */}
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-md"
        style={{
          background: "rgba(26, 22, 20, 0.85)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="NoteMaster"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-[var(--border-default)]"
              />
              <span
                className="font-bold text-sm tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                NoteMaster
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                to="/download"
                className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                style={{
                  color: "var(--accent-light)",
                  background: "rgba(224, 144, 80, 0.12)",
                  border: "1px solid rgba(224, 144, 80, 0.3)",
                }}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Android App</span>
              </Link>
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg transition-all"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary text-xs sm:text-sm"
                style={{ padding: "0.45rem 1rem" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Subtle Accent Pill */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(224, 144, 80, 0.1)",
              border: "1px solid rgba(224, 144, 80, 0.25)",
              color: "var(--accent-light)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>Refined Markdown Vault for Thinkers & Developers</span>
          </div>

          {/* Editorial Headline */}
          <h1
            className="font-extrabold leading-[1.15] mb-6 tracking-tight"
            style={{
              fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)",
              color: "var(--text-primary)",
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            Your thoughts, <br className="hidden sm:inline" />
            <span style={{ color: "var(--accent-light)", fontStyle: "italic" }}>beautifully written</span> and remembered.
          </h1>

          <p
            className="text-base sm:text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            A warm, distraction-free markdown workspace crafted for extended reading, structured code notes, and friction-free organization.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              to="/register"
              className="btn-primary inline-flex items-center justify-center gap-2 shadow-lg"
              style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}
            >
              Open Your Vault
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary inline-flex items-center justify-center gap-2"
              style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}
            >
              Sign In to Notebook
            </Link>
          </div>

          {/* Problem vs Solution Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {problems.map((item, i) => (
              <div
                key={i}
                className="text-left p-4 rounded-xl transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <p className="text-xs mb-2 font-medium" style={{ color: "var(--text-muted)" }}>
                  {item.problem}
                </p>
                <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        className="relative py-24 px-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-bold mb-3 tracking-tight"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: "var(--text-primary)",
              }}
            >
              Crafted for long-form reading & clarity
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              No clutter, no AI distractions. Just pure focus on knowledge capture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-5 rounded-xl transition-all duration-200 card card-hover flex flex-col justify-between"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      background: "rgba(224, 144, 80, 0.12)",
                      border: "1px solid rgba(224, 144, 80, 0.2)",
                      color: "var(--accent-light)",
                    }}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section
        className="relative py-20 px-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="font-bold mb-3 tracking-tight"
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: "var(--text-primary)",
              }}
            >
              The 3-Step Workspace
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Organize once, reference effortlessly forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Organize Folders", desc: "Build topical notebooks with custom icons, colors, and subdirectories." },
              { n: "02", title: "Write in Markdown", desc: "Code, notes, checklists, and rich tables in comfortable warm serif typography." },
              { n: "03", title: "Share or Present", desc: "Generate clean read-only links or present in full-screen slide deck mode." },
            ].map((step) => (
              <div
                key={step.n}
                className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 font-mono font-bold text-xs"
                  style={{
                    background: "rgba(224, 144, 80, 0.12)",
                    color: "var(--accent-light)",
                  }}
                >
                  {step.n}
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="relative py-20 px-4 sm:px-6 text-center"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-xl mx-auto">
          <h2
            className="font-bold mb-3 tracking-tight"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: "var(--text-primary)",
            }}
          >
            Ready to upgrade your reading & note setup?
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Free to start, no cards required.
          </p>
          <Link
            to="/register"
            className="btn-primary inline-flex items-center gap-2 text-sm shadow-md"
            style={{ padding: "0.75rem 1.75rem" }}
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NoteMaster" className="w-5 h-5 rounded object-cover" />
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              NoteMaster &copy; {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            A handcrafted study & notes environment for developers and authors.
          </p>
        </div>
      </footer>
    </div>
  );
}
