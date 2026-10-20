import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  Folder,
  FolderPlus,
  FileText,
  ArrowRight,
  Plus,
  GripVertical,
  Search,
  X,
  Clock,
  Star,
} from "lucide-react";
import {
  getFolderTree,
  reorderFolders,
  getFavoriteNotes,
} from "../services/api";
import Loader from "../components/Loader";
import { useFolders } from "../contexts/FolderContext";
import { getRecentNotes } from "../utils/markdownHelpers";
import toast from "react-hot-toast";

export default function Home() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [favSearchQuery, setFavSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const { refreshTrigger, refreshFolders } = useFolders();

  const recentNotes = useMemo(() => {
    const raw = getRecentNotes() || [];
    return raw.slice(0, 5);
  }, []);

  const countFolderNotes = (folder) => {
    let count = folder.noteCount || 0;
    if (folder.children && folder.children.length > 0) {
      folder.children.forEach((child) => {
        count += countFolderNotes(child);
      });
    }
    return count;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [data, favs] = await Promise.all([
          getFolderTree(),
          getFavoriteNotes().catch(() => []),
        ]);
        const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        if (isMounted) {
          setFolders(sortedData);
          setFavoriteNotes(favs);
        }
      } catch (error) {
        console.error("Failed to fetch home data:", error);
        if (isMounted) {
          setFolders([]);
          toast.error("Failed to load dashboard data");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFolders = [...folders];
    const draggedFolder = newFolders[draggedIndex];
    newFolders.splice(draggedIndex, 1);
    newFolders.splice(index, 0, draggedFolder);
    setFolders(newFolders);
    setDraggedIndex(index);
  };
  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    try {
      const folderOrders = folders.map((folder, index) => ({
        id: folder._id,
        order: index,
      }));
      await reorderFolders(folderOrders);
      toast.success("Folder order saved");
      refreshFolders();
    } catch {
      toast.error("Failed to update folder order");
    } finally {
      setDraggedIndex(null);
    }
  };

  const filteredFavs = useMemo(() => {
    if (!favSearchQuery.trim()) return favoriteNotes;
    const q = favSearchQuery.toLowerCase();
    return favoriteNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content && n.content.toLowerCase().includes(q))
    );
  }, [favoriteNotes, favSearchQuery]);

  if (loading) {
    return (
      <div className="page-container py-12">
        <Loader message="Loading your notebooks..." />
      </div>
    );
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Header, Search & Action Bar */}
      <div className="mb-10 space-y-6">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: "var(--text-primary)",
            }}
          >
            Welcome to your <span style={{ color: "var(--accent-light)", fontStyle: "italic" }}>Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            Review, write, and organize your knowledge vault.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 items-center">
          <button
            onClick={() => {
              const btn = document.querySelector('[title="Create folder"]');
              if (btn) btn.click();
            }}
            className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
          <Link
            to="/app/create"
            className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Note</span>
          </Link>
        </div>
      </div>

      {/* Regular Dashboard View */}
      <div className="space-y-10">
          {/* Recently Viewed Strip */}
          {recentNotes.length > 0 && (
            <div>
              <div className="section-header mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: "var(--accent-light)" }} />
                  <h2 className="section-title">Recently Read</h2>
                  <span className="badge badge-neutral">{recentNotes.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {recentNotes.map((note) => (
                  <Link
                    key={note._id}
                    to={`/app/note/${note._id}${
                      note.folderId ? `?folder=${note.folderId}` : ""
                    }`}
                    className="card card-hover p-3.5 group block flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                        <h3
                          className="font-semibold text-xs truncate transition-colors group-hover:text-[var(--accent-light)]"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {note.title}
                        </h3>
                      </div>
                      <p
                        className="text-xs line-clamp-2 mb-2 leading-relaxed"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {note.excerpt || note.folderName}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: "var(--text-faint)" }}>
                      {note.folderName}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Main Notebook Folders Grid */}
          <div>
            <div className="section-header mb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Folder className="h-4 w-4" style={{ color: "var(--accent)" }} />
                <h2 className="section-title">Notebooks</h2>
                <span className="badge badge-primary">
                  {folders.length + (favoriteNotes.length > 0 ? 1 : 0)}
                </span>
                <div
                  className="flex items-center gap-1.5 text-xs ml-auto"
                  style={{ color: "var(--text-muted)" }}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Drag to rearrange</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Starred Favorites Card */}
              {favoriteNotes.length > 0 && (
                <div
                  onClick={() => setShowFavoritesModal(true)}
                  className="card card-hover p-5 relative overflow-hidden cursor-pointer flex flex-col justify-between"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid rgba(212, 169, 71, 0.3)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{
                      background: "linear-gradient(90deg, #d4a947, rgba(212, 169, 71, 0.2))",
                    }}
                  />

                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: "rgba(212, 169, 71, 0.15)",
                        border: "1px solid rgba(212, 169, 71, 0.3)",
                      }}
                    >
                      ⭐
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-sm truncate tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Favorites Vault
                      </h3>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                        Starred & bookmarked notes
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <div
                      className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: "#d4a947" }}
                    >
                      <Star className="h-3.5 w-3.5 fill-[#d4a947]" />
                      <span>{favoriteNotes.length} notes</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: "#d4a947" }} />
                  </div>
                </div>
              )}

              {/* Folder Cards */}
              {folders.map((folder, index) => {
                const folderColor = folder.color || "var(--accent)";
                return (
                  <div
                    key={folder._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="relative"
                    style={{
                      opacity: draggedIndex === index ? 0.4 : 1,
                      transform: draggedIndex === index ? "scale(0.97)" : "none",
                    }}
                  >
                    {/* Drag Handle */}
                    <div
                      className="absolute top-3 left-3 z-10 p-1.5 rounded-md cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      title="Drag to rearrange"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>

                    <Link
                      to={`/app/folder/${folder._id}`}
                      className="card card-hover block p-5 pl-10 relative overflow-hidden flex flex-col justify-between h-full"
                    >
                      {/* Top Accent Strip */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                          backgroundColor: folderColor,
                          opacity: 0.8,
                        }}
                      />

                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          {folder.icon || "📁"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-sm truncate tracking-tight transition-colors group-hover:text-[var(--accent-light)]"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {folder.name}
                          </h3>
                          {folder.description && (
                            <p
                              className="text-xs mt-0.5 line-clamp-1 leading-relaxed"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {folder.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: "1px solid var(--border-subtle)" }}
                      >
                        <div
                          className="flex items-center gap-3 text-xs font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {folder.children?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              {folder.children.length}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {countFolderNotes(folder)}
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                      </div>
                    </Link>
                  </div>
                );
              })}

              {/* Add Folder Dashed Card */}
              <button
                onClick={() => {
                  const btn = document.querySelector('[title="Create folder"]');
                  if (btn) btn.click();
                }}
                className="flex flex-col items-center justify-center min-h-[140px] rounded-xl transition-all duration-200 border border-dashed hover:-translate-y-0.5 cursor-pointer p-5"
                style={{
                  borderColor: "var(--border-default)",
                  background: "transparent",
                  color: "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent-light)";
                  e.currentTarget.style.background = "rgba(224, 144, 80, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <FolderPlus className="h-5 w-5 mb-2" />
                <span className="text-xs font-semibold">New Folder</span>
              </button>
            </div>
          </div>
        </div>

      {/* Favorites Vault Modal */}
      {showFavoritesModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => setShowFavoritesModal(false)}
          >
          <div
            className="w-full max-w-2xl rounded-xl p-6 max-h-[85vh] flex flex-col shadow-2xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between mb-4 pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                  style={{
                    background: "rgba(212, 169, 71, 0.15)",
                    border: "1px solid rgba(212, 169, 71, 0.3)",
                  }}
                >
                  ⭐
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    Favorites Vault
                  </h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {favoriteNotes.length} starred study notes
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFavoritesModal(false)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Search inside Modal */}
            <div className="relative mb-4">
              <Search
                className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Filter favorites..."
                value={favSearchQuery}
                onChange={(e) => setFavSearchQuery(e.target.value)}
                className="input-search w-full text-xs"
                style={{ paddingLeft: "2.25rem" }}
              />
            </div>

            {/* Note List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
              {filteredFavs.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-7 w-7 mx-auto mb-2 opacity-30" />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {favSearchQuery ? "No matching favorite notes found" : "No favorite notes saved yet"}
                  </p>
                </div>
              ) : (
                filteredFavs.map((note) => (
                  <Link
                    key={note._id}
                    to={`/app/note/${note._id}${
                      note.folder?._id ? `?folder=${note.folder._id}` : ""
                    }`}
                    onClick={() => setShowFavoritesModal(false)}
                    className="card card-hover p-4 block transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                        <h3 className="font-semibold text-xs truncate" style={{ color: "var(--text-primary)" }}>
                          {note.title}
                        </h3>
                      </div>
                      <Star className="h-3.5 w-3.5 fill-[#d4a947] flex-shrink-0" style={{ color: "#d4a947" }} />
                    </div>
                    <p className="text-xs line-clamp-2 mb-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {note.content
                        ? note.content.substring(0, 120).replace(/[#*`_]/g, "")
                        : "No content"}
                    </p>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--text-faint)" }}>
                      {note.folder && (
                        <span className="badge badge-neutral text-[10px]">
                          {note.folder.icon || "📁"} {note.folder.name}
                        </span>
                      )}
                      <span>
                        {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
