import { Link, useLocation } from "react-router-dom";
import { Plus, Home, LogOut, PanelLeft } from "lucide-react";
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
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          transition: "border-color 0.2s ease",
        }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="px-3 sm:px-4">
          <div className="flex justify-between items-center h-12">
            {/* Left */}
            <div className="flex items-center gap-1">
              {/* Sidebar toggle — always visible */}
              <button
                id="sidebar-toggle-btn"
                onClick={onToggleSidebar}
                className="p-2 rounded-md transition-colors"
                style={{
                  color: sidebarOpen ? "var(--text-primary)" : "var(--text-muted)",
                  background: sidebarOpen ? "var(--bg-elevated)" : "transparent",
                }}
                aria-label="Toggle sidebar"
                aria-expanded={sidebarOpen}
                title="Toggle sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>

              {/* Logo */}
              <Link to="/app" className="flex items-center gap-2 ml-1 group">
                <img
                  src="/logo.png"
                  alt="NoteMaster"
                  className="w-7 h-7 rounded-md object-cover"
                  style={{ display: "block" }}
                />
                <span
                  className="text-sm font-semibold hidden sm:block"
                  style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
                >
                  NoteMaster
                </span>
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1.5">
              {/* Home Link */}
              <Link
                to="/app"
                id="nav-home-link"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: isActive("/app") ? "var(--text-primary)" : "var(--text-muted)",
                  background: isActive("/app") ? "var(--bg-elevated)" : "transparent",
                }}
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Home</span>
              </Link>

              {/* New Note Button */}
              <Link
                to="/app/create"
                id="nav-new-note-btn"
                className="btn-primary flex items-center gap-1.5 text-xs"
                style={{ padding: "0.4rem 0.75rem" }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Note</span>
              </Link>

              {/* User Menu */}
              <div className="relative ml-0.5">
                <button
                  ref={buttonRef}
                  id="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors"
                  style={{
                    background: showUserMenu ? "var(--bg-elevated)" : "transparent",
                    color: "var(--text-secondary)",
                  }}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {getUserInitials()}
                  </div>
                  <span className="hidden md:block text-xs max-w-[90px] truncate font-medium" style={{ color: "var(--text-secondary)" }}>
                    {user?.name}
                  </span>
                  <svg
                    className={`hidden sm:block w-3 h-3 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div
                      ref={menuRef}
                      id="user-dropdown-menu"
                      className="absolute right-0 mt-1.5 w-56 z-50 overflow-hidden"
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      }}
                      role="menu"
                    >
                      {/* User Info */}
                      <div
                        className="px-3 py-3"
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-default)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(248, 81, 73, 0.08)";
                            e.currentTarget.style.color = "#f85149";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                          role="menuitem"
                        >
                          <LogOut className="h-3.5 w-3.5" />
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
      <div className="h-12" />
    </>
  );
}
