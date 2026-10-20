import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FolderPlus, ChevronRight, Save, Loader2, Check, Home } from "lucide-react";
import { getFolderTree, saveSharedContent, createFolder } from "../services/api";
import { useFolders } from "../contexts/FolderContext";
import { sanitizeName } from "../utils/sanitize";
import toast from "react-hot-toast";

export default function SaveToAccountModal({
  shareId,
  type, // 'note' or 'folder'
  resourceName,
  onClose,
  onSaveSuccess,
}) {
  const { refreshFolders } = useFolders();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null = root level
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const data = await getFolderTree();
      setFolders(data.folders || data || []);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (folderId) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveSharedContent(shareId, selectedFolderId);
      setSaveResult(result);
      refreshFolders();
      
      if (type === "folder" && result.savedResource?.noteCount) {
        toast.success(`Saved folder with ${result.savedResource.noteCount} notes!`);
      } else {
        toast.success("Saved to your notes!");
      }
      
      if (onSaveSuccess) {
        onSaveSuccess(result);
      }
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error(error.response?.data?.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    
    const sanitizedName = sanitizeName(newFolderName);
    if (!sanitizedName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    setCreatingFolder(true);
    try {
      const newFolder = await createFolder({
        name: sanitizedName,
        parentFolder: selectedFolderId,
        icon: "📁",
        color: "#e09050",
      });
      
      toast.success("Folder created!");
      setNewFolderName("");
      setShowCreateFolder(false);
      
      await fetchFolders();
      setSelectedFolderId(newFolder._id);
      refreshFolders();
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error(error.response?.data?.message || "Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  // Render folder tree item recursively
  const renderFolderItem = (folder, depth = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder._id);
    const isSelected = selectedFolderId === folder._id;

    return (
      <div key={folder._id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors`}
          style={{
            paddingLeft: `${12 + depth * 16}px`,
            background: isSelected ? "rgba(224, 144, 80, 0.12)" : "transparent",
            border: isSelected ? "1px solid rgba(224, 144, 80, 0.3)" : "1px solid transparent",
          }}
          onClick={() => setSelectedFolderId(folder._id)}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.background = "transparent";
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder._id);
              }}
              className="p-0.5 rounded hover:opacity-80"
            >
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                style={{ color: "var(--text-muted)" }}
              />
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span className="text-base">{folder.icon || "📁"}</span>
          <span className="text-xs truncate flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
            {folder.name}
          </span>
          {isSelected && <Check className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {folder.children.map((child) => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Success state view
  if (saveResult) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        style={{ background: "rgba(18, 15, 13, 0.75)" }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-xl overflow-hidden animate-fade-in shadow-2xl"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-modal)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" style={{ color: "var(--success)" }} />
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                Saved Successfully
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: "rgba(124, 179, 128, 0.08)",
                border: "1px solid rgba(124, 179, 128, 0.2)",
              }}
            >
              <Check className="h-10 w-10 mx-auto mb-2" style={{ color: "var(--success)" }} />
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                {type === "folder" ? "Folder saved!" : "Note saved!"}
              </p>
              {type === "folder" && saveResult.savedResource?.noteCount && (
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {saveResult.savedResource.noteCount} note{saveResult.savedResource.noteCount !== 1 ? "s" : ""} copied to your account
                </p>
              )}
            </div>

            <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              You can find "{resourceName}" in your notes.
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end px-6 py-3.5"
            style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
          >
            <button onClick={onClose} className="btn-primary px-5 py-1.5 text-xs font-medium cursor-pointer">
              Done
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(18, 15, 13, 0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] rounded-xl overflow-hidden flex flex-col animate-fade-in shadow-2xl"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-modal)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Save to My Notes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Resource being saved */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Saving
            </p>
            <p className="font-medium truncate text-sm" style={{ color: "var(--text-primary)" }}>
              {resourceName || "Untitled"}
            </p>
          </div>

          {/* Destination selection */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Choose destination folder
            </label>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
              </div>
            ) : (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                }}
              >
                {/* Root level option */}
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                  style={{
                    background: selectedFolderId === null ? "rgba(224, 144, 80, 0.12)" : "transparent",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                  onClick={() => setSelectedFolderId(null)}
                >
                  <Home className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs font-medium flex-1" style={{ color: "var(--text-primary)" }}>
                    {type === "folder" ? "Root Level (No Parent)" : "No Folder (Root)"}
                  </span>
                  {selectedFolderId === null && (
                    <Check className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                  )}
                </div>

                {/* Folder tree */}
                <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {folders.length > 0 ? (
                    folders.map((folder) => renderFolderItem(folder))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                      No folders yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Create new folder inline */}
          {!showCreateFolder ? (
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
              style={{ color: "var(--accent)" }}
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Create new folder
            </button>
          ) : (
            <form onSubmit={handleCreateFolder} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name"
                  className="input flex-1 text-xs"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  {creatingFolder ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName("");
                  }}
                  className="btn-ghost px-2.5 py-1.5 text-xs"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {selectedFolderId
                  ? "New folder will be created inside the selected folder"
                  : "New folder will be created at root level"}
              </p>
            </form>
          )}

          {/* Info text */}
          <div
            className="rounded-lg p-3 text-xs leading-relaxed"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            {type === "folder"
              ? "The entire folder structure including all notes will be copied to your account."
              : "A copy of this note will be saved to your account."}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2.5 px-6 py-3.5 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
        >
          <button onClick={onClose} className="btn-ghost px-3.5 py-1.5 text-xs font-medium cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary px-4 py-1.5 flex items-center gap-1.5 text-xs font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save {type === "folder" ? "Folder" : "Note"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
