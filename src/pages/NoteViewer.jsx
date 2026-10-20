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
  Volume2,
} from "lucide-react";
import Loader from "../components/Loader";
import ShareButton from "../components/ShareButton";
import ReadingStatsBadge from "../components/ReadingStatsBadge";
import AudioReaderBar from "../components/AudioReaderBar";
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
import { useTabs } from "../contexts/TabContext";

export default function NoteViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folder");
  const { openTab } = useTabs();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [folderNotes, setFolderNotes] = useState([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);

  const [headings, setHeadings] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const [audioReaderOpen, setAudioReaderOpen] = useState(false);

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
      openTab({
        id: data._id,
        title: data.title || "Untitled",
        path: `/app/note/${data._id}${folderId ? `?folder=${folderId}` : ""}`,
      });
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader message="Opening note..." />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          {error || "Note not found"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  const isTOCActive = showTOC && headings.length > 0;

  return (
    <div className="min-h-screen pb-16 animate-fade-in">
      {/* 2px Warm Amber Reading Progress Bar */}
      <div
        ref={contentRef}
        className="fixed top-14 left-0 h-[2px] z-50 transition-all duration-75"
        style={{
          width: "var(--progress, 0%)",
          background: "linear-gradient(90deg, var(--accent), var(--accent-light))",
        }}
      />

      {/* Main Container Layout */}
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 pt-6 ${
          audioReaderOpen ? "pb-32" : "pb-12"
        } flex gap-8 items-start ${!isTOCActive ? "justify-center" : ""}`}
      >
        {/* Main Reading Column (Optimal max 720px for serif reading comfort) */}
        <div className={`flex-1 min-w-0 ${!isTOCActive ? "max-w-3xl mx-auto" : "max-w-3xl"}`}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            <Link to="/app" className="hover:underline">Home</Link>
            <span>/</span>
            {note.folder ? (
              <Link to={`/app/folder/${note.folder._id}`} className="hover:underline">
                {note.folder.name || "Notebook"}
              </Link>
            ) : (
              <span>Unsorted</span>
            )}
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }} className="truncate max-w-[200px] font-medium">
              {note.title}
            </span>
          </div>

          {/* Reading Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigate(-1)}
                  className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                {folderId && folderNotes.length > 1 && (
                  <div
                    className="flex items-center gap-1.5 pl-2.5"
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
                      className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--bg-elevated)")}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      title="Previous note in folder"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
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
                      className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = "var(--bg-elevated)")}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      title="Next note in folder"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {headings.length > 0 && (
                  <button
                    onClick={() => setShowTOC(!showTOC)}
                    className="btn-secondary flex items-center gap-1 text-xs px-2.5 py-1.5"
                    title={showTOC ? "Hide Table of Contents" : "Show Table of Contents"}
                  >
                    <List className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{showTOC ? "TOC" : "TOC"}</span>
                  </button>
                )}

                {/* Read Aloud Button */}
                <button
                  type="button"
                  onClick={() => setAudioReaderOpen((prev) => !prev)}
                  className="btn-secondary flex items-center gap-1.5 text-xs px-2.5 py-1.5 cursor-pointer font-medium"
                  style={{
                    background: audioReaderOpen ? "rgba(224, 144, 80, 0.15)" : undefined,
                    color: audioReaderOpen ? "var(--accent)" : undefined,
                    borderColor: audioReaderOpen ? "var(--accent)" : undefined,
                  }}
                  title="Read Note Aloud (Text-to-Speech)"
                >
                  <Volume2 className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                  <span>{audioReaderOpen ? "Listening" : "Listen"}</span>
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className="p-2 rounded-lg transition-colors cursor-pointer"
                  style={{
                    background: isFavorite ? "rgba(212, 169, 71, 0.15)" : "transparent",
                    color: isFavorite ? "#d4a947" : "var(--text-muted)",
                  }}
                  title={isFavorite ? "Remove favorite" : "Bookmark note"}
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
                  className="btn-primary flex items-center gap-1.5 text-xs font-semibold"
                  style={{ padding: "0.45rem 0.85rem" }}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Note</span>
                </Link>
              </div>
            </div>

            {/* Note Title — Elegant Source Serif 4 */}
            <h1
              className="font-bold mb-4 tracking-tight leading-[1.2]"
              style={{
                fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: "var(--text-primary)",
              }}
            >
              {note.title}
            </h1>

            {/* Metadata Bar */}
            <div
              className="flex flex-wrap items-center gap-3 text-xs pb-5"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              {note.episode && (
                <span className="badge badge-primary font-mono">Episode {note.episode}</span>
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
                  onMouseEnter={e => e.currentTarget.style.color = "var(--accent-light)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  <Folder className="h-3.5 w-3.5" />
                  <span>{note.folder.name || "Notebook"}</span>
                </Link>
              )}
              <ReadingStatsBadge content={note.content} className="ml-auto" />
            </div>
          </div>

          {/* Markdown Content Area */}
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

          {/* Sequential Folder Navigator at Bottom */}
          {folderId && folderNotes.length > 1 && (
            <div
              className="mt-12 pt-6"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Previous Note */}
                <div className="flex-1">
                  {currentNoteIndex > 0 ? (
                    <button
                      onClick={() => {
                        navigate(
                          `/app/note/${folderNotes[currentNoteIndex - 1]._id}?folder=${folderId}`
                        );
                        window.scrollTo(0, 0);
                      }}
                      className="card card-hover flex items-center gap-3 p-3 rounded-xl text-left w-full"
                    >
                      <ChevronLeft className="h-4 w-4" style={{ color: "var(--accent)" }} />
                      <div className="min-w-0">
                        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Previous</div>
                        <div className="text-xs font-semibold line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {folderNotes[currentNoteIndex - 1].title}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="p-3 text-xs" style={{ color: "var(--text-faint)" }}>Beginning of notebook</div>
                  )}
                </div>

                {/* Chapter Dot Tracker */}
                <div className="text-center px-4">
                  <div className="text-[11px] font-mono font-medium" style={{ color: "var(--text-muted)" }}>
                    {currentNoteIndex + 1} of {folderNotes.length}
                  </div>
                  <div className="flex gap-1.5 mt-2 justify-center">
                    {folderNotes.map((n, i) => (
                      <button
                        key={n._id}
                        onClick={() =>
                          navigate(`/app/note/${n._id}?folder=${folderId}`)
                        }
                        className="w-1.5 h-1.5 rounded-full transition-all cursor-pointer"
                        style={{
                          background:
                            i === currentNoteIndex
                              ? "var(--accent)"
                              : i < currentNoteIndex
                              ? "var(--success)"
                              : "var(--border-default)",
                          transform: i === currentNoteIndex ? "scale(1.4)" : "scale(1)",
                        }}
                        title={n.title}
                      />
                    ))}
                  </div>
                </div>

                {/* Next Note */}
                <div className="flex-1 flex justify-end">
                  {currentNoteIndex < folderNotes.length - 1 ? (
                    <button
                      onClick={() => {
                        navigate(
                          `/app/note/${folderNotes[currentNoteIndex + 1]._id}?folder=${folderId}`
                        );
                        window.scrollTo(0, 0);
                      }}
                      className="card card-hover flex items-center justify-end gap-3 p-3 rounded-xl text-right w-full"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Next</div>
                        <div className="text-xs font-semibold line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {folderNotes[currentNoteIndex + 1].title}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" style={{ color: "var(--accent)" }} />
                    </button>
                  ) : (
                    <div className="p-3 text-xs" style={{ color: "var(--text-faint)" }}>End of notebook</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Table of Contents Sidebar */}
        {isTOCActive && (
          <aside
            className="hidden xl:block w-60 flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar p-4 rounded-xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <List className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                <h3 className="font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                  Contents
                </h3>
              </div>
              <button
                onClick={() => setShowTOC(false)}
                className="text-xs hover:underline cursor-pointer"
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
                    className="text-left py-1 px-2 rounded-md w-full truncate transition-colors block text-xs cursor-pointer"
                    style={{
                      color: activeHeadingId === h.id ? "var(--accent)" : "var(--text-secondary)",
                      background: activeHeadingId === h.id ? "var(--accent-soft)" : "transparent",
                      fontWeight: activeHeadingId === h.id ? "600" : "400",
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

      {/* Floating Audio Reader Bar */}
      <AudioReaderBar
        title={note?.title}
        content={note?.content}
        isOpen={audioReaderOpen}
        onClose={() => setAudioReaderOpen(false)}
      />
    </div>
  );
}
