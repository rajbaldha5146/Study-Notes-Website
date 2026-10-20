import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  X,
  MoreHorizontal,
  FolderX,
  Check,
} from "lucide-react";
import { useTabs } from "../contexts/TabContext";

export default function TabBar() {
  const { tabs, activeTabId, closeTab, closeAllTabs, closeOtherTabs } = useTabs();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null);

  // If no tabs are open and not reading a note, don't show an empty bar
  if (tabs.length === 0) {
    return null;
  }

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  const handleContextMenu = (e, tab) => {
    e.preventDefault();
    setContextMenu({
      tabId: tab.id,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleWheel = (e) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <>
      <div
        className="sticky top-14 z-20 flex items-center justify-between border-b transition-colors select-none"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          height: "38px",
        }}
      >
        {/* Horizontal Scrollable Tabs Strip */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex-1 flex items-center overflow-x-auto h-full scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => {
            const isActive =
              tab.id === activeTabId || location.pathname === tab.path;

            return (
              <div
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                onContextMenu={(e) => handleContextMenu(e, tab)}
                className={`group flex items-center gap-2 h-full px-3.5 border-r cursor-pointer text-xs transition-all relative flex-shrink-0 ${
                  isActive ? "font-semibold" : "font-normal hover:bg-[var(--bg-hover)]"
                }`}
                style={{
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  borderColor: "var(--border-subtle)",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  maxWidth: "200px",
                }}
                title={tab.title}
              >
                {/* Active Accent Top Indicator Line */}
                {isActive && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: "var(--accent)" }}
                  />
                )}

                {/* Note Icon */}
                <FileText
                  className="w-3.5 h-3.5 flex-shrink-0 transition-colors"
                  style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
                />

                {/* Tab Title */}
                <span className="truncate flex-1 min-w-0">
                  {tab.title || "Untitled"}
                </span>

                {/* Close Tab Button */}
                <button
                  type="button"
                  onClick={(e) => closeTab(tab.id, e)}
                  className={`p-0.5 rounded transition-all flex-shrink-0 ${
                    isActive
                      ? "opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
                      : "opacity-0 group-hover:opacity-70 hover:!opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
                  }`}
                  style={{ color: "var(--text-muted)" }}
                  title="Close tab (Alt+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Action Icons (Close All if multiple tabs exist) */}
        {tabs.length > 1 && (
          <div
            className="flex items-center px-2 h-full border-l flex-shrink-0"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
          >
            <button
              type="button"
              onClick={closeAllTabs}
              className="p-1 rounded-md transition-colors hover:bg-[var(--bg-hover)] cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              title="Close all tabs"
            >
              <FolderX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 rounded-xl shadow-2xl p-1 text-xs animate-fade-in"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              minWidth: "140px",
            }}
          >
            <button
              onClick={() => {
                closeTab(contextMenu.tabId);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: "var(--text-primary)" }}
            >
              Close Tab <span className="text-[10px] text-[var(--text-muted)] font-mono ml-2">Alt+W</span>
            </button>
            <button
              onClick={() => {
                closeOtherTabs(contextMenu.tabId);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: "var(--text-primary)" }}
            >
              Close Other Tabs
            </button>
            <button
              onClick={() => {
                closeAllTabs();
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: "var(--danger)" }}
            >
              Close All Tabs
            </button>
          </div>
        </>
      )}
    </>
  );
}
