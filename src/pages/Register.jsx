import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/4 left-1/4" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        </div>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 relative z-10"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleRegistrationSuccess = (email) => {
    // Store email for the check email page
    localStorage.setItem('pendingVerificationEmail', email);
    window.location.href = '/check-email?email=' + encodeURIComponent(email);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/4 left-1/4" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10">
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
};

export default Register;