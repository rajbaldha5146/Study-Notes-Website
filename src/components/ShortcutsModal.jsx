import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Keyboard, X } from "lucide-react";

export default function ShortcutsModal({ isOpen, onClose }) {
  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: "Navigation & Search",
      shortcuts: [
        {
          label: "Spotlight Search / Quick Switcher",
          description: "Instantly search notes, notebooks, and quick actions",
          keys: ["Ctrl", "K"],
        },
        {
          label: "Toggle Sidebar",
          description: "Show or hide the notebook sidebar",
          keys: ["Ctrl", "B"],
        },
        {
          label: "Close Overlays / Clear",
          description: "Close search, modal dialogs, and reader bars",
          keys: ["Esc"],
        },
        {
          label: "Keyboard Shortcuts Guide",
          description: "Open this keyboard shortcuts cheat-sheet",
          keys: ["?"],
        },
      ],
    },
    {
      category: "Multi-Tab Workspace",
      shortcuts: [
        {
          label: "Close Active Note Tab",
          description: "Close current note and jump to neighboring tab",
          keys: ["Alt", "W"],
        },
        {
          label: "Close Active Tab (Alternate)",
          description: "Quick editor buffer close fallback",
          keys: ["Alt", "Q"],
        },
        {
          label: "Next Open Tab",
          description: "Cycle forward to the next tab in your bar",
          keys: ["Alt", "→"],
        },
        {
          label: "Previous Open Tab",
          description: "Cycle backward to the previous tab in your bar",
          keys: ["Alt", "←"],
        },
        {
          label: "Scroll Tab Strip",
          description: "Pan through tabs horizontally",
          keys: ["Mouse Wheel"],
        },
        {
          label: "Tab Actions Menu",
          description: "Close tab, close other tabs, or close all tabs",
          keys: ["Right Click"],
        },
      ],
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-200"
      style={{ background: "rgba(0, 0, 0, 0.65)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-subtle)",
          maxHeight: "85vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--bg-elevated)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(224, 144, 80, 0.15)",
                color: "var(--accent)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2
                className="text-base font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Keyboard Shortcuts
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Fast navigation and workspace power keys
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Body List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {shortcutGroups.map((group) => (
            <div key={group.category}>
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-2.5 px-1"
                style={{ color: "var(--accent)" }}
              >
                {group.category}
              </div>

              <div
                className="rounded-xl divide-y overflow-hidden border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                {group.shortcuts.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-[var(--bg-hover)]"
                  >
                    <div className="pr-4">
                      <div
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((k, i) => (
                        <React.Fragment key={k}>
                          <kbd
                            className="inline-flex items-center justify-center min-w-[22px] px-1.5 py-1 text-[11px] font-mono font-bold rounded-md shadow-xs border transition-all"
                            style={{
                              background: "var(--bg-elevated)",
                              borderColor: "var(--border-default)",
                              color: "var(--text-primary)",
                            }}
                          >
                            {k}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span
                              className="text-[10px] font-mono mx-0.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              +
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t text-xs"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--bg-elevated)",
            color: "var(--text-muted)",
          }}
        >
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px] border" style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)", color: "var(--text-primary)" }}>?</kbd> anytime outside text fields to reopen</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
