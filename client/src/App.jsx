import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import InstituteProfile from "./pages/InstituteProfile";
import AllPrograms from "./pages/AllPrograms";
import AlliedCourseMapping from "./pages/AlliedCourseMapping";
import AlliedDepartment from "./pages/AlliedDepartment";
import FacultyByDepartment from "./pages/FacultyByDepartment";
import FacultyByAllied from "./pages/FacultyByAllied";
import RatioByDepartment from "./pages/RatioByDepartment";
import RatioByAllied from "./pages/RatioByAllied";
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex justify-center items-center min-h-screen text-2xl text-[#333]">Loading...</div>
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
          path="/institute-profile"
          element={
            <ProtectedRoute>
              <InstituteProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-programs"
          element={
            <ProtectedRoute>
              <AllPrograms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allied-mapping"
          element={
            <ProtectedRoute>
              <AlliedCourseMapping />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allied-department"
          element={
            <ProtectedRoute>
              <AlliedDepartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty-department"
          element={
            <ProtectedRoute>
              <FacultyByDepartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty-allied"
          element={
            <ProtectedRoute>
              <FacultyByAllied />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ratio-department"
          element={
            <ProtectedRoute>
              <RatioByDepartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ratio-allied"
          element={
            <ProtectedRoute>
              <RatioByAllied />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all - redirect to institute profile */}
        <Route path="*" element={<Navigate to="/institute-profile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;