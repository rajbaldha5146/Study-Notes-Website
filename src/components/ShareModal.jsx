import { useState, useEffect } from "react";
import { X, Copy, Check, Link, Trash2, Loader2 } from "lucide-react";
import { createShare, checkResourceShared, revokeShare } from "../services/api";
import toast from "react-hot-toast";

export default function ShareModal({ type, resourceId, resourceName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Check if resource is already shared or create new share
  useEffect(() => {
    const initializeShare = async () => {
      setLoading(true);
      try {
        // First check if already shared
        const existingShare = await checkResourceShared(type, resourceId);
        if (existingShare.isShared) {
          setShareData(existingShare.share);
        } else {
          // Create new share
          const result = await createShare(type, resourceId);
          setShareData(result.share);
        }
      } catch (error) {
        console.error("Failed to initialize share:", error);
        toast.error(error.response?.data?.message || "Failed to create share link");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    initializeShare();
  }, [type, resourceId, onClose]);

  const shareUrl = shareData?.shareUrl || 
    (shareData?.shareId ? `${window.location.origin}/share/${shareData.shareId}` : "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleRevoke = async () => {
    if (!shareData?.shareId) return;
    
    setRevoking(true);
    try {
      await revokeShare(shareData.shareId);
      toast.success("Share link revoked");
      onClose();
    } catch (error) {
      console.error("Failed to revoke share:", error);
      toast.error(error.response?.data?.message || "Failed to revoke share");
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-neutral-100">
              Share {type === "folder" ? "Folder" : "Note"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-3" />
              <p className="text-neutral-400 text-sm">Generating share link...</p>
            </div>
          ) : (
            <>
              {/* Resource name */}
              <div>
                <p className="text-sm text-neutral-400 mb-1">Sharing</p>
                <p className="text-neutral-100 font-medium truncate">
                  {resourceName || "Untitled"}
                </p>
              </div>

              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="input flex-1 text-sm bg-neutral-800 cursor-text select-all"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={handleCopy}
                    className="btn-primary px-3 py-2 flex items-center gap-1.5"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only sm:not-sr-only">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Share creation date */}
              {shareData?.createdAt && (
                <p className="text-xs text-neutral-500">
                  Shared on {formatDate(shareData.createdAt)}
                </p>
              )}

              {/* Info text */}
              <div className="bg-neutral-800/50 rounded-lg p-3 text-sm text-neutral-400">
                <p>
                  Anyone with this link can view this {type} after signing in.
                  They can also save a copy to their own account.
                </p>
              </div>

              {/* Revoke option */}
              <div className="pt-2 border-t border-neutral-800">
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {revoking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {revoking ? "Revoking..." : "Revoke share link"}
                </button>
                <p className="text-xs text-neutral-500 mt-1">
                  This will disable the link. Copies already saved won't be affected.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-neutral-800">
          <button onClick={onClose} className="btn-ghost px-4 py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
