import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getNote, updateNote } from "../services/api";
import toast from "react-hot-toast";
import { sanitizeMarkdown, sanitizeName } from "../utils/sanitize";
import BookLoader from "../components/BookLoader";

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

        <button
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            preview
              ? "bg-indigo-600 text-white"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>{preview ? "Edit" : "Preview"}</span>
        </button>
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

        {/* Content Editor */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-200">Content</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Write in Markdown format
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Editor */}
            <div className={preview ? "hidden lg:block" : ""}>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-[400px] p-6 bg-neutral-950 text-neutral-200 border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm placeholder-neutral-600"
                placeholder="Write your content here..."
                required
              />
            </div>

            {/* Preview */}
            <div
              className={`border-l border-neutral-800 bg-neutral-900 ${
                !preview ? "hidden lg:block" : ""
              }`}
            >
              <div className="p-6 prose max-w-none overflow-auto h-[400px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {formData.content || "*Preview will appear here...*"}
                </ReactMarkdown>
              </div>
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
