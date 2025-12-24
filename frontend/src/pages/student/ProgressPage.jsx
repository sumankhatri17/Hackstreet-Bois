import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ProgressTracker from "../../components/student/ProgressTracker";

const ProgressPage = () => {
  // Mock data
  const progressData = {
    overallProgress: 72,
    subjects: [
      {
        name: "Mathematics",
        level: 8,
        progress: 75,
        completedLessons: 24,
        completedTests: 8,
      },
      {
        name: "English",
        level: 7,
        progress: 68,
        completedLessons: 20,
        completedTests: 6,
      },
      {
        name: "Science",
        level: 8,
        progress: 80,
        completedLessons: 28,
        completedTests: 9,
      },
    ],
    strengths: [
      "Problem Solving",
      "Reading Comprehension",
      "Scientific Method",
    ],
    weaknesses: ["Grammar", "Algebra", "Essay Writing"],
    achievements: [
      { icon: "🏆", name: "Top Performer" },
      { icon: "📚", name: "Bookworm" },
      { icon: "⭐", name: "Perfect Score" },
    ],
  };

  const user = { name: "John Doe", role: "student" };

  return (
    <DashboardLayout user={user}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Progress</h1>
        <ProgressTracker progressData={progressData} />
      </div>
    </DashboardLayout>
  );
};

export default ProgressPage;
