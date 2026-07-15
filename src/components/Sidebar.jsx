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

  const SIDEBAR_WIDTH = 240;

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFolderTree();
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
    return () => { isMounted = false; };
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

  // Update CSS variable for main content margin
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isOpen ? `${SIDEBAR_WIDTH}px` : "0px"
    );
  }, [isOpen]);

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

  const handleFolderCreated = useCallback((newFolder) => {
    fetchFolders();
    triggerGlobalRefresh();
    setShowCreateModal(false);
    if (newFolder?.parent) {
      setExpandedFolders((prev) => new Set([...prev, newFolder.parent]));
    }
  }, [triggerGlobalRefresh, fetchFolders]);

  const handleDeleteFolder = useCallback(async (folderId, folderName, e) => {
    e?.stopPropagation();
    if (window.confirm(`Delete "${folderName}"? This will also delete all notes and subfolders.`)) {
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
  }, [triggerGlobalRefresh, fetchFolders]);

  const countNotes = useCallback((folder) => {
    let count = folder.noteCount || 0;
    if (folder.children) {
      folder.children.forEach((child) => { count += countNotes(child); });
    }
    return count;
  }, []);

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id);
    const hasChildren = folder.children?.length > 0;
    const isActive = location.pathname === `/app/folder/${folder._id}`;
    const isHovered = hoveredFolder === folder._id;
    const noteCount = countNotes(folder);
    const sortedChildren = folder.children?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

    return (
      <div key={folder._id}>
        <div
          className="group flex items-center gap-1.5 rounded-md cursor-pointer relative transition-all duration-100"
          style={{
            paddingLeft: `${8 + level * 12}px`,
            paddingRight: "6px",
            paddingTop: "5px",
            paddingBottom: "5px",
            background: isActive
              ? "var(--bg-elevated)"
              : isHovered
              ? "rgba(255,255,255,0.04)"
              : "transparent",
          }}
          onMouseEnter={() => setHoveredFolder(folder._id)}
          onMouseLeave={() => setHoveredFolder(null)}
        >
          {/* Active indicator */}
          {isActive && (
            <div
              className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
              style={{ background: "var(--blue)" }}
            />
          )}

          {/* Expand button */}
          <button
            onClick={(e) => hasChildren && toggleFolder(folder._id, e)}
            className={`flex-shrink-0 p-0.5 rounded transition-colors ${
              hasChildren ? "hover:bg-white/10" : "invisible"
            }`}
          >
            {hasChildren && (
              isExpanded
                ? <ChevronDown className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                : <ChevronRight className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
            )}
          </button>

          {/* Folder icon */}
          <span className="flex-shrink-0 text-sm leading-none">{folder.icon || "📁"}</span>

          {/* Folder link */}
          <Link
            to={`/app/folder/${folder._id}`}
            onClick={onClose}
            className="flex-1 truncate text-sm transition-colors"
            style={{
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: isActive ? "500" : "400",
            }}
          >
            {folder.name}
          </Link>

          {/* Note count */}
          {noteCount > 0 && (
            <span
              className="flex-shrink-0 text-xs px-1 py-0.5 rounded font-medium"
              style={{
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: "0.65rem",
              }}
            >
              {noteCount}
            </span>
          )}

          {/* Actions */}
          <div
            className={`flex-shrink-0 flex items-center gap-0.5 transition-opacity ${
              isHovered || isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateFolder(folder._id);
              }}
              className="p-1 rounded hover:bg-white/8 transition-colors"
              title="Add subfolder"
            >
              <Plus className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteFolder(folder._id, folder.name, e);
              }}
              className="p-1 rounded transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              title="Delete folder"
            >
              <Trash2 className="h-3 w-3" />
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
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-12 bottom-0 overflow-y-auto z-40 custom-scrollbar transition-transform duration-250 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        <div className="p-3 h-full flex flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between mb-3 pb-3"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Folders
              </span>
              {/* Live indicator */}
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--success)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
            </div>
            <button
              onClick={() => handleCreateFolder()}
              className="p-1.5 rounded-md transition-colors"
              style={{
                color: "var(--text-muted)",
                background: "transparent",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--bg-elevated)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              title="Create new folder"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Folders list */}
          <div className="flex-1 space-y-0.5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-10 px-3">
                <div
                  className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                >
                  <Folder className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>No folders yet</p>
                <button
                  onClick={() => handleCreateFolder()}
                  className="btn-primary text-xs"
                  style={{ padding: "0.35rem 0.75rem" }}
                >
                  <FolderPlus className="h-3 w-3 mr-1" />
                  New Folder
                </button>
              </div>
            ) : (
              folders.map((folder) => renderFolder(folder))
            )}
          </div>

          {/* Footer */}
          {!loading && folders.length > 0 && (
            <div
              className="mt-3 pt-3"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <Folder className="h-3 w-3" />
                <span>
                  {folders.reduce((acc, f) => {
                    const countFolders = (folder) => {
                      let count = 1;
                      if (folder.children) {
                        folder.children.forEach((child) => { count += countFolders(child); });
                      }
                      return count;
                    };
                    return acc + countFolders(f);
                  }, 0)}{" "}folders
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
