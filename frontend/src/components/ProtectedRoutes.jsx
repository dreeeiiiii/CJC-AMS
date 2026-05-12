import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Check if user is logged in
  if (!token || !user.email) {
    return <Navigate to="/login" replace />;
  }

  // Standardize role to uppercase to avoid "admin" vs "ADMIN" mismatch
  const userRole = user.role?.toUpperCase();

  // Redirect if route is admin-only but user is not an admin
  if (adminOnly && userRole !== "ADMIN") {
    return <Navigate to="/homepage" replace />;
  }

  return children;
};

export default ProtectedRoute;