import { useState, useEffect } from "react";
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

  // Fetch folder tree on mount
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
      
      // Show success toast
      if (type === "folder" && result.savedResource?.noteCount) {
        toast.success(`Saved folder with ${result.savedResource.noteCount} notes!`);
      } else {
        toast.success("Saved to your notes!");
      }
      
      // Call success callback if provided
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
        color: "#6366f1",
      });
      
      toast.success("Folder created!");
      setNewFolderName("");
      setShowCreateFolder(false);
      
      // Refresh folders and select the new one
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
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? "bg-indigo-500/20 border border-indigo-500/50"
              : "hover:bg-neutral-800 border border-transparent"
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => setSelectedFolderId(folder._id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder._id);
              }}
              className="p-0.5 hover:bg-neutral-700 rounded"
            >
              <ChevronRight
                className={`h-4 w-4 text-neutral-500 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          ) : (
            <span className="w-5" />
          )}
          <span className="text-lg">{folder.icon || "📁"}</span>
          <span className="text-sm text-neutral-200 truncate flex-1">
            {folder.name}
          </span>
          {isSelected && <Check className="h-4 w-4 text-indigo-400" />}
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
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-neutral-100">
                Saved Successfully
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <Check className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-neutral-200 font-medium mb-1">
                {type === "folder" ? "Folder saved!" : "Note saved!"}
              </p>
              {type === "folder" && saveResult.savedResource?.noteCount && (
                <p className="text-sm text-neutral-400">
                  {saveResult.savedResource.noteCount} note{saveResult.savedResource.noteCount !== 1 ? "s" : ""} copied to your account
                </p>
              )}
            </div>

            <p className="text-sm text-neutral-400 text-center">
              You can find "{resourceName}" in your notes.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-neutral-800">
            <button onClick={onClose} className="btn-primary px-6 py-2">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Save className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-neutral-100">
              Save to My Notes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Resource being saved */}
          <div>
            <p className="text-sm text-neutral-400 mb-1">Saving</p>
            <p className="text-neutral-100 font-medium truncate">
              {resourceName || "Untitled"}
            </p>
          </div>

          {/* Destination selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Choose destination
            </label>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
              </div>
            ) : (
              <div className="border border-neutral-700 rounded-lg overflow-hidden">
                {/* Root level option */}
                <div
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                    selectedFolderId === null
                      ? "bg-indigo-500/20 border-b border-indigo-500/50"
                      : "hover:bg-neutral-800 border-b border-neutral-700"
                  }`}
                  onClick={() => setSelectedFolderId(null)}
                >
                  <Home className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-neutral-200 flex-1">
                    {type === "folder" ? "Root Level (No Parent)" : "No Folder"}
                  </span>
                  {selectedFolderId === null && (
                    <Check className="h-4 w-4 text-indigo-400" />
                  )}
                </div>

                {/* Folder tree */}
                <div className="max-h-48 overflow-y-auto">
                  {folders.length > 0 ? (
                    folders.map((folder) => renderFolderItem(folder))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-neutral-500">
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
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
            >
              <FolderPlus className="h-4 w-4" />
              Create new folder
            </button>
          ) : (
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name"
                  className="input flex-1 text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
                >
                  {creatingFolder ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
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
                  className="btn-ghost px-3 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                {selectedFolderId
                  ? "New folder will be created inside the selected folder"
                  : "New folder will be created at root level"}
              </p>
            </form>
          )}

          {/* Info text */}
          <div className="bg-neutral-800/50 rounded-lg p-3 text-sm text-neutral-400">
            <p>
              {type === "folder"
                ? "The entire folder structure including all notes will be copied to your account."
                : "A copy of this note will be saved to your account."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-800 flex-shrink-0">
          <button onClick={onClose} className="btn-ghost px-4 py-2">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary px-6 py-2 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save {type === "folder" ? "Folder" : "Note"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
