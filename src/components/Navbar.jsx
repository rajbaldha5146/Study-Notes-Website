import { Link, useLocation } from "react-router-dom";
import { Plus, Home, LogOut, PanelLeft, ChevronDown, Sun, Moon, Search, Keyboard, Smartphone } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";
import ShortcutsModal from "./ShortcutsModal";

export default function Navbar({ onToggleSidebar, sidebarOpen, onOpenSpotlight }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
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

      // Quick hotkey '?' to toggle shortcuts modal (ignored inside inputs/textareas)
      if (
        event.key === "?" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) &&
        !document.activeElement?.isContentEditable
      ) {
        setShortcutsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showUserMenu]);

  useEffect(() => {
    setShowUserMenu(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
        className="fixed top-0 left-0 right-0 z-50 transition-colors"
      >
        <div className="px-3 sm:px-5">
          <div className="flex justify-between items-center h-14">
            {/* Left Slot: Toggle & Brand */}
            <div className="flex items-center gap-1.5">
              <button
                id="sidebar-toggle-btn"
                onClick={onToggleSidebar}
                className="p-2 rounded-lg transition-colors cursor-pointer"
                style={{
                  color: sidebarOpen ? "var(--accent)" : "var(--text-muted)",
                  background: sidebarOpen ? "var(--bg-elevated)" : "transparent",
                }}
                aria-label="Toggle sidebar (Ctrl+B)"
                aria-expanded={sidebarOpen}
                title="Toggle sidebar (Ctrl+B)"
              >
                <PanelLeft className="h-4 w-4" />
              </button>

              <Link to="/app" className="flex items-center gap-2.5 ml-1 group">
                <img
                  src="/logo.png"
                  alt="NoteMaster"
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-[var(--border-default)] transition-transform group-hover:scale-105"
                />
                <span
                  className="text-sm font-bold hidden sm:block tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  NoteMaster
                </span>
              </Link>
            </div>

            {/* Middle / Center: Spotlight Search Trigger */}
            <div className="flex-1 max-w-md mx-3 hidden sm:flex items-center">
              <button
                type="button"
                onClick={onOpenSpotlight}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer group"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-focus)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
                title="Search notes and commands (Ctrl+K)"
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-3.5 h-3.5 group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
                  <span className="truncate">Search notes, notebooks, commands...</span>
                </div>
                <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <kbd className="font-sans font-medium">Ctrl</kbd>&nbsp;K
                  </span>
                </div>
              </button>
            </div>

            {/* Right Slot: Navigation Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Spotlight Trigger */}
              <button
                type="button"
                onClick={onOpenSpotlight}
                className="sm:hidden p-2 rounded-lg transition-colors cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                title="Search (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
              </button>

              <Link
                to="/app"
                id="nav-home-link"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                style={{
                  color: isActive("/app") ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive("/app") ? "var(--bg-elevated)" : "transparent",
                  border: isActive("/app") ? "1px solid var(--border-subtle)" : "1px solid transparent",
                }}
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>

              <Link
                to="/app/create"
                id="nav-new-note-btn"
                className="btn-primary flex items-center gap-1.5 text-xs font-semibold"
                style={{ padding: "0.45rem 0.85rem" }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Note</span>
              </Link>

              {/* Mobile App Link */}
              <Link
                to="/download"
                id="nav-mobile-app-link"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: "rgba(224, 144, 80, 0.12)",
                  border: "1px solid rgba(224, 144, 80, 0.3)",
                  color: "var(--accent-light)",
                }}
                title="Download NoteMaster Android APK"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Android App</span>
              </Link>

              {/* User Dropdown Trigger */}
              <div className="relative ml-1">
                <button
                  ref={buttonRef}
                  id="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer"
                  style={{
                    background: showUserMenu ? "var(--bg-elevated)" : "transparent",
                    border: "1px solid",
                    borderColor: showUserMenu ? "var(--border-default)" : "transparent",
                  }}
                  aria-label="User profile menu"
                  aria-expanded={showUserMenu}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: "rgba(224, 144, 80, 0.15)",
                      border: "1px solid rgba(224, 144, 80, 0.35)",
                      color: "var(--accent-light)",
                    }}
                  >
                    {getUserInitials()}
                  </div>
                  <span
                    className="hidden md:block text-xs font-medium max-w-[100px] truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {user?.name || "Account"}
                  </span>
                  <ChevronDown
                    className={`hidden sm:block w-3.5 h-3.5 transition-transform duration-200 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    style={{ color: "var(--text-muted)" }}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div
                      ref={menuRef}
                      id="user-dropdown-menu"
                      className="absolute right-0 mt-2 w-60 z-50 rounded-xl overflow-hidden shadow-2xl animate-fade-in"
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-default)",
                      }}
                      role="menu"
                    >
                      <div
                        className="p-3.5"
                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      >
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {user?.name}
                        </p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {user?.email}
                        </p>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        {/* Theme Toggle */}
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-hover)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                          role="menuitem"
                        >
                          <div className="flex items-center gap-2">
                            {isDark ? (
                              <Sun className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                            ) : (
                              <Moon className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                            )}
                            <span>{isDark ? "Light mode" : "Dark mode"}</span>
                          </div>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase"
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {isDark ? "Dark" : "Light"}
                          </span>
                        </button>

                        {/* Keyboard Shortcuts Info Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            setShortcutsOpen(true);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-hover)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                          role="menuitem"
                        >
                          <div className="flex items-center gap-2">
                            <Keyboard className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                            <span>Keyboard Shortcuts</span>
                          </div>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-muted)",
                            }}
                          >
                            ?
                          </span>
                        </button>

                        {/* Mobile App Download Link in Dropdown */}
                        <Link
                          to="/download"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-hover)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                          role="menuitem"
                        >
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                            <span>Android App (APK)</span>
                          </div>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase"
                            style={{
                              background: "rgba(34, 197, 94, 0.15)",
                              border: "1px solid rgba(34, 197, 94, 0.3)",
                              color: "#4ade80",
                            }}
                          >
                            v1.0
                          </span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(217, 91, 78, 0.12)";
                            e.currentTarget.style.color = "var(--danger)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                          role="menuitem"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Sign Out</span>
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

      {/* Spacer to offset fixed 56px (h-14) nav */}
      <div className="h-14" />

      {/* Keyboard Shortcuts Reference Modal */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
}
