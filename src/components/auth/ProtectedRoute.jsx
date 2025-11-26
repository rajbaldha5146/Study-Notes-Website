import React, { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { storePendingShare } from '../../utils/shareRedirect';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const params = useParams();

  // Store pending share ID if this is a share route and user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname.startsWith('/share/')) {
      const shareId = params.shareId || location.pathname.split('/share/')[1];
      if (shareId) {
        storePendingShare(shareId);
      }
    }
  }, [loading, isAuthenticated, location.pathname, params.shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Store share ID before redirecting (in case useEffect hasn't run yet)
    if (location.pathname.startsWith('/share/')) {
      const shareId = params.shareId || location.pathname.split('/share/')[1];
      if (shareId) {
        storePendingShare(shareId);
      }
    }
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;