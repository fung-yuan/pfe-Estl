import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children, isAllowed = true }) => {
  const { isAuthenticated } = useAuth();
  
  console.log("ProtectedRoute: Authentication check", { 
    isAuthenticated, 
    isAllowed, 
    willRender: isAuthenticated && isAllowed 
  });

  // First check if user is authenticated
  if (!isAuthenticated) {
    console.log("ProtectedRoute: User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Then check if user has permission
  if (!isAllowed) {
    console.log("ProtectedRoute: User doesn't have permission, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and allowed, render the children
  console.log("ProtectedRoute: Rendering protected content");
  return children;
};

export default ProtectedRoute;
