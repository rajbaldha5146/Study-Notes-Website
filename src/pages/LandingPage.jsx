import { Link } from "react-router-dom";
import { FileText, ArrowRight, CheckCircle, Github } from "lucide-react";

export default function LandingPage() {
  const features = [
    "Organize notes in folders",
    "Markdown support with syntax highlighting",
    "Present notes in slideshow mode",
    "Upload existing markdown files",
    "Search and filter notes",
    "Clean, distraction-free interface",
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-900 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">NoteMaster</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-neutral-400 hover:text-neutral-100 px-4 py-2 text-sm"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm mb-8">
            <span className="text-indigo-400">Simple note-taking for developers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Notes that
            <span className="text-indigo-400"> just work</span>
          </h1>

          <p className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto">
            A clean, fast note-taking app with Markdown support. No bloat, no
            distractions. Just your notes, organized the way you want.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-semibold text-lg"
            >
              Start for free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-8 py-4 rounded-xl font-semibold text-lg border border-neutral-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Everything you need, nothing you don't
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-neutral-900 rounded-xl border border-neutral-800"
              >
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-neutral-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-neutral-900">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-neutral-400 mb-8">
            Create your free account and start organizing your notes today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-semibold"
          >
            Create free account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <FileText className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-neutral-500">NoteMaster</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-300">
              Privacy
            </a>
            <a href="#" className="hover:text-neutral-300">
              Terms
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
