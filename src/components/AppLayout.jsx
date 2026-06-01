import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { ChevronUp } from "lucide-react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [sidebarOpen]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Ambient background blobs — fixed, decorative */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <div
          className="absolute rounded-full"
          style={{
            width: "600px",
            height: "600px",
            top: "-200px",
            left: "-200px",
            background: "radial-gradient(circle, rgba(109,40,217,0.07) 0%, transparent 70%)",
            animation: "float-slow 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            bottom: "-150px",
            right: "-150px",
            background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
            animation: "float-mid 22s ease-in-out infinite",
          }}
        />
      </div>

      {/* Navbar */}
      <div data-navbar style={{ position: "relative", zIndex: 50 }}>
        <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </div>

      {/* Sidebar */}
      <div data-sidebar>
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      </div>

      {/* Main content */}
      <main
        className="lg:ml-64 min-h-screen pt-4 pb-12"
        style={{ position: "relative", zIndex: 1 }}
      >
        <Outlet />
      </main>

      {/* Scroll to top */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, var(--violet-dark), var(--violet))",
            boxShadow: "0 4px 16px rgba(139,92,246,0.35)",
            border: "1px solid rgba(139,92,246,0.3)",
          }}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}
