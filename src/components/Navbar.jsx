import { Link } from 'react-router-dom'
import { BookOpen, Plus, Home, User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700 fixed top-0 left-0 right-0 z-40">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/app" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📝</span>
            </div>
            <span className="text-xl font-bold text-white">NoteMaster</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            
            <Link 
              to="/app" 
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link 
              to="/app/create" 
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:block">{user?.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
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