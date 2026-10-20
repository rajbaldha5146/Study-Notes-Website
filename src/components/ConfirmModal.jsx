import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 relative shadow-2xl transition-all"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg transition-colors cursor-pointer"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.background = "var(--bg-elevated)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: isDanger
                ? "rgba(217, 91, 78, 0.15)"
                : "rgba(224, 144, 80, 0.15)",
              border: `1px solid ${
                isDanger ? "rgba(217, 91, 78, 0.3)" : "rgba(224, 144, 80, 0.3)"
              }`,
            }}
          >
            {isDanger ? (
              <Trash2 className="h-5 w-5" style={{ color: "var(--danger)" }} />
            ) : (
              <AlertTriangle className="h-5 w-5" style={{ color: "var(--accent)" }} />
            )}
          </div>
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
        </div>

        {/* Message */}
        <p
          className="text-xs sm:text-sm mb-6 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs font-medium px-4 py-2"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={
              isDanger
                ? "btn-danger text-xs font-semibold px-4 py-2"
                : "btn-primary text-xs font-semibold px-4 py-2"
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
