import { Link } from "react-router-dom";
import {
  FileText,
  ArrowRight,
  Folder,
  Upload,
  Share2,
  Search,
  Sparkles,
  Lock,
  Code,
  GripVertical,
  BookOpen,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const problems = [
    {
      problem: "Notes scattered everywhere?",
      solution: "One place for all your markdown notes",
    },
    {
      problem: "Complex apps slowing you down?",
      solution: "Simple, fast, distraction-free",
    },
    {
      problem: "Can't find what you need?",
      solution: "Smart search and organization",
    },
  ];

  const features = [
    {
      icon: Folder,
      title: "Smart Folders",
      description:
        "Create folders and subfolders. Drag and drop to reorder. Organize your way.",
    },
    {
      icon: Code,
      title: "Markdown Editor",
      description:
        "Write in Markdown with live preview and syntax highlighting for code blocks.",
    },
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description:
        "Generate structured note outlines with AI. Just enter a topic and create instantly.",
    },
    {
      icon: Upload,
      title: "Bulk Import",
      description:
        "Upload multiple .md files at once. Migrate your existing notes in seconds.",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description:
        "Share individual notes or entire folders with a simple link.",
    },
    {
      icon: BookOpen,
      title: "Reading Mode",
      description:
        "Clean, distraction-free reading with progress tracking and navigation.",
    },
    {
      icon: Search,
      title: "Fast Search",
      description:
        "Search and filter across all your notes. Find what you need instantly.",
    },
    {
      icon: GripVertical,
      title: "Drag & Drop",
      description:
        "Reorder folders by dragging. Organize at the speed of thought.",
    },
    {
      icon: Lock,
      title: "Private & Secure",
      description:
        "Your notes are private by default. Secure authentication protects your data.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-900 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-lg">NoteMaster</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-neutral-400 hover:text-neutral-100 px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm mb-8">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-indigo-400">
              Markdown notes with AI-powered content generation
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your notes,
            <span className="text-indigo-400"> organized</span>
            <br />
            and <span className="text-indigo-400">searchable</span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            A clean, fast note-taking app built for developers and writers.
            Markdown support, AI generation, and smart organization. No bloat,
            just notes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Start for free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-8 py-4 rounded-xl font-semibold text-lg border border-neutral-700 transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Problem/Solution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {problems.map((item, i) => (
              <div
                key={i}
                className="text-left p-4 bg-neutral-900/50 rounded-lg border border-neutral-800"
              >
                <p className="text-sm text-neutral-400 mb-2">{item.problem}</p>
                <p className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Powerful features that help you organize, write, and share your
              notes effortlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors group"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple workflow
            </h2>
            <p className="text-lg text-neutral-400">Get started in seconds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500/20">
                <span className="text-2xl font-bold text-indigo-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                Create folders
              </h3>
              <p className="text-sm text-neutral-400">
                Organize your notes into folders and subfolders
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500/20">
                <span className="text-2xl font-bold text-indigo-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                Write or generate
              </h3>
              <p className="text-sm text-neutral-400">
                Write in Markdown or use AI to generate content
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-500/20">
                <span className="text-2xl font-bold text-indigo-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                Share & collaborate
              </h3>
              <p className="text-sm text-neutral-400">
                Share notes with a link or keep them private
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to organize your notes?
          </h2>
          <p className="text-lg text-neutral-400 mb-8">
            Join thousands of users who trust NoteMaster for their note-taking
            needs.
            <br />
            Free to start, no credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Create free account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <FileText className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-neutral-500">© 2025 NoteMaster</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <span>Made for developers and writers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
