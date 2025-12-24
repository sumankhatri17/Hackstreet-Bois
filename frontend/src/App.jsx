import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard Pages - For all peer learners
import ProgressPage from "./pages/student/ProgressPage";
import ResourcesPage from "./pages/student/ResourcesPage";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";

// Assessment Pages
import InitialAssessmentPage from "./pages/assessment/InitialAssessmentPage";

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Assessment Routes */}
        <Route
          path="/assessment/initial"
          element={
            <ProtectedRoute>
              <InitialAssessmentPage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Routes - All users are peers */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/resources"
          element={
            <ProtectedRoute>
              <ResourcesPage />
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
