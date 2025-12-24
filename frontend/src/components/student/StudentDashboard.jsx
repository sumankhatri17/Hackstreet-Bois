import React from "react";
import Card from "../common/Card";
import Badge from "../common/Badge";

const StudentDashboard = ({ student }) => {
  const stats = [
    {
      label: "Current Level",
      value: `Grade ${student?.currentLevel || "?"}`,
      color: "primary",
    },
    {
      label: "Reading Level",
      value: `Grade ${student?.readingLevel || "?"}`,
      color: "success",
    },
    {
      label: "Writing Level",
      value: `Grade ${student?.writingLevel || "?"}`,
      color: "info",
    },
    {
      label: "Tests Completed",
      value: student?.testsCompleted || 0,
      color: "warning",
    },
  ];

  const recentActivities = student?.recentActivities || [];
  const upcomingTests = student?.upcomingTests || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3">
            Welcome back, {student?.name}! 🎉
          </h1>
          <p className="text-blue-100 text-lg">
            Let's continue your learning journey today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="text-center group hover:scale-105 transition-transform duration-300"
            hoverable
          >
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card title="Recent Activities">
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 pb-4 border-b last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {activity.type === "assessment" ? "📝" : "✅"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "completed" ? "success" : "warning"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No recent activities
            </p>
          )}
        </Card>

        {/* Upcoming Tests */}
        <Card title="Upcoming Tests">
          {upcomingTests.length > 0 ? (
            <div className="space-y-4">
              {upcomingTests.map((test, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {test.subject}
                    </h4>
                    <Badge variant="info">{test.date}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming tests</p>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl text-left transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
              📝
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">
              Take Assessment
            </h4>
            <p className="text-sm text-gray-600">Start a new assessment</p>
          </button>
          <button className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl text-left transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
              📚
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">
              View Resources
            </h4>
            <p className="text-sm text-gray-600">Explore learning materials</p>
          </button>
          <button className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl text-left transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
              📈
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">
              Track Progress
            </h4>
            <p className="text-sm text-gray-600">View your improvement</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
