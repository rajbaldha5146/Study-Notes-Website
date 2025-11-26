import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { consumePendingShareRedirect } from '../../utils/shareRedirect';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Check for pending share redirect first (consume it to clear storage)
    const pendingShareRedirect = consumePendingShareRedirect();
    if (pendingShareRedirect) {
      return <Navigate to={pendingShareRedirect} replace />;
    }

    // Check for location state redirect (from ProtectedRoute)
    const from = location.state?.from?.pathname;
    if (from && from.startsWith('/share/')) {
      return <Navigate to={from} replace />;
    }

    // Default: redirect authenticated users to the app
    return <Navigate to="/app" replace />;
  }

  return children;
};

export default PublicRoute;