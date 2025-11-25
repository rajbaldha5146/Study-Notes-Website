import { useState } from "react";
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
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#10b981", "#06b6d4", "#f59e0b", "#ef4444",
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
    color: "#6366f1",
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h3 className="text-lg font-semibold text-neutral-100">
            Create Folder
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input"
              placeholder="Folder name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input resize-none"
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {folderIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-2 text-lg rounded-lg border ${
                    formData.icon === icon
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {folderColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color
                      ? "border-white"
                      : "border-neutral-700"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="btn-primary px-6 py-2"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
