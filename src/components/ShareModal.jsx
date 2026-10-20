import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Link, Trash2, Loader2 } from "lucide-react";
import { createShare, checkResourceShared, revokeShare } from "../services/api";
import toast from "react-hot-toast";

export default function ShareModal({ type, resourceId, resourceName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    const initializeShare = async () => {
      setLoading(true);
      try {
        const existingShare = await checkResourceShared(type, resourceId);
        if (existingShare.isShared) {
          setShareData(existingShare.share);
        } else {
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

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(18, 15, 13, 0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden animate-fade-in shadow-2xl"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-modal)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Share {type === "folder" ? "Folder" : "Note"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-7 w-7 animate-spin mb-3" style={{ color: "var(--accent)" }} />
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Generating share link...
              </p>
            </div>
          ) : (
            <>
              {/* Resource name */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Sharing
                </p>
                <p className="font-medium truncate text-sm" style={{ color: "var(--text-primary)" }}>
                  {resourceName || "Untitled"}
                </p>
              </div>

              {/* Share URL */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Share link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="input flex-1 text-xs cursor-text select-all"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={handleCopy}
                    className="btn-primary px-3 py-2 flex items-center gap-1.5 text-xs font-medium"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span className="sr-only sm:not-sr-only">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Share creation date */}
              {shareData?.createdAt && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Shared on {formatDate(shareData.createdAt)}
                </p>
              )}

              {/* Info text */}
              <div
                className="rounded-lg p-3 text-xs leading-relaxed"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                Anyone with this link can view and read this {type} without signing in. If they sign in, they can also save a copy directly to their own account.
              </div>

              {/* Revoke option */}
              <div className="pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="flex items-center gap-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                  style={{ color: "var(--danger)" }}
                >
                  {revoking ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {revoking ? "Revoking link..." : "Revoke share link"}
                </button>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                  This will immediately disable the public link. Copies already saved won't be affected.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end px-6 py-3.5"
          style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
        >
          <button onClick={onClose} className="btn-ghost px-4 py-1.5 text-xs font-medium cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
