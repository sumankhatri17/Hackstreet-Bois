import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StudentDashboard from "../../components/student/StudentDashboard";

const StudentDashboardPage = () => {
  // Mock data - would come from API/state management
  const studentData = {
    name: "John Doe",
    currentLevel: 8,
    readingLevel: 7,
    writingLevel: 8,
    testsCompleted: 12,
    recentActivities: [
      {
        type: "assessment",
        title: "Math Assessment Completed",
        date: "2 hours ago",
        status: "completed",
      },
      {
        type: "test",
        title: "Science Weekly Test",
        date: "1 day ago",
        status: "completed",
      },
    ],
    upcomingTests: [
      {
        subject: "English",
        date: "Dec 26",
        description: "Reading comprehension test",
      },
      { subject: "Math", date: "Dec 28", description: "Algebra basics" },
    ],
  };

  const user = { name: "John Doe", role: "student" };

  return (
    <DashboardLayout user={user}>
      <StudentDashboard student={studentData} />
    </DashboardLayout>
  );
};

export default StudentDashboardPage;
