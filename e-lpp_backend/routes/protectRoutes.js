// ProtectRoute.js
// Checks both role AND email domain for instructor/admin protected routes.
// Even if someone manually edits localStorage the domain check blocks them.

import { Navigate } from "react-router-dom";

const INSTRUCTOR_DOMAIN = "elpp.ac.in";  // keep in sync with authController
const ADMIN_DOMAIN      = "elpp.ac.in";  // keep in sync with authController

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("userRole");

  // Not logged in
  if (!role) return <Navigate to="/login" replace />;

  // Role not allowed for this route
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;

  // Extra domain check for instructor and admin routes
  try {
    const user   = JSON.parse(localStorage.getItem("user") || "{}");
    const domain = user.email?.split("@")[1]?.toLowerCase();

    if (role === "instructor" && domain !== INSTRUCTOR_DOMAIN.toLowerCase()) {
      return <Navigate to="/dashboard" replace />;
    }
    if (role === "admin" && domain !== ADMIN_DOMAIN.toLowerCase()) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;