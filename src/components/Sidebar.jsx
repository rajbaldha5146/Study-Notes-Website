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

    // Use folder color or default violet
    const accentColor = folder.color || "#8b5cf6";
    const accentAlpha = accentColor + "20";

    return (
      <div key={folder._id}>
        <div
          className="group flex items-center gap-2 rounded-lg cursor-pointer relative transition-all duration-150"
          style={{
            paddingLeft: `${10 + level * 14}px`,
            paddingRight: "8px",
            paddingTop: "6px",
            paddingBottom: "6px",
            background: isActive
              ? `linear-gradient(90deg, ${accentColor}18 0%, transparent 100%)`
              : isHovered
              ? "rgba(255,255,255,0.035)"
              : "transparent",
          }}
          onMouseEnter={() => setHoveredFolder(folder._id)}
          onMouseLeave={() => setHoveredFolder(null)}
        >
          {/* Active indicator bar */}
          {isActive && (
            <div
              className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
              style={{
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}80`,
              }}
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
                ? <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                : <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            )}
          </button>

          {/* Folder icon */}
          <span className="flex-shrink-0 text-sm">{folder.icon || "📁"}</span>

          {/* Folder link */}
          <Link
            to={`/app/folder/${folder._id}`}
            onClick={onClose}
            className="flex-1 truncate text-sm font-medium transition-colors"
            style={{ color: isActive ? accentColor : "var(--text-secondary)" }}
          >
            {folder.name}
          </Link>

          {/* Note count */}
          {noteCount > 0 && (
            <span
              className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: isActive ? `${accentColor}20` : "var(--bg-elevated)",
                color: isActive ? accentColor : "var(--text-muted)",
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
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Add subfolder"
            >
              <Plus className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteFolder(folder._id, folder.name, e);
              }}
              className="p-1 rounded hover:bg-rose-500/15 transition-colors"
              title="Delete folder"
            >
              <Trash2 className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
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
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-14 bottom-0 w-64 overflow-y-auto z-40 lg:translate-x-0 custom-scrollbar transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          /* Purple glow spine on the left edge */
          boxShadow: "inset -1px 0 0 var(--border-subtle), 4px 0 24px rgba(0,0,0,0.2)",
        }}
      >
        {/* Left spine glow */}
        <div
          className="absolute left-0 top-0 bottom-0 w-px pointer-events-none"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.6) 30%, rgba(6,182,212,0.4) 70%, transparent 100%)",
          }}
        />

        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between mb-4 pb-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" style={{ color: "var(--violet)" }} />
              <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                My Vault
              </h2>
              {/* Animated status dot */}
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--cyan)",
                  boxShadow: "0 0 6px rgba(6,182,212,0.8)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
            </div>
            <button
              onClick={() => handleCreateFolder()}
              className="p-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
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
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--violet)" }} />
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-10 px-3">
                <div
                  className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                >
                  <Folder className="h-5 w-5" style={{ color: "var(--violet)" }} />
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>No folders yet</p>
                <button
                  onClick={() => handleCreateFolder()}
                  className="btn-primary text-xs"
                  style={{ padding: "0.4rem 0.875rem" }}
                >
                  <FolderPlus className="h-3.5 w-3.5 mr-1" />
                  Create Folder
                </button>
              </div>
            ) : (
              folders.map((folder) => renderFolder(folder))
            )}
          </div>

          {/* Footer */}
          {!loading && folders.length > 0 && (
            <div
              className="mt-4 pt-4"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-faint)" }}>
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
