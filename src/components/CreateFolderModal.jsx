import { useState } from "react";
import { X } from "lucide-react";
import { createFolder } from "../services/api";
import { useFolders } from "../contexts/FolderContext";
import { sanitizeName } from "../utils/sanitize";
import toast from "react-hot-toast";

const folderIcons = [
  "📁",
  "📚",
  "💻",
  "🎯",
  "🔬",
  "🎨",
  "📊",
  "🏗️",
  "🌟",
  "🚀",
  "💡",
  "🔥",
  "⚡",
  "🎪",
  "🎭",
  "🎪",
];

const folderColors = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#a855f7", // Violet
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#ef4444", // Red
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
        description: formData.description.trim()
      };
      
      const newFolder = await createFolder(folderData);
      toast.success("Folder created successfully!");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Create New Folder
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Folder Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., JavaScript, React, Data Structures"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
              {folderIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-2 text-lg rounded-md border-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    formData.icon === icon
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      ? "border-gray-800 dark:border-white"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-semibold text-sm sm:text-base order-1 sm:order-2"
              aria-label={loading ? "Creating folder" : "Create folder"}
            >
              {loading ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
