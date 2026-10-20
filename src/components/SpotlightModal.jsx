import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Folder,
  Plus,
  Home,
  Sun,
  Moon,
  Trash2,
  CornerDownLeft,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { getNotes, getFolders } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

export default function SpotlightModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load initial notes and folders when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setQuery("");
    setSelectedIndex(0);

    const loadData = async () => {
      setLoading(true);
      try {
        const [notesData, foldersData] = await Promise.all([
          getNotes({ limit: 50 }),
          getFolders(),
        ]);
        setNotes(Array.isArray(notesData) ? notesData : []);
        setFolders(Array.isArray(foldersData) ? foldersData : []);
      } catch (err) {
        console.error("Failed to load spotlight data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-focus input after mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    // Prevent body scrolling
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Debounced API search for notes when query changes
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      try {
        const results = await getNotes({ search: trimmed });
        if (Array.isArray(results)) {
          setNotes((prevNotes) => {
            // Merge unique notes
            const existingIds = new Set(prevNotes.map((n) => n._id));
            const newNotes = results.filter((n) => !existingIds.has(n._id));
            return [...newNotes, ...prevNotes];
          });
        }
      } catch (err) {
        console.error("Spotlight search error:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Define Quick Actions
  const quickActions = useMemo(() => {
    return [
      {
        id: "action-new-note",
        title: "Create New Note",
        subtitle: "Open the note editor",
        category: "Actions",
        icon: Plus,
        keywords: ["new", "create", "write", "note", "add"],
        perform: () => navigate("/app/create"),
      },
      {
        id: "action-dashboard",
        title: "Go to Dashboard",
        subtitle: "View all notebooks and recent notes",
        category: "Actions",
        icon: Home,
        keywords: ["home", "dashboard", "main", "all notes"],
        perform: () => navigate("/app"),
      },
      {
        id: "action-theme",
        title: `Switch to ${isDark ? "Light" : "Dark"} Mode`,
        subtitle: `Currently using ${isDark ? "Dark Ember" : "Editorial Paper"} theme`,
        category: "Actions",
        icon: isDark ? Sun : Moon,
        keywords: ["theme", "light", "dark", "color", "mode", "toggle"],
        perform: () => toggleTheme(),
      },
      {
        id: "action-trash",
        title: "Open Trash Bin",
        subtitle: "View and restore deleted notes",
        category: "Actions",
        icon: Trash2,
        keywords: ["trash", "bin", "deleted", "restore", "archive"],
        perform: () => navigate("/app/trash"),
      },
    ];
  }, [isDark, toggleTheme, navigate]);

  // Extract snippet highlighting around the search query
  const getSnippet = useCallback((content, q) => {
    if (!content) return "";
    if (!q) return content.slice(0, 90).replace(/\n+/g, " ");

    const lowerContent = content.toLowerCase();
    const lowerQ = q.toLowerCase();
    const idx = lowerContent.indexOf(lowerQ);

    if (idx === -1) {
      return content.slice(0, 90).replace(/\n+/g, " ");
    }

    const start = Math.max(0, idx - 25);
    const end = Math.min(content.length, idx + lowerQ.length + 55);
    let snippet = content.slice(start, end).replace(/\n+/g, " ");
    if (start > 0) snippet = "…" + snippet;
    if (end < content.length) snippet = snippet + "…";
    return snippet;
  }, []);

  // Filter and group items
  const { filteredActions, filteredFolders, filteredNotes, allItems } = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Actions
    const matchedActions = quickActions.filter((a) => {
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.includes(q))
      );
    });

    // 2. Folders
    const matchedFolders = folders
      .filter((f) => {
        if (!q) return false; // Only show folders if searching
        return f.name.toLowerCase().includes(q);
      })
      .map((f) => ({
        id: `folder-${f._id}`,
        title: f.name,
        subtitle: `${f.icon || "📁"} Notebook`,
        category: "Notebooks",
        icon: Folder,
        item: f,
        perform: () => navigate(`/app/folder/${f._id}`),
      }));

    // 3. Notes
    const matchedNotes = notes
      .filter((n) => {
        if (!q) return true;
        const titleMatch = (n.title || "").toLowerCase().includes(q);
        const contentMatch = (n.content || "").toLowerCase().includes(q);
        return titleMatch || contentMatch;
      })
      .slice(0, q ? 15 : 6)
      .map((n) => {
        const folderObj = folders.find((f) => f._id === (n.folder?._id || n.folder));
        const folderName = folderObj?.name ? `${folderObj.icon || "📁"} ${folderObj.name}` : "Note";
        return {
          id: `note-${n._id}`,
          title: n.title || "Untitled Note",
          subtitle: getSnippet(n.content, q),
          tag: folderName,
          category: "Notes",
          icon: FileText,
          item: n,
          perform: () => navigate(`/app/note/${n._id}`),
        };
      });

    // Flatten all items into single array for linear keyboard selection
    const all = [
      ...matchedActions,
      ...matchedFolders,
      ...matchedNotes,
    ];

    return {
      filteredActions: matchedActions,
      filteredFolders: matchedFolders,
      filteredNotes: matchedNotes,
      allItems: all,
    };
  }, [query, quickActions, folders, notes, getSnippet, navigate]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (allItems.length === 0) return 0;
      if (prev >= allItems.length) return allItems.length - 1;
      return prev;
    });
  }, [allItems.length]);

  // Auto-scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // Global key navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length ? (prev + 1) % allItems.length : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        allItems.length ? (prev - 1 + allItems.length) % allItems.length : 0
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        current.perform();
        onClose();
      } else if (query.trim()) {
        // Quick fallback: create note titled query
        navigate("/app/create");
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  let globalCounter = 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[13vh] px-4 backdrop-blur-md animate-fade-in"
      style={{
        background: isDark ? "rgba(10, 8, 7, 0.78)" : "rgba(30, 26, 22, 0.5)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px var(--border-subtle)",
          maxHeight: "75vh",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Bar */}
        <div
          className="flex items-center gap-3 px-4 sm:px-5 py-3.5"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
          }}
        >
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search notes & notebooks..."
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base font-medium placeholder-[var(--text-muted)] leading-relaxed"
            style={{
              color: "var(--text-primary)",
            }}
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md transition-colors cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span
              className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              ESC
            </span>
          )}
        </div>

        {/* Results Container */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 custom-scrollbar"
          style={{ maxHeight: "400px" }}
        >
          {allItems.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                No matches found for "{query}"
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Try searching with different keywords, or create a new note.
              </p>
              <button
                type="button"
                onClick={() => {
                  navigate("/app/create");
                  onClose();
                }}
                className="btn-primary mt-4 inline-flex items-center gap-2 text-xs font-semibold cursor-pointer"
                style={{ padding: "0.5rem 1rem" }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create note with this title</span>
              </button>
            </div>
          ) : (
            <>
              {/* Group: Actions */}
              {filteredActions.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Quick Commands
                  </div>
                  {filteredActions.map((action) => {
                    const itemIndex = globalCounter++;
                    const isSelected = selectedIndex === itemIndex;
                    const IconComponent = action.icon;
                    return (
                      <div
                        key={action.id}
                        data-index={itemIndex}
                        onClick={() => {
                          action.perform();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                          isSelected ? "shadow-sm" : ""
                        }`}
                        style={{
                          background: isSelected ? "var(--bg-elevated)" : "transparent",
                          border: "1px solid",
                          borderColor: isSelected ? "var(--border-default)" : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                            style={{
                              background: isSelected ? "rgba(224, 144, 80, 0.2)" : "var(--bg-card)",
                              color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <p
                              className="text-xs sm:text-sm font-semibold truncate"
                              style={{
                                color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                              }}
                            >
                              {action.title}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                              {action.subtitle}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div
                            className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              background: "var(--bg-surface)",
                              color: "var(--accent)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            <CornerDownLeft className="w-3 h-3" />
                            <span className="hidden sm:inline">Jump</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Group: Folders / Notebooks */}
              {filteredFolders.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Notebooks
                  </div>
                  {filteredFolders.map((folderItem) => {
                    const itemIndex = globalCounter++;
                    const isSelected = selectedIndex === itemIndex;
                    return (
                      <div
                        key={folderItem.id}
                        data-index={itemIndex}
                        onClick={() => {
                          folderItem.perform();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                          isSelected ? "shadow-sm" : ""
                        }`}
                        style={{
                          background: isSelected ? "var(--bg-elevated)" : "transparent",
                          border: "1px solid",
                          borderColor: isSelected ? "var(--border-default)" : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                            style={{
                              background: isSelected ? "rgba(224, 144, 80, 0.2)" : "var(--bg-card)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            {folderItem.item.icon || "📁"}
                          </div>
                          <div className="truncate">
                            <p
                              className="text-xs sm:text-sm font-semibold truncate"
                              style={{
                                color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                              }}
                            >
                              {folderItem.title}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                              {folderItem.subtitle}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div
                            className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              background: "var(--bg-surface)",
                              color: "var(--accent)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            <CornerDownLeft className="w-3 h-3" />
                            <span className="hidden sm:inline">Open</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Group: Notes */}
              {filteredNotes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <span>{query ? "Matching Notes" : "Recent Notes"}</span>
                    <span>{filteredNotes.length} notes</span>
                  </div>
                  {filteredNotes.map((noteItem) => {
                    const itemIndex = globalCounter++;
                    const isSelected = selectedIndex === itemIndex;
                    return (
                      <div
                        key={noteItem.id}
                        data-index={itemIndex}
                        onClick={() => {
                          noteItem.perform();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                          isSelected ? "shadow-sm" : ""
                        }`}
                        style={{
                          background: isSelected ? "var(--bg-elevated)" : "transparent",
                          border: "1px solid",
                          borderColor: isSelected ? "var(--border-default)" : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: isSelected ? "rgba(224, 144, 80, 0.2)" : "var(--bg-card)",
                              color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <p
                                className="text-xs sm:text-sm font-semibold truncate"
                                style={{
                                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                                }}
                              >
                                {noteItem.title}
                              </p>
                              {noteItem.tag && (
                                <span
                                  className="text-[10px] px-1.5 py-0.2 rounded font-medium flex-shrink-0"
                                  style={{
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border-subtle)",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {noteItem.tag}
                                </span>
                              )}
                            </div>
                            <p
                              className="text-[11px] truncate mt-0.5 font-mono"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {noteItem.subtitle}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div
                            className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              background: "var(--bg-surface)",
                              color: "var(--accent)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            <CornerDownLeft className="w-3 h-3" />
                            <span className="hidden sm:inline">Open</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Bar with Key Indicators */}
        <div
          className="flex items-center justify-between px-4 sm:px-5 py-2.5 text-[11px]"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            color: "var(--text-muted)",
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4 font-mono text-[10px] sm:text-[11px]">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">esc</kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="text-[11px] font-medium hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} />
            <span>Spotlight Switcher</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
