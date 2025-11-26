import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { getFolderTree, deleteFolder } from "../services/api";
import CreateFolderModal from "./CreateFolderModal";
import { useFolders } from "../contexts/FolderContext";
import toast from "react-hot-toast";

export default function Sidebar({ isOpen, onClose }) {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredFolder, setHoveredFolder] = useState(null);
  const location = useLocation();
  const { refreshTrigger, refreshFolders: triggerGlobalRefresh } = useFolders();

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFolderTree();
      // Sort folders by order
      const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setFolders(sortedData);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadFolders = async () => {
      if (isMounted) await fetchFolders();
    };
    loadFolders();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, fetchFolders]);

  useEffect(() => {
    const expandParentFolders = (folders, targetPath) => {
      const pathSegments = targetPath.split("/").filter(Boolean);
      const folderId = pathSegments[pathSegments.length - 1];

      const findAndExpandParents = (items, parents = []) => {
        for (const folder of items) {
          const currentPath = [...parents, folder._id];
          if (folder._id === folderId) {
            setExpandedFolders(new Set(currentPath));
            return true;
          }
          if (folder.children?.length > 0) {
            if (findAndExpandParents(folder.children, currentPath)) return true;
          }
        }
        return false;
      };
      findAndExpandParents(folders);
    };

    if (location.pathname.includes("/folder/")) {
      expandParentFolders(folders, location.pathname);
    }
  }, [location.pathname, folders]);

  const toggleFolder = useCallback((folderId, e) => {
    e?.stopPropagation();
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  }, []);

  const handleCreateFolder = useCallback((parentId = null) => {
    setSelectedParent(parentId);
    setShowCreateModal(true);
  }, []);

  const handleFolderCreated = useCallback(
    (newFolder) => {
      fetchFolders();
      triggerGlobalRefresh();
      setShowCreateModal(false);
      if (newFolder?.parent) {
        setExpandedFolders((prev) => new Set([...prev, newFolder.parent]));
      }
    },
    [triggerGlobalRefresh, fetchFolders]
  );

  const handleDeleteFolder = useCallback(
    async (folderId, folderName, e) => {
      e?.stopPropagation();
      if (
        window.confirm(
          `Delete "${folderName}"? This will also delete all notes and subfolders.`
        )
      ) {
        try {
          await deleteFolder(folderId);
          toast.success("Folder deleted");
          await fetchFolders();
          triggerGlobalRefresh();
        } catch (error) {
          console.error("Failed to delete folder:", error);
          toast.error(error.response?.data?.message || "Failed to delete");
        }
      }
    },
    [triggerGlobalRefresh, fetchFolders]
  );

  const countNotes = useCallback((folder) => {
    let count = folder.noteCount || 0;
    if (folder.children) {
      folder.children.forEach((child) => {
        count += countNotes(child);
      });
    }
    return count;
  }, []);

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id);
    const hasChildren = folder.children?.length > 0;
    const isActive = location.pathname === `/app/folder/${folder._id}`;
    const isHovered = hoveredFolder === folder._id;
    const noteCount = countNotes(folder);
    
    // Sort children by order
    const sortedChildren = folder.children?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

    return (
      <div key={folder._id}>
        <div
          className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
            isActive
              ? "bg-indigo-500/10 text-indigo-400"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onMouseEnter={() => setHoveredFolder(folder._id)}
          onMouseLeave={() => setHoveredFolder(null)}
        >
          {/* Expand button */}
          <button
            onClick={(e) => hasChildren && toggleFolder(folder._id, e)}
            className={`flex-shrink-0 p-0.5 rounded ${
              hasChildren ? "hover:bg-neutral-700" : "invisible"
            }`}
          >
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-500" />
              ))}
          </button>

          {/* Folder icon */}
          <span className="flex-shrink-0 text-base">{folder.icon || "📁"}</span>

          {/* Folder link */}
          <Link
            to={`/app/folder/${folder._id}`}
            onClick={onClose}
            className="flex-1 truncate text-sm font-medium"
          >
            {folder.name}
          </Link>

          {/* Note count */}
          {noteCount > 0 && (
            <span
              className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-neutral-800 text-neutral-500"
              }`}
            >
              {noteCount}
            </span>
          )}

          {/* Actions */}
          <div
            className={`flex-shrink-0 flex items-center gap-1 ${
              isHovered || isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateFolder(folder._id);
              }}
              className="p-1 rounded hover:bg-neutral-700"
              title="Add subfolder"
            >
              <Plus className="h-3.5 w-3.5 text-neutral-500 hover:text-neutral-300" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteFolder(folder._id, folder.name, e);
              }}
              className="p-1 rounded hover:bg-red-500/10"
              title="Delete folder"
            >
              <Trash2 className="h-3.5 w-3.5 text-neutral-500 hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {sortedChildren.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-14 bottom-0 w-64 bg-neutral-950 border-r border-neutral-800 overflow-y-auto z-40 lg:translate-x-0 custom-scrollbar ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-200">
                Folders
              </h2>
            </div>
            <button
              onClick={() => handleCreateFolder()}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200"
              title="Create new folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>

          {/* Folders list */}
          <div className="flex-1 space-y-0.5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-neutral-600 animate-spin" />
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Folder className="h-10 w-10 mx-auto mb-3 text-neutral-700" />
                <p className="text-sm text-neutral-500 mb-4">No folders yet</p>
                <button
                  onClick={() => handleCreateFolder()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create Folder
                </button>
              </div>
            ) : (
              folders.map((folder) => renderFolder(folder))
            )}
          </div>

          {/* Footer */}
          {!loading && folders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <Folder className="h-3.5 w-3.5" />
                <span>
                  {folders.reduce((acc, f) => {
                    const countFolders = (folder) => {
                      let count = 1;
                      if (folder.children) {
                        folder.children.forEach((child) => {
                          count += countFolders(child);
                        });
                      }
                      return count;
                    };
                    return acc + countFolders(f);
                  }, 0)}{" "}
                  folders
                </span>
              </div>
            </div>
          )}
        </div>
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
  );
}
