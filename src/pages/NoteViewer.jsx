import { useState, useEffect, useRef } from "react";
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
  Brain,
} from "lucide-react";
import BookLoader from "../components/BookLoader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { getNote, getFolder } from "../services/api";
import "highlight.js/styles/vs2015.css"; // Dark theme for code blocks
import "../styles/markdown.css"; // Enhanced markdown styling

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
      if (isMounted) {
        await fetchNote();
        if (folderId) {
          await fetchFolderNotes();
        }
      }
    };

    loadData();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [id, folderId]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNote(id);

      // Clean frontmatter from content
      if (data.content) {
        data.content = cleanMarkdownContent(data.content);
      }

      setNote(data);
    } catch (err) {
      setError("Failed to load note");
      console.error("Error fetching note:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderNotes = async () => {
    try {
      const folderData = await getFolder(folderId);
      // Sort notes by episode number or creation date
      const sortedNotes = folderData.notes.sort((a, b) => {
        if (a.episode && b.episode) {
          return a.episode - b.episode;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      setFolderNotes(sortedNotes);

      // Find current note index
      const currentIndex = sortedNotes.findIndex((note) => note._id === id);
      setCurrentNoteIndex(currentIndex);
    } catch (err) {
      console.error("Error fetching folder notes:", err);
    }
  };



  const cleanMarkdownContent = (content) => {
    // Remove YAML frontmatter - more precise regex
    let cleanContent = content;

    // Remove frontmatter at the beginning (---...---) only
    cleanContent = cleanContent.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/m, "");

    // Clean up extra newlines at the start
    cleanContent = cleanContent.replace(/^\n+/, "").trim();

    return cleanContent;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BookLoader message="Loading your note..." />
      </div>
    );
  }

  // Error state
  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
            {error || "Note not found"}
          </h2>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            The note you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {/* Navigation buttons when in folder presentation mode */}
              {folderId && folderNotes.length > 0 && (
                <div className="flex items-center space-x-2 border-l border-gray-300 dark:border-gray-600 pl-3 sm:pl-4">
                  <button
                    onClick={() => {
                      const prevIndex = currentNoteIndex - 1;
                      if (prevIndex >= 0) {
                        navigate(
                          `/note/${folderNotes[prevIndex]._id}?folder=${folderId}`
                        );
                        // Scroll to top when switching notes
                        window.scrollTo(0, 0);
                      }
                    }}
                    disabled={currentNoteIndex <= 0}
                    className={`flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-colors text-sm ${
                      currentNoteIndex <= 0
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {currentNoteIndex + 1} / {folderNotes.length}
                  </span>

                  <button
                    onClick={() => {
                      const nextIndex = currentNoteIndex + 1;
                      if (nextIndex < folderNotes.length) {
                        navigate(
                          `/note/${folderNotes[nextIndex]._id}?folder=${folderId}`
                        );
                        // Scroll to top when switching notes
                        window.scrollTo(0, 0);
                      }
                    }}
                    disabled={currentNoteIndex >= folderNotes.length - 1}
                    className={`flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-colors text-sm ${
                      currentNoteIndex >= folderNotes.length - 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {note?.content && note.content.length >= 100 && (
                <Link
                  to={`/app/quiz/${note._id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-md transition-all duration-200 transform hover:scale-105"
                  title="Take quiz on this note"
                >
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Take Quiz</span>
                </Link>
              )}
              
              <Link
                to={`/edit/${note._id}`}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            </div>
          </div>

          {/* Note Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {note.title}
          </h1>

          {/* Note Meta */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
            {note.episode && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Episode {note.episode}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            {note.folder && (
              <div className="flex items-center space-x-1">
                <Folder className="h-4 w-4" />
                <span>JavaScript</span>
              </div>
            )}
          </div>
        </div>

        {/* Note Content */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div
            ref={contentRef}
            className="p-4 sm:p-8 lg:p-12 prose prose-sm sm:prose-base lg:prose-xl prose-gray dark:prose-invert max-w-none overflow-x-auto
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-5xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-indigo-500/30
              prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-700/50
              prose-h3:text-3xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-indigo-300
              prose-h4:text-2xl prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-purple-300
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
              prose-strong:text-white prose-strong:font-bold
              prose-em:text-indigo-300 prose-em:italic
              prose-a:text-indigo-400 prose-a:no-underline prose-a:font-medium hover:prose-a:text-indigo-300 hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-500/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:my-6
              prose-ul:my-6 prose-ul:space-y-2
              prose-ol:my-6 prose-ol:space-y-2
              prose-li:text-gray-300 prose-li:leading-relaxed prose-li:text-lg
              prose-li:marker:text-indigo-400
              prose-hr:border-gray-700/50 prose-hr:my-12
              prose-table:border-collapse prose-table:w-full prose-table:my-8
              prose-th:bg-gray-800/50 prose-th:p-4 prose-th:text-left prose-th:font-semibold prose-th:text-indigo-300 prose-th:border prose-th:border-gray-700
              prose-td:p-4 prose-td:border prose-td:border-gray-700 prose-td:text-gray-300
              prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-8"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                // Code handling
                code({ node, inline, className, children, ...props }) {
                  const isInlineCode =
                    inline === true ||
                    !className ||
                    !className.startsWith("language-");

                  if (isInlineCode) {
                    return (
                      <code
                        className="bg-gray-900 text-orange-300 px-2.5 py-1 rounded-md text-base font-mono font-semibold shadow-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <code
                      className={`${className} bg-transparent text-gray-50 font-mono text-base`}
                      style={{
                        fontFamily:
                          "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', Consolas, monospace",
                        lineHeight: "1.8",
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },

                // Code blocks with language
                pre({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";

                  return (
                    <div className="relative my-8 overflow-x-auto">
                      {language && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 text-xs font-bold rounded-bl-xl rounded-tr-xl z-10 uppercase tracking-wider shadow-lg">
                          {language}
                        </div>
                      )}
                      <pre
                        className="overflow-x-auto !mx-4 !my-8"
                        style={{
                          background:
                            "linear-gradient(135deg, #0a0a1f 0%, #1a1a3e 50%, #2a1a4a 100%)",
                          borderRadius: "10px",
                          border: "none",
                          outline: "none",
                          padding: "2rem",
                          boxShadow: "none",
                        }}
                        {...props}
                      >
                        {children}
                      </pre>
                    </div>
                  );
                },

                // Headings with custom styling
                h1({ node, children, ...props }) {
                  return (
                    <h1 className="group relative" {...props}>
                      <span className="absolute -left-8 top-0 text-indigo-500/30 font-bold text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                        #
                      </span>
                      {children}
                    </h1>
                  );
                },

                h2({ node, children, ...props }) {
                  return (
                    <h2 className="group relative" {...props}>
                      <span className="absolute -left-7 top-0 text-indigo-500/30 font-bold text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                        ##
                      </span>
                      {children}
                    </h2>
                  );
                },

                h3({ node, children, ...props }) {
                  return (
                    <h3 className="group relative" {...props}>
                      <span className="absolute -left-6 top-0 text-indigo-500/30 font-bold text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                        ###
                      </span>
                      {children}
                    </h3>
                  );
                },

                // Lists with better styling
                ul({ node, children, ...props }) {
                  return (
                    <ul className="space-y-3 pl-6" {...props}>
                      {children}
                    </ul>
                  );
                },

                ol({ node, children, ...props }) {
                  return (
                    <ol className="space-y-3 pl-6" {...props}>
                      {children}
                    </ol>
                  );
                },

                // Blockquote with icon
                blockquote({ node, children, ...props }) {
                  return (
                    <blockquote className="relative" {...props}>
                      <span className="absolute -left-2 top-0 text-6xl text-indigo-500/20 font-serif">
                        "
                      </span>
                      {children}
                    </blockquote>
                  );
                },

                // Links with icon
                a({ node, children, href, ...props }) {
                  return (
                    <a
                      href={href}
                      className="inline-flex items-center gap-1 group"
                      {...props}
                    >
                      {children}
                      <svg
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  );
                },
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Bottom Navigation - Only show in presentation mode */}
        {folderId && folderNotes.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              {/* Previous Note */}
              <div className="flex-1">
                {currentNoteIndex > 0 ? (
                  <button
                    onClick={() => {
                      const prevIndex = currentNoteIndex - 1;
                      navigate(
                        `/note/${folderNotes[prevIndex]._id}?folder=${folderId}`
                      );
                      // Scroll to top when switching notes
                      window.scrollTo(0, 0);
                    }}
                    className="flex items-center space-x-3 text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                      <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Previous
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {folderNotes[currentNoteIndex - 1].title}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3 p-3 opacity-50">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <ChevronLeft className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">
                        No previous note
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="flex flex-col items-center space-y-2 px-6">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {currentNoteIndex + 1} of {folderNotes.length}
                </div>
                <div className="flex space-x-1">
                  {folderNotes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        navigate(
                          `/note/${folderNotes[index]._id}?folder=${folderId}`
                        )
                      }
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentNoteIndex
                          ? "bg-blue-500"
                          : index < currentNoteIndex
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                      }`}
                      title={folderNotes[index].title}
                    />
                  ))}
                </div>
              </div>

              {/* Next Note */}
              <div className="flex-1 flex justify-end">
                {currentNoteIndex < folderNotes.length - 1 ? (
                  <button
                    onClick={() => {
                      const nextIndex = currentNoteIndex + 1;
                      navigate(
                        `/note/${folderNotes[nextIndex]._id}?folder=${folderId}`
                      );
                      // Scroll to top when switching notes
                      window.scrollTo(0, 0);
                    }}
                    className="flex items-center space-x-3 text-right p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Next
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {folderNotes[currentNoteIndex + 1].title}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                      <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3 p-3 opacity-50">
                    <div>
                      <div className="text-sm text-gray-400">No next note</div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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
