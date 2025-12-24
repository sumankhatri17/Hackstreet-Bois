import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ProgressTracker from "../../components/student/ProgressTracker";
import progressService from "../../services/progress.service";
import useAuthStore from "../../store/authStore";

const ProgressPage = () => {
  const { user } = useAuthStore();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const data = await progressService.getMyProgress();

        // Transform backend data to match component format
        const transformedData = {
          overallProgress: data.overall_progress || 0,
          subjects: data.subject_progress
            ? Object.entries(data.subject_progress).map(([name, progress]) => ({
                name,
                level: progress.level || 0,
                progress: progress.progress || 0,
                completedLessons: progress.completed_lessons || 0,
                completedTests: progress.completed_tests || 0,
              }))
            : [],
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          achievements: data.achievements || [],
        };

        setProgressData(transformedData);
      } catch (err) {
        console.error("Error fetching progress:", err);
        setError(err.message || "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  return (
    <DashboardLayout user={user}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Progress</h1>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your progress...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && progressData && (
          <ProgressTracker progressData={progressData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProgressPage;
