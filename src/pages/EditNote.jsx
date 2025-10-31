import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getNote, updateNote } from "../services/api";
import toast from "react-hot-toast";
import { sanitizeMarkdown, sanitizeName } from "../utils/sanitize";
import LoadingSpinner from "../components/LoadingSpinner";

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
    let isMounted = true;

    const loadNote = async () => {
      if (isMounted) {
        await fetchNote();
      }
    };

    loadNote();

    return () => {
      isMounted = false;
    };
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
      const noteData = {
        title: sanitizedTitle,
        content: sanitizedContent,
      };

      // Debug logging
      console.log("Updating note with data:", {
        id,
        title: sanitizedTitle,
        contentLength: sanitizedContent.length,
        contentPreview: sanitizedContent.substring(0, 100) + "..."
      });

      await updateNote(id, noteData);
      toast.success("Note updated successfully!");
      navigate(`/app/note/${id}`);
    } catch (error) {
      console.error("Error updating note:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
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
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" message="Loading note..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate(`/app/note/${id}`)}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Edit Note
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
              preview
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{preview ? "Edit" : "Preview"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 p-4 sm:p-6 lg:p-8">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 transition-all text-sm sm:text-base"
              placeholder="Enter note title..."
              required
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
          <div className="border-b border-gray-700/50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-900/30">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Content
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Write your note in Markdown format
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-64 sm:min-h-96">
            {/* Editor */}
            <div className={`${preview ? "hidden lg:block" : ""}`}>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-64 sm:h-96 p-4 sm:p-6 bg-gray-900 text-white border-0 resize-none focus:ring-0 focus:outline-none font-mono text-xs sm:text-sm placeholder-gray-500"
                placeholder="Write your content here using Markdown..."
                required
              />
            </div>

            {/* Preview */}
            <div
              className={`border-l border-gray-700 bg-gray-900 ${
                !preview ? "hidden lg:block" : ""
              }`}
            >
              <div className="p-4 sm:p-6 prose prose-sm max-w-none prose-invert overflow-auto h-64 sm:h-96">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return (
                        <code
                          className={`${className} ${
                            inline
                              ? "bg-gray-700 text-gray-200 px-1 py-0.5 rounded text-sm"
                              : "block bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"
                          }`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
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
            className="flex items-center space-x-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base w-full sm:w-auto justify-center"
            aria-label={loading ? "Updating note" : "Update note"}
          >
            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{loading ? "Updating..." : "Update Note"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
