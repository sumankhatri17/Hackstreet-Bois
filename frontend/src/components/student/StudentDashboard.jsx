import { useState } from "react";
import Badge from "../common/Badge";
import Card from "../common/Card";
import PeerLearnerCard from "../peers/PeerLearnerCard";
import PeerTutorCard from "../peers/PeerTutorCard";

const StudentDashboard = ({ student }) => {
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [modalType, setModalType] = useState(null);

  const handleRequestHelp = (peer) => {
    setSelectedPeer(peer);
    setModalType("request");
  };

  const handleOfferHelp = (peer) => {
    setSelectedPeer(peer);
    setModalType("offer");
  };

  const handleModalSubmit = async (data) => {
    // In real app: await peerService.requestHelp(data) or peerService.offerHelp(data)
    console.log("Submitting help request/offer:", data);
    setSelectedPeer(null);
    setModalType(null);
  };

  const stats = [
    {
      label: "Current Grade",
      value: `Grade ${student?.grade || student?.currentLevel || "?"}`,
      color: "primary",
    },
    {
      label: "Math Level",
      value: `${student?.math_level || "?"}%`,
      color: "success",
    },
    {
      label: "English Level",
      value: `${student?.reading_level || "?"}%`,
      color: "info",
    },
    {
      label: "Tests Completed",
      value: student?.testsCompleted || student?.tests_completed || 0,
      color: "warning",
    },
  ];

  const recentActivities =
    student?.recentActivities || student?.recent_activities || [];
  const upcomingTests = student?.upcomingTests || student?.upcoming_tests || [];
  const weaknesses = student?.weaknesses || student?.weak_areas || [];
  const strongAreas = student?.strongAreas || student?.strong_areas || [];
  const peerTutors = student?.peerTutors || student?.peer_tutors_for_me || [];
  const peersToHelp = student?.peersICanHelp || student?.peers_i_can_help || [];
  const studyMaterials =
    student?.studyMaterials || student?.study_materials || [];
  const teachingMaterials =
    student?.teachingMaterials || student?.teaching_materials || [];
  const helpStats = {
    given: student?.helpSessionsGiven || student?.help_sessions_given || 0,
    received:
      student?.helpSessionsReceived || student?.help_sessions_received || 0,
    peersHelped: student?.peersHelped || student?.peers_helped || 0,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-blue-600 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">
              Welcome back, {student?.name}!
            </h1>
            <p className="text-sm sm:text-base text-blue-100">
              Let's continue your learning journey today.
            </p>
          </div>
          <a
            href="/assessment/initial"
            className="inline-flex items-center justify-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <span className="mr-2">📝</span>
            Retake Assessment
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center" hoverable padding="sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

      {/* Weaknesses & Improvement Areas */}
      <Card title="🎯 Areas for Improvement (Math & English)">
        <p className="text-sm text-gray-600 mb-4">
          Based on your Grade {student?.currentLevel || "?"} assessments
        </p>
        {weaknesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weaknesses.map((weakness, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {weakness.topic}
                    </h4>
                    <p className="text-sm text-gray-600">{weakness.subject}</p>
                  </div>
                  <Badge variant="danger">{weakness.score}%</Badge>
                </div>
                <div className="mt-2 p-2 bg-white border border-red-100 rounded">
                  <p className="text-xs text-gray-600">
                    Grade {weakness.gradeLevel} level topic
                  </p>
                </div>
                <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium text-center">
                  View Study Materials →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">
              Great job! No major weaknesses detected yet.
            </p>
            <p className="text-sm text-gray-400">
              Complete more assessments to get personalized feedback.
            </p>
          </div>
        )}
      </Card>

      {/* Peer Tutors Who Can Help Me */}
      <Card title="🎓 Your Peer Tutors">
        <p className="text-sm text-gray-600 mb-4">
          Other students who excel in your weak areas and can help you improve
        </p>
        {peerTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {peerTutors.map((peer, index) => (
              <PeerTutorCard
                key={index}
                peer={peer}
                onRequestHelp={handleRequestHelp}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No peer tutors matched yet.</p>
            <p className="text-sm text-gray-400">
              Complete your assessment to get matched with peers who can help!
            </p>
          </div>
        )}
      </Card>

      {/* Your Strong Areas */}
      {strongAreas.length > 0 && (
        <Card title="💪 Your Strong Areas">
          <p className="text-sm text-gray-600 mb-4">
            Topics where you excel (score &gt; 75%)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strongAreas.map((area, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {area.topic}
                    </h4>
                    <p className="text-sm text-gray-600">{area.subject}</p>
                  </div>
                  <Badge variant="success">{area.score}%</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Grade {area.grade} level
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Peers I Can Help */}
      {peersToHelp.length > 0 && (
        <Card title="🤝 Peers You Can Help">
          <p className="text-sm text-gray-600 mb-4">
            Students who need help in topics where you're strong - help them
            learn!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {peersToHelp.map((peer, index) => (
              <PeerLearnerCard
                key={index}
                peer={peer}
                onOfferHelp={handleOfferHelp}
              />
            ))}
          </div>

          {/* Help Statistics */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">
              Your Teaching Impact 🌟
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {helpStats.given}
                </div>
                <div className="text-xs text-gray-600">Sessions Given</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {helpStats.received}
                </div>
                <div className="text-xs text-gray-600">Sessions Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {helpStats.peersHelped}
                </div>
                <div className="text-xs text-gray-600">Peers Helped</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Teaching Materials - For helping peers effectively */}
      {teachingMaterials.length > 0 && (
        <Card title="📖 Teaching Resources">
          <p className="text-sm text-gray-600 mb-4">
            Materials to help you teach your strong topics effectively to other
            peers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachingMaterials.map((material, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl">{material.icon}</div>
                  <Badge variant="warning">
                    {material.difficulty || "Guide"}
                  </Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {material.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">{material.topic}</p>
                <div className="mb-3 p-2 bg-white border border-amber-100 rounded">
                  <p className="text-xs text-gray-700">
                    <strong>For teaching:</strong> {material.description}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-700 font-medium">
                    {material.type}
                  </span>
                  <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    View Guide →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>💡 Teaching Tips:</strong> These resources help you
              explain concepts clearly, identify common mistakes, and engage
              your peers effectively. Use them to prepare before your help
              sessions!
            </p>
          </div>
        </Card>
      )}

      {/* Study Materials & Flashcards */}
      <Card title="📚 Recommended Study Materials">
        {studyMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyMaterials.map((material, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
              >
                <div className="text-3xl mb-2">{material.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {material.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">{material.topic}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{material.type}</span>
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    {material.type === "Flashcards" ? "Study →" : "Read →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">
              No study materials available yet.
            </p>
            <p className="text-sm text-gray-400">
              Complete assessments to receive personalized learning resources.
            </p>
          </div>
        )}
      </Card>

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

      {/* Help Request Modal */}
      {selectedPeer && (
        <HelpRequestModal
          peer={selectedPeer}
          type={modalType}
          onClose={() => {
            setSelectedPeer(null);
            setModalType(null);
          }}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
