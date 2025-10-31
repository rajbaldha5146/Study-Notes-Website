import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Plus,
  FileText,
  Folder,
  Calendar,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  Presentation,
  SortAsc,
  SortDesc,
  Upload,
  X,
  Check,
} from "lucide-react";
import {
  getFolder,
  deleteNote,
  deleteFolder,
  createNote,
} from "../services/api";
import BookLoader from "../components/BookLoader";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { debounce } from "../utils/debounce";
import { useFolders } from "../contexts/FolderContext";

export default function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshFolders } = useFolders();

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Bulk upload handler
  const handleBulkUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Filter for markdown files
    const markdownFiles = files.filter(
      (file) => file.name.endsWith(".md") || file.name.endsWith(".markdown")
    );

    if (markdownFiles.length === 0) {
      toast.error("Please select markdown files (.md or .markdown)");
      return;
    }

    setIsUploading(true);
    setUploadProgress(
      markdownFiles.map((file) => ({
        name: file.name,
        status: "pending",
        error: null,
      }))
    );

    const results = [];

    for (let i = 0; i < markdownFiles.length; i++) {
      const file = markdownFiles[i];

      try {
        // Update progress
        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "uploading" } : item
          )
        );

        // Read file content
        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        // Extract title from filename (remove .md extension)
        const title = file.name.replace(/\.(md|markdown)$/i, "");

        // Create note
        const noteData = {
          title: title,
          content: content,
          folder: id,
        };

        await createNote(noteData);

        // Update progress
        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "success" } : item
          )
        );

        results.push({ file: file.name, success: true });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);

        // Update progress
        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i
              ? {
                  ...item,
                  status: "error",
                  error: error.message || "Upload failed",
                }
              : item
          )
        );

        results.push({ file: file.name, success: false, error: error.message });
      }
    }

    // Show results
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (successful > 0) {
      toast.success(
        `Successfully uploaded ${successful} file${successful > 1 ? "s" : ""}`
      );
      await fetchFolderData(); // Refresh the folder data
    }

    if (failed > 0) {
      toast.error(`Failed to upload ${failed} file${failed > 1 ? "s" : ""}`);
    }

    // Reset upload state after a delay to show final status
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress([]);
    }, 2000);

    // Clear the input
    event.target.value = "";
  };
  const [folderData, setFolderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchFolderData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const fetchFolderData = async () => {
    try {
      const data = await getFolder(id);
      setFolderData(data);
    } catch (error) {
      console.error("Failed to fetch folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = useCallback(async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(noteId);
        toast.success("Note deleted successfully!");
        await fetchFolderData();
      } catch (error) {
        console.error("Failed to delete note:", error);
        toast.error(error.response?.data?.message || "Failed to delete note");
      }
    }
  }, []);

  const handleDeleteFolder = useCallback(async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${folderData?.folder?.name}"? This will also delete all notes and subfolders inside it.`
      )
    ) {
      try {
        await deleteFolder(id);
        toast.success("Folder deleted successfully!");
        navigate("/app");
      } catch (error) {
        console.error("Failed to delete folder:", error);
        toast.error(error.response?.data?.message || "Failed to delete folder");
      }
    }
  }, [id, folderData?.folder?.name, navigate]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Memoize filtered and sorted notes
  const filteredNotes = useMemo(() => {
    if (!folderData?.notes) return [];

    let notes = folderData.notes;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      notes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const sortedNotes = [...notes].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
          break;
        case "size":
          aValue = a.content?.length || 0;
          bValue = b.content?.length || 0;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sortedNotes;
  }, [folderData?.notes, debouncedSearchTerm, sortBy, sortOrder]);

  // Memoize sorted subfolders
  const sortedSubfolders = useMemo(() => {
    if (!folderData?.subfolders) return [];

    return [...folderData.subfolders].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "title":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [folderData?.subfolders, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <BookLoader message="Loading folder contents..." />
      </div>
    );
  }

  if (!folderData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
          Folder not found
        </h2>
        <Link
          to="/app"
          className="text-primary-600 dark:text-primary-400 hover:underline mt-4 inline-block"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 sm:pb-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="pt-6 pb-4 mb-6">
          {/* Top Row: Back button + Title + Quick Actions */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link
                to="/app"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back</span>
              </Link>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl flex-shrink-0">
                  {folderData.folder.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
                    {folderData.folder.name}
                  </h1>
                  {folderData.folder.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      {folderData.folder.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Delete */}
            <button
              onClick={handleDeleteFolder}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
              title="Delete folder"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>

          {/* Bottom Row: Actions + Search + Sort */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to={`/app/create/${id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                <span>New Note</span>
              </Link>

              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".md,.markdown"
                  onChange={handleBulkUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="bulk-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="bulk-upload"
                  className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer ${
                    isUploading
                      ? "opacity-75 cursor-not-allowed transform-none"
                      : ""
                  }`}
                >
                  <Upload
                    className={`h-4 w-4 ${isUploading ? "animate-bounce" : ""}`}
                  />
                  <span className="hidden sm:inline">
                    {isUploading ? "Uploading..." : "Upload"}
                  </span>
                  <span className="sm:hidden">
                    {isUploading ? "..." : "Upload"}
                  </span>
                </label>
              </div>

              {filteredNotes.length > 0 && (
                <Link
                  to={`/app/note/${filteredNotes[0]._id}?folder=${id}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <Presentation className="h-4 w-4" />
                  <span className="hidden md:inline">Present</span>
                  <span className="md:hidden">▶</span>
                </Link>
              )}
            </div>

            {/* Search and Sort - Enhanced */}
            <div className="flex items-center gap-3 flex-1 lg:flex-initial lg:min-w-0">
              {/* Enhanced Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <input
                  type="text"
                  placeholder="Search notes and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="relative">
                <div className="flex items-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 bg-transparent text-gray-900 dark:text-gray-100 text-sm font-medium focus:outline-none cursor-pointer border-r border-gray-200 dark:border-gray-700 rounded-l-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <option
                        value="createdAt"
                        className="bg-white dark:bg-gray-800"
                      >
                        📅 Date Created
                      </option>
                      <option
                        value="updatedAt"
                        className="bg-white dark:bg-gray-800"
                      >
                        ✏️ Date Modified
                      </option>
                      <option
                        value="title"
                        className="bg-white dark:bg-gray-800"
                      >
                        🔤 Name
                      </option>
                      <option
                        value="size"
                        className="bg-white dark:bg-gray-800"
                      >
                        📊 Size
                      </option>
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-lg transition-colors border-l border-gray-200 dark:border-gray-700"
                    title={`Sort ${
                      sortOrder === "asc" ? "descending" : "ascending"
                    }`}
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <SortDesc className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subfolders */}
        {sortedSubfolders && sortedSubfolders.length > 0 && (
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Folder className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Subfolders
                </h2>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                {sortedSubfolders.length}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedSubfolders.map((subfolder) => (
                <Link
                  key={subfolder._id}
                  to={`/app/folder/${subfolder._id}`}
                  className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      {subfolder.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {subfolder.name}
                      </h3>
                      {subfolder.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {subfolder.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Notes
                </h2>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-semibold">
                {filteredNotes.length}
              </div>
            </div>

            {(debouncedSearchTerm ||
              sortBy !== "createdAt" ||
              sortOrder !== "desc") && (
              <div className="flex flex-wrap items-center gap-2">
                {debouncedSearchTerm && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-xs font-medium">
                    <Search className="h-3 w-3" />
                    <span>"{debouncedSearchTerm}"</span>
                  </div>
                )}
                {(sortBy !== "createdAt" || sortOrder !== "desc") && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-medium">
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-3 w-3" />
                    ) : (
                      <SortDesc className="h-3 w-3" />
                    )}
                    <span>
                      {sortBy === "createdAt"
                        ? "Date Created"
                        : sortBy === "updatedAt"
                        ? "Date Modified"
                        : sortBy === "title"
                        ? "Name"
                        : "Size"}
                      ({sortOrder === "asc" ? "↑" : "↓"})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                  {searchTerm ? "No notes found" : "No notes yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  {searchTerm
                    ? "Try adjusting your search criteria or create a new note"
                    : "Start building your knowledge base by creating your first note"}
                </p>

                {!searchTerm && (
                  <Link
                    to={`/app/create/${id}`}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create Your First Note</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className="group relative bg-gradient-to-br from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2 flex-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                        {note.title}
                      </h3>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          to={`/app/edit/${note._id}`}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 transform hover:scale-110"
                          title="Edit note"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200 transform hover:scale-110"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="mb-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                        {note.content.substring(0, 180)}...
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-medium">
                          {sortBy === "createdAt" ? "Created" : "Created"}:
                        </span>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {sortBy === "updatedAt" && note.updatedAt && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Edit className="h-3.5 w-3.5 text-blue-500" />
                          <span className="font-medium">Modified:</span>
                          <span>
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {sortBy === "size" && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <FileText className="h-3.5 w-3.5 text-purple-500" />
                          <span className="font-medium">Size:</span>
                          <span>
                            {formatFileSize(note.content?.length || 0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/app/note/${note._id}`}
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>View Note</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </Link>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress Modal */}
        {isUploading && uploadProgress.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Uploading Files
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Upload className="h-4 w-4 animate-bounce" />
                    <span>
                      {
                        uploadProgress.filter((p) => p.status === "success")
                          .length
                      }{" "}
                      / {uploadProgress.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {uploadProgress.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {file.status === "pending" && (
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                        )}
                        {file.status === "uploading" && (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {file.status === "success" && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {file.status === "error" && (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        {file.error && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {file.error}
                          </p>
                        )}
                        {file.status === "success" && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Uploaded successfully
                          </p>
                        )}
                        {file.status === "uploading" && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Uploading...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (uploadProgress.filter(
                          (p) => p.status === "success" || p.status === "error"
                        ).length /
                          uploadProgress.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
