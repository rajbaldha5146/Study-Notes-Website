import { Link } from 'react-router-dom'
import { BookOpen, Plus, Home, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700 fixed top-0 left-0 right-0 z-40">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <Link to="/app" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📝</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">NoteMaster</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            <Link 
              to="/app" 
              className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Home</span>
            </Link>
            <Link 
              to="/app/create" 
              className="flex items-center space-x-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Note</span>
            </Link>

            {/* User Menu */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                aria-label="User menu"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:block">{user?.name}</span>
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}