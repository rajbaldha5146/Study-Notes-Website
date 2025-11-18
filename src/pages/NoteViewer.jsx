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
import "highlight.js/styles/vs2015.css";
import "../styles/markdown.css";

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
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;

      await fetchNote();
      if (folderId) {
        await fetchFolderNotes();
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, folderId]);

  // Hide sidebar (full screen mode)
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

  // Reading progress bar (updates --progress on .prose) - Highly optimized for smooth scrolling
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only update if scroll position changed significantly (reduces unnecessary updates)
      if (Math.abs(currentScrollY - lastScrollY) < 5) return;

      if (!ticking && contentRef.current) {
        requestAnimationFrame(() => {
          if (!contentRef.current) return;

          const doc = document.documentElement;
          const scrollTop = window.scrollY || doc.scrollTop;
          const max = doc.scrollHeight - window.innerHeight;
          const progress =
            max > 0 ? Math.min(Math.max(scrollTop / max, 0), 1) : 0;

          // Use transform instead of width for better performance
          contentRef.current.style.setProperty(
            "--progress",
            `${progress * 100}%`
          );

          lastScrollY = scrollTop;
          ticking = false;
        });
        ticking = true;
      }
    };

    // Throttle scroll events even more
    let scrollTimeout;
    const throttledScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 16); // ~60fps
    };

    handleScroll(); // init once
    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
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
        if (a.episode && b.episode) {
          return a.episode - b.episode;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      setFolderNotes(sortedNotes);
      const currentIndex = sortedNotes.findIndex((note) => note._id === id);
      setCurrentNoteIndex(currentIndex);
    } catch (err) {
      console.error("Error fetching folder notes:", err);
    }
  };

  const cleanMarkdownContent = (content) => {
    let cleanContent = content;
    // Only remove YAML frontmatter if it's at the very start and looks like actual YAML
    // This prevents removing markdown section dividers (---)
    if (cleanContent.startsWith("---\n")) {
      const frontmatterEnd = cleanContent.indexOf("\n---\n", 4);
      if (frontmatterEnd !== -1) {
        // Check if it contains YAML-like content (key: value)
        const frontmatter = cleanContent.substring(4, frontmatterEnd);
        if (frontmatter.includes(":") && /^\w+\s*:/.test(frontmatter.trim())) {
          cleanContent = cleanContent.substring(frontmatterEnd + 5);
        }
      }
    }
    cleanContent = cleanContent.replace(/^\n+/, "").trim();
    return cleanContent;
  };

  const slugify = (value) =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const createHeading =
    (Tag) =>
    ({ node, children, ...props }) => {
      const text = React.Children.toArray(children)
        .map((child) => (typeof child === "string" ? child : ""))
        .join("");
      const id = slugify(text || "");

      return (
        <Tag id={id} {...props}>
          {/* anchor hash for CSS .anchor styles */}
          <a href={`#${id}`} className="anchor">
            #
          </a>
          {children}
        </Tag>
      );
    };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <BookLoader message="Loading your note..." />
      </div>
    );
  }

  // Error state
  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            {error || "Note not found"}
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            The note you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 sm:pb-10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6 rounded-2xl border border-slate-800/70 bg-slate-900/90 px-4 sm:px-5 py-3 sm:py-4 shadow-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:border-blue-500/60 hover:bg-slate-900 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {folderId && folderNotes.length > 0 && (
                <div className="flex items-center space-x-2 border-l border-slate-700 pl-3 sm:pl-4">
                  <button
                    onClick={() => {
                      const prevIndex = currentNoteIndex - 1;
                      if (prevIndex >= 0) {
                        navigate(
                          `/app/note/${folderNotes[prevIndex]._id}?folder=${folderId}`
                        );
                        window.scrollTo(0, 0);
                      }
                    }}
                    disabled={currentNoteIndex <= 0}
                    className={
                      "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors " +
                      (currentNoteIndex <= 0
                        ? "bg-slate-800/60 text-slate-500 cursor-not-allowed"
                        : "bg-slate-900/80 text-slate-200 border border-slate-700 hover:border-blue-500/70 hover:text-blue-300")
                    }
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <span className="text-xs sm:text-sm text-slate-400">
                    {currentNoteIndex + 1} / {folderNotes.length}
                  </span>

                  <button
                    onClick={() => {
                      const nextIndex = currentNoteIndex + 1;
                      if (nextIndex < folderNotes.length) {
                        navigate(
                          `/app/note/${folderNotes[nextIndex]._id}?folder=${folderId}`
                        );
                        window.scrollTo(0, 0);
                      }
                    }}
                    disabled={currentNoteIndex >= folderNotes.length - 1}
                    className={
                      "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors " +
                      (currentNoteIndex >= folderNotes.length - 1
                        ? "bg-slate-800/60 text-slate-500 cursor-not-allowed"
                        : "bg-slate-900/80 text-slate-200 border border-slate-700 hover:border-blue-500/70 hover:text-blue-300")
                    }
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/app/edit/${note._id}`}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/40 hover:bg-blue-500 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3 sm:mb-4">
            {note.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            {note.episode && (
              <div className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-blue-200">
                <span className="font-medium">Episode {note.episode}</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-slate-300">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>

            {note.folder && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-slate-300">
                <Folder className="h-3.5 w-3.5" />
                <span>{note.folder.name || "Unknown Folder"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Markdown content */}
        <div className="bg-slate-950/95 rounded-3xl border border-slate-800/80 overflow-hidden">
          <article
            ref={contentRef}
            className="prose max-w-none p-6 sm:p-8 lg:p-10"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                // Code blocks: attach data-language attr to <pre> for CSS badge
                pre({ children, ...props }) {
                  const child = Array.isArray(children)
                    ? children[0]
                    : children;
                  const className = child?.props?.className || "";
                  const match = /language-(\w+)/.exec(className);
                  const lang = match ? match[1] : "";

                  return (
                    <pre data-language={lang} {...props}>
                      {children}
                    </pre>
                  );
                },

                // Inline code: let CSS handle styling
                code({ inline, className, children, ...props }) {
                  if (inline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }

                  // For block code, we just render <code> inside <pre>
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },

                // Headings with anchor links for .anchor styles
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
          </article>
        </div>

        {/* Bottom navigation */}
        {folderId && folderNotes.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-slate-900/90 rounded-2xl shadow-lg shadow-slate-950/70 border border-slate-800/80 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Previous */}
              <div className="flex-1 min-w-0">
                {currentNoteIndex > 0 ? (
                  <button
                    onClick={() => {
                      const prevIndex = currentNoteIndex - 1;
                      navigate(
                        `/app/note/${folderNotes[prevIndex]._id}?folder=${folderId}`
                      );
                      window.scrollTo(0, 0);
                    }}
                    className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-full border border-slate-700 group-hover:border-blue-500/70 group-hover:bg-blue-950/60 transition-colors">
                      <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-blue-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-400">Previous</div>
                      <div className="font-medium text-slate-100 text-sm line-clamp-1">
                        {folderNotes[currentNoteIndex - 1].title}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3 opacity-60">
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-full border border-slate-800">
                      <ChevronLeft className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">
                        No previous note
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress dots */}
              <div className="flex flex-col items-center space-y-2 px-2 sm:px-6">
                <div className="text-xs sm:text-sm font-medium text-slate-300">
                  {currentNoteIndex + 1} of {folderNotes.length}
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 max-w-[11rem]">
                  {folderNotes.map((n, index) => (
                    <button
                      key={n._id}
                      onClick={() =>
                        navigate(`/app/note/${n._id}?folder=${folderId}`)
                      }
                      className={
                        "w-2.5 h-2.5 rounded-full transition-colors " +
                        (index === currentNoteIndex
                          ? "bg-blue-500"
                          : index < currentNoteIndex
                          ? "bg-emerald-500/80 hover:bg-emerald-400"
                          : "bg-slate-600 hover:bg-slate-500")
                      }
                      title={n.title}
                    />
                  ))}
                </div>
              </div>

              {/* Next */}
              <div className="flex-1 min-w-0 flex justify-end">
                {currentNoteIndex < folderNotes.length - 1 ? (
                  <button
                    onClick={() => {
                      const nextIndex = currentNoteIndex + 1;
                      navigate(
                        `/app/note/${folderNotes[nextIndex]._id}?folder=${folderId}`
                      );
                      window.scrollTo(0, 0);
                    }}
                    className="flex items-center gap-3 text-right p-3 rounded-xl hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-slate-400">Next</div>
                      <div className="font-medium text-slate-100 text-sm line-clamp-1">
                        {folderNotes[currentNoteIndex + 1].title}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-full border border-slate-700 group-hover:border-blue-500/70 group-hover:bg-blue-950/60 transition-colors">
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-300" />
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3 opacity-60">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">No next note</div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-full border border-slate-800">
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
