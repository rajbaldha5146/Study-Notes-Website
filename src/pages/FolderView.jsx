import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  Folder, 
  Calendar, 
  Edit, 
  Trash2, 
  Search,
  Tag,
  ArrowLeft,
  Presentation,
  FileCode
} from 'lucide-react'
import { getFolder, deleteNote, deleteFolder } from '../services/api'
import BookLoader from '../components/BookLoader'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function FolderView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [folderData, setFolderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFolderData()
  }, [id])

  const fetchFolderData = async () => {
    try {
      const data = await getFolder(id)
      setFolderData(data)
    } catch (error) {
      console.error('Failed to fetch folder:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId)
        toast.success('Note deleted successfully!')
        fetchFolderData()
      } catch (error) {
        console.error('Failed to delete note:', error)
        toast.error('Failed to delete note')
      }
    }
  }

  const handleDeleteFolder = async () => {
    if (window.confirm(`Are you sure you want to delete "${folderData?.folder?.name}"? This will also delete all notes and subfolders inside it.`)) {
      try {
        await deleteFolder(id)
        toast.success('Folder deleted successfully!')
        navigate('/app')
      } catch (error) {
        console.error('Failed to delete folder:', error)
        toast.error('Failed to delete folder. It may contain notes or subfolders.')
      }
    }
  }

  const filteredNotes = folderData?.notes?.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <BookLoader message="Loading folder contents..." />
      </div>
    )
  }

  if (!folderData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">Folder not found</h2>
        <Link to="/app" className="text-primary-600 dark:text-primary-400 hover:underline mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pt-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            to="/app"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{folderData.folder.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {folderData.folder.name}
              </h1>
              {folderData.folder.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {folderData.folder.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to={`/app/create/${id}`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </Link>

            <Link
              to={`/app/create/${id}?type=markdown`}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <FileCode className="h-4 w-4" />
              <span>Add MD File</span>
            </Link>
            
            {filteredNotes.length > 0 && (
              <Link
                to={`/app/note/${filteredNotes[0]._id}?folder=${id}`}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Presentation className="h-4 w-4" />
                <span>Start Presentation</span>
              </Link>
            )}
            
            <button
              onClick={handleDeleteFolder}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              title="Delete this folder"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Folder</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Subfolders */}
      {folderData.subfolders && folderData.subfolders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Subfolders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folderData.subfolders.map(subfolder => (
              <Link
                key={subfolder._id}
                to={`/app/folder/${subfolder._id}`}
                className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <span className="text-2xl">{subfolder.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{subfolder.name}</h3>
                  {subfolder.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {subfolder.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Notes ({filteredNotes.length})
        </h2>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Create your first note in this folder'
              }
            </p>
            {!searchTerm && (
              <Link
                to={`/app/create/${id}`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div key={note._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">
                      {note.title}
                    </h3>
                    <div className="flex space-x-2">
                      <Link
                        to={`/app/edit/${note._id}`}
                        className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {note.content.substring(0, 150)}...
                  </p>
                  
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {note.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">+{note.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                    
                    <Link
                      to={`/app/note/${note._id}`}
                      className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                    >
                      View Note
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}