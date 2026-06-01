import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Folder, FolderPlus, FileText, ArrowRight, Plus, GripVertical } from "lucide-react";
import { getFolderTree, reorderFolders } from "../services/api";
import BookLoader from "../components/BookLoader";
import { useFolders } from "../contexts/FolderContext";
import toast from "react-hot-toast";

export default function Home() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const { refreshTrigger, refreshFolders } = useFolders();

  useEffect(() => {
    let isMounted = true;
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const data = await getFolderTree();
        const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        if (isMounted) setFolders(sortedData);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
        if (isMounted) {
          setFolders([]);
          toast.error("Failed to load folders");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFolders();
    return () => { isMounted = false; };
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
      const folderOrders = folders.map((folder, index) => ({ id: folder._id, order: index }));
      await reorderFolders(folderOrders);
      toast.success("Order saved");
      refreshFolders();
    } catch {
      toast.error("Failed to update order");
    } finally {
      setDraggedIndex(null);
    }
  };

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
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ letterSpacing: "-0.03em" }}>
          Welcome back,{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--violet-light), var(--cyan-light))",
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

      {folders.length === 0 ? (
        /* ── Empty State ── */
        <div className="space-y-8">
          {/* Main CTA card */}
          <div
            className="card p-10 sm:p-14 text-center"
            style={{
              background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(139,92,246,0.05) 100%)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "1.25rem",
            }}
          >
            {/* Orbit animation */}
            <div className="empty-state-orbit mx-auto mb-6">
              <div className="orbit-dot-1" />
              <div className="orbit-dot-2" />
              <div className="empty-state-icon-inner">
                <FolderPlus className="h-6 w-6" style={{ color: "var(--violet)" }} />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3" style={{ letterSpacing: "-0.02em" }}>
              Start building your vault
            </h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)", lineHeight: 1.65 }}>
              Create your first folder to begin organizing your notes. Folders keep related ideas together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  const btn = document.querySelector('[title="Create new folder"]');
                  if (btn) btn.click();
                }}
                className="btn-primary flex items-center gap-2 px-6 py-2.5"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Create Folder</span>
              </button>
              <Link
                to="/app/create"
                className="btn-secondary flex items-center gap-2 px-6 py-2.5"
              >
                <Plus className="h-4 w-4" />
                <span>Create Note</span>
              </Link>
            </div>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Folder, title: "Nested Folders", desc: "Create subfolders for deep organization", color: "#8b5cf6" },
              { icon: FileText, title: "Markdown", desc: "Write with syntax highlighting", color: "#06b6d4" },
              { icon: ArrowRight, title: "Slideshow", desc: "Present your notes beautifully", color: "#10b981" },
            ].map((f, i) => (
              <div
                key={i}
                className="card p-5"
                style={{
                  borderColor: `${f.color}20`,
                  background: `linear-gradient(135deg, var(--bg-card) 0%, ${f.color}08 100%)`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}
                >
                  <f.icon className="h-4 w-4" style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Folders Grid ── */
        <div>
          <div className="section-header mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Folder className="h-4 w-4" style={{ color: "var(--violet)" }} />
              <h2 className="section-title">Your Folders</h2>
              <span className="badge badge-primary">{folders.length}</span>
              <div className="flex items-center gap-1.5 text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                <GripVertical className="h-3.5 w-3.5" />
                <span>Drag to reorder</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    transform: draggedIndex === index ? "scale(0.96) rotate(1deg)" : "none",
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
                    <GripVertical className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                  </div>

                  {/* Drag indicator */}
                  {draggedIndex === index && (
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none z-20"
                      style={{
                        border: "2px dashed rgba(139,92,246,0.5)",
                        boxShadow: "inset 0 0 20px rgba(139,92,246,0.05)",
                      }}
                    />
                  )}

                  <Link
                    to={`/app/folder/${folder._id}`}
                    className="group block rounded-xl pl-10 relative overflow-hidden"
                    style={{
                      background: "var(--bg-card)",
                      border: `1px solid var(--border-subtle)`,
                      transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
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
                    {/* Colored top accent bar */}
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
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                            {folder.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--border-subtle)" }}
                    >
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
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
      )}
    </div>
  );
}
