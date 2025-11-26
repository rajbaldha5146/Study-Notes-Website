import { useState, useEffect } from "react";
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
        // Silently fail - just don't show shared indicator
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
    // Re-check shared status after modal closes (in case share was created or revoked)
    checkResourceShared(type, resourceId)
      .then((result) => setIsShared(result.isShared))
      .catch(() => {});
  };

  // Size variants
  const sizeClasses = {
    small: "px-2 py-1.5 text-xs",
    default: "px-3 py-2 text-sm",
    large: "px-4 py-2.5 text-base"
  };

  const iconSizes = {
    small: "h-3.5 w-3.5",
    default: "h-4 w-4",
    large: "h-5 w-5"
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={checking || !resourceId}
        className={`
          flex items-center gap-2 rounded-lg font-medium
          transition-colors duration-150
          ${isShared 
            ? "text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20" 
            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${className}
        `}
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
