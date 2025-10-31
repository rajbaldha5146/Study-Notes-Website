import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  FolderOpen,
  Loader2
} from 'lucide-react'
import { getFolderTree, createFolder, deleteFolder } from '../services/api'
import CreateFolderModal from './CreateFolderModal'
import { useFolders } from '../contexts/FolderContext'
import toast from 'react-hot-toast'

export default function Sidebar({ isOpen, onClose }) {
  const [folders, setFolders] = useState([])
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hoveredFolder, setHoveredFolder] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshTrigger, refreshFolders: triggerGlobalRefresh } = useFolders()

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getFolderTree()
      setFolders(data)
    } catch (error) {
      console.error('Failed to fetch folders:', error)
      toast.error('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    
    const loadFolders = async () => {
      if (isMounted) {
        await fetchFolders()
      }
    }
    
    loadFolders()
    
    return () => {
      isMounted = false
    }
  }, [refreshTrigger, fetchFolders])

  // Auto-expand parent folders of current folder
  useEffect(() => {
    const expandParentFolders = (folders, targetPath) => {
      const pathSegments = targetPath.split('/').filter(Boolean)
      const folderId = pathSegments[pathSegments.length - 1]
      
      const findAndExpandParents = (items, parents = []) => {
        for (const folder of items) {
          const currentPath = [...parents, folder._id]
          
          if (folder._id === folderId) {
            setExpandedFolders(new Set(currentPath))
            return true
          }
          
          if (folder.children && folder.children.length > 0) {
            if (findAndExpandParents(folder.children, currentPath)) {
              return true
            }
          }
        }
        return false
      }
      
      findAndExpandParents(folders)
    }

    if (location.pathname.includes('/folder/')) {
      expandParentFolders(folders, location.pathname)
    }
  }, [location.pathname, folders])

  const toggleFolder = useCallback((folderId, e) => {
    e?.stopPropagation()
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
    if (newFolder && newFolder.parent) {
      setExpandedFolders(prev => new Set([...prev, newFolder.parent]))
    }
  }, [triggerGlobalRefresh, fetchFolders])

  const handleDeleteFolder = useCallback(async (folderId, folderName, e) => {
    e?.stopPropagation()
    
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
  }, [triggerGlobalRefresh, fetchFolders])

  const countNotes = useCallback((folder) => {
    let count = folder.noteCount || 0
    if (folder.children) {
      folder.children.forEach(child => {
        count += countNotes(child)
      })
    }
    return count
  }, [])

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id)
    const hasChildren = folder.children && folder.children.length > 0
    const isActive = location.pathname === `/app/folder/${folder._id}`
    const isHovered = hoveredFolder === folder._id
    const noteCount = countNotes(folder)

    return (
      <div key={folder._id} className="select-none">
        <div 
          className={`
            group relative flex items-center px-3 py-2.5 rounded-xl cursor-pointer
            transition-all duration-200 ease-out
            ${isActive 
              ? 'bg-gradient-to-r from-blue-500/15 via-purple-500/10 to-blue-500/15 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
            }
          `}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onMouseEnter={() => setHoveredFolder(folder._id)}
          onMouseLeave={() => setHoveredFolder(null)}
        >
          {/* Active indicator line */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full shadow-lg shadow-blue-500/50" />
          )}

          {/* Depth connector lines */}
          {level > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700" style={{ left: `${12 + (level - 1) * 16}px` }} />
          )}

          {/* Expand/Collapse button */}
          <button
            onClick={(e) => hasChildren && toggleFolder(folder._id, e)}
            className={`
              flex-shrink-0 mr-1.5 p-0.5 rounded-md
              transition-all duration-200
              ${hasChildren ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : 'invisible'}
            `}
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              )
            )}
          </button>
          
          {/* Folder icon */}
          <div className="flex-shrink-0 mr-2.5 text-xl transform transition-transform duration-200 group-hover:scale-110">
            {isExpanded && hasChildren ? (
              <span>{folder.icon}</span>
            ) : (
              <span>{folder.icon}</span>
            )}
          </div>
          
          {/* Folder link */}
          <Link 
            to={`/app/folder/${folder._id}`}
            onClick={onClose}
            className="flex-1 truncate font-medium text-sm hover:no-underline min-w-0"
          >
            {folder.name}
          </Link>

          {/* Note count badge */}
          {noteCount > 0 && (
            <div className={`
              flex-shrink-0 ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
              transition-all duration-200
              ${isActive 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}>
              {noteCount}
            </div>
          )}

          {/* Action buttons */}
          <div className={`
            flex-shrink-0 flex items-center gap-1 ml-2
            transition-all duration-200
            ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}
          `}>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleCreateFolder(folder._id)
              }}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 transform hover:scale-110 group/btn"
              title="Create subfolder"
              aria-label={`Create subfolder in ${folder.name}`}
            >
              <Plus className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                handleDeleteFolder(folder._id, folder.name, e)
              }}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 transform hover:scale-110 group/btn"
              title="Delete folder"
              aria-label={`Delete ${folder.name} folder`}
            >
              <Trash2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 group-hover/btn:text-red-600 dark:group-hover/btn:text-red-400" />
            </button>
          </div>
        </div>

        {/* Children folders with animation */}
        {hasChildren && (
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="py-0.5 space-y-0.5">
              {folder.children.map(child => renderFolder(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border-r border-gray-200/80 dark:border-gray-700/80 
        overflow-y-auto z-40 
        transition-transform duration-300 ease-in-out 
        lg:translate-x-0 
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent
      `}>
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200/80 dark:border-gray-700/80">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Folders
              </h2>
            </div>
            <button
              onClick={() => handleCreateFolder()}
              className="group p-2 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 bg-gray-100 dark:bg-gray-800 rounded-xl transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-blue-500/30"
              title="Create new folder"
              aria-label="Create new folder"
            >
              <FolderPlus className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Folders list */}
          <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 mx-auto mb-3 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading folders...
                  </p>
                </div>
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="relative mb-6 inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center">
                    <Folder className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Plus className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No folders yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Create your first folder to organize your notes
                </p>
                <button
                  onClick={() => handleCreateFolder()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create Folder
                </button>
              </div>
            ) : (
              <>
                {folders.map(folder => renderFolder(folder))}
              </>
            )}
          </div>

          {/* Footer stats */}
          {!loading && folders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-gray-700/80">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
                <div className="flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {folders.reduce((acc, f) => {
                      const countFolders = (folder) => {
                        let count = 1
                        if (folder.children) {
                          folder.children.forEach(child => {
                            count += countFolders(child)
                          })
                        }
                        return count
                      }
                      return acc + countFolders(f)
                    }, 0)} Folders
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Decorative gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
      </aside>

      {/* Create Folder Modal */}
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