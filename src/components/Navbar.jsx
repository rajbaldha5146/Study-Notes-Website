import { Link, useLocation } from "react-router-dom";
import { Plus, Home, LogOut, Menu, X } from "lucide-react";
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
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
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

  useEffect(() => {
    setShowUserMenu(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          scrolled
            ? "bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800"
            : "bg-neutral-950 border-b border-neutral-900"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                aria-label="Toggle sidebar"
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Logo */}
              <Link to="/app" className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">N</span>
                </div>
                <span className="text-base font-semibold text-neutral-100 hidden sm:block">
                  NoteMaster
                </span>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Home Link */}
              <Link
                to="/app"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive("/app")
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Home</span>
              </Link>

              {/* New Note Button */}
              <Link
                to="/app/create"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Note</span>
              </Link>

              {/* User Menu */}
              <div className="relative ml-2">
                <button
                  ref={buttonRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                    showUserMenu
                      ? "bg-neutral-800"
                      : "hover:bg-neutral-800"
                  }`}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center text-neutral-200 text-xs font-semibold">
                    {getUserInitials()}
                  </div>
                  <span className="hidden md:block text-sm text-neutral-300 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <svg
                    className={`hidden sm:block w-4 h-4 text-neutral-500 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40 sm:hidden"
                      onClick={() => setShowUserMenu(false)}
                    />

                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                      role="menu"
                    >
                      {/* User Info */}
                      <div className="px-4 py-4 border-b border-neutral-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center text-neutral-200 text-sm font-semibold">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-100 truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
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
