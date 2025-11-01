import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    let isMounted = true;

    const initFolders = async () => {
      if (isMounted) {
        await loadFolders();
      }
    };

    initFolders();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadFolders = async () => {
    try {
      setLoadingFolders(true);
      const foldersData = await getFolders();

      if (foldersData.length === 0) {
        const defaultFolder = await createFolder({
          name: "My Notes",
          description: "Default folder for your notes",
          color: "#6366f1",
          icon: "📝",
        });
        setFolders([defaultFolder]);
        setFormData((prev) => ({ ...prev, folder: defaultFolder._id }));
        refreshFolders();
      } else {
        setFolders(foldersData);
        setFormData((prev) => ({ ...prev, folder: foldersData[0]._id }));
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
      toast.error(
        "Content is required. Please write content or upload a markdown file."
      );
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
      toast.success("Note created successfully!");
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
    setFormData(prevData => ({
      ...prevData,
      title: aiContent.title,
      content: aiContent.content,
    }));
    setShowAIGenerator(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is markdown
    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
      toast.error("Please select a markdown (.md) file");
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
      toast.success("Markdown file loaded successfully!");
    };

    reader.onerror = () => {
      toast.error("Error reading file");
    };

    reader.readAsText(file);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setFormData((prev) => ({
      ...prev,
      content: "",
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Create New Note</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          type="button"
          onClick={() => {
            setUploadedFile(null);
            setFormData({
              title: "",
              content: "",
              folder: folders.length > 0 ? folders[0]._id : "",
            });
            toast.success("Ready to create new note");
          }}
          className="flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] w-full sm:w-auto sm:min-w-[200px] justify-center"
          aria-label="Create new note"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-base sm:text-lg font-semibold">New Note</span>
        </button>

        <button
          type="button"
          onClick={() => setShowAIGenerator(!showAIGenerator)}
          className={`flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r text-white rounded-xl sm:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] w-full sm:w-auto sm:min-w-[200px] justify-center ${
            showAIGenerator 
              ? 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' 
              : 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          }`}
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-base sm:text-lg font-semibold">
            {showAIGenerator ? 'Manual Mode' : 'AI Generate'}
          </span>
        </button>

        <label className="flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl sm:rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] cursor-pointer w-full sm:w-auto sm:min-w-[200px] justify-center">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-base sm:text-lg font-semibold">Upload MD</span>
          <input
            type="file"
            className="hidden"
            accept=".md,.markdown"
            onChange={handleFileUpload}
            aria-label="Upload markdown file"
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Topic Generator */}
        <AITopicGenerator 
          onContentGenerated={handleAIContentGenerated}
          isVisible={showAIGenerator}
        />

        {/* File Status */}
        {uploadedFile && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">File Loaded</p>
                  <p className="text-gray-400 text-sm">{uploadedFile.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearUploadedFile}
                className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded border border-red-400 hover:border-red-300 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900/50 border text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 transition-all ${
                  formData.title ? 'border-emerald-500/50' : 'border-gray-600/50'
                }`}
                placeholder={showAIGenerator ? "AI will generate title..." : "Enter note title..."}
                required={!showAIGenerator}
                readOnly={showAIGenerator}
              />
              {formData.title && !showAIGenerator && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Generated by AI
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Folder *
              </label>
              <select
                name="folder"
                value={formData.folder}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
                disabled={loadingFolders}
              >
                {loadingFolders ? (
                  <option>Loading folders...</option>
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

        {/* Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
          <div className="border-b border-gray-700/50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-900/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Content</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {uploadedFile
                    ? "Content loaded from uploaded file"
                    : showAIGenerator
                    ? "AI will generate structured content"
                    : formData.content && !uploadedFile
                    ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Sparkles className="h-3 w-3" />
                          Generated by AI
                        </span>
                      )
                    : "Write your note in Markdown format"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-64 sm:min-h-96">
            {/* Editor */}
            <div className={`${preview ? "hidden lg:block" : ""}`}>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-64 sm:h-96 p-4 sm:p-6 bg-gray-900 text-white border-0 resize-none focus:ring-0 focus:outline-none font-mono text-xs sm:text-sm placeholder-gray-500"
                placeholder={
                  showAIGenerator
                    ? "AI will generate structured content here..."
                    : uploadedFile
                    ? "Content from uploaded file will appear here..."
                    : `# Your Note Title

Write your content here using Markdown...

## Example Section

- Bullet point 1
- Bullet point 2

\`\`\`javascript
// Code example
function example() {
  console.log('Hello World!');
}
\`\`\``
                }
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
            aria-label={loading ? "Creating note" : "Create note"}
          >
            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{loading ? "Creating..." : "Create Note"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
