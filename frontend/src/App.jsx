import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import useAuthStore from "./store/authStore";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard Pages - For all peer learners
import ProgressPage from "./pages/student/ProgressPage";
import RAGAssessmentPage from "./pages/student/RAGAssessmentPage";
import ResourcesPage from "./pages/student/ResourcesPage";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";

// Assessment Pages
import InitialAssessmentPage from "./pages/assessment/InitialAssessmentPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
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
        <Route
          path="/dashboard/rag-assessment"
          element={
            <ProtectedRoute>
              <RAGAssessmentPage />
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
