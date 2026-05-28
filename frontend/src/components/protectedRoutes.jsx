import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [authState, setAuthState] = useState({
    checking: true,
    authenticated: false,
    role: "",
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthState({ checking: false, authenticated: false, role: "" });
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
          setAuthState({ checking: false, authenticated: false, role: "" });
          return;
        }

        const data = await response.json();
        const userRole = (data.user?.role || "").toUpperCase();

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", userRole);
        window.dispatchEvent(new Event("userDataUpdated"));

        setAuthState({
          checking: false,
          authenticated: Boolean(data.authenticated),
          role: userRole,
        });
      } catch (error) {
        console.error("Auth verification failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        setAuthState({ checking: false, authenticated: false, role: "" });
      }
    };

    verifyAuth();
  }, []);

  if (authState.checking) {
    return null;
  }

  if (!authState.authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && authState.role !== "ADMIN") {
    return <Navigate to="/member/home" replace />;
  }

  if (!adminOnly && authState.role === "ADMIN") {
    return <Navigate to="/admin/home" replace />;
  }

  return children;
};

export default ProtectedRoute;