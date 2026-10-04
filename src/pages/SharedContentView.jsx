import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  FileText,
  Folder,
  Calendar,
  ChevronRight,
  Save,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import BookLoader from "../components/BookLoader";
import SaveToAccountModal from "../components/SaveToAccountModal";
import { getSharedContent } from "../services/api";


export default function SharedContentView() {
  const { shareId } = useParams();
  const navigate = useNavigate();

  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    fetchSharedContent();
  }, [shareId]);

  const fetchSharedContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSharedContent(shareId);
      setSharedData(data);
    } catch (err) {
      console.error("Error fetching shared content:", err);
      const status = err.response?.status;
      if (status === 404) {
        setError("This share link is invalid or the content no longer exists.");
      } else if (status === 410) {
        setError("This share link has been revoked by the owner.");
      } else {
        setError("Failed to load shared content. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToAccount = () => {
    setShowSaveModal(true);
  };

  const handleSaveSuccess = () => {
    // Optionally navigate to the saved content or just close the modal
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <BookLoader message="Loading shared content..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
        <div className="card p-8 max-w-md text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-4" style={{ color: "var(--danger)" }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Content Unavailable
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>{error}</p>
          <Link to="/app" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go to My Notes
          </Link>
        </div>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
        <div className="card p-8 max-w-md text-center">
          <FileText className="h-10 w-10 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Content Not Found
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            The shared content you're looking for doesn't exist.
          </p>
          <Link to="/app" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go to My Notes
          </Link>
        </div>
      </div>
    );
  }

  const { type, owner, content } = sharedData;

  // Get resource name for the modal
  const resourceName = type === "folder" 
    ? content?.folder?.name 
    : content?.title;

  return (
    <div className="min-h-screen pb-12" style={{ background: "var(--bg-base)" }}>
      {/* Mini nav bar */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NoteMaster" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>NoteMaster</span>
          </div>
          <Link to="/app" className="btn-primary text-xs" style={{ padding: "0.35rem 0.75rem" }}>
            Open App
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate("/app")}
              className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>My Notes</span>
            </button>

            <button
              onClick={handleSaveToAccount}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Save className="h-4 w-4" />
              <span>
                {type === "folder" ? "Save Folder to My Notes" : "Save to My Notes"}
              </span>
            </button>
          </div>

          {/* Owner Attribution */}
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            <User className="h-3.5 w-3.5" />
            <span>Shared by {owner?.name || "Unknown"}</span>
          </div>

          {type === "note" ? (
            <SharedNoteDisplay content={content} />
          ) : (
            <SharedFolderDisplay content={content} />
          )}
        </div>
      </div>

      {/* Save to Account Modal */}
      {showSaveModal && (
        <SaveToAccountModal
          shareId={shareId}
          type={type}
          resourceName={resourceName}
          onClose={() => setShowSaveModal(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}


// Sub-task 7.2: Shared Note Display Component
function SharedNoteDisplay({ content }) {
  if (!content) return null;

  const { title, content: noteContent, createdAt } = content;

  return (
    <>
      {/* Note Title */}
      <h1 className="text-3xl font-bold text-neutral-100 mb-4">{title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm mb-8">
        <span className="flex items-center gap-1.5 text-neutral-500">
          <Calendar className="h-4 w-4" />
          {new Date(createdAt).toLocaleDateString()}
        </span>
        <span className="badge badge-primary">Shared Note</span>
      </div>

      {/* Note Content - Read Only — no card, blends with page */}
      <div className="note-viewer">
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              pre({ children, ...props }) {
                const child = Array.isArray(children) ? children[0] : children;
                const className = child?.props?.className || "";
                const match = /language-([^\s]+)/.exec(className);
                let lang = match ? match[1] : "";
                if (lang === "csharp" || lang === "cs" || lang === "c-sharp") {
                  lang = "c#";
                }

                const extractText = (node) => {
                  if (typeof node === "string") return node;
                  if (Array.isArray(node)) return node.map(extractText).join("");
                  if (node?.props?.children) return extractText(node.props.children);
                  return "";
                };

                const [copied, setCopied] = React.useState(false);
                const handleCopy = () => {
                  const text = extractText(child?.props?.children || "");
                  navigator.clipboard.writeText(text).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                };

                return (
                  <div className="code-block-wrapper">
                    <pre data-language={lang} {...props}>
                      {children}
                    </pre>
                    <button
                      onClick={handleCopy}
                      className="code-copy-btn"
                      title={copied ? "Copied!" : "Copy code"}
                      aria-label="Copy code to clipboard"
                    >
                      {copied ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                      )}
                    </button>
                  </div>
                );
              },
              code({ inline, className, children, ...props }) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {noteContent || ""}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
}


// Sub-task 7.3: Shared Folder Display Component
function SharedFolderDisplay({ content }) {
  if (!content) return null;

  const { folder, notes, subfolders } = content;

  return (
    <>
      {/* Folder Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl">
          {folder?.icon || "📁"}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-100">{folder?.name}</h1>
          {folder?.description && (
            <p className="text-neutral-400 mt-1">{folder.description}</p>
          )}
        </div>
      </div>

      {/* Folder Badge */}
      <div className="flex flex-wrap items-center gap-3 text-sm mb-8">
        <span className="badge badge-primary">Shared Folder</span>
        <span className="text-neutral-500">
          {countTotalNotes(notes, subfolders)} notes
        </span>
      </div>

      {/* Notes in this folder */}
      {notes && notes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-neutral-500" />
            <h2 className="text-sm font-medium text-neutral-400">Notes</h2>
            <span className="badge badge-neutral text-xs">{notes.length}</span>
          </div>
          <div className="space-y-3">
            {notes.map((note, index) => (
              <NotePreviewCard key={note._id || index} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Subfolders */}
      {subfolders && subfolders.length > 0 && (
        <div>
          {subfolders.map((subfolder, index) => (
            <SubfolderSection key={subfolder.folder?._id || index} subfolder={subfolder} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {(!notes || notes.length === 0) && (!subfolders || subfolders.length === 0) && (
        <div className="card p-8 text-center">
          <Folder className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-400">This folder is empty.</p>
        </div>
      )}
    </>
  );
}

// Recursive subfolder section component
function SubfolderSection({ subfolder, depth = 0 }) {
  const { folder, notes, subfolders } = subfolder;
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`mb-6 ${depth > 0 ? "ml-4 pl-4 border-l border-neutral-800" : ""}`}>
      {/* Subfolder Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-neutral-900 transition-colors mb-3"
      >
        <ChevronRight
          className={`h-4 w-4 text-neutral-500 transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
        <span className="text-xl">{folder?.icon || "📁"}</span>
        <span className="font-medium text-neutral-200">{folder?.name}</span>
        <span className="text-xs text-neutral-500">
          ({countTotalNotes(notes, subfolders)} notes)
        </span>
      </button>

      {isExpanded && (
        <>
          {/* Notes in subfolder */}
          {notes && notes.length > 0 && (
            <div className="space-y-3 mb-4">
              {notes.map((note, index) => (
                <NotePreviewCard key={note._id || index} note={note} />
              ))}
            </div>
          )}

          {/* Nested subfolders */}
          {subfolders && subfolders.length > 0 && (
            <div>
              {subfolders.map((nestedSubfolder, index) => (
                <SubfolderSection
                  key={nestedSubfolder.folder?._id || index}
                  subfolder={nestedSubfolder}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Note preview card for folder view
function NotePreviewCard({ note }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full text-left"
      >
        <ChevronRight
          className={`h-4 w-4 text-neutral-500 transition-transform flex-shrink-0 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
        <FileText className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        <span className="font-medium text-neutral-200 truncate">{note.title}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 pl-11">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {note.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to count total notes recursively
function countTotalNotes(notes, subfolders) {
  let count = notes?.length || 0;
  if (subfolders && subfolders.length > 0) {
    for (const subfolder of subfolders) {
      count += countTotalNotes(subfolder.notes, subfolder.subfolders);
    }
  }
  return count;
}
