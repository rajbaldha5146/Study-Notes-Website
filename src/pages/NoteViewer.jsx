import React, { useState, useEffect, useRef } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Folder,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  List,
} from "lucide-react";
import BookLoader from "../components/BookLoader";
import ShareButton from "../components/ShareButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { getNote, getFolder, toggleNoteFavorite } from "../services/api";
import {
  extractHeadings,
  calculateReadingTime,
  addRecentNote,
} from "../utils/markdownHelpers";
import toast from "react-hot-toast";

export default function NoteViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folder");

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [folderNotes, setFolderNotes] = useState([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);

  const [headings, setHeadings] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState("");

  const contentRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      await fetchNote();
      if (folderId) await fetchFolderNotes();
    };
    loadData();
  }, [id, folderId]);

  // Reading progress & ScrollSpy
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const doc = document.documentElement;
          const scrollTop = window.scrollY || doc.scrollTop;
          const max = doc.scrollHeight - window.innerHeight;
          const progress = max > 0 ? Math.min(Math.max(scrollTop / max, 0), 1) : 0;
          if (contentRef.current) {
            contentRef.current.style.setProperty("--progress", `${progress * 100}%`);
          }

          // Scrollspy active heading detection
          if (headings.length > 0) {
            for (let i = headings.length - 1; i >= 0; i--) {
              const el = document.getElementById(headings[i].id);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 140) {
                  setActiveHeadingId(headings[i].id);
                  break;
                }
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNote(id);
      if (data.content) {
        data.content = cleanMarkdownContent(data.content);
        setHeadings(extractHeadings(data.content));
      }
      setNote(data);
      setIsFavorite(!!data.isFavorite);
      addRecentNote(data);
    } catch (err) {
      console.error("Error fetching note:", err);
      setError("Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await toggleNoteFavorite(note._id);
      setIsFavorite(res.isFavorite);
      toast.success(res.isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      toast.error("Failed to update favorite");
    }
  };

  const fetchFolderNotes = async () => {
    try {
      const folderData = await getFolder(folderId);
      const sortedNotes = folderData.notes.sort((a, b) => {
        if (a.episode && b.episode) return a.episode - b.episode;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      setFolderNotes(sortedNotes);
      setCurrentNoteIndex(sortedNotes.findIndex((note) => note._id === id));
    } catch (err) {
      console.error("Error fetching folder notes:", err);
    }
  };

  const cleanMarkdownContent = (content) => {
    let cleanContent = content;
    if (cleanContent.startsWith("---\n")) {
      const frontmatterEnd = cleanContent.indexOf("\n---\n", 4);
      if (frontmatterEnd !== -1) {
        const frontmatter = cleanContent.substring(4, frontmatterEnd);
        if (frontmatter.includes(":") && /^\w+\s*:/.test(frontmatter.trim())) {
          cleanContent = cleanContent.substring(frontmatterEnd + 5);
        }
      }
    }
    return cleanContent.replace(/^\n+/, "").trim();
  };

  const slugify = (value) =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const createHeading = (Tag) => ({ children, ...props }) => {
    const text = React.Children.toArray(children)
      .map((child) => (typeof child === "string" ? child : ""))
      .join("");
    const headingId = slugify(text || "");

    return (
      <Tag id={headingId} {...props}>
        <a href={`#${headingId}`} className="anchor">
          #
        </a>
        {children}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <BookLoader message="Loading note..." />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <h2 className="text-xl font-semibold text-neutral-200 mb-4">
          {error || "Note not found"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  const isTOCActive = showTOC && headings.length > 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Reading progress bar */}
      <div
        ref={contentRef}
        className="fixed top-12 left-0 h-px z-50 transition-all"
        style={{ width: "var(--progress, 0%)", background: "var(--blue)" }}
      />

      {/* Main Container Layout */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 pt-8 flex gap-8 items-start ${!isTOCActive ? "justify-center" : ""}`}>
        {/* Main Note Column */}
        <div className={`flex-1 min-w-0 ${!isTOCActive ? "max-w-4xl mx-auto" : "max-w-4xl"}`}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            <Link to="/app" className="hover:underline">Home</Link>
            <span>&gt;</span>
            {note.folder ? (
              <Link to={`/app/folder/${note.folder._id}`} className="hover:underline">
                {note.folder.name || "Unknown"}
              </Link>
            ) : (
              <span>Uncategorized</span>
            )}
            <span>&gt;</span>
            <span style={{ color: "var(--text-primary)" }} className="truncate max-w-[200px]">{note.title}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                {folderId && folderNotes.length > 1 && (
                  <div
                    className="flex items-center gap-2 pl-3"
                    style={{ borderLeft: "1px solid var(--border-subtle)" }}
                  >
                    <button
                      onClick={() => {
                        if (currentNoteIndex > 0) {
                          navigate(
                            `/app/note/${folderNotes[currentNoteIndex - 1]._id}?folder=${folderId}`
                          );
                          window.scrollTo(0, 0);
                        }
                      }}
                      disabled={currentNoteIndex <= 0}
                      className="p-1.5 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--bg-elevated)")}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {currentNoteIndex + 1} / {folderNotes.length}
                    </span>
                    <button
                      onClick={() => {
                        if (currentNoteIndex < folderNotes.length - 1) {
                          navigate(
                            `/app/note/${folderNotes[currentNoteIndex + 1]._id}?folder=${folderId}`
                          );
                          window.scrollTo(0, 0);
                        }
                      }}
                      disabled={currentNoteIndex >= folderNotes.length - 1}
                      className="p-1.5 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--bg-elevated)")}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {headings.length > 0 && (
                  <button
                    onClick={() => setShowTOC(!showTOC)}
                    className="btn-secondary flex items-center gap-1.5 text-xs px-2.5 py-1.5"
                    title={showTOC ? "Hide Table of Contents" : "Show Table of Contents"}
                  >
                    <List className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{showTOC ? "Hide TOC" : "Show TOC"}</span>
                  </button>
                )}
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-md transition-colors ${isFavorite ? "text-yellow-500" : ""}`}
                  style={{ background: isFavorite ? "var(--bg-elevated)" : "transparent", color: isFavorite ? "#eab308" : "var(--text-muted)" }}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <ShareButton
                  type="note"
                  resourceId={note._id}
                  resourceName={note.title}
                  size="default"
                />
                <Link
                  to={`/app/edit/${note._id}`}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-extrabold mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
              {note.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm pb-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {note.episode && (
                <span className="badge badge-primary">Episode {note.episode}</span>
              )}
              <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <Calendar className="h-3.5 w-3.5" />
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
              {note.folder && (
                <Link
                  to={`/app/folder/${note.folder._id}`}
                  className="flex items-center gap-1.5 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--blue-light)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  <Folder className="h-3.5 w-3.5" />
                  <span>{note.folder.name || "Unknown"}</span>
                </Link>
              )}
              <span className="flex items-center gap-1.5 ml-auto" style={{ color: "var(--text-muted)" }}>
                <Clock className="h-3.5 w-3.5" />
                {calculateReadingTime(note.content).text} · {calculateReadingTime(note.content).words} words
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="note-viewer mt-6">
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
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
                  h1: createHeading("h1"),
                  h2: createHeading("h2"),
                  h3: createHeading("h3"),
                  h4: createHeading("h4"),
                  h5: createHeading("h5"),
                  h6: createHeading("h6"),
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Bottom Navigation */}
          {folderId && folderNotes.length > 1 && (
            <div
              className="mt-10 pt-6"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Previous */}
                <div className="flex-1">
                  {currentNoteIndex > 0 ? (
                    <button
                      onClick={() => {
                        navigate(
                          `/app/note/${folderNotes[currentNoteIndex - 1]._id}?folder=${folderId}`
                        );
                        window.scrollTo(0, 0);
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg text-left transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <ChevronLeft className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                      <div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>Previous</div>
                        <div className="text-sm font-medium line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {folderNotes[currentNoteIndex - 1].title}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="p-3 text-sm" style={{ color: "var(--text-faint)" }}>No previous</div>
                  )}
                </div>

                {/* Progress */}
                <div className="text-center px-4">
                  <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {currentNoteIndex + 1} of {folderNotes.length}
                  </div>
                  <div className="flex gap-1 mt-2 justify-center">
                    {folderNotes.map((n, i) => (
                      <button
                        key={n._id}
                        onClick={() =>
                          navigate(`/app/note/${n._id}?folder=${folderId}`)
                        }
                        className="w-1.5 h-1.5 rounded-full transition-all"
                        style={{
                          background: i === currentNoteIndex
                            ? "var(--blue)"
                            : i < currentNoteIndex
                            ? "var(--success)"
                            : "var(--border-default)",
                          transform: i === currentNoteIndex ? "scale(1.3)" : "scale(1)",
                        }}
                        title={n.title}
                      />
                    ))}
                  </div>
                </div>

                {/* Next */}
                <div className="flex-1 flex justify-end">
                  {currentNoteIndex < folderNotes.length - 1 ? (
                    <button
                      onClick={() => {
                        navigate(
                          `/app/note/${folderNotes[currentNoteIndex + 1]._id}?folder=${folderId}`
                        );
                        window.scrollTo(0, 0);
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg text-right transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>Next</div>
                        <div className="text-sm font-medium line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {folderNotes[currentNoteIndex + 1].title}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                    </button>
                  ) : (
                    <div className="p-3 text-sm" style={{ color: "var(--text-faint)" }}>No next</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar Card - Table of Contents */}
        {isTOCActive && (
          <aside
            className="hidden xl:block w-64 flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar p-4 rounded-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" style={{ color: "var(--blue)" }} />
                <h3 className="font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                  Table of Contents
                </h3>
              </div>
              <button
                onClick={() => setShowTOC(false)}
                className="text-xs hover:underline"
                style={{ color: "var(--text-muted)" }}
                title="Hide Table of Contents"
              >
                Hide
              </button>
            </div>
            <ul className="space-y-1 text-xs">
              {headings.map((h, i) => (
                <li key={i} style={{ paddingLeft: `${(h.level - 1) * 0.5}rem` }}>
                  <button
                    onClick={() => {
                      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                      setActiveHeadingId(h.id);
                    }}
                    className="text-left py-1 px-2 rounded-md w-full truncate transition-colors block"
                    style={{
                      color: activeHeadingId === h.id ? "var(--blue-light)" : "var(--text-secondary)",
                      background: activeHeadingId === h.id ? "var(--bg-elevated)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (activeHeadingId !== h.id) {
                        e.currentTarget.style.color = "var(--text-primary)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeHeadingId !== h.id) {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}
