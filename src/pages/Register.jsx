import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleRegistrationSuccess = () => {
    setTimeout(() => {
      navigate("/app", { replace: true });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm onSuccess={handleRegistrationSuccess} />
    </div>
  );
};

export default Register;
