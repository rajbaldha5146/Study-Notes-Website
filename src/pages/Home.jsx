import { useState, useEffect, useMemo } from "react";
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
  globalSearchNotes,
  getFavoriteNotes,
} from "../services/api";
import BookLoader from "../components/BookLoader";
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

  // Limit recently viewed notes to max 5
  const recentNotes = useMemo(() => {
    const raw = getRecentNotes() || [];
    return raw.slice(0, 5);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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

  // Global search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await globalSearchNotes(searchTerm);
        setSearchResults(data.results);
      } catch (error) {
        console.error("Global search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      toast.success("Order saved");
      refreshFolders();
    } catch {
      toast.error("Failed to update order");
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
      <div className="page-container">
        <div className="flex justify-center items-center h-[60vh]">
          <BookLoader message="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8" style={{ animation: "fade-up 0.3s ease both" }}>
      {/* Header, Actions, Global Search */}
      <div className="mb-10 space-y-6">
        <div>
          <h1
            className="text-3xl font-extrabold mb-2 tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Welcome back,{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--violet-light), var(--cyan-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your Vault
            </span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            Organize your thoughts. Everything in one place.
          </p>
        </div>

        {/* Quick Actions & Global Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center max-w-4xl">
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                const btn = document.querySelector('[title="Create new folder"]');
                if (btn) btn.click();
              }}
              className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 flex-1 md:flex-none whitespace-nowrap"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </button>
            <Link
              to="/app/create"
              className="btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 flex-1 md:flex-none whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </Link>
          </div>

          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search across all notes by heading..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-search w-full"
              style={{
                paddingLeft: "2.5rem",
                paddingRight: searchTerm ? "2.5rem" : "0.875rem",
                margin: 0,
                height: "42px",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: "var(--text-muted)" }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults !== null ? (
        <div style={{ animation: "fade-up 0.2s ease both" }}>
          <div className="section-header mb-4">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4" style={{ color: "var(--blue)" }} />
              <h2 className="section-title">Search Results</h2>
              <span className="badge badge-primary">{searchResults.length}</span>
            </div>
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="empty-state">
              <Search className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <h3 className="empty-state-title">No results found</h3>
              <p className="empty-state-description">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Link
                  key={result._id}
                  to={`/app/note/${result._id}`}
                  className="group block rounded-lg p-4 transition-all duration-150"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.background = "var(--bg-elevated)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.background = "var(--bg-card)";
                  }}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--blue)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="text-sm font-semibold truncate"
                          style={{
                            color: result.titleMatch
                              ? "var(--blue-light)"
                              : "var(--text-primary)",
                          }}
                        >
                          {result.title}
                        </h3>
                        {result.folder && (
                          <span className="badge badge-neutral text-xs flex-shrink-0">
                            {result.folder.icon || "📁"} {result.folder.name}
                          </span>
                        )}
                      </div>
                      {result.matchedHeadings.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {result.matchedHeadings.slice(0, 5).map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                              style={{
                                background: "rgba(74, 158, 255, 0.08)",
                                color: "var(--blue-light)",
                                border: "1px solid rgba(74, 158, 255, 0.15)",
                              }}
                            >
                              <span style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                                {"#".repeat(h.level)}
                              </span>
                              {h.text}
                            </span>
                          ))}
                          {result.matchedHeadings.length > 5 && (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              +{result.matchedHeadings.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Normal Dashboard View */
        <div className="space-y-10">
          {/* Recently Viewed Notes (Max 5) */}
          {recentNotes.length > 0 && (
            <div>
              <div className="section-header mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <h2 className="section-title">Recently Viewed</h2>
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
                    className="card card-hover p-3.5 group block"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <h3
                        className="font-medium text-xs truncate group-hover:text-indigo-400 transition-colors"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {note.title}
                      </h3>
                    </div>
                    <p
                      className="text-xs line-clamp-1 mb-2"
                      style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}
                    >
                      {note.excerpt || note.folderName}
                    </p>
                    <span className="text-[10px] block" style={{ color: "var(--text-faint)" }}>
                      {note.folderName}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Main Folders Grid (includes Favorites Folder Card) */}
          <div>
            <div className="section-header mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Folder className="h-4 w-4" style={{ color: "var(--violet)" }} />
                <h2 className="section-title">Your Folders</h2>
                <span className="badge badge-primary">
                  {folders.length + (favoriteNotes.length > 0 ? 1 : 0)}
                </span>
                <div
                  className="flex items-center gap-1.5 text-xs ml-auto"
                  style={{ color: "var(--text-muted)" }}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                  <span>Drag to reorder</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* ⭐ Special Favorites Folder Card */}
              {favoriteNotes.length > 0 && (
                <div
                  onClick={() => setShowFavoritesModal(true)}
                  className="group block rounded-xl relative overflow-hidden cursor-pointer"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    padding: "1.25rem 1.25rem 1.25rem 1.25rem",
                    transition:
                      "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = "rgba(234, 179, 8, 0.6)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(234, 179, 8, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(234, 179, 8, 0.3)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Top gold accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{
                      background:
                        "linear-gradient(90deg, #eab308, rgba(234, 179, 8, 0.2))",
                    }}
                  />

                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{
                        background: "rgba(234, 179, 8, 0.15)",
                        border: "1px solid rgba(234, 179, 8, 0.3)",
                      }}
                    >
                      ⭐
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold truncate group-hover:text-yellow-400 transition-colors"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.9375rem",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Favorites Vault
                      </h3>
                      <p
                        className="text-xs mt-0.5 line-clamp-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Your starred study notes
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: "#eab308" }}
                    >
                      <Star className="h-3.5 w-3.5 fill-yellow-500" />
                      <span>{favoriteNotes.length} notes</span>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      style={{ color: "#eab308" }}
                    />
                  </div>
                </div>
              )}

              {/* Regular Folders */}
              {folders.map((folder, index) => {
                const accentColor = folder.color || "#8b5cf6";
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
                      transform:
                        draggedIndex === index ? "scale(0.96) rotate(1deg)" : "none",
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                    }}
                  >
                    {/* Drag handle */}
                    <div
                      className="absolute top-3 left-3 z-10 p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110"
                      style={{
                        background: "rgba(15,23,42,0.8)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <GripVertical
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>

                    <Link
                      to={`/app/folder/${folder._id}`}
                      className="group block rounded-xl pl-10 relative overflow-hidden"
                      style={{
                        background: "var(--bg-card)",
                        border: `1px solid var(--border-subtle)`,
                        transition:
                          "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                        padding: "1.25rem 1.25rem 1.25rem 3rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.borderColor = `${accentColor}40`;
                        e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.3), 0 0 20px ${accentColor}15`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "var(--border-subtle)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-0.5"
                        style={{
                          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                          opacity: 0.7,
                        }}
                      />

                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
                            border: `1px solid ${accentColor}25`,
                          }}
                        >
                          {folder.icon || "📁"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold truncate transition-colors"
                            style={{
                              color: "var(--text-primary)",
                              fontSize: "0.9375rem",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {folder.name}
                          </h3>
                          {folder.description && (
                            <p
                              className="text-xs mt-0.5 line-clamp-1"
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
                          className="flex items-center gap-3 text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {folder.children?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              {folder.children.length}
                            </span>
                          )}
                          {folder.noteCount > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {folder.noteCount}
                            </span>
                          )}
                        </div>
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          style={{ color: accentColor }}
                        />
                      </div>
                    </Link>
                  </div>
                );
              })}

              {/* Add Folder Card */}
              <button
                onClick={() => {
                  const btn = document.querySelector('[title="Create new folder"]');
                  if (btn) btn.click();
                }}
                className="flex flex-col items-center justify-center min-h-[140px] rounded-xl transition-all duration-200 hover:-translate-y-1"
                style={{
                  border: "1px dashed var(--border-default)",
                  background: "transparent",
                  color: "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
                  e.currentTarget.style.color = "var(--violet-light)";
                  e.currentTarget.style.background = "rgba(139,92,246,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <FolderPlus className="h-5 w-5 mb-2" />
                <span className="text-sm font-semibold">New Folder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ Favorites Vault Modal */}
      {showFavoritesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowFavoritesModal(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl p-6 max-h-[85vh] flex flex-col"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: "rgba(234, 179, 8, 0.15)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                  }}
                >
                  ⭐
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-100">
                    Favorites Vault
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {favoriteNotes.length} starred study note(s)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFavoritesModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="relative mb-4">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Filter favorites..."
                value={favSearchQuery}
                onChange={(e) => setFavSearchQuery(e.target.value)}
                className="input-search w-full"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>

            {/* Favorites Note List */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {filteredFavs.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">
                    {favSearchQuery ? "No matching favorites found" : "No favorite notes yet"}
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
                    className="card p-4 block group hover:bg-neutral-800/60 transition-all border border-neutral-800 hover:border-yellow-500/40"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        <h3 className="font-semibold text-sm text-neutral-100 group-hover:text-yellow-400 transition-colors truncate">
                          {note.title}
                        </h3>
                      </div>
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                      {note.content
                        ? note.content.substring(0, 120).replace(/[#*`_]/g, "")
                        : "No content"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      {note.folder && (
                        <span className="badge badge-neutral text-xs">
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
        </div>
      )}
    </div>
  );
}
