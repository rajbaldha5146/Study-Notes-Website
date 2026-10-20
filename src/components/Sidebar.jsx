import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Search,
  Smartphone,
} from "lucide-react";
import { getFolderTree, deleteFolder } from "../services/api";
import CreateFolderModal from "./CreateFolderModal";
import ConfirmModal from "./ConfirmModal";
import Loader from "./Loader";
import { useFolders } from "../contexts/FolderContext";
import toast from "react-hot-toast";

export default function Sidebar({ isOpen, onClose }) {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredFolder, setHoveredFolder] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");
  const location = useLocation();
  const { refreshTrigger, refreshFolders: triggerGlobalRefresh } = useFolders();

  const SIDEBAR_WIDTH = 232;

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

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    onConfirm: () => {},
  });

  const handleDeleteFolder = useCallback((folderId, folderName, e) => {
    e?.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: "Delete Folder?",
      message: `Are you sure you want to delete "${folderName}"? All notes inside will be moved to the Trash Bin.`,
      confirmText: "Delete Folder",
      onConfirm: async () => {
        try {
          await deleteFolder(folderId);
          toast.success("Folder deleted (notes moved to trash)");
          await fetchFolders();
          triggerGlobalRefresh();
        } catch (error) {
          console.error("Failed to delete folder:", error);
          toast.error(error.response?.data?.message || "Failed to delete");
        }
      },
    });
  }, [triggerGlobalRefresh, fetchFolders]);

  const countNotes = useCallback((folder) => {
    let count = folder.noteCount || 0;
    if (folder.children) {
      folder.children.forEach((child) => { count += countNotes(child); });
    }
    return count;
  }, []);

  const getFilteredFolders = useCallback((nodes, query) => {
    if (!query) return nodes;
    const lowerQuery = query.toLowerCase();

    const filterNodes = (items) => {
      return items.map(item => {
        const matches = item.name.toLowerCase().includes(lowerQuery);
        let filteredChildren = [];
        if (item.children) {
          filteredChildren = filterNodes(item.children);
        }
        
        if (matches || filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }).filter(Boolean);
    };

    return filterNodes(nodes);
  }, []);

  const filteredFolders = getFilteredFolders(folders, filterQuery);

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id) || !!filterQuery;
    const hasChildren = folder.children?.length > 0;
    const isActive = location.pathname === `/app/folder/${folder._id}`;
    const isHovered = hoveredFolder === folder._id;
    const noteCount = countNotes(folder);
    const sortedChildren = folder.children?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

    return (
      <div key={folder._id}>
        <div
          className="group flex items-center gap-1.5 rounded-lg cursor-pointer relative transition-all duration-150"
          style={{
            paddingLeft: `${8 + level * 12}px`,
            paddingRight: "6px",
            paddingTop: "6px",
            paddingBottom: "6px",
            background: isActive
              ? "var(--bg-elevated)"
              : isHovered
              ? "var(--bg-hover)"
              : "transparent",
          }}
          onMouseEnter={() => setHoveredFolder(folder._id)}
          onMouseLeave={() => setHoveredFolder(null)}
        >
          {/* Active Accent Left Border */}
          {isActive && (
            <div
              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md"
              style={{ background: "var(--accent)" }}
            />
          )}

          {/* Expand Chevron */}
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

          {/* Folder Icon Emoji */}
          <span className="flex-shrink-0 text-sm leading-none">{folder.icon || "📁"}</span>

          {/* Folder Link */}
          <Link
            to={`/app/folder/${folder._id}`}
            onClick={onClose}
            className="flex-1 truncate text-xs font-medium transition-colors"
            style={{
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: isActive ? "600" : "400",
            }}
          >
            {folder.name}
          </Link>

          {/* Note Count Badge */}
          {noteCount > 0 && (
            <span
              className="flex-shrink-0 px-1.5 py-0.5 rounded-md font-mono text-[10px] font-medium"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {noteCount}
            </span>
          )}

          {/* Quick Actions (Add Subfolder / Delete) */}
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
              className="p-1 rounded hover:bg-red-500/10 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              title="Delete folder"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Children Subfolders */}
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
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden backdrop-blur-sm"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-14 bottom-0 overflow-y-auto z-40 custom-scrollbar transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        <div className="p-3.5 h-full flex flex-col justify-between">
          <div>
            {/* Sidebar Section Header */}
            <div
              className="flex items-center justify-between mb-3 pb-2.5"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Folders
              </span>
              <button
                onClick={() => handleCreateFolder()}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{
                  color: "var(--accent-light)",
                  background: "rgba(224, 144, 80, 0.1)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(224, 144, 80, 0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(224, 144, 80, 0.1)";
                }}
                title="Create folder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Instant Filter Input */}
            <div className="mb-3">
              <div className="relative">
                <Search
                  className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  placeholder="Filter folders..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full text-xs rounded-lg pl-8 pr-2.5 py-1.5 focus:outline-none transition-colors"
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                />
              </div>
            </div>

            {/* Folders List Tree */}
            <div className="space-y-0.5">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <Loader variant="spinner" className="h-4 w-4" />
                </div>
              ) : filteredFolders.length === 0 ? (
                <div className="text-center py-8 px-2">
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    No folders yet
                  </p>
                  <button
                    onClick={() => handleCreateFolder()}
                    className="btn-primary text-xs"
                    style={{ padding: "0.35rem 0.75rem" }}
                  >
                    <FolderPlus className="h-3 w-3 inline mr-1" />
                    New Folder
                  </button>
                </div>
              ) : (
                filteredFolders.map((folder) => renderFolder(folder))
              )}
            </div>
          </div>

          {/* Footer Area with Trash Bin */}
          <div
            className="pt-3 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              <Folder className="h-3.5 w-3.5" />
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
                }, 0)}{" "}
                total
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/download"
                onClick={onClose}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{ color: "var(--accent-light)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                }}
                title="Download NoteMaster Android Mobile App"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Mobile App</span>
              </Link>

              <Link
                to="/app/trash"
                onClick={onClose}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "var(--danger)";
                  e.currentTarget.style.background = "rgba(217, 91, 78, 0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Trash</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Modals */}
      {showCreateModal && (
        <CreateFolderModal
          parentId={selectedParent}
          onClose={() => setShowCreateModal(false)}
          onFolderCreated={handleFolderCreated}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
