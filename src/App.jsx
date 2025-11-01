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
import QuizPage from "./pages/QuizPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route path="/reset-password" element={<ResetPassword />} />

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
                  <Route path="quiz/:noteId" element={<QuizPage />} />
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

              <Toaster
                position="top-right"
                containerStyle={{
                  top: 80,
                }}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1f2937",
                    color: "#f9fafb",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
                    maxWidth: "90vw",
                    width: "100%",
                  },
                  className: "sm:max-w-md",
                  success: {
                    style: {
                      background: "#065f46",
                      color: "#d1fae5",
                      border: "1px solid #10b981",
                    },
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#d1fae5",
                    },
                  },
                  error: {
                    style: {
                      background: "#7f1d1d",
                      color: "#fecaca",
                      border: "1px solid #ef4444",
                    },
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fecaca",
                    },
                  },
                  loading: {
                    style: {
                      background: "#78350f",
                      color: "#fef3c7",
                      border: "1px solid #f59e0b",
                    },
                    iconTheme: {
                      primary: "#f59e0b",
                      secondary: "#fef3c7",
                    },
                  },
                }}
                limit={3}
              />
            </Router>
          </FolderProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
