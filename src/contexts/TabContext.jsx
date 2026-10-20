import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getUserTabs, saveUserTabs } from "../services/api";

const TabContext = createContext();

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabProvider");
  }
  return context;
};

export const TabProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  const prevUserIdRef = useRef(null);
  const isHydratedRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Load persisted tabs from localStorage for instant initial render
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem("notemaster_open_tabs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTabId, setActiveTabId] = useState(null);

  // Hydrate tabs from database when authenticated user is detected
  useEffect(() => {
    // If user logged out, clear tabs and localStorage
    if (!currentUserId) {
      if (prevUserIdRef.current) {
        setTabs([]);
        try {
          localStorage.removeItem("notemaster_open_tabs");
        } catch {
          // ignore
        }
      }
      prevUserIdRef.current = null;
      isHydratedRef.current = false;
      return;
    }

    // If user changed or freshly mounted with authenticated user
    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;
      isHydratedRef.current = false;

      const hydrateTabs = async () => {
        try {
          // Check if tabs were pre-loaded on user object, otherwise query API
          let dbTabs = Array.isArray(user?.openTabs) && user.openTabs.length > 0 ? user.openTabs : null;
          if (!dbTabs) {
            dbTabs = await getUserTabs();
          }

          if (Array.isArray(dbTabs) && dbTabs.length > 0) {
            setTabs((currentTabs) => {
              // Merge dbTabs with any currently open tab in current session
              const merged = [...dbTabs];
              for (const cur of currentTabs) {
                if (!merged.some((m) => m.id === cur.id)) {
                  merged.push(cur);
                }
              }
              return merged;
            });
          } else {
            // DB has no saved tabs: check if localStorage has existing tabs to seed DB
            const localSaved = localStorage.getItem("notemaster_open_tabs");
            const localTabs = localSaved ? JSON.parse(localSaved) : [];
            if (localTabs.length > 0) {
              await saveUserTabs(localTabs);
            }
          }
        } catch (err) {
          console.warn("Failed to hydrate tabs from DB:", err);
        } finally {
          isHydratedRef.current = true;
        }
      };

      hydrateTabs();
    }
  }, [currentUserId, user]);

  // Keep localStorage synced & debounce DB sync (1000ms delay to protect database)
  useEffect(() => {
    try {
      localStorage.setItem("notemaster_open_tabs", JSON.stringify(tabs));
    } catch (err) {
      console.warn("Failed to persist tabs to localStorage:", err);
    }

    // Only sync to DB if user is authenticated and initial hydration completed
    if (!currentUserId || !isHydratedRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveUserTabs(tabs);
      } catch (err) {
        console.warn("Failed to sync tabs to DB:", err);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tabs, currentUserId]);

  // Synchronize activeTabId with URL
  useEffect(() => {
    const match = location.pathname.match(/\/app\/note\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const noteId = match[1];
      setActiveTabId(noteId);
    } else if (location.pathname === "/app/create") {
      setActiveTabId("create-note-tab");
    } else {
      setActiveTabId(null);
    }
  }, [location.pathname]);

  // Open or update tab
  const openTab = useCallback((newTab) => {
    setTabs((prevTabs) => {
      const exists = prevTabs.find((t) => t.id === newTab.id);
      if (exists) {
        // Update title or path if changed
        return prevTabs.map((t) =>
          t.id === newTab.id
            ? { ...t, title: newTab.title || t.title, path: newTab.path }
            : t
        );
      }
      return [...prevTabs, { ...newTab, isPinned: false }];
    });
    setActiveTabId(newTab.id);
  }, []);

  // Close specific tab
  const closeTab = useCallback((tabId, e) => {
    if (e) e.stopPropagation();

    setTabs((prevTabs) => {
      const tabIndex = prevTabs.findIndex((t) => t.id === tabId);
      if (tabIndex === -1) {
        if (location.pathname.includes("/app/note/")) {
          navigate("/app");
          setActiveTabId(null);
        }
        return prevTabs;
      }

      const newTabs = prevTabs.filter((t) => t.id !== tabId);

      // If closing active tab, switch to nearest neighbor
      if (tabId === activeTabId || location.pathname.includes(tabId)) {
        if (newTabs.length > 0) {
          const nextTab = newTabs[Math.min(tabIndex, newTabs.length - 1)];
          navigate(nextTab.path);
          setActiveTabId(nextTab.id);
        } else {
          navigate("/app");
          setActiveTabId(null);
        }
      }

      return newTabs;
    });
  }, [activeTabId, location.pathname, navigate]);

  // Close currently active tab (Shortcut Ctrl+W)
  const closeActiveTab = useCallback(() => {
    if (activeTabId) {
      closeTab(activeTabId);
    } else if (tabs.length > 0) {
      closeTab(tabs[tabs.length - 1].id);
    } else if (location.pathname.includes("/app/note/")) {
      navigate("/app");
    }
  }, [activeTabId, tabs, closeTab, location.pathname, navigate]);

  // Close all tabs
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    navigate("/app");
  }, [navigate]);

  // Close other tabs
  const closeOtherTabs = useCallback((keepId) => {
    setTabs((prevTabs) => prevTabs.filter((t) => t.id === keepId));
    setActiveTabId(keepId);
  }, []);

  // Global Keyboard Shortcuts: Alt+W / Alt+Q to close active tab (avoid browser Ctrl+W conflict)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+W or Alt+Q: Close active tab (safe from browser window interception)
      if (e.altKey && (e.key === "w" || e.key === "W" || e.key === "q" || e.key === "Q")) {
        if (tabs.length > 0 || location.pathname.includes("/app/note/")) {
          e.preventDefault();
          closeActiveTab();
          return;
        }
      }

      // Ctrl+W or Cmd+W fallback (for standalone/PWA window mode)
      if ((e.ctrlKey || e.metaKey) && (e.key === "w" || e.key === "W")) {
        if (tabs.length > 0 || location.pathname.includes("/app/note/")) {
          e.preventDefault();
          closeActiveTab();
          return;
        }
      }

      // Alt+ArrowRight / Alt+ArrowLeft to cycle through open tabs
      if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        if (tabs.length > 1) {
          e.preventDefault();
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          if (currentIndex !== -1) {
            const nextIndex =
              e.key === "ArrowRight"
                ? (currentIndex + 1) % tabs.length
                : (currentIndex - 1 + tabs.length) % tabs.length;
            const targetTab = tabs[nextIndex];
            navigate(targetTab.path);
            setActiveTabId(targetTab.id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeTabId, closeActiveTab, navigate, location.pathname]);

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        openTab,
        closeTab,
        closeActiveTab,
        closeAllTabs,
        closeOtherTabs,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};
