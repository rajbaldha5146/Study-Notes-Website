import { Link } from "react-router-dom";
import {
  FileText, ArrowRight, Folder, Upload, Share2, Search,
  Sparkles, Lock, Code, GripVertical, BookOpen, Zap, CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const problems = [
    { problem: "Notes scattered everywhere?", solution: "One vault for all your markdown notes" },
    { problem: "Complex tools slowing you down?", solution: "Simple, fast, distraction-free" },
    { problem: "Can't find what you need?", solution: "Smart search and organization" },
  ];

  const features = [
    { icon: Folder, title: "Smart Folders", description: "Create folders and subfolders. Drag and drop to reorder.", color: "#8b5cf6" },
    { icon: Code, title: "Markdown Editor", description: "Write in Markdown with live preview and syntax highlighting.", color: "#06b6d4" },
    { icon: Sparkles, title: "AI Generation", description: "Generate structured note outlines with AI in seconds.", color: "#a78bfa" },
    { icon: Upload, title: "Bulk Import", description: "Upload multiple .md files at once. Migrate in seconds.", color: "#10b981" },
    { icon: Share2, title: "Easy Sharing", description: "Share notes or entire folders with a simple link.", color: "#f59e0b" },
    { icon: BookOpen, title: "Reading Mode", description: "Clean, distraction-free reading with progress tracking.", color: "#22d3ee" },
    { icon: Search, title: "Fast Search", description: "Search and filter across all your notes instantly.", color: "#8b5cf6" },
    { icon: GripVertical, title: "Drag & Drop", description: "Reorder folders by dragging. Organize at the speed of thought.", color: "#06b6d4" },
    { icon: Lock, title: "Private & Secure", description: "Your notes are private by default. JWT-secured authentication.", color: "#f43f5e" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full"
          style={{
            width: "800px", height: "800px",
            top: "-300px", left: "-300px",
            background: "radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 65%)",
            animation: "float-slow 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "600px", height: "600px",
            top: "20%", right: "-200px",
            background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)",
            animation: "float-mid 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "500px", height: "500px",
            bottom: "10%", left: "20%",
            background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)",
            animation: "float-slow 30s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Navigation */}
      <nav
        className="fixed top-0 w-full z-50"
        style={{
          background: "rgba(7,12,24,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #6d28d9, #8b5cf6, #06b6d4)",
                  boxShadow: "0 0 12px rgba(139,92,246,0.4)",
                }}
              >
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span
                className="font-bold text-lg"
                style={{
                  background: "linear-gradient(135deg, #f1f5f9, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                NoteMaster
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm"
                style={{ padding: "0.45rem 1.125rem" }}
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Pill badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--cyan)", boxShadow: "0 0 6px rgba(6,182,212,0.8)", animation: "pulse-glow 2s ease-in-out infinite" }}
            />
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--violet-light)" }} />
            <span style={{ color: "var(--violet-light)" }}>Markdown notes with AI-powered generation</span>
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold leading-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "-0.04em" }}
          >
            Your notes,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--violet-light), var(--cyan-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              organized
            </span>
            <br />
            and{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--cyan-light), var(--violet-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              searchable
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            A clean, fast note-taking app built for developers and writers.
            Markdown support, AI generation, and smart organization. No bloat, just notes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              to="/register"
              className="btn-primary inline-flex items-center justify-center gap-2 text-lg"
              style={{ padding: "0.875rem 2rem", borderRadius: "0.75rem" }}
            >
              Start for free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary inline-flex items-center justify-center gap-2 text-lg"
              style={{ padding: "0.875rem 2rem", borderRadius: "0.75rem" }}
            >
              Sign in
            </Link>
          </div>

          {/* Problem/Solution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {problems.map((item, i) => (
              <div
                key={i}
                className="text-left p-4 rounded-xl"
                style={{
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid var(--border-subtle)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>{item.problem}</p>
                <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "#6ee7b7" }}>
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        className="relative py-20 px-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border-subtle)", zIndex: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="font-extrabold mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em" }}
            >
              Everything you need
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Powerful features that help you organize, write, and share effortlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl group transition-all duration-300 cursor-default"
                style={{
                  background: `linear-gradient(135deg, var(--bg-card) 0%, ${feature.color}08 100%)`,
                  border: "1px solid var(--border-subtle)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${feature.color}30`;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 24px ${feature.color}12`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-200"
                  style={{
                    background: `${feature.color}15`,
                    border: `1px solid ${feature.color}25`,
                  }}
                >
                  <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="relative py-20 px-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border-subtle)", zIndex: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-extrabold mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em" }}>
              Simple workflow
            </h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>Get started in seconds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "1", title: "Create folders", desc: "Organize your notes into folders and subfolders", color: "var(--violet)" },
              { n: "2", title: "Write or generate", desc: "Write in Markdown or use AI to generate content", color: "var(--cyan)" },
              { n: "3", title: "Share & present", desc: "Share notes with a link or run slideshow mode", color: "#10b981" },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: `${step.color}12`,
                    border: `1px solid ${step.color}30`,
                    boxShadow: `0 0 24px ${step.color}20`,
                  }}
                >
                  <span className="text-2xl font-extrabold" style={{ color: step.color }}>{step.n}</span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-20 px-4 sm:px-6"
        style={{
          borderTop: "1px solid var(--border-subtle)",
          zIndex: 1,
          background: "linear-gradient(135deg, rgba(109,40,217,0.06) 0%, rgba(6,182,212,0.04) 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-extrabold mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em" }}>
            Ready to organize your notes?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Join thousands of users who trust NoteMaster.<br />
            Free to start, no credit card required.
          </p>
          <Link
            to="/register"
            className="btn-primary inline-flex items-center gap-2 text-lg"
            style={{ padding: "0.875rem 2.25rem", borderRadius: "0.875rem" }}
          >
            Create free account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-8 px-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border-subtle)", zIndex: 1 }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6d28d9, #06b6d4)" }}
            >
              <BookOpen className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>© 2025 NoteMaster</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
            <span>Made for developers and writers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
