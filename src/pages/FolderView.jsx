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
  Upload,
  ChevronDown,
  X,
  Check,
  Download,
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  getFolder,
  deleteNote,
  deleteFolder,
  createNote,
  searchFolderNotes,
} from "../services/api";
import Loader from "../components/Loader";
import ShareButton from "../components/ShareButton";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";
import { useFolders } from "../contexts/FolderContext";
import { stripMarkdown, calculateReadingTime } from "../utils/markdownHelpers";

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
  const [isDownloading, setIsDownloading] = useState(false);

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

  useEffect(() => {
    fetchFolderData();
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    let cancelled = false;
    const doSearch = async () => {
      try {
        const data = await searchFolderNotes(id, debouncedSearchTerm);
        if (!cancelled) setSearchResults(data.notes);
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setSearchResults([]);
      }
    };
    doSearch();
    return () => { cancelled = true; };
  }, [debouncedSearchTerm, id]);

  const handleBulkUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const markdownFiles = files.filter(
      (file) =>
        file.name.toLowerCase().endsWith(".md") ||
        file.name.toLowerCase().endsWith(".markdown")
    );

    if (!markdownFiles.length) {
      toast.error("Please select markdown files (.md)");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(
      markdownFiles.map((file) => ({
        name: file.name,
        status: "pending",
      }))
    );

    for (let i = 0; i < markdownFiles.length; i++) {
      const file = markdownFiles[i];
      try {
        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "uploading" } : item
          )
        );

        const content = await file.text();
        const title = file.name.replace(/\.(md|markdown)$/i, "");

        await createNote({
          title,
          content,
          folder: id,
        });

        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "success" } : item
          )
        );
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "error" } : item
          )
        );
      }
    }

    await fetchFolderData();
    refreshFolders();
    toast.success("Upload finished!");
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress([]);
    }, 2000);
    event.target.value = "";
  };

  const handleDownloadZip = async () => {
    if (!folderData?.notes || folderData.notes.length === 0) {
      toast.error("No notes to download");
      return;
    }

    try {
      setIsDownloading(true);
      toast.loading("Generating ZIP archive...", { id: "zip-toast" });

      const zip = new JSZip();
      const folderName = folderData.folder?.name || "notes";
      const sanitizedFolderName = folderName.replace(/[^a-zA-Z0-9_-]/g, "_");

      folderData.notes.forEach((note) => {
        const sanitizedTitle = (note.title || "untitled").replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );
        const fileName = `${sanitizedTitle}.md`;
        let content = `# ${note.title || "Untitled"}\n\n`;
        if (note.createdAt) {
          content += `*Created: ${new Date(note.createdAt).toLocaleDateString()}*\n\n`;
        }
        content += note.content || "";
        zip.file(fileName, content);
      });

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      saveAs(zipBlob, `${sanitizedFolderName}.zip`);
      toast.success("ZIP downloaded successfully!", { id: "zip-toast" });
    } catch (error) {
      console.error("Failed to generate ZIP:", error);
      toast.error("Failed to generate ZIP", { id: "zip-toast" });
    } finally {
      setIsDownloading(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    onConfirm: () => {},
  });

  const handleDeleteFolder = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Notebook?",
      message: `Are you sure you want to delete "${folderData.folder.name}"? All notes within it will be moved to the Trash.`,
      confirmText: "Delete Notebook",
      onConfirm: async () => {
        try {
          await deleteFolder(id);
          toast.success("Notebook moved to Trash");
          refreshFolders();
          navigate("/app");
        } catch (error) {
          console.error("Failed to delete notebook:", error);
          toast.error("Failed to delete notebook");
        }
      },
    });
  };

  const handleDeleteNote = (noteId, noteTitle) => {
    setConfirmModal({
      isOpen: true,
      title: "Move to Trash?",
      message: `Are you sure you want to move "${noteTitle}" to the Trash?`,
      confirmText: "Move to Trash",
      onConfirm: async () => {
        try {
          await deleteNote(noteId);
          toast.success("Note moved to Trash");
          await fetchFolderData();
          refreshFolders();
        } catch (error) {
          console.error("Failed to delete note:", error);
          toast.error("Failed to move note to trash");
        }
      },
    });
  };

  const filteredNotes = useMemo(() => {
    const sourceNotes = searchResults !== null ? searchResults : folderData?.notes;
    if (!sourceNotes) return [];

    const notes = [...sourceNotes];

    notes.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "title":
          aVal = (a.title || "").toLowerCase();
          bVal = (b.title || "").toLowerCase();
          break;
        case "updatedAt":
          aVal = new Date(a.updatedAt || a.createdAt);
          bVal = new Date(b.updatedAt || b.createdAt);
          break;
        default:
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return notes;
  }, [folderData?.notes, searchResults, sortBy, sortOrder]);

  const sortedSubfolders = useMemo(() => {
    if (!folderData?.subfolders) return [];
    return [...folderData.subfolders].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [folderData?.subfolders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader message="Loading notebook..." />
      </div>
    );
  }

  if (!folderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Notebook not found
        </h2>
        <Link to="/app" className="btn-primary flex items-center gap-2 text-xs">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const folder = folderData.folder;

  return (
    <div className="page-container py-6 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/app"
              className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {folder.icon || "📁"}
              </div>
              <div className="min-w-0">
                <h1
                  className="text-xl sm:text-2xl font-bold truncate tracking-tight"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "'Source Serif 4', Georgia, serif",
                  }}
                >
                  {folder.name}
                </h1>
                {folder.description && (
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {folder.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton
              type="folder"
              resourceId={id}
              resourceName={folder.name}
              size="default"
            />
            <button
              onClick={handleDeleteFolder}
              className="btn-danger flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
              title="Delete Notebook"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Action Ribbon & Search Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3 pt-2">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/app/create/${id}`}
              className="btn-primary flex items-center gap-1.5 text-xs font-semibold"
              style={{ padding: "0.45rem 0.85rem" }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Note</span>
            </Link>

            <div className="relative">
              <input
                type="file"
                multiple
                accept=".md,.markdown"
                onChange={handleBulkUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="btn-secondary flex items-center gap-1.5 text-xs font-medium cursor-pointer" style={{ padding: "0.45rem 0.85rem" }}>
                <Upload className="h-3.5 w-3.5" />
                <span>{isUploading ? "Uploading..." : "Upload .md"}</span>
              </div>
            </div>

            {filteredNotes.length > 0 && (
              <Link
                to={`/app/note/${filteredNotes[0]._id}?folder=${id}`}
                className="btn-secondary flex items-center gap-1.5 text-xs font-medium"
                style={{ padding: "0.45rem 0.85rem" }}
              >
                <Presentation className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Present</span>
              </Link>
            )}

            {folderData?.notes?.length > 0 && (
              <button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="btn-secondary flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                style={{ padding: "0.45rem 0.85rem" }}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {isDownloading ? "Zipping..." : "Export ZIP"}
                </span>
              </button>
            )}
          </div>

          {/* Search & Sort Filters */}
          <div className="flex items-center gap-2.5 flex-1 lg:justify-end">
            <div className="relative flex-1 lg:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search in notebook..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-search w-full text-xs"
                style={{ paddingLeft: "2.25rem", height: "36px" }}
              />
            </div>

            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split("-");
                  setSortBy(by);
                  setSortOrder(order);
                }}
                className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-xs cursor-pointer transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  height: "36px",
                }}
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
                <option value="updatedAt-desc">Recently Updated</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Subfolders Shelf */}
      {sortedSubfolders.length > 0 && (
        <div className="mb-8">
          <div className="section-header mb-3">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" style={{ color: "var(--accent)" }} />
              <h2 className="section-title">Subdirectories</h2>
              <span className="badge badge-neutral">{sortedSubfolders.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {sortedSubfolders.map((subfolder) => (
              <Link
                key={subfolder._id}
                to={`/app/folder/${subfolder._id}`}
                className="card card-hover p-3 flex items-center gap-2.5"
              >
                <span className="text-base flex-shrink-0">{subfolder.icon || "📁"}</span>
                <span className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {subfolder.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div>
        <div className="section-header mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <h2 className="section-title">Notes</h2>
            <span className="badge badge-neutral">{filteredNotes.length}</span>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <FileText className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <h3 className="empty-state-title">
              {searchTerm ? "No matching notes" : "Notebook is empty"}
            </h3>
            <p className="empty-state-description">
              {searchTerm
                ? "Try searching with different terms"
                : "Create your first note to begin this notebook"}
            </p>
            {!searchTerm && (
              <Link
                to={`/app/create/${id}`}
                className="btn-primary inline-flex items-center gap-2 text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Note</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Link
                key={note._id}
                to={`/app/note/${note._id}?folder=${id}`}
                className="card card-hover block p-5 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3
                      className="font-bold text-sm line-clamp-2 transition-colors group-hover:text-[var(--accent-light)]"
                      style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
                    >
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/app/edit/${note._id}`);
                        }}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        title="Edit note"
                      >
                        <Edit className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteNote(note._id, note.title);
                        }}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors"
                        title="Move to trash"
                      >
                        <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                      </button>
                    </div>
                  </div>

                  <p
                    className="text-xs line-clamp-3 mb-4 leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stripMarkdown(note.content).substring(0, 140)}...
                  </p>
                </div>

                <div
                  className="flex items-center justify-between text-[11px] font-mono pt-3"
                  style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-faint)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>{calculateReadingTime(note.content).text}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upload Progress Modal */}
      {isUploading && uploadProgress.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-5 shadow-2xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Importing Markdown Notes
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {uploadProgress.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] text-xs"
                >
                  <span className="truncate max-w-[200px]" style={{ color: "var(--text-secondary)" }}>
                    {file.name}
                  </span>
                  {file.status === "uploading" && (
                    <Loader variant="spinner" className="h-3.5 w-3.5" />
                  )}
                  {file.status === "success" && (
                    <Check className="h-4 w-4" style={{ color: "var(--success)" }} />
                  )}
                  {file.status === "error" && (
                    <X className="h-4 w-4" style={{ color: "var(--danger)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
