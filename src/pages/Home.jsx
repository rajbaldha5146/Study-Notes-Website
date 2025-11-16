import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Folder,
  FolderPlus,
  Zap,
  FileText,
  ArrowRight,
  Lightbulb,
  Target,
  Rocket,
  Plus,
} from "lucide-react";
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
        if (isMounted) {
          setFolders(data);
        }
      } catch (error) {
        console.error("Failed to fetch folders:", error);
        if (isMounted) {
          setFolders([]);
          toast.error("Failed to load folders");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFolders();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-[60vh]">
          <BookLoader message="Loading your workspace..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12 text-center px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-blue-400 animate-in slide-in-from-top-4 duration-700 delay-100">
          Welcome to NoteMaster
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-200">
          Organize your thoughts, create notes, and keep everything perfectly
          structured in one beautiful place.
        </p>
      </div>

      {folders.length === 0 ? (
        /* Enhanced Empty State */
        <div className="space-y-8 sm:space-y-12">
          {/* Main CTA Card */}
          <div className="relative overflow-hidden bg-slate-900/80 rounded-2xl border border-slate-800/70 p-8 sm:p-12 lg:p-16 backdrop-blur-sm animate-in zoom-in duration-700 delay-300">


            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/30 animate-bounce">
                <FolderPlus className="h-12 w-12 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-blue-400 mb-4">
                Let's Get Started! 🚀
              </h2>

              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Create your first folder to begin organizing your notes. Think
                of folders as your digital notebooks - perfect for different
                projects, subjects, or topics.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const createButton = document.querySelector(
                      '[title="Create new folder"]'
                    );
                    if (createButton) {
                      createButton.click();
                    } else {
                      toast.error("Could not find create folder button");
                    }
                  }}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 overflow-hidden"
                  aria-label="Create your first folder"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <FolderPlus className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">
                    Create Your First Folder
                  </span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </button>

                <Link
                  to="/app/create"
                  className="group flex items-center gap-3 px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
                >
                  <Plus className="h-5 w-5" />
                  <span>Or Create a Note</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700 delay-500">
            <div className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300">
                  <Lightbulb className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Organize Smartly
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Create folders and subfolders to keep your notes perfectly
                  organized and easy to find.
                </p>
              </div>
            </div>

            <div className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300">
                  <FileText className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Markdown Support
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Write in Markdown or upload .md files. Full syntax
                  highlighting and live preview included.
                </p>
              </div>
            </div>

            <div className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Powerful Features
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Search instantly, present your notes in slideshow mode, and
                  organize with ease.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 animate-in fade-in duration-700 delay-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Quick Tips to Get Started
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  number: "1",
                  color: "blue",
                  title: "Create folders",
                  description:
                    "using the sidebar - organize by project, subject, or any way you like",
                },
                {
                  number: "2",
                  color: "purple",
                  title: "Add notes",
                  description:
                    'by clicking the "New Note" button or upload existing markdown files',
                },
                {
                  number: "3",
                  color: "emerald",
                  title: "Search & filter",
                  description: "to quickly find the notes you need",
                },
                {
                  number: "4",
                  color: "cyan",
                  title: "Present & share",
                  description: "your notes in beautiful slideshow mode",
                },
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div
                    className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br from-${tip.color}-500/20 to-${tip.color}-600/20 rounded-xl flex items-center justify-center text-${tip.color}-400 text-lg font-bold border border-${tip.color}-500/20 transition-transform duration-300`}
                  >
                    {tip.number}
                  </div>
                  <div>
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-semibold text-white">
                        {tip.title}
                      </span>{" "}
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Folders Grid - When folders exist */
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex items-center justify-between px-4 sm:px-0 animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Folder className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Your Folders
              </h2>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <span className="text-sm font-semibold text-slate-400">
                {folders.length} {folders.length === 1 ? "folder" : "folders"}
              </span>
            </div>
          </div>

          {/* Folders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder, index) => (
              <Link
                key={folder._id}
                to={`/app/folder/${folder._id}`}
                className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-700/50 hover:border-blue-500/50 overflow-hidden hover:-translate-y-2 animate-in zoom-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
                aria-label={`Open ${folder.name} folder`}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/5 transition-all duration-300"></div>

                <div className="relative z-10 p-6">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-300 group-hover:rotate-6"
                      style={{
                        backgroundColor: folder.color
                          ? `${folder.color}30`
                          : "#3b82f640",
                        boxShadow: `0 8px 24px ${folder.color || "#3b82f6"}40`,
                      }}
                    >
                      {folder.icon || "📁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate mb-1">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-4 text-sm">
                      {folder.children && folder.children.length > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Folder className="h-4 w-4" />
                          <span className="font-medium">
                            {folder.children.length}
                          </span>
                        </div>
                      )}
                      {folder.noteCount > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">
                            {folder.noteCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75"></div>
              </Link>
            ))}

            {/* Add Folder Card */}
            <button
              onClick={() => {
                const createButton = document.querySelector(
                  '[title="Create new folder"]'
                );
                if (createButton) {
                  createButton.click();
                } else {
                  toast.error("Could not find create folder button");
                }
              }}
              className="group relative bg-slate-900/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 overflow-hidden hover:-translate-y-2 min-h-[180px] flex items-center justify-center"
              aria-label="Create new folder"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>

              <div className="relative z-10 text-center p-6">
                <div className="w-14 h-14 mx-auto mb-4 bg-blue-500/20 rounded-2xl flex items-center justify-center transition-transform duration-300">
                  <FolderPlus className="h-7 w-7 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-400 group-hover:text-white transition-colors">
                  Create New Folder
                </h3>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
