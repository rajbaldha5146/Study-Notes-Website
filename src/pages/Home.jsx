import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Folder, FolderPlus, FileText, ArrowRight, Plus } from "lucide-react";
import { getFolderTree } from "../services/api";
import BookLoader from "../components/BookLoader";
import { useFolders } from "../contexts/FolderContext";
import toast from "react-hot-toast";

export default function Home() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useFolders();

  useEffect(() => {
    let isMounted = true;

    const fetchFolders = async () => {
      try {
        setLoading(true);
        const data = await getFolderTree();
        if (isMounted) setFolders(data);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
        if (isMounted) {
          setFolders([]);
          toast.error("Failed to load folders");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFolders();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-[60vh]">
          <BookLoader message="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-100 mb-2">
          Welcome back
        </h1>
        <p className="text-neutral-500">
          Organize your thoughts and keep everything in one place.
        </p>
      </div>

      {folders.length === 0 ? (
        /* Empty State */
        <div className="space-y-8">
          {/* Main CTA */}
          <div className="card p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
              <FolderPlus className="h-8 w-8 text-indigo-400" />
            </div>

            <h2 className="text-2xl font-semibold text-neutral-100 mb-3">
              Get started
            </h2>

            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Create your first folder to begin organizing your notes. Folders
              help you keep related notes together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  const createButton = document.querySelector(
                    '[title="Create new folder"]'
                  );
                  if (createButton) createButton.click();
                }}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                <FolderPlus className="h-5 w-5" />
                <span>Create Folder</span>
              </button>

              <Link
                to="/app/create"
                className="btn-secondary flex items-center gap-2 px-6 py-3"
              >
                <Plus className="h-5 w-5" />
                <span>Create Note</span>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Folder,
                title: "Organize",
                desc: "Create folders and subfolders for better organization",
              },
              {
                icon: FileText,
                title: "Markdown",
                desc: "Write in Markdown with syntax highlighting",
              },
              {
                icon: ArrowRight,
                title: "Present",
                desc: "Present your notes in slideshow mode",
              },
            ].map((feature, i) => (
              <div key={i} className="card p-5">
                <feature.icon className="h-5 w-5 text-indigo-400 mb-3" />
                <h3 className="text-sm font-semibold text-neutral-200 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-neutral-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Folders Grid */
        <div>
          {/* Section Header */}
          <div className="section-header">
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-neutral-500" />
              <h2 className="section-title">Your Folders</h2>
              <span className="badge badge-neutral">{folders.length}</span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Link
                key={folder._id}
                to={`/app/folder/${folder._id}`}
                className="card card-hover p-5 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: folder.color
                        ? `${folder.color}20`
                        : "#6366f120",
                    }}
                  >
                    {folder.icon || "📁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-100 truncate group-hover:text-indigo-400">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-sm text-neutral-500 line-clamp-1 mt-0.5">
                        {folder.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    {folder.children?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Folder className="h-3.5 w-3.5" />
                        {folder.children.length}
                      </span>
                    )}
                    {folder.noteCount > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {folder.noteCount}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-indigo-400" />
                </div>
              </Link>
            ))}

            {/* Add Folder Card */}
            <button
              onClick={() => {
                const createButton = document.querySelector(
                  '[title="Create new folder"]'
                );
                if (createButton) createButton.click();
              }}
              className="card border-dashed border-neutral-700 hover:border-neutral-600 p-5 flex flex-col items-center justify-center min-h-[140px] text-neutral-500 hover:text-neutral-300"
            >
              <FolderPlus className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">New Folder</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
