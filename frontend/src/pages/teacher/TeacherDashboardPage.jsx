import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import TeacherDashboard from "../../components/teacher/TeacherDashboard";

const TeacherDashboardPage = () => {
  // Mock data
  const teacherData = {
    name: "Ms. Smith",
    totalStudents: 45,
    activeAssessments: 8,
    avgPerformance: 78,
    pendingReviews: 12,
    recentStudents: [
      {
        name: "John Doe",
        activity: "Completed Math Assessment",
        status: "completed",
      },
      {
        name: "Jane Smith",
        activity: "Started Science Test",
        status: "in-progress",
      },
    ],
    upcomingClasses: [
      { subject: "Mathematics", grade: "8", time: "10:00 AM", students: 25 },
      { subject: "Science", grade: "7", time: "2:00 PM", students: 20 },
    ],
  };

  const user = { name: "Ms. Smith", role: "teacher" };

  return (
    <DashboardLayout user={user}>
      <TeacherDashboard teacher={teacherData} />
    </DashboardLayout>
  );
};

export default TeacherDashboardPage;
