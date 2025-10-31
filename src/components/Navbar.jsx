import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Plus, Home, User, LogOut, Menu, X, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const location = useLocation()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    const names = user.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showUserMenu &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showUserMenu) {
        setShowUserMenu(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showUserMenu])

  // Close user menu on route change
  useEffect(() => {
    setShowUserMenu(false)
  }, [location.pathname])

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/20 border-b border-gray-800/80'
            : 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 active:scale-95"
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
              <Link
                to="/app"
                className="group flex items-center gap-2.5 hover:opacity-90 transition-opacity"
              >
                <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:scale-105">
                  <span className="text-white text-lg">📝</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent hidden sm:block">
                  NoteMaster
                </span>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Home Link */}
              <Link
                to="/app"
                className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isActive('/app')
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline text-sm">Home</span>
                {isActive('/app') && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
                )}
              </Link>

              {/* New Note Button */}
              <Link
                to="/app/create"
                className="group relative flex items-center gap-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Plus className="h-4 w-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden sm:inline text-sm relative z-10">New Note</span>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`group flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    showUserMenu
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300">
                      {getUserInitials()}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-gray-900 rounded-full"></div>
                  </div>
                  <span className="hidden md:block text-sm font-medium truncate max-w-[120px]">
                    {user?.name}
                  </span>
                  <svg
                    className={`hidden sm:block w-4 h-4 transition-transform duration-200 ${
                      showUserMenu ? 'rotate-180' : ''
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
                    {/* Backdrop for mobile */}
                    <div
                      className="fixed inset-0 z-40 sm:hidden"
                      onClick={() => setShowUserMenu(false)}
                    ></div>

                    <div
                      ref={menuRef}
                      className={`absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-gray-700/80 z-50 overflow-hidden transform origin-top-right transition-all duration-200 ${
                        showUserMenu
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {/* User Info Header */}
                      <div className="relative px-4 py-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-b border-gray-700/80">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Profile Link (optional) */}
                       
                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-red-500/10 transition-all duration-200 group"
                          role="menuitem"
                        >
                          <div className="p-1.5 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="h-4 w-4 text-red-400" />
                          </div>
                          <span>Sign out</span>
                        </button>
                      </div>

                      {/* Decorative gradient at bottom */}
                      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar indicator (optional - for loading states) */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0"></div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16"></div>
    </>
  )
}