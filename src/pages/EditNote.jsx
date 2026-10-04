import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, Layout, Columns } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getNote, updateNote } from "../services/api";
import toast from "react-hot-toast";
import { sanitizeMarkdown, sanitizeName } from "../utils/sanitize";
import { calculateReadingTime } from "../utils/markdownHelpers";
import MarkdownToolbar from "../components/MarkdownToolbar";
import BookLoader from "../components/BookLoader";

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'edit' | 'preview'
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const note = await getNote(id);
      setFormData({
        title: note.title,
        content: note.content,
      });
    } catch (error) {
      toast.error("Failed to fetch note");
      navigate("/app");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedTitle = sanitizeName(formData.title);
    const sanitizedContent = sanitizeMarkdown(formData.content);

    if (!sanitizedTitle.trim() || !sanitizedContent.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      await updateNote(id, {
        title: sanitizedTitle,
        content: sanitizedContent,
      });
      toast.success("Note updated!");
      navigate(`/app/note/${id}`);
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error(error.response?.data?.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <BookLoader message="Loading note..." />
      </div>
    );
  }

  const readingTimeStats = calculateReadingTime(formData.content);
  const charCount = formData.content.length;

  return (
    <div className="page-container py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/app/note/${id}`)}
            className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-neutral-100">Edit Note</h1>
        </div>

        {/* View Mode Switches */}
        <div
          className="flex items-center p-1 rounded-lg"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "edit" ? "text-white" : ""
            }`}
            style={{
              background: viewMode === "edit" ? "var(--blue)" : "transparent",
              color: viewMode === "edit" ? "#fff" : "var(--text-muted)",
            }}
            title="Edit Only"
          >
            <Layout className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "split" ? "text-white" : ""
            }`}
            style={{
              background: viewMode === "split" ? "var(--blue)" : "transparent",
              color: viewMode === "split" ? "#fff" : "var(--text-muted)",
            }}
            title="Split View"
          >
            <Columns className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "preview" ? "text-white" : ""
            }`}
            style={{
              background: viewMode === "preview" ? "var(--blue)" : "transparent",
              color: viewMode === "preview" ? "#fff" : "var(--text-muted)",
            }}
            title="Preview Only"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="Note title"
            required
          />
        </div>

        {/* Content Editor with Formatting Toolbar */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Header & Stats */}
          <div
            className="px-6 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Editor
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Markdown supported
              </p>
            </div>
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>{readingTimeStats.words} words</span>
              <span>•</span>
              <span>{readingTimeStats.text}</span>
            </div>
          </div>

          {/* Markdown Formatting Toolbar */}
          <MarkdownToolbar
            textareaRef={textareaRef}
            content={formData.content}
            onChange={(newContent) =>
              setFormData((prev) => ({ ...prev, content: newContent }))
            }
          />

          <div
            className={`grid ${
              viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            } min-h-[450px]`}
          >
            {/* Editor */}
            {viewMode !== "preview" && (
              <textarea
                ref={textareaRef}
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-[450px] p-6 text-sm resize-none focus:ring-0 focus:outline-none font-mono leading-relaxed"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "none",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                }}
                placeholder="Write your content here..."
                required
              />
            )}

            {/* Preview */}
            {viewMode !== "edit" && (
              <div
                className={`p-6 prose max-w-none overflow-auto h-[450px] custom-scrollbar ${
                  viewMode === "split" ? "border-l border-neutral-700" : ""
                }`}
                style={{ background: "var(--bg-elevated)" }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {formData.content || "*Preview will appear here...*"}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div
            className="px-6 py-2 flex items-center justify-between text-xs"
            style={{
              background: "var(--bg-surface)",
              borderTop: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            <span>Markdown Mode</span>
            <div className="flex items-center gap-4">
              <span>{charCount} characters</span>
              <span>{readingTimeStats.words} words</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-6 py-2.5"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
