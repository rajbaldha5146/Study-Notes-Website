import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Heart,
  Coffee,
  Rocket,
  Github,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-rotate screenshots every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const screenshots = [
    {
      url: "https://res.cloudinary.com/dlyqtgjaz/image/upload/v1760699822/2_eiejrq.png",
      title: "Split-screen magic ✨",
    },
    {
      url: "https://res.cloudinary.com/dlyqtgjaz/image/upload/v1760699822/1_yn4jbl.png",
      title: "Your brain, organized 🧠",
    },
    {
      url: "https://res.cloudinary.com/dlyqtgjaz/image/upload/v1760699822/3_jx7okp.png",
      title: "Highlight like a boss 🎨",
    },
  ];

  const realReviews = [
    {
      text: "Honestly, this is what Notion should've been",
      author: "Jake",
      role: "Dev",
    },
    {
      text: "I'm not going back to my old app, sorry not sorry",
      author: "Maya",
      role: "Designer",
    },
    {
      text: "Finally! An app that doesn't make me want to throw my laptop",
      author: "Alex",
      role: "Writer",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Floating gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          style={{
            top: mousePosition.y / 10,
            left: mousePosition.x / 10,
            transition: "all 0.3s ease-out",
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation - Minimal & Modern */}
      <nav className="fixed top-0 w-full bg-gray-950/50 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-gray-900 p-1.5 sm:p-2 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold">NoteMaster</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/login"
                className="text-gray-400 hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-800/50 transition-all text-sm sm:text-base"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                Try it free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Asymmetric & Bold */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                <span className="text-blue-300">Used by 10k+ note-takers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                Notes that
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  don't suck
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed">
                Look, we get it. You've tried every notes app out there. They're
                either too complicated or too basic.
                <span className="text-white font-medium">
                  {" "}
                  This one's different.
                </span>{" "}
                Promise.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Link
                  to="/register"
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg overflow-hidden transform hover:scale-105 transition-all text-center"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get started - it's free
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 pt-2 sm:pt-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  <span>Setup in 30 seconds</span>
                </div>
              </div>
            </div>

            {/* Screenshot Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-500"></div>
                </div>

                <div className="relative aspect-video">
                  {screenshots.map((shot, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        activeTab === idx ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <img
                        src={shot.url}
                        alt={shot.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 p-4 bg-gray-800/30">
                  {screenshots.map((shot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === idx
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Organic */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 border-y border-gray-800/50 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              <span>10,247 happy users</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-amber-400" />
              <span>500k+ notes created</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-blue-400" />
              <span>99.9% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-purple-400" />
              <span>Open source friendly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Card Grid */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Everything you actually need.
              <br className="hidden sm:block" />
              <span className="text-gray-500">Nothing you don't.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Feature Card 1 */}
            <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-blue-500/50 transition-all">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-3xl sm:text-4xl">✍️</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 pr-10">
                Markdown that just works
              </h3>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
                Write in plain markdown. See it render beautifully in real-time.
                No learning curve, no BS.
              </p>
              <div className="inline-flex items-center gap-2 text-blue-400 text-xs sm:text-sm font-medium">
                <span>Try the editor</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-purple-500/50 transition-all">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-3xl sm:text-4xl">📂</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 pr-10">
                Folders that make sense
              </h3>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
                Organize your chaos into clean folders. Add icons, colors,
                whatever. Make it yours.
              </p>
              <div className="inline-flex items-center gap-2 text-purple-400 text-xs sm:text-sm font-medium">
                <span>See organization</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-green-500/50 transition-all">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-3xl sm:text-4xl">🔍</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 pr-10">
                Search that's actually fast
              </h3>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
                Find anything in milliseconds. Search titles, content, tags -
                all your notes, instantly.
              </p>
              <div className="inline-flex items-center gap-2 text-green-400 text-xs sm:text-sm font-medium">
                <span>Test search speed</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-pink-500/50 transition-all">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-3xl sm:text-4xl">⚡</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 pr-10">Upload & forget</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
                Drag your .md files in. Done. We'll handle the rest. No weird
                import process.
              </p>
              <div className="inline-flex items-center gap-2 text-pink-400 text-xs sm:text-sm font-medium">
                <span>Upload now</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Honest Section */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4">
            Why people switch to us
          </h2>
          <p className="text-sm sm:text-base text-gray-400 text-center mb-8 sm:mb-12">
            Real reasons from real people (we didn't pay them, we swear)
          </p>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                reason: "Other apps are bloated with features I never use",
                emoji: "🎯",
              },
              {
                reason:
                  "Notion is great but I just need notes, not a whole workspace",
                emoji: "📝",
              },
              {
                reason: "Apple Notes doesn't support markdown properly",
                emoji: "🍎",
              },
              {
                reason:
                  "I wanted something that feels like it's made for developers",
                emoji: "👨‍💻",
              },
              { reason: "Honestly? The UI just looks better", emoji: "✨" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 sm:gap-4 bg-gray-800/50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-gray-700/50 hover:border-gray-600 transition-all"
              >
                <span className="text-xl sm:text-2xl">{item.emoji}</span>
                <p className="text-sm sm:text-base lg:text-lg text-gray-300 flex-1">{item.reason}</p>
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0 mt-0.5 sm:mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Real & Raw */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Don't just take our word for it
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {realReviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-800"
              >
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 italic">"{review.text}"</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm sm:text-base">
                    {review.author[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{review.author}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Simple & Clear */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl sm:rounded-3xl border border-blue-500/20 p-6 sm:p-8 lg:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-green-400" />
              <span className="text-green-300 font-medium">
                Limited Time Offer
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
              <span className="line-through text-gray-600">$9.99</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                FREE
              </span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8">
              Yeah, you read that right. Everything's free while we're in beta.
              <br className="hidden sm:block" />
              No catches, no hidden fees, no credit card required.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 text-left">
              {[
                "Unlimited notes & folders",
                "All features unlocked",
                "Priority support",
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl font-bold text-base sm:text-lg lg:text-xl hover:shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 transition-all"
            >
              Claim your free account
              <Rocket className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>

            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              Join 10k+ users already using NoteMaster
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA - FOMO */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-gradient-to-t from-gray-900/50 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Still reading? 🤔
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8">
            While you're here, 23 people just created their first note.
            <br className="hidden sm:block" />
            Don't get left behind.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl"
          >
            Alright, I'm in
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-gray-800 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">NoteMaster</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/login" className="hover:text-white transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-white transition-colors"
              >
                Sign up
              </Link>
              <span>Made with 💙 for note-takers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
