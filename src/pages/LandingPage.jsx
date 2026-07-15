import { Link } from "react-router-dom";
import {
  FileText, ArrowRight, Folder, Upload, Share2, Search,
  Sparkles, Lock, Code, GripVertical, Zap, CheckCircle2,
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
      {/* Clean subtle background */}

      {/* Navigation */}
      <nav
        className="fixed top-0 w-full z-50"
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="NoteMaster"
                className="w-7 h-7 rounded-md object-cover"
              />
              <span
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
              >
                NoteMaster
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium transition-colors px-3 py-1.5 rounded-md"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm"
                style={{ padding: "0.4rem 0.875rem" }}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium mb-8"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <Sparkles className="h-3 w-3" style={{ color: "var(--blue)" }} />
            <span>Markdown notes with AI-powered generation</span>
          </div>

          {/* Headline */}
          <h1
            className="font-bold leading-tight mb-5"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", letterSpacing: "-0.03em", color: "var(--text-primary)" }}
          >
            Your notes,{" "}
            <span style={{ color: "var(--blue-light)" }}>organized</span>
            {" "}and{" "}
            <span style={{ color: "var(--blue-light)" }}>searchable</span>
          </h1>

          <p
            className="text-base sm:text-lg mb-10 max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            A clean, fast note-taking app built for developers and writers.
            Markdown support, AI generation, and smart organization.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link
              to="/register"
              className="btn-primary inline-flex items-center justify-center gap-2"
              style={{ padding: "0.625rem 1.5rem", fontSize: "0.9375rem" }}
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary inline-flex items-center justify-center gap-2"
              style={{ padding: "0.625rem 1.5rem", fontSize: "0.9375rem" }}
            >
              Sign in
            </Link>
          </div>

          {/* Problem/Solution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {problems.map((item, i) => (
              <div
                key={i}
                className="text-left p-4 rounded-lg"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{item.problem}</p>
                <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--success)" }}>
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
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
              { n: "01", title: "Create folders", desc: "Organize your notes into folders and subfolders" },
              { n: "02", title: "Write or generate", desc: "Write in Markdown or use AI to generate content" },
              { n: "03", title: "Share & present", desc: "Share notes with a link or run slideshow mode" },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <span className="text-sm font-bold font-mono" style={{ color: "var(--blue)" }}>{step.n}</span>
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-16 px-4 sm:px-6"
        style={{
          borderTop: "1px solid var(--border-subtle)",
          zIndex: 1,
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-bold mb-3" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Ready to organize your notes?
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Free to start, no credit card required.
          </p>
          <Link
            to="/register"
            className="btn-primary inline-flex items-center gap-2"
            style={{ padding: "0.625rem 1.5rem", fontSize: "0.9375rem" }}
          >
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-6 px-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border-subtle)", zIndex: 1 }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="NoteMaster"
              className="w-6 h-6 rounded-md object-cover"
            />
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
