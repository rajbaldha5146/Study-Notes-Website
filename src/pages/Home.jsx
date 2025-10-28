import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Folder, 
  FolderPlus, 
  BookOpen, 
  Sparkles, 
  Zap, 
  FileText,
  ArrowRight,
  Lightbulb,
  Target,
  Rocket
} from 'lucide-react'
import { getFolderTree } from '../services/api'
import BookLoader from '../components/BookLoader'
import { useFolders } from '../contexts/FolderContext'

export default function Home() {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const { refreshTrigger } = useFolders()

  useEffect(() => {
    let isMounted = true;
    
    const fetchFolders = async () => {
      try {
        setLoading(true)
        const data = await getFolderTree()
        if (isMounted) {
          setFolders(data)
        }
      } catch (error) {
        console.error('Failed to fetch folders:', error)
        if (isMounted) {
          setFolders([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    };
    
    fetchFolders();
    
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <BookLoader message="Loading your folders..." />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12 text-center px-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 border border-indigo-500/20">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
          <span className="text-xs sm:text-sm font-medium text-indigo-300">Your Smart Note-Taking Companion</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Welcome to NoteMaster
        </h1>
        
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8">
          Organize your thoughts, create notes, and keep everything perfectly structured in one beautiful place.
        </p>
      </div>

      {folders.length === 0 ? (
        /* Enhanced Empty State */
        <div className="space-y-12">
          {/* Main CTA Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 rounded-xl sm:rounded-2xl border border-indigo-500/20 p-6 sm:p-8 lg:p-12">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-indigo-500/30 animate-bounce">
                <FolderPlus className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Let's Get Started! 🚀
              </h2>
              
              <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto px-4">
                Create your first folder to begin organizing your notes. Think of folders as your digital notebooks - perfect for different projects, subjects, or topics.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                <button
                  onClick={() => {
                    document.querySelector('[title="Create new folder"]')?.click();
                  }}
                  className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] font-semibold"
                  aria-label="Create your first folder"
                >
                  <FolderPlus className="h-5 w-5" />
                  <span>Create Your First Folder</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-200 hover:scale-[1.02]">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">Organize Smartly</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Create folders and subfolders to keep your notes perfectly organized and easy to find.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 hover:scale-[1.02]">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">Markdown Support</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Write in Markdown or upload .md files. Full syntax highlighting and live preview included.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-violet-500/50 transition-all duration-200 hover:scale-[1.02]">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">Powerful Features</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Search instantly, present your notes in slideshow mode, and organize with ease.
              </p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700/50">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
              <h3 className="text-lg sm:text-xl font-semibold text-white">Quick Tips to Get Started</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs sm:text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    <span className="font-semibold text-white">Create folders</span> using the sidebar - organize by project, subject, or any way you like
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-xs sm:text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    <span className="font-semibold text-white">Add notes</span> by clicking the "New Note" button or upload existing markdown files
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-violet-500/20 rounded-full flex items-center justify-center text-violet-400 text-xs sm:text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    <span className="font-semibold text-white">Search & filter</span> to quickly find the notes you need
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xs sm:text-sm font-bold mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    <span className="font-semibold text-white">Present & share</span> your notes in beautiful slideshow mode
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Folders Grid - When folders exist */
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-4 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Your Folders</h2>
            <div className="text-xs sm:text-sm text-gray-400">
              {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {folders.map(folder => (
              <Link
                key={folder._id}
                to={`/app/folder/${folder._id}`}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 border border-gray-700/50 hover:border-indigo-500/50 overflow-hidden hover:scale-[1.02]"
                aria-label={`Open ${folder.name} folder`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                    <div 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg transition-transform group-hover:scale-110 flex-shrink-0"
                      style={{ 
                        backgroundColor: folder.color + '30',
                        boxShadow: `0 4px 14px ${folder.color}40`
                      }}
                    >
                      {folder.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mt-0.5 sm:mt-1">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-400 group-hover:text-indigo-400 transition-colors">
                      Click to explore
                    </span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}