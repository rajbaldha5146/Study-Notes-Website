import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  FileText,
  Folder,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Save,
  AlertCircle,
  Sun,
  Moon,
  Search,
  PanelLeft,
  Copy,
  Check,
  List,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import Loader from "../components/Loader";
import SaveToAccountModal from "../components/SaveToAccountModal";
import ReadingStatsBadge from "../components/ReadingStatsBadge";
import { getSharedContent } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";

export default function SharedContentView() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme, setTheme } = useTheme();

  // Default shared notes to light theme for optimal reading
  useEffect(() => {
    const userChoice = sessionStorage.getItem("shared_theme_user_chosen");
    if (!userChoice) {
      setTheme("light");
    }
  }, [setTheme]);

  const handleToggleTheme = () => {
    sessionStorage.setItem("shared_theme_user_chosen", "true");
    toggleTheme();
  };

  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchSharedContent();
  }, [shareId]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchSharedContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSharedContent(shareId);
      setSharedData(data);
    } catch (err) {
      console.error("Error fetching shared content:", err);
      const status = err.response?.status;
      if (status === 404) {
        setError("This share link is invalid or the content no longer exists.");
      } else if (status === 410) {
        setError("This share link has been revoked by the owner.");
      } else {
        setError("Failed to load shared content. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToAccount = () => {
    if (!user) {
      toast("Please sign in to save this to your account", { icon: "🔒" });
      navigate("/login", { state: { from: { pathname: `/share/${shareId}` } } });
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveSuccess = () => {
    toast.success("Saved to your notebooks!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <Loader type="page" message="Loading shared notebook..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
        <div className="card p-8 max-w-md text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-4" style={{ color: "var(--danger)" }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Content Unavailable
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>{error}</p>
          <Link to={user ? "/app" : "/"} className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {user ? "Go to My Notes" : "Go to Home"}
          </Link>
        </div>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
        <div className="card p-8 max-w-md text-center">
          <FileText className="h-10 w-10 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Content Not Found
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            The shared content you're looking for doesn't exist.
          </p>
          <Link to={user ? "/app" : "/"} className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {user ? "Go to My Notes" : "Go to Home"}
          </Link>
        </div>
      </div>
    );
  }

  const { type, owner, content } = sharedData;

  // Get resource name for the modal
  const resourceName = type === "folder" 
    ? content?.folder?.name 
    : content?.title;

  return (
    <div
      className="min-h-screen pb-16 flex flex-col"
      style={{
        background: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* Top Navbar */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md transition-colors"
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
              <img src="/logo.png" alt="NoteMaster" className="w-6 h-6 rounded-md object-cover" />
              <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
                NoteMaster
              </span>
            </Link>

            <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {type === "folder" ? "Shared Notebook" : "Shared Note"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--bg-hover)]"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4" style={{ color: "var(--accent)" }} />
              ) : (
                <Moon className="h-4 w-4" style={{ color: "var(--accent)" }} />
              )}
            </button>

            {/* Save to Account Button */}
            <button
              onClick={handleSaveToAccount}
              className="btn-primary flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              style={{ padding: "0.4rem 0.85rem" }}
              title={user ? "Save copy to your account" : "Sign in to save"}
            >
              <Save className="h-3.5 w-3.5" />
              <span>{type === "folder" ? "Save Folder" : "Save Note"}</span>
            </button>

            {user ? (
              <Link to="/app" className="btn-secondary text-xs" style={{ padding: "0.4rem 0.85rem" }}>
                My Workspace
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  state={{ from: { pathname: `/share/${shareId}` } }}
                  className="btn-ghost text-xs px-2.5 py-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-secondary text-xs"
                  style={{ padding: "0.4rem 0.85rem" }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main View Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Owner Info & Attribution Bar */}
        <div className="flex items-center justify-between text-xs mb-6 pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            <User className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Shared by <strong className="font-semibold text-[var(--text-primary)]">{owner?.name || "Unknown Author"}</strong></span>
          </div>

          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Read-only preview
          </div>
        </div>

        {/* Content based on type */}
        {type === "folder" ? (
          <SharedFolderExplorer content={content} />
        ) : (
          <div className="max-w-3xl mx-auto">
            <SharedNoteViewer content={content} />
          </div>
        )}
      </div>

      {/* Save to Account Modal */}
      {showSaveModal && (
        <SaveToAccountModal
          shareId={shareId}
          type={type}
          resourceName={resourceName}
          onClose={() => setShowSaveModal(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {/* Smooth Scroll-To-Top Button */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-2.5 rounded-lg transition-all duration-200 shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--accent)",
          }}
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Shared Folder Explorer Component (Folder view + NoteViewer split)
// -------------------------------------------------------------
function SharedFolderExplorer({ content }) {
  const { folder, notes = [], subfolders = [] } = content || {};

  // Flatten all notes from folder and nested subfolders for linear iteration
  const allNotes = useMemo(() => {
    const list = [];
    const extractNotes = (notesList, subList, currentFolderName) => {
      if (notesList && notesList.length > 0) {
        notesList.forEach((n) => {
          list.push({ ...n, folderName: currentFolderName });
        });
      }
      if (subList && subList.length > 0) {
        subList.forEach((sub) => {
          extractNotes(sub.notes, sub.subfolders, sub.folder?.name || currentFolderName);
        });
      }
    };
    extractNotes(notes, subfolders, folder?.name || "Notebook");
    return list;
  }, [notes, subfolders, folder]);

  const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentNote = allNotes[selectedNoteIndex] || allNotes[0];

  // Filtered notes for sidebar search
  const filteredNotes = useMemo(() => {
    if (!filterQuery.trim()) return allNotes;
    const q = filterQuery.toLowerCase();
    return allNotes.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.folderName && n.folderName.toLowerCase().includes(q))
    );
  }, [allNotes, filterQuery]);

  const handleSelectNote = (originalIndex) => {
    setSelectedNoteIndex(originalIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  if (allNotes.length === 0) {
    return (
      <div className="card p-12 text-center max-w-md mx-auto my-12">
        <Folder className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
        <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          {folder?.name || "Folder"} is empty
        </h3>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          This shared folder does not contain any notes yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden w-full flex items-center justify-between p-2.5 rounded-xl border mb-2" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="flex items-center gap-2 text-xs font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          <PanelLeft className="w-4 h-4" style={{ color: "var(--accent)" }} />
          <span>{folder?.name} Notes ({allNotes.length})</span>
        </button>

        <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>
          {selectedNoteIndex + 1} of {allNotes.length}
        </span>
      </div>

      {/* Left Sidebar: Compact Notes List */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } lg:block w-full lg:w-56 xl:w-60 flex-shrink-0 rounded-xl border p-3 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar transition-all duration-150`}
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Folder Header */}
        <div className="flex items-center gap-2.5 mb-3 pb-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {folder?.icon || "📁"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {folder?.name || "Notebook"}
            </h2>
            <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
              {allNotes.length} {allNotes.length === 1 ? "note" : "notes"}
            </p>
          </div>
        </div>

        {/* Filter Input */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-2.5"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter..."
            className="w-full bg-transparent border-none outline-none text-xs placeholder-[var(--text-muted)]"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* List of notes */}
        <div className="space-y-0.5">
          {filteredNotes.length === 0 ? (
            <div className="py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              No notes found
            </div>
          ) : (
            filteredNotes.map((note) => {
              const originalIndex = allNotes.findIndex((n) => n === note);
              const isSelected = originalIndex === selectedNoteIndex;

              return (
                <button
                  key={note._id || originalIndex}
                  onClick={() => handleSelectNote(originalIndex)}
                  className={`w-full text-left py-2 px-2.5 rounded-lg transition-all cursor-pointer relative flex items-start gap-2 ${
                    isSelected ? "shadow-xs font-semibold" : "hover:bg-[var(--bg-hover)]"
                  }`}
                  style={{
                    background: isSelected ? "var(--bg-elevated)" : "transparent",
                    color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                    border: "1px solid",
                    borderColor: isSelected ? "var(--border-default)" : "transparent",
                  }}
                >
                  {/* Active Indicator Line */}
                  {isSelected && (
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-r-md"
                      style={{ background: "var(--accent)" }}
                    />
                  )}

                  <FileText
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-xs truncate leading-tight">
                      {note.title || "Untitled"}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {note.episode && (
                        <span className="font-mono text-[9px] px-1 rounded" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                          Ep {note.episode}
                        </span>
                      )}
                      {note.folderName && note.folderName !== folder?.name && (
                        <span className="truncate max-w-[100px]">{note.folderName}</span>
                      )}
                      {note.createdAt && (
                        <span>{new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Column: Active Note Viewer (exact NoteViewer CSS & experience) */}
      <main className="flex-1 min-w-0 w-full">
        {/* Sequential Navigation Bar */}
        <div
          className="flex items-center justify-between gap-3 p-3 rounded-xl border mb-6"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <Folder className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span className="font-medium">{folder?.name}</span>
            <span>/</span>
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px] sm:max-w-xs">
              {currentNote?.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => handleSelectNote(selectedNoteIndex - 1)}
              disabled={selectedNoteIndex === 0}
              className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[var(--bg-elevated)] cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              title="Previous note"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono px-1" style={{ color: "var(--text-muted)" }}>
              {selectedNoteIndex + 1} / {allNotes.length}
            </span>

            <button
              onClick={() => handleSelectNote(selectedNoteIndex + 1)}
              disabled={selectedNoteIndex >= allNotes.length - 1}
              className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[var(--bg-elevated)] cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              title="Next note"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NoteViewer Core Rendering */}
        <div className="card p-6 sm:p-10 rounded-2xl shadow-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <SharedNoteViewer
            content={currentNote}
            folderName={folder?.name}
          />
        </div>

        {/* Bottom Sequential Previous / Next Cards */}
        {allNotes.length > 1 && (
          <div
            className="mt-8 pt-6 flex items-center justify-between gap-4"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div className="flex-1">
              {selectedNoteIndex > 0 ? (
                <button
                  onClick={() => handleSelectNote(selectedNoteIndex - 1)}
                  className="card card-hover flex items-center gap-3 p-3.5 rounded-xl text-left w-full cursor-pointer transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                >
                  <ChevronLeft className="h-4 w-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                  <div className="min-w-0">
                    <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Previous Note</div>
                    <div className="text-xs font-semibold line-clamp-1" style={{ color: "var(--text-primary)" }}>
                      {allNotes[selectedNoteIndex - 1].title}
                    </div>
                  </div>
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Quick dot indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2">
              {allNotes.slice(0, 15).map((_, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectNote(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all cursor-pointer"
                  style={{
                    background: i === selectedNoteIndex ? "var(--accent)" : "var(--border-default)",
                    transform: i === selectedNoteIndex ? "scale(1.4)" : "scale(1)",
                  }}
                  title={`Jump to note ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex-1 flex justify-end">
              {selectedNoteIndex < allNotes.length - 1 ? (
                <button
                  onClick={() => handleSelectNote(selectedNoteIndex + 1)}
                  className="card card-hover flex items-center justify-end gap-3 p-3.5 rounded-xl text-right w-full cursor-pointer transition-all"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                >
                  <div className="min-w-0">
                    <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Next Note</div>
                    <div className="text-xs font-semibold line-clamp-1" style={{ color: "var(--text-primary)" }}>
                      {allNotes[selectedNoteIndex + 1].title}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                </button>
              ) : (
                <div className="p-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  End of notebook
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// Shared Note Viewer Component (exact NoteViewer CSS and formatting)
// -------------------------------------------------------------
function SharedNoteViewer({ content, folderName }) {
  if (!content) return null;

  const { title, content: noteContent, episode, createdAt } = content;

  // Clean frontmatter from markdown
  const cleanedContent = useMemo(() => {
    if (!noteContent) return "";
    let clean = noteContent;
    if (clean.startsWith("---\n")) {
      const frontmatterEnd = clean.indexOf("\n---\n", 4);
      if (frontmatterEnd !== -1) {
        const frontmatter = clean.substring(4, frontmatterEnd);
        if (frontmatter.includes(":") && /^\w+\s*:/.test(frontmatter.trim())) {
          clean = clean.substring(frontmatterEnd + 5);
        }
      }
    }
    return clean.replace(/^\n+/, "").trim();
  }, [noteContent]);

  return (
    <article className="animate-fade-in">
      {/* Header Area */}
      <div className="mb-8 pb-5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        {/* Note Title in Source Serif 4 */}
        <h1
          className="font-bold mb-4 tracking-tight leading-[1.25]"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.35rem)",
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: "var(--text-primary)",
          }}
        >
          {title || "Untitled Note"}
        </h1>

        {/* Metadata & Stats Bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {episode && (
            <span className="badge badge-amber font-mono text-[11px]">
              Episode {episode}
            </span>
          )}

          {createdAt && (
            <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Calendar className="h-3.5 w-3.5" />
              {new Date(createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}

          {folderName && (
            <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Folder className="h-3.5 w-3.5" />
              <span>{folderName}</span>
            </span>
          )}

          <div className="ml-auto">
            <ReadingStatsBadge content={cleanedContent} />
          </div>
        </div>
      </div>

      {/* Note Content — Read-Only Prose with full markdown & copy buttons */}
      <div className="note-viewer">
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              pre({ children, ...props }) {
                const child = Array.isArray(children) ? children[0] : children;
                const className = child?.props?.className || "";
                const match = /language-([^\s]+)/.exec(className);
                let lang = match ? match[1] : "";
                if (lang === "csharp" || lang === "cs" || lang === "c-sharp") {
                  lang = "c#";
                }

                const extractText = (node) => {
                  if (typeof node === "string") return node;
                  if (Array.isArray(node)) return node.map(extractText).join("");
                  if (node?.props?.children) return extractText(node.props.children);
                  return "";
                };

                const [copied, setCopied] = React.useState(false);
                const handleCopy = () => {
                  const text = extractText(child?.props?.children || "");
                  navigator.clipboard.writeText(text).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                };

                return (
                  <div className="code-block-wrapper">
                    <pre data-language={lang} {...props}>
                      {children}
                    </pre>
                    <button
                      onClick={handleCopy}
                      className="code-copy-btn"
                      title={copied ? "Copied!" : "Copy code"}
                      aria-label="Copy code to clipboard"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              },
              code({ inline, className, children, ...props }) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {cleanedContent || "*No content in this note.*"}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
