import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Plus,
  FileText,
  Folder,
  Calendar,
  Edit,
  Trash2,
  Search,
  Tag,
  ArrowLeft,
  Presentation,
  FileCode,
} from "lucide-react";
import { getFolder, deleteNote, deleteFolder } from "../services/api";
import BookLoader from "../components/BookLoader";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { debounce } from "../utils/debounce";
import { useFolders } from "../contexts/FolderContext";

export default function FolderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshFolders } = useFolders();
  const [folderData, setFolderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchFolderData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const fetchFolderData = async () => {
    try {
      const data = await getFolder(id);
      setFolderData(data);
    } catch (error) {
      console.error("Failed to fetch folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = useCallback(async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(noteId);
        toast.success("Note deleted successfully!");
        await fetchFolderData();
      } catch (error) {
        console.error("Failed to delete note:", error);
        toast.error(error.response?.data?.message || "Failed to delete note");
      }
    }
  }, []);

  const handleDeleteFolder = useCallback(async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${folderData?.folder?.name}"? This will also delete all notes and subfolders inside it.`
      )
    ) {
      try {
        await deleteFolder(id);
        toast.success("Folder deleted successfully!");
        navigate("/app");
      } catch (error) {
        console.error("Failed to delete folder:", error);
        toast.error(error.response?.data?.message || "Failed to delete folder");
      }
    }
  }, [id, folderData?.folder?.name, navigate]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Memoize filtered notes to prevent unnecessary recalculations
  const filteredNotes = useMemo(() => {
    if (!folderData?.notes) return [];

    if (!debouncedSearchTerm) return folderData.notes;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return folderData.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
    );
  }, [folderData?.notes, debouncedSearchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <BookLoader message="Loading folder contents..." />
      </div>
    );
  }

  if (!folderData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
          Folder not found
        </h2>
        <Link
          to="/app"
          className="text-primary-600 dark:text-primary-400 hover:underline mt-4 inline-block"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link
            to="/app"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm sm:text-base">Back</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-2xl sm:text-3xl">
              {folderData.folder.icon}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white truncate">
                {folderData.folder.name}
              </h1>
              {folderData.folder.description && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
                  {folderData.folder.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to={`/app/create/${id}`}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>New Note</span>
            </Link>

            <Link
              to={`/app/create/${id}?type=markdown`}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm sm:text-base"
            >
              <FileCode className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add MD File</span>
              <span className="sm:hidden">MD File</span>
            </Link>

            {filteredNotes.length > 0 && (
              <Link
                to={`/app/note/${filteredNotes[0]._id}?folder=${id}`}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                <Presentation className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">Start Presentation</span>
                <span className="md:hidden">Present</span>
              </Link>
            )}

            <button
              onClick={handleDeleteFolder}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
              title="Delete this folder"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Delete Folder</span>
              <span className="sm:hidden">Delete</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              aria-label="Search notes in this folder"
            />
          </div>
        </div>
      </div>

      {/* Subfolders */}
      {folderData.subfolders && folderData.subfolders.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
            Subfolders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {folderData.subfolders.map((subfolder) => (
              <Link
                key={subfolder._id}
                to={`/app/folder/${subfolder._id}`}
                className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <span className="text-xl sm:text-2xl">{subfolder.icon}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm sm:text-base text-gray-800 dark:text-white truncate">
                    {subfolder.name}
                  </h3>
                  {subfolder.description && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {subfolder.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
          Notes ({filteredNotes.length})
        </h2>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              {searchTerm ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 mb-3 sm:mb-4">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Create your first note in this folder"}
            </p>
            {!searchTerm && (
              <Link
                to={`/app/create/${id}`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white line-clamp-2 flex-1">
                      {note.title}
                    </h3>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <Link
                        to={`/app/edit/${note._id}`}
                        className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                    {note.content.substring(0, 150)}...
                  </p>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-3 sm:mt-4">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>

                    <Link
                      to={`/app/note/${note._id}`}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 text-white text-xs sm:text-sm rounded-md hover:bg-primary-700 transition-colors text-center"
                    >
                      View Note
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
