import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = ['admin'] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not in the allowed list, redirect them to their home
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'branch_manager') {
      return <Navigate to="/branch-manager/dashboard" replace />;
    }
    // admin trying to hit a BM route → send to admin home
    if (user.role === 'admin') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
