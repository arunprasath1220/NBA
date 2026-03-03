import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

/**
 * ProtectedRoute component for role-based access control
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles that can access this route (optional)
 * @param {string} props.redirectTo - Path to redirect unauthorized users (default: "/login")
 *
 * Usage:
 * - <ProtectedRoute>...</ProtectedRoute> - Requires authentication only
 * - <ProtectedRoute allowedRoles={["admin"]}>...</ProtectedRoute> - Admin only
 * - <ProtectedRoute allowedRoles={["admin", "user"]}>...</ProtectedRoute> - Admin or User
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If no specific roles required, allow any authenticated user
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  const userRoles = user?.roles || [];
  const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasPermission) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
