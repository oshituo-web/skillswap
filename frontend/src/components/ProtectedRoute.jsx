import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, isAdminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait until authentication status is resolved

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAdminOnly) {
      const isAdmin = user?.user_metadata?.is_admin;
      if (!isAdmin) {
        navigate('/dashboard'); // Redirect non-admins away
      }
    }
  }, [isAuthenticated, loading, navigate, isAdminOnly, user]);

  if (loading) {
    return <div className="text-center p-8 text-lg">Loading authentication status...</div>;
  }

  // Only render children if authenticated (and admin if required)
  if (isAuthenticated && (!isAdminOnly || user?.user_metadata?.is_admin)) {
    return children;
  }

  // Otherwise, render nothing while redirecting
  return null;
};

export default ProtectedRoute;
