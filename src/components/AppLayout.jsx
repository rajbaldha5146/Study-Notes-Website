import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

/**
 * Reusable layout component for authenticated app pages
 * Eliminates code duplication from App.jsx
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-x-hidden">
      {/* Animated floating gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary blob - Blue */}
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl top-1/4 left-1/4 animate-blob" />
        
        {/* Secondary blob - Purple */}
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        {/* Tertiary blob - Emerald */}
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        {/* Quaternary blob - Pink */}
        <div className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-6000" />

        {/* Subtle grid overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Navbar with dynamic backdrop */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <main
        className={`
          relative z-10 min-h-screen
          transition-all duration-300 ease-in-out
          lg:ml-64
          pt-20 sm:pt-24
          px-4 sm:px-6 lg:px-8
          pb-8 sm:pb-12
        `}
      >
        {/* Content backdrop for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/20 to-gray-950/40 pointer-events-none" />
        
        {/* Actual content */}
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>

      {/* Scroll to top button */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 lg:bottom-8 lg:right-8"
          aria-label="Scroll to top"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}