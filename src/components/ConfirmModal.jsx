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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 relative shadow-2xl transition-all"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isDanger
                ? "rgba(248, 81, 73, 0.15)"
                : "rgba(74, 158, 255, 0.15)",
              border: `1px solid ${
                isDanger ? "rgba(248, 81, 73, 0.3)" : "rgba(74, 158, 255, 0.3)"
              }`,
            }}
          >
            {isDanger ? (
              <Trash2 className="h-5 w-5 text-red-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-neutral-100">{title}</h3>
        </div>

        {/* Message */}
        <p
          className="text-sm mb-6 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm px-4 py-2"
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
                ? "btn-danger text-sm px-4 py-2"
                : "btn-primary text-sm px-4 py-2"
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
