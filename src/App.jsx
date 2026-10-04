import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FolderProvider } from "./contexts/FolderContext";
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

                {/* Share route - requires authentication */}
                <Route
                  path="/share/:shareId"
                  element={
                    <ProtectedRoute>
                      <SharedContentView />
                    </ProtectedRoute>
                  }
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
                    background: "rgba(22, 25, 32, 0.95)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(16px)",
                  },
                  success: {
                    style: {
                      border: "1px solid rgba(63, 185, 80, 0.3)",
                      background: "rgba(16, 32, 24, 0.95)",
                      color: "#4ade80",
                    },
                    iconTheme: {
                      primary: "#4ade80",
                      secondary: "#162018",
                    },
                  },
                  error: {
                    style: {
                      border: "1px solid rgba(248, 81, 73, 0.3)",
                      background: "rgba(35, 16, 18, 0.95)",
                      color: "#fca5a5",
                    },
                    iconTheme: {
                      primary: "#f85149",
                      secondary: "#231012",
                    },
                  },
                }}
                limit={4}
              />
            </Router>
          </FolderProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
