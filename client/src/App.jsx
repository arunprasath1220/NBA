import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/authStore";
import "./App.css";

function App() {
  const { fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in on app load
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes - Any authenticated user */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes Example */}
        {/*
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        */}

        {/* User Routes - admin or user role */}
        {/*
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        */}

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all - redirect to dashboard or login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
