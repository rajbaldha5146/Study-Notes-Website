import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, Layout, Columns } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { getNote, updateNote } from "../services/api";
import toast from "react-hot-toast";
import { sanitizeMarkdown, sanitizeName } from "../utils/sanitize";
import { calculateReadingTime } from "../utils/markdownHelpers";
import MarkdownToolbar from "../components/MarkdownToolbar";
import ReadingStatsBadge from "../components/ReadingStatsBadge";
import Loader from "../components/Loader";
import { useTabs } from "../contexts/TabContext";

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openTab } = useTabs();
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
      openTab({
        id: note._id,
        title: note.title || "Untitled",
        path: `/app/note/${note._id}`,
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
      openTab({
        id,
        title: sanitizedTitle,
        path: `/app/note/${id}`,
      });
      toast.success("Note saved!");
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader message="Loading editor..." />
      </div>
    );
  }

  const readingTimeStats = calculateReadingTime(formData.content);
  const charCount = formData.content.length;

  return (
    <div className="page-container py-6 animate-fade-in max-w-5xl">
      {/* Header with Back and Mode Switcher */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/app/note/${id}`)}
            className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--text-primary)", fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Edit Note
          </h1>
        </div>

        {/* View Mode Segmented Control */}
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
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer"
            style={{
              background: viewMode === "edit" ? "var(--accent)" : "transparent",
              color: viewMode === "edit" ? "#1a1614" : "var(--text-muted)",
              fontWeight: viewMode === "edit" ? "600" : "500",
            }}
            title="Edit mode"
          >
            <Layout className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer"
            style={{
              background: viewMode === "split" ? "var(--accent)" : "transparent",
              color: viewMode === "split" ? "#1a1614" : "var(--text-muted)",
              fontWeight: viewMode === "split" ? "600" : "500",
            }}
            title="Split mode"
          >
            <Columns className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer"
            style={{
              background: viewMode === "preview" ? "var(--accent)" : "transparent",
              color: viewMode === "preview" ? "#1a1614" : "var(--text-muted)",
              fontWeight: viewMode === "preview" ? "600" : "500",
            }}
            title="Preview mode"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input Card */}
        <div className="card p-5">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Note Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input text-xs sm:text-sm font-medium"
            placeholder="Note title..."
            required
          />
        </div>

        {/* Content Editor with Formatting Toolbar */}
        <div className="card overflow-hidden">
          {/* Header Bar */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                Editor Workspace
              </h3>
            </div>
            <ReadingStatsBadge content={formData.content} />
          </div>

          {/* Formatting Toolbar */}
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
            } min-h-[460px]`}
          >
            {/* Editor Textarea */}
            {viewMode !== "preview" && (
              <textarea
                ref={textareaRef}
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-[460px] p-5 text-xs sm:text-sm resize-none focus:outline-none font-mono leading-relaxed"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "none",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                }}
                placeholder="Write your note content here..."
                required
              />
            )}

            {/* Live Preview Panel */}
            {viewMode !== "edit" && (
              <div
                className={`p-5 prose max-w-none overflow-auto h-[460px] custom-scrollbar ${
                  viewMode === "split" ? "border-t lg:border-t-0 lg:border-l" : ""
                }`}
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                >
                  {formData.content || "*Formatted preview appears here in real time...*"}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div
            className="px-5 py-2 flex items-center justify-between text-xs font-mono"
            style={{
              background: "var(--bg-surface)",
              borderTop: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            <span>Markdown Active</span>
            <div className="flex items-center gap-4">
              <span>{charCount} chars</span>
              <span>{readingTimeStats.words} words</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
