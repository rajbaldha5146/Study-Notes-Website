import React from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import { useAuth } from "../contexts/AuthContext";
import { consumePendingShareRedirect } from "../utils/shareRedirect";

const Register = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
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

  const handleRegistrationSuccess = () => {
    // Consume the pending share redirect when navigating after registration
    const pendingShare = consumePendingShareRedirect();
    const redirectTo = location.state?.from?.pathname || pendingShare || "/app";
    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 2000);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: "700px", height: "700px",
            top: "-250px", right: "-250px",
            background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)",
            animation: "float-mid 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "500px", height: "500px",
            bottom: "-150px", left: "-150px",
            background: "radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 65%)",
            animation: "float-slow 18s ease-in-out infinite",
          }}
        />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
};

export default Register;
