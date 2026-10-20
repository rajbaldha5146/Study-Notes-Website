import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import {
  getTrashNotes,
  restoreNote,
  restoreBulkNotes,
  deleteBulkNotes,
  emptyTrash,
  permanentDeleteNote,
} from "../services/api";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

export default function TrashView() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    onConfirm: () => {},
  });

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const data = await getTrashNotes();
      setNotes(data);
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to load trash:", error);
      toast.error("Failed to load trash items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notes.map((n) => n._id));
    }
  };

  const handleSingleRestore = async (id, title) => {
    try {
      await restoreNote(id);
      toast.success(`Restored "${title}"`);
      await fetchTrash();
    } catch (error) {
      toast.error("Failed to restore note");
    }
  };

  const handleSingleDelete = (id, title) => {
    setConfirmModal({
      isOpen: true,
      title: "Permanently Delete Note?",
      message: `Are you sure you want to permanently delete "${title}"? This action CANNOT be undone.`,
      confirmText: "Delete Permanently",
      onConfirm: async () => {
        try {
          await permanentDeleteNote(id);
          toast.success("Note permanently deleted");
          await fetchTrash();
        } catch (error) {
          toast.error("Failed to delete note");
        }
      },
    });
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    try {
      await restoreBulkNotes(selectedIds);
      toast.success(`Restored ${selectedIds.length} note(s)`);
      await fetchTrash();
    } catch (error) {
      toast.error("Failed to restore selected notes");
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Permanently Delete Selected Notes?",
      message: `Are you sure you want to permanently delete ${selectedIds.length} selected note(s)? This action CANNOT be undone.`,
      confirmText: "Delete Permanently",
      onConfirm: async () => {
        try {
          await deleteBulkNotes(selectedIds);
          toast.success(`Permanently deleted ${selectedIds.length} note(s)`);
          await fetchTrash();
        } catch (error) {
          toast.error("Failed to delete selected notes");
        }
      },
    });
  };

  const handleEmptyTrash = () => {
    if (notes.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Empty Trash Bin?",
      message: "Are you sure you want to permanently delete ALL notes in trash? This action CANNOT be undone.",
      confirmText: "Empty Trash",
      onConfirm: async () => {
        try {
          await emptyTrash();
          toast.success("Trash emptied");
          await fetchTrash();
        } catch (error) {
          toast.error("Failed to empty trash");
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="page-container py-12 flex justify-center items-center min-h-[60vh]">
        <Loader message="Loading Trash..." />
      </div>
    );
  }

  const allSelected = notes.length > 0 && selectedIds.length === notes.length;

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app")}
            className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl sm:text-2xl font-bold tracking-tight"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "'Source Serif 4', Georgia, serif",
                }}
              >
                Recycle Bin
              </h1>
              <span className="badge badge-neutral text-xs">{notes.length}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Items in trash can be restored or purged permanently.
            </p>
          </div>
        </div>

        {notes.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="btn-danger flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      {notes.length > 0 && (
        <div
          className="p-3.5 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-4"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4" style={{ color: "var(--accent)" }} />
            ) : (
              <Square className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            )}
            <span>
              {allSelected ? "Deselect All" : "Select All"} ({notes.length})
            </span>
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium mr-1 font-mono" style={{ color: "var(--text-muted)" }}>
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleBulkRestore}
                className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5 font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="btn-danger flex items-center gap-1.5 text-xs px-3 py-1.5 font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Purge</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trash Note Cards */}
      {notes.length === 0 ? (
        <div className="empty-state">
          <Trash2 className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <h3 className="empty-state-title">Recycle Bin is Empty</h3>
          <p className="empty-state-description">
            Deleted notes will appear here so you can recover them anytime.
          </p>
          <Link to="/app" className="btn-primary inline-flex items-center gap-2 text-xs">
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const isSelected = selectedIds.includes(note._id);
            return (
              <div
                key={note._id}
                className="card card-hover p-5 relative group flex flex-col justify-between"
                style={{
                  background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                  borderColor: isSelected ? "var(--accent)" : "var(--border-subtle)",
                  boxShadow: isSelected ? "0 0 0 1px var(--accent)" : "none",
                }}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleSelect(note._id)}
                        className="cursor-pointer"
                        style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <h3 className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {note.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleSingleRestore(note._id, note.title)}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        style={{ color: "var(--success)" }}
                        title="Restore Note"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleSingleDelete(note._id, note.title)}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors"
                        style={{ color: "var(--danger)" }}
                        title="Delete Permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <p
                    className="text-xs line-clamp-2 mb-4 leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {note.content ? note.content.substring(0, 120).replace(/[#*`_]/g, "") : "No content"}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div
                  className="flex items-center justify-between text-xs pt-3"
                  style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-faint)" }}
                >
                  {note.folder && (
                    <span className="badge badge-neutral text-[10px]">
                      {note.folder.icon || "📁"} {note.folder.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] font-mono">
                    <Calendar className="h-3 w-3" />
                    {new Date(note.deletedAt || note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
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
