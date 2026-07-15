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
} from "lucide-react";
import BookLoader from "../components/BookLoader";
import ShareButton from "../components/ShareButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { getNote, getFolder } from "../services/api";


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

  const contentRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      await fetchNote();
      if (folderId) await fetchFolderNotes();
    };
    loadData();
  }, [id, folderId]);

  // NoteViewer does not manipulate sidebar — sidebar toggle is handled globally

  // Reading progress
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && contentRef.current) {
        requestAnimationFrame(() => {
          const doc = document.documentElement;
          const scrollTop = window.scrollY || doc.scrollTop;
          const max = doc.scrollHeight - window.innerHeight;
          const progress = max > 0 ? Math.min(Math.max(scrollTop / max, 0), 1) : 0;
          contentRef.current.style.setProperty("--progress", `${progress * 100}%`);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNote(id);
      if (data.content) {
        data.content = cleanMarkdownContent(data.content);
      }
      setNote(data);
    } catch (err) {
      console.error("Error fetching note:", err);
      setError("Failed to load note");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen pb-12">
      {/* Reading progress bar */}
      <div
        ref={contentRef}
        className="fixed top-12 left-0 h-px z-50 transition-all"
        style={{ width: "var(--progress, 0%)", background: "var(--blue)" }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
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

            <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Content — no card box, blends with page background like HackMD */}
        <div className="note-viewer mt-6">
          <div className="prose max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                pre({ children, ...props }) {
                  const child = Array.isArray(children) ? children[0] : children;
                  const className = child?.props?.className || "";
                  const match = /language-(\w+)/.exec(className);
                  const lang = match ? match[1] : "";
                  return (
                    <pre data-language={lang} {...props}>
                      {children}
                    </pre>
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
    </div>
  );
}
