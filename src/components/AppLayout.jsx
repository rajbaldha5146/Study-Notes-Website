import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SpotlightModal from "./SpotlightModal";
import TabBar from "./TabBar";
import { ChevronUp } from "lucide-react";

export default function AppLayout() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // Global Keyboard Shortcuts: Ctrl+K (Spotlight) & Ctrl+B (Sidebar Toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Spotlight Search: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
        return;
      }

      // Sidebar Toggle: Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll on mobile overlay
  useEffect(() => {
    if (sidebarOpen && !isDesktop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [sidebarOpen, isDesktop]);

  const mainMargin = isDesktop && sidebarOpen ? "232px" : "0";

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Top Navbar */}
      <div data-navbar style={{ position: "relative", zIndex: 50 }}>
        <Navbar
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          onOpenSpotlight={() => setSpotlightOpen(true)}
        />
      </div>

      {/* Primary Sidebar */}
      <div data-sidebar>
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      </div>

      {/* Global Spotlight Search Modal */}
      <SpotlightModal
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
      />

      {/* Main Outlet */}
      <main
        className="min-h-screen pb-16 transition-all duration-200"
        style={{
          marginLeft: mainMargin,
          position: "relative",
          zIndex: 1,
        }}
      >
        <TabBar />
        <Outlet />
      </main>

      {/* Smooth Scroll-To-Top Button */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-2.5 rounded-lg transition-all duration-200 shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--accent)",
          }}
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
