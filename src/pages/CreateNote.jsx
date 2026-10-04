import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  FileText,
  Plus,
  Layout,
  Columns,
  Maximize2,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { createNote, getFolders, createFolder } from "../services/api";
import toast from "react-hot-toast";
import { useFolders } from "../contexts/FolderContext";
import { sanitizeMarkdown, sanitizeName } from "../utils/sanitize";
import { calculateReadingTime } from "../utils/markdownHelpers";
import { NOTE_TEMPLATES } from "../utils/noteTemplates";
import MarkdownToolbar from "../components/MarkdownToolbar";

export default function CreateNote() {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const { refreshFolders } = useFolders();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    folder: "",
  });
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'edit' | 'preview'
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const textareaRef = useRef(null);

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

  const handleApplyTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      content: template.content,
      title: prev.title || template.name,
    }));
    toast.success(`Applied template: ${template.name}`);
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

  const readingTimeStats = calculateReadingTime(formData.content);
  const charCount = formData.content.length;

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
          <h1 className="text-xl font-semibold text-neutral-100">Create Note</h1>
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
              background:
                viewMode === "edit" ? "var(--blue)" : "transparent",
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
              background:
                viewMode === "split" ? "var(--blue)" : "transparent",
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
              background:
                viewMode === "preview" ? "var(--blue)" : "transparent",
              color: viewMode === "preview" ? "#fff" : "var(--text-muted)",
            }}
            title="Preview Only"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>

      {/* Quick Actions & Templates */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
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
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <label className="btn-secondary flex items-center gap-2 text-xs cursor-pointer">
            <FileText className="h-3.5 w-3.5" />
            <span>Upload .md</span>
            <input
              type="file"
              className="hidden"
              accept=".md,.markdown"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Templates Selector */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--blue-light)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Template:
          </span>
          <select
            onChange={(e) => {
              const tmpl = NOTE_TEMPLATES.find((t) => t.id === e.target.value);
              if (tmpl) handleApplyTemplate(tmpl);
            }}
            defaultValue="blank"
            className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            {NOTE_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.icon} {tmpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                required
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

        {/* Content Editor with Formatting Toolbar */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Header & Markdown Toolbar */}
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

          {/* Markdown Toolbar */}
          <MarkdownToolbar
            textareaRef={textareaRef}
            content={formData.content}
            onChange={(newContent) =>
              setFormData((prev) => ({ ...prev, content: newContent }))
            }
          />

          <div
            className={`grid ${
              viewMode === "split"
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1"
            } min-h-[450px]`}
          >
            {/* Textarea Editor */}
            {viewMode !== "preview" && (
              <div className="relative flex flex-col">
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
            )}

            {/* Live Preview Panel */}
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
            <span>{loading ? "Creating..." : "Create Note"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
