import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./store/authStore";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student Pages
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import ProgressPage from "./pages/student/ProgressPage";
import ResourcesPage from "./pages/student/ResourcesPage";

// Teacher Pages
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

// Protected Route Component - DISABLED FOR TESTING
const ProtectedRoute = ({ children, requiredRole }) => {
  // const { isAuthenticated, user } = useAuthStore();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (requiredRole && user?.role !== requiredRole) {
  //   return <Navigate to={`/${user?.role}/dashboard`} replace />;
  // }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={<Navigate to="/student/dashboard" replace />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress"
          element={
            <ProtectedRoute requiredRole="student">
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/resources"
          element={
            <ProtectedRoute requiredRole="student">
              <ResourcesPage />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
