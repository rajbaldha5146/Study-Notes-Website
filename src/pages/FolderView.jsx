import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import { useFolders } from "../contexts/FolderContext";

export default function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshFolders } = useFolders();

  const [folderData, setFolderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Bulk upload handler
  const handleBulkUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const markdownFiles = files.filter(
      (file) =>
        file.name.toLowerCase().endsWith(".md") ||
        file.name.toLowerCase().endsWith(".markdown")
    );

    if (!markdownFiles.length) {
      toast.error("Please select markdown files (.md or .markdown)");
      event.target.value = "";
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
        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "uploading" } : item
          )
        );

        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const title = file.name.replace(/\.(md|markdown)$/i, "");

        const noteData = { title, content, folder: id };
        await createNote(noteData);

        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "success" } : item
          )
        );

        results.push({ file: file.name, success: true });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        const message = error?.message || "Upload failed";

        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i
              ? { ...item, status: "error", error: message }
              : item
          )
        );

        results.push({ file: file.name, success: false, error: message });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;

    if (successful > 0) {
      toast.success(
        `Successfully uploaded ${successful} file${successful > 1 ? "s" : ""}`
      );
      await fetchFolderData();
      refreshFolders?.();
    }

    if (failed > 0) {
      toast.error(`Failed to upload ${failed} file${failed > 1 ? "s" : ""}`);
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress([]);
    }, 2000);

    event.target.value = "";
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await fetchFolderData();
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFolderData = async () => {
    try {
      setLoading(true);
      const data = await getFolder(id);
      setFolderData(data);
    } catch (error) {
      console.error("Failed to fetch folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = useCallback(async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(noteId);
      toast.success("Note deleted successfully!");
      await fetchFolderData();
      refreshFolders?.();
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error(error.response?.data?.message || "Failed to delete note");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteFolder = useCallback(async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${folderData?.folder?.name}"? This will also delete all notes and subfolders inside it.`
      )
    )
      return;

    try {
      await deleteFolder(id);
      toast.success("Folder deleted successfully!");
      refreshFolders?.();
      navigate("/app");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error(error.response?.data?.message || "Failed to delete folder");
    }
  }, [id, folderData?.folder?.name, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Filter + sort notes
  const filteredNotes = useMemo(() => {
    if (!folderData?.notes) return [];

    let notes = [...folderData.notes];

    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    notes.sort((a, b) => {
      let aValue;
      let bValue;

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

    return notes;
  }, [folderData?.notes, debouncedSearchTerm, sortBy, sortOrder]);

  // Sort subfolders
  const sortedSubfolders = useMemo(() => {
    if (!folderData?.subfolders) return [];

    const list = [...folderData.subfolders];

    list.sort((a, b) => {
      let aValue;
      let bValue;

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

    return list;
  }, [folderData?.subfolders, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <BookLoader message="Loading folder contents..." />
      </div>
    );
  }

  if (!folderData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
        <h2 className="text-2xl font-bold text-slate-100 mb-3">
          Folder not found
        </h2>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-md shadow-blue-500/40 hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const folder = folderData.folder;

  return (
    <div className="min-h-screen pb-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="pt-6 pb-4 mb-6">
          {/* Top row */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/70 bg-slate-900/80 text-xs sm:text-sm text-slate-200 hover:border-blue-500/60 hover:text-blue-300 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/20 border border-slate-700 text-2xl">
                  {folder.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-50 truncate">
                    {folder.name}
                  </h1>
                  {folder.description && (
                    <p className="mt-1 text-sm text-slate-400 truncate">
                      {folder.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleDeleteFolder}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium shadow-sm shadow-red-500/40 hover:bg-red-600 transition-all flex-shrink-0"
              title="Delete folder"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>

          {/* Bottom row: actions + search + sort */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to={`/app/create/${id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-md shadow-blue-500/40 hover:shadow-blue-500/60 hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>New Note</span>
              </Link>

              <div className="relative">
                <input
                  id="bulk-upload"
                  type="file"
                  multiple
                  accept=".md,.markdown"
                  onChange={handleBulkUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <label
                  htmlFor="bulk-upload"
                  className={
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-md shadow-blue-500/40 hover:shadow-blue-500/60 transform transition-all cursor-pointer " +
                    (isUploading
                      ? "opacity-75 cursor-not-allowed hover:transform-none"
                      : "hover:-translate-y-0.5")
                  }
                >
                  <Upload
                    className={
                      "h-4 w-4 " + (isUploading ? "animate-bounce" : "")
                    }
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-md shadow-blue-500/40 hover:shadow-blue-500/60 transform hover:-translate-y-0.5 transition-all"
                >
                  <Presentation className="h-4 w-4" />
                  <span className="hidden md:inline">Present</span>
                  <span className="md:hidden">▶</span>
                </Link>
              )}
            </div>

            {/* Search & sort */}
            <div className="flex items-center gap-3 flex-1 lg:flex-initial lg:min-w-0">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 z-10" />
                <input
                  type="text"
                  placeholder="Search notes and subfolders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 bg-slate-900/80 border border-slate-700 focus:border-blue-500 focus:ring-0 shadow-sm shadow-slate-950/40 hover:shadow-md hover:shadow-slate-950/60 transition-all"
                />
              </div>

              {/* Sort control */}
              <div className="relative">
                <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700 shadow-sm shadow-slate-950/40 hover:shadow-md hover:shadow-slate-950/60 transition-all">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-4 pr-9 py-2.5 bg-transparent text-sm font-medium text-slate-100 focus:outline-none cursor-pointer border-r border-slate-700 rounded-l-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <option value="createdAt">📅 Date Created</option>
                      <option value="updatedAt">✏️ Date Modified</option>
                      <option value="title">🔤 Name</option>
                      <option value="size">📊 Size</option>
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                    className="px-2.5 py-2.5 rounded-r-xl hover:bg-slate-800/80 transition-colors border-l border-slate-700"
                    title={`Sort ${
                      sortOrder === "asc" ? "descending" : "ascending"
                    }`}
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4 text-slate-300" />
                    ) : (
                      <SortDesc className="h-4 w-4 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subfolders */}
        {sortedSubfolders.length > 0 && (
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Folder className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold text-slate-50">Subfolders</h2>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500/15 text-blue-300 rounded-full text-sm font-semibold">
                {sortedSubfolders.length}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedSubfolders.map((subfolder) => (
                <Link
                  key={subfolder._id}
                  to={`/app/folder/${subfolder._id}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 shadow-md shadow-slate-950/70 hover:shadow-xl hover:shadow-slate-950/80 hover:border-blue-500/70 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-5 flex flex-col h-full">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 border border-slate-700 flex items-center justify-center text-2xl">
                        {subfolder.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-50 truncate group-hover:text-blue-300 transition-colors">
                          {subfolder.name}
                        </h3>
                        {subfolder.description && (
                          <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                            {subfolder.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>Subfolder</span>
                      <span className="inline-flex items-center gap-1 text-blue-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-110 transition-transform" />
                        Open
                      </span>
                    </div>
                  </div>
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
                <FileText className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold text-slate-50">Notes</h2>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500/15 text-blue-300 rounded-full text-sm font-semibold">
                {filteredNotes.length}
              </div>
            </div>

            {(debouncedSearchTerm ||
              sortBy !== "createdAt" ||
              sortOrder !== "desc") && (
              <div className="flex flex-wrap items-center gap-2">
                {debouncedSearchTerm && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-xs font-medium text-blue-200 border border-blue-500/40">
                    <Search className="h-3 w-3" />
                    <span>"{debouncedSearchTerm}"</span>
                  </div>
                )}

                {(sortBy !== "createdAt" || sortOrder !== "desc") && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 text-xs font-medium text-slate-200 border border-slate-600">
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
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-950/60">
                    <FileText className="h-12 w-12 text-slate-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/40">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-50 mb-3">
                  {searchTerm ? "No notes found" : "No notes yet"}
                </h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  {searchTerm
                    ? "Try adjusting your search criteria or create a new note."
                    : "Start building your knowledge base by creating your first note."}
                </p>

                {!searchTerm && (
                  <Link
                    to={`/app/create/${id}`}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-500/40 hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all"
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
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 shadow-md shadow-slate-950/70 hover:shadow-2xl hover:shadow-slate-950/90 hover:border-blue-500/70 transform hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-4 flex justify-between items-start gap-3">
                      <h3 className="flex-1 text-lg font-bold text-slate-50 line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {note.title}
                      </h3>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          to={`/app/edit/${note._id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors"
                          title="Edit note"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                        {note.content.substring(0, 180)}...
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="space-y-2 mb-4 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                        <span className="font-medium">Created:</span>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {sortBy === "updatedAt" && note.updatedAt && (
                        <div className="flex items-center gap-2">
                          <Edit className="h-3.5 w-3.5 text-blue-400" />
                          <span className="font-medium">Modified:</span>
                          <span>
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {sortBy === "size" && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-blue-400" />
                          <span className="font-medium">Size:</span>
                          <span>
                            {formatFileSize(note.content?.length || 0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View button */}
                    <Link
                      to={`/app/note/${note._id}`}
                      className="mt-auto block w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition-all"
                    >
                      <span className="flex items-center justify-center gap-2 px-4 py-3">
                        <span>View Note</span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </Link>
                  </div>

                  {/* Deco dots */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity delay-100" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload progress modal */}
        {isUploading && uploadProgress.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md max-h-96 overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-slate-950/90">
              <div className="border-b border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-50">
                    Uploading Files
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Upload className="h-4 w-4 animate-bounce text-blue-400" />
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

              <div className="max-h-64 overflow-y-auto px-4 py-3">
                <div className="space-y-3">
                  {uploadProgress.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl bg-slate-900/80 px-3 py-3 border border-slate-800"
                    >
                      <div className="flex-shrink-0">
                        {file.status === "pending" && (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-500" />
                        )}
                        {file.status === "uploading" && (
                          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        )}
                        {file.status === "success" && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {file.status === "error" && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-50">
                          {file.name}
                        </p>
                        {file.error && (
                          <p className="mt-1 text-xs text-red-400">
                            {file.error}
                          </p>
                        )}
                        {file.status === "success" && (
                          <p className="mt-1 text-xs text-emerald-400">
                            Uploaded successfully
                          </p>
                        )}
                        {file.status === "uploading" && (
                          <p className="mt-1 text-xs text-blue-400">
                            Uploading...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 px-4 py-3">
                <div className="h-2 w-full rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-300"
                    style={{
                      width: `${
                        (uploadProgress.filter(
                          (p) => p.status === "success" || p.status === "error"
                        ).length /
                          uploadProgress.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}