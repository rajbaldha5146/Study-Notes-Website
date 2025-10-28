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
      <div className="mb-12 text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 px-4 py-2 rounded-full mb-6 border border-indigo-500/20">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-medium text-indigo-300">Your Smart Note-Taking Companion</span>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Welcome to NoteMaster
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Organize your thoughts, create notes, and keep everything perfectly structured in one beautiful place.
        </p>
      </div>

      {folders.length === 0 ? (
        /* Enhanced Empty State */
        <div className="space-y-12">
          {/* Main CTA Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 rounded-2xl border border-indigo-500/20 p-12">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-indigo-500/30 animate-bounce">
                <FolderPlus className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Let's Get Started! 🚀
              </h2>
              
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
                Create your first folder to begin organizing your notes. Think of folders as your digital notebooks - perfect for different projects, subjects, or topics.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-200 hover:scale-[1.02]">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Organize Smartly</h3>
              <p className="text-gray-400 text-sm">
                Create folders and subfolders to keep your notes perfectly organized and easy to find.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 hover:scale-[1.02]">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Markdown Support</h3>
              <p className="text-gray-400 text-sm">
                Write in Markdown or upload .md files. Full syntax highlighting and live preview included.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-violet-500/50 transition-all duration-200 hover:scale-[1.02]">
              <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Powerful Features</h3>
              <p className="text-gray-400 text-sm">
                Search instantly, present your notes in slideshow mode, and organize with ease.
              </p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="h-6 w-6 text-indigo-400" />
              <h3 className="text-xl font-semibold text-white">Quick Tips to Get Started</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-gray-300 text-sm">
                    <span className="font-semibold text-white">Create folders</span> using the sidebar - organize by project, subject, or any way you like
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-gray-300 text-sm">
                    <span className="font-semibold text-white">Add notes</span> by clicking the "New Note" button or upload existing markdown files
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center text-violet-400 text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-gray-300 text-sm">
                    <span className="font-semibold text-white">Search & filter</span> to quickly find the notes you need
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm font-bold mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-gray-300 text-sm">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Folders</h2>
            <div className="text-sm text-gray-400">
              {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map(folder => (
              <Link
                key={folder._id}
                to={`/app/folder/${folder._id}`}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 border border-gray-700/50 hover:border-indigo-500/50 overflow-hidden hover:scale-[1.02]"
                aria-label={`Open ${folder.name} folder`}
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110"
                      style={{ 
                        backgroundColor: folder.color + '30',
                        boxShadow: `0 4px 14px ${folder.color}40`
                      }}
                    >
                      {folder.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 group-hover:text-indigo-400 transition-colors">
                      Click to explore
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
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