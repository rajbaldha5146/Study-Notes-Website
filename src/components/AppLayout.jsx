import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { ChevronUp } from "lucide-react";

export default function AppLayout() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  // Sidebar: open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [scrolled, setScrolled] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      // Auto-open sidebar when transitioning to desktop
      if (desktop && !sidebarOpen) {
        // Don't auto-open if user explicitly closed it
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll on mobile when sidebar is open
  useEffect(() => {
    if (sidebarOpen && !isDesktop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [sidebarOpen, isDesktop]);

  // On desktop: sidebar pushes content. On mobile: sidebar overlays.
  const mainMargin = isDesktop && sidebarOpen ? "240px" : "0";

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
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
        className="min-h-screen pt-4 pb-12"
        style={{
          marginLeft: mainMargin,
          transition: "margin-left 0.3s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Outlet />
      </main>

      {/* Scroll to top */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-2.5 rounded-xl transition-all duration-200 shadow-xl hover:-translate-y-1 active:translate-y-0"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--blue-light)",
          }}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
