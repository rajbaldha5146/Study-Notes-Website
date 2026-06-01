import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye, FileText, Plus, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { createNote, getFolders, createFolder } from "../services/api";
import toast from "react-hot-toast";
import { useFolders } from "../contexts/FolderContext";
import { sanitizeMarkdown, sanitizeName } from "../utils/sanitize";
import AITopicGenerator from "../components/ai/AITopicGenerator";

export default function CreateNote() {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const { refreshFolders } = useFolders();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    folder: "",
  });
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    loadFolders();
  }, [folderId]);

  const loadFolders = async () => {
    try {
      setLoadingFolders(true);
      const foldersData = await getFolders();

      if (foldersData.length === 0) {
        const defaultFolder = await createFolder({
          name: "My Notes",
          description: "Default folder",
          color: "#6366f1",
          icon: "📝",
        });
        setFolders([defaultFolder]);
        setFormData((prev) => ({ ...prev, folder: defaultFolder._id }));
        refreshFolders();
      } else {
        setFolders(foldersData);
        // If folderId is provided in URL, use it; otherwise use first folder
        const defaultFolderId = folderId || foldersData[0]._id;
        setFormData((prev) => ({ ...prev, folder: defaultFolderId }));
      }
    } catch (error) {
      console.error("Error loading folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedTitle = sanitizeName(formData.title);
    const sanitizedContent = sanitizeMarkdown(formData.content);

    if (!sanitizedTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!sanitizedContent.trim()) {
      toast.error("Content is required");
      return;
    }

    if (!formData.folder) {
      toast.error("Please select a folder");
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        title: sanitizedTitle,
        content: sanitizedContent,
        folder: formData.folder,
      };

      const newNote = await createNote(noteData);
      toast.success("Note created!");
      navigate(`/app/note/${newNote._id}`);
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error(error.response?.data?.message || "Failed to create note");
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

  const handleAIContentGenerated = (aiContent) => {
    setFormData((prevData) => ({
      ...prevData,
      title: aiContent.title,
      content: aiContent.content,
    }));
    setShowAIGenerator(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
      toast.error("Please select a markdown file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const fileName = file.name.replace(/\.(md|markdown)$/, "");

      setFormData((prev) => ({
        ...prev,
        title: prev.title || fileName,
        content: content,
      }));
      setUploadedFile(file);
      toast.success("File loaded");
    };

    reader.onerror = () => toast.error("Error reading file");
    reader.readAsText(file);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setFormData((prev) => ({ ...prev, content: "" }));
  };

  return (
    <div className="page-container py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app")}
            className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-neutral-100">
            Create Note
          </h1>
        </div>

        <button
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            preview
              ? "text-white"
              : "hover:opacity-80"
          }`}
          style={preview ? {
            background: "linear-gradient(135deg, var(--violet-dark), var(--violet))",
            boxShadow: "0 0 12px rgba(139,92,246,0.3)",
            border: "1px solid rgba(139,92,246,0.3)"
          } : {
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)"
          }}
        >
          <Eye className="h-4 w-4" />
          <span>{preview ? "Edit" : "Preview"}</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setUploadedFile(null);
            setFormData({
              title: "",
              content: "",
              folder: folderId || (folders.length > 0 ? folders[0]._id : ""),
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAIGenerator(!showAIGenerator)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            showAIGenerator
              ? "bg-emerald-600 text-white"
              : "bg-purple-600 text-white hover:bg-purple-500"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{showAIGenerator ? "Manual" : "AI Generate"}</span>
        </button>

        <label className="btn-secondary flex items-center gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          <span>Upload</span>
          <input
            type="file"
            className="hidden"
            accept=".md,.markdown"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Generator */}
        <AITopicGenerator
          onContentGenerated={handleAIContentGenerated}
          isVisible={showAIGenerator}
        />

        {/* File Status */}
        {uploadedFile && (
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-neutral-200">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-neutral-500">File loaded</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearUploadedFile}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}

        {/* Basic Info */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter note title..."
                required={!showAIGenerator}
                readOnly={showAIGenerator}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Folder
              </label>
              <select
                name="folder"
                value={formData.folder}
                onChange={handleChange}
                className="input"
                required
                disabled={loadingFolders}
              >
                {loadingFolders ? (
                  <option>Loading...</option>
                ) : (
                  folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.icon} {folder.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Content</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Write in Markdown format</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Editor */}
            <div className={preview ? "hidden lg:block" : ""}>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-[400px] p-6 text-sm resize-none focus:ring-0 focus:outline-none font-mono leading-relaxed"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "none",
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                }}
                placeholder={`# Your Note Title

Write your content here...

## Section

- Point 1
- Point 2

\`\`\`javascript
console.log('Hello!');
\`\`\``}
                required
              />
            </div>

            {/* Preview */}
            <div
              className={`border-l border-neutral-700 ${
                !preview ? "hidden lg:block" : ""
              }`}
              style={{ background: "var(--bg-elevated)" }}
            >
              <div className="p-6 prose max-w-none overflow-auto h-[400px] custom-scrollbar">
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
            <span>{loading ? "Creating..." : "Create Note"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
