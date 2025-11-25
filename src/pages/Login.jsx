import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/app";

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
};

export default Login;
