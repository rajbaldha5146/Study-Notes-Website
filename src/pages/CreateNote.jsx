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
  LayoutTemplate,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { createNote, getFolders, createFolder } from "../services/api";
import toast from "react-hot-toast";
import { useFolders } from "../contexts/FolderContext";
import { sanitizeMarkdown, sanitizeName } from "../utils/sanitize";
import { calculateReadingTime } from "../utils/markdownHelpers";
import { NOTE_TEMPLATES } from "../utils/noteTemplates";
import MarkdownToolbar from "../components/MarkdownToolbar";
import ReadingStatsBadge from "../components/ReadingStatsBadge";

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
          description: "Default notebook",
          color: "#e09050",
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
      toast.error("Please select a notebook folder");
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
      toast.success(`Loaded "${file.name}"`);
    };
    reader.readAsText(file);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
  };

  const readingTimeStats = calculateReadingTime(formData.content);
  const charCount = formData.content.length;

  return (
    <div className="page-container py-6 animate-fade-in max-w-5xl">
      {/* Header & Mode Segmented Switcher */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--text-primary)", fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Create New Note
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

      {/* Action Strip: Reset, Upload, Templates */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
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
            className="btn-secondary flex items-center gap-1.5 text-xs font-medium"
            style={{ padding: "0.4rem 0.75rem" }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <label
            className="btn-secondary flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            style={{ padding: "0.4rem 0.75rem" }}
          >
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
          <LayoutTemplate className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
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
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File Loaded Status Pill */}
        {uploadedFile && (
          <div
            className="p-3 rounded-lg flex items-center justify-between border"
            style={{
              background: "rgba(124, 179, 128, 0.08)",
              borderColor: "rgba(124, 179, 128, 0.25)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4" style={{ color: "var(--success)" }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {uploadedFile.name}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Markdown file loaded</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearUploadedFile}
              className="text-xs font-medium hover:underline cursor-pointer"
              style={{ color: "var(--danger)" }}
            >
              Remove
            </button>
          </div>
        )}

        {/* Basic Metadata Info */}
        <div className="card p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input text-xs sm:text-sm"
                placeholder="e.g. Distributed Consensus in Raft"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Notebook Folder
              </label>
              <select
                name="folder"
                value={formData.folder}
                onChange={handleChange}
                className="input text-xs sm:text-sm cursor-pointer"
                required
                disabled={loadingFolders}
              >
                {loadingFolders ? (
                  <option>Loading notebooks...</option>
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

        {/* Content Editor & Split Preview Panel */}
        <div className="card overflow-hidden">
          {/* Editor Header Bar */}
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
              viewMode === "split"
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1"
            } min-h-[460px]`}
          >
            {/* Textarea Editor */}
            {viewMode !== "preview" && (
              <div className="relative flex flex-col">
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
                  placeholder={`# Note Title

Write your structured notes here...

## Key Concepts

- Concept 1: Description
- Concept 2: Code reference

\`\`\`javascript
const vault = new NoteVault();
\`\`\``}
                  required
                />
              </div>
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

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Creating..." : "Save to Notebook"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
