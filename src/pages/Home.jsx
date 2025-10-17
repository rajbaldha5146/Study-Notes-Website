import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Tag, Calendar, Edit, Trash2, BookOpen, Plus, Folder } from 'lucide-react'
import { getFolderTree } from '../services/api'
import BookLoader from '../components/BookLoader'

export default function Home() {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    try {
      const data = await getFolderTree()
      setFolders(data)
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <BookLoader message="Loading your folders..." />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to NoteMaster
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your smart note-taking companion. Organize your thoughts, upload markdown files, and keep everything perfectly structured.
        </p>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map(folder => (
          <Link
            key={folder._id}
            to={`/app/folder/${folder._id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 group"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: folder.color + '20' }}
                >
                  {folder.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {folder.name}
                  </h3>
                  {folder.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {folder.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Click to explore</span>
                <div className="flex items-center space-x-1">
                  <Folder className="h-4 w-4" />
                  <span>Folder</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {folders.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No folders yet</h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            Create your first folder to organize your notes
          </p>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            Use the sidebar to create folders and organize your notes
          </div>
        </div>
      )}
    </div>
  )
}