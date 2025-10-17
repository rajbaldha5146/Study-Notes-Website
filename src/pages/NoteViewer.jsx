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
  Highlighter,
  Eraser,
  Save,
  Tag,
  Calendar,
  Folder,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BookLoader from "../components/BookLoader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { getNote, updateHighlights, getFolder } from "../services/api";
import "highlight.js/styles/vs2015.css"; // Dark theme for code blocks

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

  // Highlighting states
  const [highlightMode, setHighlightMode] = useState(false);
  const [removeHighlightMode, setRemoveHighlightMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#fbbf24"); // amber-400
  const [highlights, setHighlights] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const contentRef = useRef(null);

  // Highlight colors - professional palette
  const highlightColors = [
    {
      name: "Yellow",
      value: "#fbbf24",
      bg: "bg-amber-200",
      darkBg: "bg-amber-900",
    },
    {
      name: "Green",
      value: "#10b981",
      bg: "bg-emerald-200",
      darkBg: "bg-emerald-900",
    },
    {
      name: "Blue",
      value: "#3b82f6",
      bg: "bg-blue-200",
      darkBg: "bg-blue-900",
    },
    {
      name: "Purple",
      value: "#8b5cf6",
      bg: "bg-violet-200",
      darkBg: "bg-violet-900",
    },
    {
      name: "Pink",
      value: "#ec4899",
      bg: "bg-pink-200",
      darkBg: "bg-pink-900",
    },
    {
      name: "Orange",
      value: "#f97316",
      bg: "bg-orange-200",
      darkBg: "bg-orange-900",
    },
  ];

  useEffect(() => {
    fetchNote();
    if (folderId) {
      fetchFolderNotes();
    }
  }, [id, folderId]);

  useEffect(() => {
    if (note) {
      setHighlights(note.highlights || []);
      // Apply highlights after content is rendered
      setTimeout(() => {
        applyHighlights();
      }, 100);
    }
  }, [note]);

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
    // Remove YAML frontmatter - more comprehensive regex
    let cleanContent = content;

    // Remove frontmatter at the beginning (---...---)
    cleanContent = cleanContent.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/m, "");

    // Remove any remaining frontmatter patterns
    cleanContent = cleanContent.replace(/^---\s*[\s\S]*?---\s*$/gm, "");

    // Remove title and tags lines that might be left
    cleanContent = cleanContent.replace(/^title:\s*.*$/gm, "");
    cleanContent = cleanContent.replace(/^tags:\s*\[.*?\]$/gm, "");

    // Clean up extra newlines
    cleanContent = cleanContent.replace(/^\n+/, "").trim();

    return cleanContent;
  };

  const applyHighlights = () => {
    if (!contentRef.current || !highlights.length) return;

    // Remove existing highlights
    const existingHighlights =
      contentRef.current.querySelectorAll(".custom-highlight");
    existingHighlights.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
      }
    });

    // Apply saved highlights
    highlights.forEach((highlight, index) => {
      if (highlight.text && highlight.color) {
        highlightTextInElement(
          contentRef.current,
          highlight.text,
          highlight.color,
          index
        );
      }
    });
  };

  const highlightTextInElement = (element, searchText, color, index) => {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          if (
            ["script", "style", "noscript", "code", "pre"].includes(tagName)
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.classList.contains("custom-highlight")) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    for (const textNode of textNodes) {
      const text = textNode.textContent;
      const highlightIndex = text
        .toLowerCase()
        .indexOf(searchText.toLowerCase());

      if (highlightIndex !== -1) {
        try {
          const range = document.createRange();
          range.setStart(textNode, highlightIndex);
          range.setEnd(textNode, highlightIndex + searchText.length);

          const span = document.createElement("span");
          span.className = "custom-highlight";
          span.style.backgroundColor = color + "40"; // Add transparency
          span.style.padding = "2px 4px";
          span.style.borderRadius = "4px";
          span.style.cursor = removeHighlightMode ? "pointer" : "default";
          span.dataset.highlightIndex = index;
          span.title = removeHighlightMode ? "Click to remove highlight" : "";

          range.surroundContents(span);
          break;
        } catch (error) {
          console.warn("Could not apply highlight:", error);
        }
      }
    }
  };

  const handleTextSelection = () => {
    if (!highlightMode) return;

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText || selectedText.length < 2) return;

    const range = selection.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    // Check if already highlighted
    const existingHighlight = highlights.find(
      (h) => h.text.toLowerCase() === selectedText.toLowerCase()
    );

    if (existingHighlight) {
      selection.removeAllRanges();
      return;
    }

    // Add new highlight
    const newHighlight = {
      text: selectedText,
      color: selectedColor,
      id: Date.now(),
    };

    const updatedHighlights = [...highlights, newHighlight];
    setHighlights(updatedHighlights);
    setHasUnsavedChanges(true);
    selection.removeAllRanges();

    // Apply highlight immediately
    setTimeout(() => {
      highlightTextInElement(
        contentRef.current,
        selectedText,
        selectedColor,
        updatedHighlights.length - 1
      );
    }, 10);
  };

  const handleHighlightClick = (e) => {
    if (!removeHighlightMode) return;

    let highlightElement = e.target;
    if (!highlightElement.classList.contains("custom-highlight")) {
      highlightElement = highlightElement.closest(".custom-highlight");
    }

    if (
      highlightElement &&
      highlightElement.classList.contains("custom-highlight")
    ) {
      e.preventDefault();
      e.stopPropagation();

      const highlightText = highlightElement.textContent;

      // Remove from DOM immediately
      const parent = highlightElement.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(highlightText),
          highlightElement
        );
        parent.normalize();
      }

      // Update state
      const updatedHighlights = highlights.filter((highlight) => {
        return highlight.text.toLowerCase() !== highlightText.toLowerCase();
      });

      if (updatedHighlights.length < highlights.length) {
        setHighlights(updatedHighlights);
        setHasUnsavedChanges(true);
      }
    }
  };

  const saveHighlights = async () => {
    try {
      await updateHighlights(id, highlights);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save highlights:", error);
    }
  };

  const clearAllHighlights = () => {
    if (highlights.length === 0) return;

    if (window.confirm(`Remove all ${highlights.length} highlights?`)) {
      // Remove from DOM
      const existingHighlights =
        contentRef.current?.querySelectorAll(".custom-highlight");
      existingHighlights?.forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent), el);
          parent.normalize();
        }
      });

      setHighlights([]);
      setHasUnsavedChanges(true);
    }
  };

  const toggleHighlightMode = () => {
    setHighlightMode(!highlightMode);
    if (highlightMode) {
      setRemoveHighlightMode(false);
    }
  };

  const toggleRemoveMode = () => {
    setRemoveHighlightMode(!removeHighlightMode);
    if (removeHighlightMode) {
      setHighlightMode(false);
    }

    // Update cursor styles
    setTimeout(() => {
      const highlights =
        contentRef.current?.querySelectorAll(".custom-highlight");
      highlights?.forEach((el) => {
        el.style.cursor = !removeHighlightMode ? "pointer" : "default";
        el.title = !removeHighlightMode ? "Click to remove highlight" : "";
      });
    }, 10);
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
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {/* Navigation buttons when in folder presentation mode */}
              {folderId && folderNotes.length > 0 && (
                <div className="flex items-center space-x-2 border-l border-gray-300 dark:border-gray-600 pl-4">
                  <button
                    onClick={() => {
                      const prevIndex = currentNoteIndex - 1;
                      if (prevIndex >= 0) {
                        navigate(
                          `/note/${folderNotes[prevIndex]._id}?folder=${folderId}`
                        );
                      }
                    }}
                    disabled={currentNoteIndex <= 0}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                      currentNoteIndex <= 0
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentNoteIndex + 1} / {folderNotes.length}
                  </span>

                  <button
                    onClick={() => {
                      const nextIndex = currentNoteIndex + 1;
                      if (nextIndex < folderNotes.length) {
                        navigate(
                          `/note/${folderNotes[nextIndex]._id}?folder=${folderId}`
                        );
                      }
                    }}
                    disabled={currentNoteIndex >= folderNotes.length - 1}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                      currentNoteIndex >= folderNotes.length - 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <Link
              to={`/edit/${note._id}`}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
          </div>

          {/* Note Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {note.title}
          </h1>

          {/* Note Meta */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
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

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Highlighting Tools */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 flex-wrap">
              {/* Highlight Button */}
              <button
                onClick={toggleHighlightMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  highlightMode
                    ? "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Highlighter className="h-4 w-4" />
                <span>Highlight</span>
              </button>

              {/* Remove Highlight Button */}
              <button
                onClick={toggleRemoveMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  removeHighlightMode
                    ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Eraser className="h-4 w-4" />
                <span>Remove</span>
              </button>

              {/* Color Picker */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Color:
                </span>
                <div className="flex space-x-1">
                  {highlightColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color.value
                          ? "border-gray-800 dark:border-gray-200 scale-110"
                          : "border-gray-300 dark:border-gray-600 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Save Controls */}
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  Unsaved changes
                </span>
              )}

              <button
                onClick={saveHighlights}
                disabled={!hasUnsavedChanges}
                className={`flex items-center space-x-1 px-4 py-2 rounded-md transition-colors ${
                  hasUnsavedChanges
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>

              {highlights.length > 0 && (
                <button
                  onClick={clearAllHighlights}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {highlightMode && (
              <p>💡 Select text to highlight it with the chosen color</p>
            )}
            {removeHighlightMode && (
              <p>💡 Click on any highlighted text to remove the highlight</p>
            )}
            {!highlightMode && !removeHighlightMode && (
              <p>
                💡 Use the tools above to highlight important parts of your
                notes
              </p>
            )}
          </div>
        </div>

        {/* Note Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div
            ref={contentRef}
            className="p-8 prose prose-lg prose-gray dark:prose-invert max-w-none"
            onMouseUp={handleTextSelection}
            onClick={handleHighlightClick}
            style={{
              userSelect:
                highlightMode || removeHighlightMode ? "text" : "auto",
              cursor: removeHighlightMode ? "pointer" : "default",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                // Code handling
                code({ node, inline, className, children, ...props }) {
                  // Check if this is truly inline code (single backticks)
                  const isInlineCode =
                    inline === true ||
                    !className ||
                    !className.startsWith("language-");

                  if (isInlineCode) {
                    // Inline code - single backticks
                    return (
                      <code
                        className="bg-gray-900 text-orange-300 px-2 py-1 rounded text-sm font-mono font-semibold shadow-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  // Block code - triple backticks (handled by pre component)
                  return (
                    <code
                      className={`${className} bg-transparent text-gray-100 font-mono text-sm leading-relaxed`}
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
                    <div className="relative my-6">
                      {language && (
                        <div className="absolute top-0 right-0 bg-gray-700 text-gray-300 px-3 py-1 text-xs rounded-bl-md rounded-tr-md z-10 font-mono">
                          {language}
                        </div>
                      )}
                      <pre
                        className="bg-gray-900 rounded-lg overflow-x-auto border border-gray-700"
                        {...props}
                      >
                        {children}
                      </pre>
                    </div>
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
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                    }}
                    className="flex items-center space-x-3 text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                      <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
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
                          ? "bg-primary-500"
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
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                      <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
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
