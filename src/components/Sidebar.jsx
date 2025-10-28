import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { getFolderTree, createFolder, deleteFolder } from '../services/api'
import CreateFolderModal from './CreateFolderModal'
import { useFolders } from '../contexts/FolderContext'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const [folders, setFolders] = useState([])
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)
  const location = useLocation()
  const { refreshTrigger, refreshFolders: triggerGlobalRefresh } = useFolders()

  useEffect(() => {
    let isMounted = true;
    
    const loadFolders = async () => {
      if (isMounted) {
        await fetchFolders();
      }
    };
    
    loadFolders();
    
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger])

  const fetchFolders = async () => {
    try {
      const data = await getFolderTree()
      setFolders(data)
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  }

  const toggleFolder = useCallback((folderId) => {
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId)
      } else {
        newExpanded.add(folderId)
      }
      return newExpanded
    })
  }, [])

  const handleCreateFolder = useCallback((parentId = null) => {
    setSelectedParent(parentId)
    setShowCreateModal(true)
  }, [])

  const handleFolderCreated = useCallback((newFolder) => {
    fetchFolders()
    triggerGlobalRefresh()
    setShowCreateModal(false)
  }, [triggerGlobalRefresh])

  const handleDeleteFolder = useCallback(async (folderId, folderName) => {
    if (window.confirm(`Are you sure you want to delete "${folderName}"? This will also delete all notes and subfolders inside it.`)) {
      try {
        await deleteFolder(folderId)
        toast.success('Folder deleted successfully!')
        await fetchFolders()
        triggerGlobalRefresh()
      } catch (error) {
        console.error('Failed to delete folder:', error)
        toast.error(error.response?.data?.message || 'Failed to delete folder')
      }
    }
  }, [triggerGlobalRefresh])

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id)
    const hasChildren = folder.children && folder.children.length > 0
    const isActive = location.pathname === `/folder/${folder._id}` || location.pathname === `/app/folder/${folder._id}`

    return (
      <div key={folder._id} className="select-none">
        <div 
          className={`flex items-center px-3 py-2 rounded-lg cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            isActive ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
        >
          <div className="flex items-center flex-1" onClick={() => hasChildren && toggleFolder(folder._id)}>
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />
              )
            ) : (
              <div className="w-5 mr-1" />
            )}
            
            <span className="mr-2 text-lg">{folder.icon}</span>
            
            <Link 
              to={`/app/folder/${folder._id}`}
              className="flex-1 truncate hover:no-underline"
            >
              {folder.name}
            </Link>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCreateFolder(folder._id)
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Create subfolder"
              aria-label={`Create subfolder in ${folder.name}`}
            >
              <Plus className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteFolder(folder._id, folder.name)
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Delete folder"
              aria-label={`Delete ${folder.name} folder`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Folders</h2>
            <button
              onClick={() => handleCreateFolder()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Create new folder"
              aria-label="Create new folder"
            >
              <FolderPlus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-1">
            {folders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No folders yet</p>
                <button
                  onClick={() => handleCreateFolder()}
                  className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-2"
                >
                  Create your first folder
                </button>
              </div>
            ) : (
              folders.map(folder => renderFolder(folder))
            )}
          </div>
        </div>
      </aside>

      {showCreateModal && (
        <CreateFolderModal
          parentId={selectedParent}
          onClose={() => setShowCreateModal(false)}
          onFolderCreated={handleFolderCreated}
        />
      )}
    </>
  )
}