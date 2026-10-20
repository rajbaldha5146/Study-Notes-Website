import React, { useState, useEffect } from "react";
import { Share2, Link } from "lucide-react";
import { checkResourceShared } from "../services/api";
import ShareModal from "./ShareModal";

export default function ShareButton({ 
  type, 
  resourceId, 
  resourceName,
  className = "",
  showLabel = true,
  size = "default" 
}) {
  const [isShared, setIsShared] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if resource is already shared on mount
  useEffect(() => {
    const checkSharedStatus = async () => {
      if (!resourceId) {
        setChecking(false);
        return;
      }
      
      try {
        const result = await checkResourceShared(type, resourceId);
        setIsShared(result.isShared);
      } catch (error) {
        console.error("Failed to check share status:", error);
      } finally {
        setChecking(false);
      }
    };

    checkSharedStatus();
  }, [type, resourceId]);

  const handleClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Re-check shared status after modal closes
    checkResourceShared(type, resourceId)
      .then((result) => setIsShared(result.isShared))
      .catch(() => {});
  };

  // Size variants
  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    default: "px-2.5 py-1.5 text-xs font-medium",
    large: "px-3.5 py-2 text-sm font-medium"
  };

  const iconSizes = {
    small: "h-3.5 w-3.5",
    default: "h-3.5 w-3.5",
    large: "h-4 w-4"
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={checking || !resourceId}
        className={`
          flex items-center gap-1.5 rounded-md font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${className}
        `}
        style={
          isShared
            ? {
                background: "rgba(224, 144, 80, 0.12)",
                color: "var(--accent)",
                border: "1px solid rgba(224, 144, 80, 0.3)",
              }
            : {
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid transparent",
              }
        }
        onMouseEnter={(e) => {
          if (!isShared) {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.background = "var(--bg-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isShared) {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.background = "transparent";
          }
        }}
        title={isShared ? "Manage share link" : `Share ${type}`}
        aria-label={isShared ? "Manage share link" : `Share ${type}`}
      >
        {isShared ? (
          <Link className={iconSizes[size]} />
        ) : (
          <Share2 className={iconSizes[size]} />
        )}
        {showLabel && (
          <span className="hidden sm:inline">
            {isShared ? "Shared" : "Share"}
          </span>
        )}
      </button>

      {showModal && (
        <ShareModal
          type={type}
          resourceId={resourceId}
          resourceName={resourceName}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
