import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, FileText, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { createNote, getFolders, createFolder } from "../services/api";
import toast from "react-hot-toast";
import { useFolders } from "../contexts/FolderContext";

export default function CreateNote() {
  const navigate = useNavigate();
  const { refreshFolders } = useFolders();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    category: "javascript",
    episode: "",
    folder: "",
  });
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoadingFolders(true);
      const foldersData = await getFolders();

      if (foldersData.length === 0) {
        // Create a default folder if none exists
        const defaultFolder = await createFolder({
          name: "General Notes",
          description: "Default folder for notes",
          color: "#3b82f6",
          icon: "📝",
        });
        setFolders([defaultFolder]);
        setFormData((prev) => ({ ...prev, folder: defaultFolder._id }));
        refreshFolders(); // Refresh sidebar
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
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error(
        "Content is required. Please write content or upload a markdown file."
      );
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        episode: formData.episode ? parseInt(formData.episode) : undefined,
      };

      console.log("Sending note data:", noteData);
      const newNote = await createNote(noteData);
      toast.success("Note created successfully!");
      navigate(`/app/note/${newNote._id}`);
    } catch (error) {
      console.error("Error creating note:", error);
      console.error("Error response:", error.response?.data);
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Create New Note</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
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
      <div className="flex justify-center space-x-4 mb-6">
        <button
          type="button"
          onClick={() => {
            setUploadedFile(null);
            setFormData({
              title: "",
              content: "",
              tags: "",
              category: "javascript",
              episode: "",
              folder: folders.length > 0 ? folders[0]._id : "",
            });
            toast.success("Ready to create new note");
          }}
          className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px] justify-center"
        >
          <Plus className="h-6 w-6" />
          <span className="text-lg font-semibold">New Note</span>
        </button>

        <label className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer min-w-[200px] justify-center">
          <FileText className="h-6 w-6" />
          <span className="text-lg font-semibold">Add MD File</span>
          <input
            type="file"
            className="hidden"
            accept=".md,.markdown"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Enter note title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Episode Number
              </label>
              <input
                type="number"
                name="episode"
                value={formData.episode}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="e.g., 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Folder *
              </label>
              <select
                name="folder"
                value={formData.folder}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="javascript">JavaScript</option>
                <option value="react">React</option>
                <option value="nodejs">Node.js</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="javascript, closures, functions"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <div className="border-b border-gray-700 px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Content</h3>
                <p className="text-sm text-gray-400">
                  {uploadedFile
                    ? "Content loaded from uploaded file"
                    : "Write your note in Markdown format or use 'Add MD File' button above"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-96">
            {/* Editor */}
            <div className={`${preview ? "hidden lg:block" : ""}`}>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-96 p-6 bg-gray-900 text-white border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm placeholder-gray-500"
                placeholder={
                  uploadedFile
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
              <div className="p-6 prose prose-sm max-w-none prose-invert">
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
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Creating..." : "Create Note"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
