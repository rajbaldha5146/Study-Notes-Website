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
} from "../services/api";
import BookLoader from "../components/BookLoader";
import ShareButton from "../components/ShareButton";
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

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

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

        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const title = file.name.replace(/\.(md|markdown)$/i, "");
        await createNote({ title, content, folder: id });

        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "success" } : item
          )
        );
      } catch (error) {
        setUploadProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "error" } : item
          )
        );
      }
    }

    const successful = uploadProgress.filter((p) => p.status === "success").length;
    if (successful > 0) {
      toast.success(`Uploaded ${successful} file(s)`);
      await fetchFolderData();
      refreshFolders?.();
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress([]);
    }, 1500);

    event.target.value = "";
  };

  const handleDeleteNote = useCallback(async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(noteId);
      toast.success("Note deleted");
      await fetchFolderData();
      refreshFolders?.();
    } catch (error) {
      toast.error("Failed to delete note");
    }
  }, []);

  const handleDeleteFolder = useCallback(async () => {
    if (!window.confirm(`Delete "${folderData?.folder?.name}"?`)) return;
    try {
      await deleteFolder(id);
      toast.success("Folder deleted");
      refreshFolders?.();
      navigate("/app");
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  }, [id, folderData?.folder?.name, navigate]);

  const handleDownloadZip = useCallback(async () => {
    if (!folderData?.notes || folderData.notes.length === 0) {
      toast.error("No notes to download");
      return;
    }

    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folderName = folderData.folder?.name || "notes";

      folderData.notes.forEach((note) => {
        const fileName = `${note.title.replace(/[^a-zA-Z0-9\s-]/g, "").trim()}.md`;
        zip.file(fileName, note.content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${folderName}.zip`);
      toast.success(`Downloaded ${folderData.notes.length} notes`);
    } catch (error) {
      console.error("Failed to create zip:", error);
      toast.error("Failed to download notes");
    } finally {
      setIsDownloading(false);
    }
  }, [folderData]);

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
      let aVal, bVal;
      switch (sortBy) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
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
  }, [folderData?.notes, debouncedSearchTerm, sortBy, sortOrder]);

  const sortedSubfolders = useMemo(() => {
    if (!folderData?.subfolders) return [];
    return [...folderData.subfolders].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [folderData?.subfolders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <BookLoader message="Loading..." />
      </div>
    );
  }

  if (!folderData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">
          Folder not found
        </h2>
        <Link to="/app" className="btn-primary flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const folder = folderData.folder;

  return (
    <div className="page-container py-6">
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumb & Actions */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/app"
                className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline" style={{ color: "var(--text-secondary)" }}>Back</span>
            </Link>

            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: folder.color ? `${folder.color}18` : "rgba(139,92,246,0.12)",
                  border: `1px solid ${folder.color ? folder.color + "30" : "rgba(139,92,246,0.2)"}`,
                }}
              >
                {folder.icon || "📁"}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-neutral-100 truncate">
                  {folder.name}
                </h1>
                {folder.description && (
                  <p className="text-sm text-neutral-500 truncate">
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
              className="btn-danger flex items-center gap-2 px-3 py-2 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/app/create/${id}`}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              New Note
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
              <div className="btn-secondary flex items-center gap-2 text-sm">
                <Upload className="h-4 w-4" />
                <span>{isUploading ? "Uploading..." : "Upload"}</span>
              </div>
            </div>

            {filteredNotes.length > 0 && (
              <Link
                to={`/app/note/${filteredNotes[0]._id}?folder=${id}`}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Presentation className="h-4 w-4" />
                <span className="hidden sm:inline">Present</span>
              </Link>
            )}

            {folderData?.notes?.length > 0 && (
              <button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isDownloading ? "Downloading..." : "Download"}
                </span>
              </button>
            )}
          </div>

          {/* Right: Search & Sort */}
          <div className="flex items-center gap-3 flex-1 lg:justify-end">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-search w-full"
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
                className="appearance-none px-3 py-2.5 pr-8 rounded-lg text-sm cursor-pointer transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
                <option value="updatedAt-desc">Recently Updated</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Subfolders */}
      {sortedSubfolders.length > 0 && (
        <div className="mb-8">
          <div className="section-header">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-medium text-neutral-400">
                Subfolders
              </h2>
              <span className="badge badge-neutral text-xs">
                {sortedSubfolders.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sortedSubfolders.map((subfolder) => (
              <Link
                key={subfolder._id}
                to={`/app/folder/${subfolder._id}`}
                className="card card-hover p-4 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{subfolder.icon || "📁"}</span>
                  <span className="text-sm font-medium text-neutral-300 truncate group-hover:text-indigo-400">
                    {subfolder.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <div className="section-header">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-500" />
            <h2 className="text-sm font-medium text-neutral-400">Notes</h2>
            <span className="badge badge-neutral text-xs">
              {filteredNotes.length}
            </span>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <h3 className="empty-state-title">
              {searchTerm ? "No notes found" : "No notes yet"}
            </h3>
            <p className="empty-state-description">
              {searchTerm
                ? "Try a different search term"
                : "Create your first note to get started"}
            </p>
            {!searchTerm && (
              <Link
                to={`/app/create/${id}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Note
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
          <div key={note._id} className="group relative rounded-xl overflow-hidden transition-all duration-200" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3), 0 0 16px rgba(139,92,246,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: "linear-gradient(180deg, var(--violet), var(--cyan))" }} />
            <div className="p-5 pl-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold line-clamp-2 transition-colors" style={{ color: "var(--text-primary)", fontSize: "0.9375rem", letterSpacing: "-0.01em" }}>
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Link
                      to={`/app/edit/${note._id}`}
                      className="p-1.5 rounded-lg hover:bg-neutral-800"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-neutral-500 hover:text-indigo-400" />
                    </Link>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <p className="text-sm line-clamp-3 mb-4" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {note.content.substring(0, 150)}...
                </p>

                <div className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-faint)" }}>
                  <Calendar className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>

                <Link
                  to={`/app/note/${note._id}`}
                  className="btn-primary block w-full text-center text-sm"
                  style={{ padding: "0.5rem", borderRadius: "0.5rem" }}
                >
                  View Note
                </Link>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Progress Modal */}
      {isUploading && uploadProgress.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "rgba(15,23,42,0.95)", border: "1px solid var(--border-subtle)", backdropFilter: "blur(20px)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <h3 className="text-lg font-semibold text-neutral-100 mb-4">
              Uploading Files
            </h3>
            <div className="space-y-2">
              {uploadProgress.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0"
                >
                  <span className="text-sm text-neutral-300 truncate">
                    {file.name}
                  </span>
                  {file.status === "uploading" && (
                    <div className="spinner" />
                  )}
                  {file.status === "success" && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                  {file.status === "error" && (
                    <X className="h-4 w-4 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
