import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { createFolder } from "../services/api";
import { useFolders } from "../contexts/FolderContext";
import { sanitizeName } from "../utils/sanitize";
import toast from "react-hot-toast";

const folderIcons = [
  "📁", "📚", "💻", "🎯", "🔬", "🎨", "📊", "🏗️",
  "🌟", "🚀", "💡", "🔥", "⚡", "🎪", "🎭", "📝",
];

const folderColors = [
  "#e09050", "#d9886a", "#d4a947", "#7cb380",
  "#58a6ff", "#b084cc", "#d95b4e", "#8a5a30",
];

export default function CreateFolderModal({
  parentId,
  onClose,
  onFolderCreated,
}) {
  const { refreshFolders } = useFolders();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📁",
    color: "#e09050",
    parentFolder: parentId,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedName = sanitizeName(formData.name);

    if (!sanitizedName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    setLoading(true);
    try {
      const folderData = {
        ...formData,
        name: sanitizedName,
        description: formData.description.trim(),
      };

      const newFolder = await createFolder(folderData);
      toast.success("Folder created!");
      refreshFolders();
      onFolderCreated(newFolder);
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error(error.response?.data?.message || "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden transition-all"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Create New Folder
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Folder Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input text-xs"
              placeholder="e.g. Design Systems, React Architecture"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Description <span className="font-normal opacity-60">(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input text-xs resize-none"
              placeholder="Brief summary of notes in this notebook"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Icon
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {folderIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className="p-1.5 text-base rounded-lg border transition-all cursor-pointer flex items-center justify-center"
                  style={{
                    background: formData.icon === icon ? "rgba(224, 144, 80, 0.18)" : "var(--bg-elevated)",
                    borderColor: formData.icon === icon ? "var(--accent)" : "var(--border-subtle)",
                    transform: formData.icon === icon ? "scale(1.08)" : "none",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Color Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {folderColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className="w-6 h-6 rounded-full transition-transform cursor-pointer"
                  style={{
                    backgroundColor: color,
                    border: formData.color === color ? "2px solid #ffffff" : "2px solid transparent",
                    boxShadow: formData.color === color ? "0 0 0 2px " + color : "none",
                    transform: formData.color === color ? "scale(1.15)" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="btn-primary text-xs px-5 py-2 font-semibold"
            >
              {loading ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
