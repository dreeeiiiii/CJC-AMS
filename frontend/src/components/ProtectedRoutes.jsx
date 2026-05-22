import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const fallbackRole = localStorage.getItem("userRole"); // Backup if stored as raw string

  // Safe JSON parsing to prevent app crashes if localStorage gets corrupted
  let user = { role: "", email: "" };
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Failed to parse user data from localStorage:", error);
  }

  // 1. Check authentication status
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Extract and standardize the role string
  const userRole = (user.role || fallbackRole || "").toUpperCase();

  // 3. Handle Admin Route Protection
  // If the route requires an admin, but the logged-in user isn't one
  if (adminOnly && userRole !== "ADMIN") {
    return <Navigate to="/member" replace />;
  }

  // 4. Handle Member Route Protection (Optional but Recommended)
  // If an Admin tries to access member-facing pages, send them back to the admin portal
  if (!adminOnly && userRole === "ADMIN") {
    return <Navigate to="/admin/home" replace />;
  }

  return children;
};

export default ProtectedRoute;