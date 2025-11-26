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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm onSuccess={handleRegistrationSuccess} />
    </div>
  );
};

export default Register;
