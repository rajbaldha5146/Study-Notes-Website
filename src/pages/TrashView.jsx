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
import BookLoader from "../components/BookLoader";
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
      <div className="page-container py-8 flex justify-center items-center h-[60vh]">
        <BookLoader message="Loading Trash..." />
      </div>
    );
  }

  const allSelected = notes.length > 0 && selectedIds.length === notes.length;

  return (
    <div className="page-container py-8" style={{ animation: "fade-up 0.2s ease both" }}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app")}
            className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              <h1 className="text-2xl font-bold text-neutral-100">Trash / Recycle Bin</h1>
              <span className="badge badge-neutral text-xs">{notes.length}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Items in trash can be restored anytime or deleted permanently.
            </p>
          </div>
        </div>

        {notes.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="btn-danger flex items-center gap-2 text-xs self-start sm:self-auto"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      {notes.length > 0 && (
        <div
          className="p-4 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-4"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-blue-400" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span>
              {allSelected ? "Deselect All" : "Select All"} ({notes.length})
            </span>
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-400 font-medium mr-2">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleBulkRestore}
                className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore Selected</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="btn-danger flex items-center gap-1.5 text-xs px-3 py-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trash Items List */}
      {notes.length === 0 ? (
        <div className="empty-state">
          <Trash2 className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <h3 className="empty-state-title">Trash is Empty</h3>
          <p className="empty-state-description">
            Deleted notes will appear here so you can restore them anytime.
          </p>
          <Link to="/app" className="btn-primary inline-flex items-center gap-2 text-sm">
            Go to Vault
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const isSelected = selectedIds.includes(note._id);
            return (
              <div
                key={note._id}
                className={`card p-5 transition-all relative group ${
                  isSelected ? "ring-2 ring-blue-500/50" : ""
                }`}
                style={{
                  background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {/* Top bar with selection checkbox and actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => handleToggleSelect(note._id)}
                      className="p-1 text-neutral-400 hover:text-white transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <h3 className="font-bold text-sm text-neutral-100 truncate">
                      {note.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleSingleRestore(note._id, note.title)}
                      className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-neutral-400 hover:text-emerald-400 transition-colors"
                      title="Restore Note"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSingleDelete(note._id, note.title)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-xs line-clamp-2 mb-4" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {note.content ? note.content.substring(0, 120).replace(/[#*`_]/g, "") : "No content"}
                </p>

                {/* Meta info */}
                <div
                  className="flex items-center justify-between text-xs pt-3"
                  style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
                >
                  {note.folder && (
                    <span className="badge badge-neutral text-xs">
                      {note.folder.icon || "📁"} {note.folder.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px]">
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
