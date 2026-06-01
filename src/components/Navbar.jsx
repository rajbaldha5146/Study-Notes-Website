import { Link, useLocation } from "react-router-dom";
import { Plus, Home, LogOut, Menu, X, BookOpen } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return user.name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showUserMenu &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showUserMenu) {
        setShowUserMenu(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showUserMenu]);

  useEffect(() => { setShowUserMenu(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        style={{
          background: scrolled
            ? "rgba(7, 12, 24, 0.95)"
            : "rgba(7, 12, 24, 0.98)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: "1px solid transparent",
          backgroundImage: scrolled
            ? `linear-gradient(rgba(7,12,24,0.95), rgba(7,12,24,0.95)), linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.4) 30%, rgba(6,182,212,0.4) 70%, transparent 100%)`
            : "none",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      >
        {/* Aurora bottom border line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.5) 25%, rgba(6,182,212,0.5) 75%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "aurora-shift 4s ease infinite",
          }}
        />

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left */}
            <div className="flex items-center gap-4">
              {/* Mobile toggle */}
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                aria-label="Toggle sidebar"
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Logo */}
              <Link to="/app" className="flex items-center gap-2.5 group">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #6d28d9, #8b5cf6, #06b6d4)",
                    boxShadow: "0 0 12px rgba(139,92,246,0.4)",
                  }}
                >
                  <BookOpen className="h-4 w-4 text-white relative z-10" />
                </div>
                <span
                  className="text-base font-bold hidden sm:block"
                  style={{
                    background: "linear-gradient(135deg, #f1f5f9, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  NoteMaster
                </span>
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Home Link */}
              <Link
                to="/app"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-500 transition-all duration-200 ${
                  isActive("/app")
                    ? "text-violet-300 bg-violet-500/10 border border-violet-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline font-medium">Home</span>
              </Link>

              {/* New Note Button */}
              <Link
                to="/app/create"
                className="btn-primary flex items-center gap-2 text-sm"
                style={{ padding: "0.45rem 0.875rem" }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Note</span>
              </Link>

              {/* User Menu */}
              <div className="relative ml-1">
                <button
                  ref={buttonRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                    showUserMenu ? "bg-slate-800/70" : "hover:bg-slate-800/50"
                  }`}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #6d28d9, #06b6d4)",
                      boxShadow: showUserMenu ? "0 0 0 2px rgba(139,92,246,0.5)" : "none",
                    }}
                  >
                    {getUserInitials()}
                  </div>
                  <span className="hidden md:block text-sm text-slate-300 max-w-[100px] truncate font-medium">
                    {user?.name}
                  </span>
                  <svg
                    className={`hidden sm:block w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40 sm:hidden"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-64 z-50 overflow-hidden"
                      style={{
                        background: "rgba(11, 17, 32, 0.95)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(26, 37, 64, 0.8)",
                        borderRadius: "0.875rem",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.08)",
                      }}
                      role="menu"
                    >
                      {/* User Info */}
                      <div
                        className="px-4 py-4"
                        style={{ borderBottom: "1px solid rgba(26, 37, 64, 0.8)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #6d28d9, #06b6d4)" }}
                          >
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1.5 px-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/8 rounded-lg transition-all duration-150"
                          role="menuitem"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}
