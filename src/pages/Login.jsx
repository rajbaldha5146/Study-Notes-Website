import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import Loader from "../components/Loader";
import { useAuth } from "../contexts/AuthContext";
import { consumePendingShareRedirect } from "../utils/shareRedirect";

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <Loader type="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    const pendingShare = consumePendingShareRedirect();
    const redirectTo = location.state?.from?.pathname || pendingShare || "/app";
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Subtle warm ember ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 15%, rgba(224, 144, 80, 0.08), transparent 70%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
