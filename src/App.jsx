import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FolderProvider } from "./contexts/FolderContext";
import { TabProvider } from "./contexts/TabContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import FolderView from "./pages/FolderView";
import NoteViewer from "./pages/NoteViewer";
import CreateNote from "./pages/CreateNote";
import EditNote from "./pages/EditNote";
import SharedContentView from "./pages/SharedContentView";
import TrashView from "./pages/TrashView";

import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <FolderProvider>
            <Router>
              <TabProvider>
                <Routes>
                {/* Public routes */}
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <LandingPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Public Share route - accessible without login */}
                <Route
                  path="/share/:shareId"
                  element={<SharedContentView />}
                />

                {/* Protected routes with shared layout */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Home />} />
                  <Route path="folder/:id" element={<FolderView />} />
                  <Route path="note/:id" element={<NoteViewer />} />
                  <Route path="create" element={<CreateNote />} />
                  <Route path="create/:folderId" element={<CreateNote />} />
                  <Route path="edit/:id" element={<EditNote />} />
                  <Route path="trash" element={<TrashView />} />
                </Route>

                {/* Legacy routes - use same layout */}
                <Route
                  path="/folder/:id"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<FolderView />} />
                </Route>
                <Route
                  path="/note/:id"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<NoteViewer />} />
                </Route>
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CreateNote />} />
                </Route>
              </Routes>

              {/* Sleek Custom Toaster */}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: "500",
                    boxShadow: "var(--shadow-modal)",
                  },
                  success: {
                    iconTheme: {
                      primary: "var(--success)",
                      secondary: "var(--bg-elevated)",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "var(--danger)",
                      secondary: "var(--bg-elevated)",
                    },
                  },
                }}
                limit={4}
              />
              </TabProvider>
            </Router>
          </FolderProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
