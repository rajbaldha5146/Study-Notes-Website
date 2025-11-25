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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { getNote, getFolder } from "../services/api";
import "highlight.js/styles/github-dark.css";

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

  // Hide sidebar
  useEffect(() => {
    const sidebar = document.querySelector("[data-sidebar]");
    const mainContent = document.querySelector("main");

    if (sidebar && mainContent) {
      sidebar.style.transform = "translateX(-100%)";
      mainContent.style.marginLeft = "0";
    }

    return () => {
      if (sidebar && mainContent) {
        sidebar.style.transform = "";
        mainContent.style.marginLeft = "";
      }
    };
  }, []);

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
      <div className="flex items-center justify-center h-screen bg-neutral-950">
        <BookLoader message="Loading note..." />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-950">
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
    <div className="min-h-screen bg-neutral-950 pb-12">
      {/* Progress bar */}
      <div
        ref={contentRef}
        className="fixed top-0 left-0 h-1 bg-indigo-500 z-50"
        style={{ width: "var(--progress, 0%)" }}
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
                <div className="flex items-center gap-2 pl-3 border-l border-neutral-800">
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
                    className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 text-neutral-400" />
                  </button>
                  <span className="text-sm text-neutral-500">
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
                    className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>
                </div>
              )}
            </div>

            <Link
              to={`/app/edit/${note._id}`}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-neutral-100 mb-4">
            {note.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {note.episode && (
              <span className="badge badge-primary">Episode {note.episode}</span>
            )}
            <span className="flex items-center gap-1.5 text-neutral-500">
              <Calendar className="h-4 w-4" />
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
            {note.folder && (
              <span className="flex items-center gap-1.5 text-neutral-500">
                <Folder className="h-4 w-4" />
                {note.folder.name || "Unknown"}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <article className="card p-6 sm:p-8">
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
        </article>

        {/* Bottom Navigation */}
        {folderId && folderNotes.length > 1 && (
          <div className="mt-8 card p-6">
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
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 text-left"
                  >
                    <ChevronLeft className="h-5 w-5 text-neutral-500" />
                    <div>
                      <div className="text-xs text-neutral-500">Previous</div>
                      <div className="text-sm font-medium text-neutral-300 line-clamp-1">
                        {folderNotes[currentNoteIndex - 1].title}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="p-3 text-neutral-600 text-sm">No previous</div>
                )}
              </div>

              {/* Progress */}
              <div className="text-center px-4">
                <div className="text-sm font-medium text-neutral-400">
                  {currentNoteIndex + 1} of {folderNotes.length}
                </div>
                <div className="flex gap-1 mt-2 justify-center">
                  {folderNotes.map((n, i) => (
                    <button
                      key={n._id}
                      onClick={() =>
                        navigate(`/app/note/${n._id}?folder=${folderId}`)
                      }
                      className={`w-2 h-2 rounded-full ${
                        i === currentNoteIndex
                          ? "bg-indigo-500"
                          : i < currentNoteIndex
                          ? "bg-emerald-500"
                          : "bg-neutral-700"
                      }`}
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
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 text-right"
                  >
                    <div>
                      <div className="text-xs text-neutral-500">Next</div>
                      <div className="text-sm font-medium text-neutral-300 line-clamp-1">
                        {folderNotes[currentNoteIndex + 1].title}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-500" />
                  </button>
                ) : (
                  <div className="p-3 text-neutral-600 text-sm">No next</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
