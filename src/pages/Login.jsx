import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import { consumePendingShareRedirect } from "../utils/shareRedirect";

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Consume the pending share redirect (clears storage) when actually redirecting
    const pendingShare = consumePendingShareRedirect();
    const redirectTo = location.state?.from?.pathname || pendingShare || "/app";
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Aurora blobs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: "700px", height: "700px",
            top: "-250px", left: "-250px",
            background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 65%)",
            animation: "float-slow 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "500px", height: "500px",
            bottom: "-150px", right: "-150px",
            background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)",
            animation: "float-mid 22s ease-in-out infinite",
          }}
        />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
