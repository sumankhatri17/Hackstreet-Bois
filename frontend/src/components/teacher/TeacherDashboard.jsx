import React from "react";
import Card from "../common/Card";
import Badge from "../common/Badge";

const TeacherDashboard = ({ teacher }) => {
  const stats = [
    {
      label: "Total Students",
      value: teacher?.totalStudents || 0,
      icon: "👥",
      color: "bg-blue-500",
    },
    {
      label: "Active Assessments",
      value: teacher?.activeAssessments || 0,
      icon: "📝",
      color: "bg-green-500",
    },
    {
      label: "Avg Performance",
      value: `${teacher?.avgPerformance || 0}%`,
      icon: "📊",
      color: "bg-purple-500",
    },
    {
      label: "Pending Reviews",
      value: teacher?.pendingReviews || 0,
      icon: "⏳",
      color: "bg-orange-500",
    },
  ];

  const recentStudents = teacher?.recentStudents || [];
  const upcomingClasses = teacher?.upcomingClasses || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {teacher?.name}!</h1>
        <p className="text-green-100">
          Manage your students and track their progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students Activity */}
        <Card title="Recent Student Activity">
          {recentStudents.length > 0 ? (
            <div className="space-y-4">
              {recentStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.activity}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      student.status === "completed" ? "success" : "warning"
                    }
                  >
                    {student.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </Card>

        {/* Upcoming Classes */}
        <Card title="Upcoming Classes">
          {upcomingClasses.length > 0 ? (
            <div className="space-y-4">
              {upcomingClasses.map((classItem, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {classItem.subject}
                    </h4>
                    <Badge variant="info">{classItem.time}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Grade {classItem.grade}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {classItem.students} students
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No upcoming classes
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
