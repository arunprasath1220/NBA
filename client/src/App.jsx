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
import StudentsIntake from "./pages/StudentsIntake";
import FacultyByDepartment from "./pages/FacultyByDepartment";
import FacultyByAllied from "./pages/FacultyByAllied";
import RatioByDepartment from "./pages/RatioByDepartment";
import StudentsByDepartment from "./pages/StudentsByDepartment";
import StudentsByAllied from "./pages/StudentsByAllied";
import SARPartA from "./pages/SARPartA";
import SARCriteria from "./pages/SARCriteria";
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
          path="/students-intake"
          element={
            <ProtectedRoute>
              <StudentsIntake />
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
          path="/students-department"
          element={
            <ProtectedRoute>
              <StudentsByDepartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students-allied"
          element={
            <ProtectedRoute>
              <StudentsByAllied />
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
          path="/sar/part-a"
          element={
            <ProtectedRoute>
              <SARPartA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sar/part-b/criteria-:num"
          element={
            <ProtectedRoute>
              <SARCriteria />
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