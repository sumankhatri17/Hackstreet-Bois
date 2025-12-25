import { useEffect, useState } from "react";
import matchingService from "../../services/matching.service";
import ragQuestionService from "../../services/ragQuestion.service";
import useAuthStore from "../../store/authStore";
import Badge from "../common/Badge";
import Card from "../common/Card";
import LocationMap from "../map/LocationMap";
import PeerLearnerCard from "../peers/PeerLearnerCard";
import PeerTutorCard from "../peers/PeerTutorCard";

const StudentDashboard = () => {
  const { user, refreshUser } = useAuthStore();
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [areasForImprovement, setAreasForImprovement] = useState([]);
  const [peerMatches, setPeerMatches] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingType, setMeetingType] = useState("physical");
  const [peerPerformances, setPeerPerformances] = useState({});
  const [myPerformance, setMyPerformance] = useState([]);
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);
  const [locationData, setLocationData] = useState({
    location: user?.location || "",
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
  });
  const [updatingLocation, setUpdatingLocation] = useState(false);

  // Debug: Log user data
  console.log("Dashboard user data:", user);
  console.log("User ID:", user?.id);
  console.log("User email:", user?.email);
  console.log("Math level:", user?.math_level);
  console.log("Science level:", user?.science_level);
  console.log("English level:", user?.english_level);
  console.log("Fit to teach:", user?.fit_to_teach_level);

  // Fetch recent activities and areas for improvement
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Refresh user data to get latest levels
        await refreshUser();

        // Fetch recent activities
        const activitiesData = await ragQuestionService.getRecentActivities(5);
        setRecentActivities(activitiesData.activities || []);

        // Fetch progress for all subjects to get areas for improvement
        const progressData = await ragQuestionService.getAllSubjectsProgress();
        const allWeaknesses = [];

        // Collect critical weaknesses and areas to improve from all subjects
        Object.entries(progressData.subjects_progress || {}).forEach(
          ([subject, data]) => {
            if (data.has_data) {
              // Add critical weaknesses
              (data.critical_weaknesses || []).forEach((weakness) => {
                allWeaknesses.push({
                  subject: subject.charAt(0).toUpperCase() + subject.slice(1),
                  chapter: weakness.chapter,
                  accuracy: weakness.accuracy,
                  severity: "critical",
                });
              });

              // Add top 2 areas to improve
              (data.areas_to_improve || []).slice(0, 2).forEach((area) => {
                allWeaknesses.push({
                  subject: subject.charAt(0).toUpperCase() + subject.slice(1),
                  chapter: area.chapter,
                  accuracy: area.accuracy,
                  severity: "moderate",
                });
              });
            }
          }
        );

        // Sort by accuracy (worst first) and limit to top 6
        allWeaknesses.sort((a, b) => a.accuracy - b.accuracy);
        setAreasForImprovement(allWeaknesses.slice(0, 6));

        // Fetch peer matching data
        try {
          const [myMatchesData, potentialMatchesData] = await Promise.all([
            matchingService.getMyMatches(),
            matchingService.getPotentialMatches(meetingType),
          ]);

          console.log("My matches data:", myMatchesData);
          console.log("Potential matches data:", potentialMatchesData);
          console.log(
            "Potential matches array:",
            potentialMatchesData.potential_matches
          );

          setPeerMatches(myMatchesData.matches || []);
          setPotentialMatches(potentialMatchesData.potential_matches || []);

          // Fetch my own chapter performance
          try {
            const myPerfData = await matchingService.getStudentPerformance(
              user.id
            );
            setMyPerformance(myPerfData || []);
            console.log("My performance data:", myPerfData);
          } catch (err) {
            console.error("Failed to load own performance:", err);
          }

          // Fetch chapter performance for each unique peer
          const uniquePeerIds = new Set();
          potentialMatchesData.potential_matches?.forEach((match) => {
            if (match.as_tutor) uniquePeerIds.add(match.learner_id);
            if (match.as_learner) uniquePeerIds.add(match.tutor_id);
          });

          const peerPerfPromises = Array.from(uniquePeerIds).map(
            async (peerId) => {
              try {
                const perfData = await matchingService.getStudentPerformance(
                  peerId
                );
                return { peerId, perfData };
              } catch (err) {
                console.error(
                  `Failed to load performance for peer ${peerId}:`,
                  err
                );
                return { peerId, perfData: [] };
              }
            }
          );

          const peerPerfResults = await Promise.all(peerPerfPromises);
          const peerPerfMap = {};
          peerPerfResults.forEach(({ peerId, perfData }) => {
            peerPerfMap[peerId] = perfData;
          });
          setPeerPerformances(peerPerfMap);
          console.log("Peer performances:", peerPerfMap);
        } catch (error) {
          console.error("Failed to load peer matching data:", error);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [meetingType]);

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

  const handleUpdateLocation = async () => {
    setUpdatingLocation(true);
    try {
      const updateData = {
        location: locationData.location,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      // Update profile via API
      const authService = (await import("../../services/auth.service.js"))
        .default;
      await authService.updateProfile(updateData);
      await refreshUser();

      setShowLocationUpdate(false);
      alert(
        "Location updated successfully! Your peer matches will now reflect this."
      );
    } catch (error) {
      console.error("Failed to update location:", error);
      alert("Failed to update location. Please try again.");
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleMapLocationSelect = (locationInfo) => {
    setLocationData({
      location: locationInfo.location,
      latitude: locationInfo.latitude,
      longitude: locationInfo.longitude,
    });
  };

  const stats = [
    {
      label: "Current Grade",
      value: user?.current_level ? `Grade ${user.current_level}` : "Not Set",
      color: "primary",
    },
    {
      label: "Fit to Teach",
      value: user?.fit_to_teach_level
        ? `Grade ${user.fit_to_teach_level}`
        : "Complete Assessment",
      color: "purple",
    },
    {
      label: "Math Level",
      value: user?.math_level != null ? `${user.math_level}%` : "Not Assessed",
      color: "success",
    },
    {
      label: "Science Level",
      value:
        user?.science_level != null ? `${user.science_level}%` : "Not Assessed",
      color: "info",
    },
    {
      label: "English Level",
      value:
        user?.english_level != null ? `${user.english_level}%` : "Not Assessed",
      color: "warning",
    },
  ];

  // Mock data - in real app, fetch from API
  const upcomingTests = [];
  const strongAreas = [];
  const studyMaterials = [];
  const teachingMaterials = [];

  // Process peer matching data
  console.log("Processing potential matches:", potentialMatches);
  const peerTutors = potentialMatches
    .filter((match) => match.as_learner)
    .map((match) => ({
      id: match.tutor_id,
      name: match.tutor_name,
      email: match.tutor_email,
      grade: match.tutor_grade,
      location: match.tutor_location,
      subject: match.subject,
      chapter: match.chapter,
      score: match.tutor_score,
      compatibility: match.compatibility_score,
    }))
    .slice(0, 6); // Limit to 6 tutors
  console.log("Peer tutors after processing:", peerTutors);

  const peersToHelp = potentialMatches
    .filter((match) => match.as_tutor)
    .map((match) => {
      // Find overlapping topics where peer needs help and I'm strong
      const learnerPerf = peerPerformances[match.learner_id] || [];
      const overlappingTopics = [];

      // Find chapters where learner has weakness and I have strength
      learnerPerf.forEach((learnerChapter) => {
        if (learnerChapter.weakness_level !== "none") {
          const myChapter = myPerformance.find(
            (ch) =>
              ch.subject === learnerChapter.subject &&
              ch.chapter === learnerChapter.chapter
          );
          if (myChapter && myChapter.weakness_level === "none") {
            overlappingTopics.push(
              `${learnerChapter.subject}: ${learnerChapter.chapter}`
            );
          }
        }
      });

      return {
        id: match.learner_id,
        name: match.learner_name,
        email: match.learner_email,
        grade: match.learner_grade,
        location: match.learner_location,
        subject: match.subject,
        chapter: match.chapter,
        score: match.learner_score,
        compatibility: match.compatibility_score,
        needs_help_with:
          overlappingTopics.length > 0 ? overlappingTopics : [match.subject],
      };
    })
    .slice(0, 6); // Limit to 6 learners

  const helpStats = {
    given: peerMatches.filter(
      (m) => m.role === "tutor" && m.status === "active"
    ).length,
    received: peerMatches.filter(
      (m) => m.role === "learner" && m.status === "active"
    ).length,
    peersHelped: new Set(
      peerMatches.filter((m) => m.role === "tutor").map((m) => m.other_user_id)
    ).size,
  };

  return (
    <div className="space-y-8 min-h-screen -m-6 p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-gray-900 rounded-2xl p-8 sm:p-10 text-white shadow-lg border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              Welcome back, {user?.name || "Student"}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-light mb-3">
              Continue your learning journey
            </p>
            {user?.location && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{user.location}</span>
                <button
                  onClick={() => setShowLocationUpdate(!showLocationUpdate)}
                  className="ml-2 p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Update location"
                >
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
            )}
            {!user?.location && (
              <button
                onClick={() => setShowLocationUpdate(!showLocationUpdate)}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                title="Add location"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
          </div>
          <a
            href="/assessment"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl transition-all font-medium text-sm whitespace-nowrap shadow-lg hover:shadow-xl hover:opacity-90"
            style={{ backgroundColor: "#323232", color: "#DDD0C8" }}
          >
            {user?.current_level ? "Retake Assessment" : "Take Assessment"}
          </a>
        </div>

        {/* Location Update Form */}
        {showLocationUpdate && (
          <div className="mt-6 p-6 bg-slate-800 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Update Your Location</h3>

            <LocationMap
              onLocationSelect={handleMapLocationSelect}
              initialLocation={
                user?.latitude && user?.longitude
                  ? { lat: user.latitude, lng: user.longitude }
                  : null
              }
            />

            {locationData.location && (
              <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Selected Location:</span>{" "}
                  {locationData.location}
                </p>
                {locationData.latitude && locationData.longitude && (
                  <p className="text-xs text-slate-400 mt-1">
                    Coordinates: {locationData.latitude.toFixed(4)},{" "}
                    {locationData.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdateLocation}
                disabled={updatingLocation || !locationData.location}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {updatingLocation ? "Updating..." : "Save Location"}
              </button>
              <button
                onClick={() => setShowLocationUpdate(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
              💡 Physical meetups will match you with nearby peers within 10km.
              Online meetups work with anyone!
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md"
            style={{ backgroundColor: "#F5EDE5", borderColor: "#C9BDB3" }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: "#5A5A5A" }}
            >
              {stat.label}
            </div>
            <div className="text-3xl font-bold" style={{ color: "#323232" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <Card title="Recent Activities">
        {loading ? (
          <div className="text-center py-8">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "#323232" }}
            ></div>
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {recentActivities.map((activity, index) => {
              const submittedDate = new Date(activity.submitted_at);
              const formattedDate = submittedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-3 rounded-lg transition-colors border-l-4"
                  style={{ borderColor: "#323232" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#E8DDD3", color: "#323232" }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="#5A5A5A"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      Completed{" "}
                      {activity.subject.charAt(0).toUpperCase() +
                        activity.subject.slice(1)}{" "}
                      Assessment
                    </p>
                    <p className="text-sm text-gray-500">
                      {formattedDate} • {activity.total_questions} questions
                      {activity.score !== undefined && ` • ${activity.score}%`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "evaluated"
                        ? "success"
                        : activity.status === "evaluating"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {activity.status === "evaluated"
                      ? "Done"
                      : activity.status === "evaluating"
                      ? "Processing"
                      : activity.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No recent activities</p>
            <a
              href="/assessment"
              className="text-sm font-medium"
              style={{ color: "#323232" }}
            >
              Take your first assessment →
            </a>
          </div>
        )}
      </Card>

      {/* Weaknesses & Improvement Areas */}
      <Card title="Areas for Improvement">
        <p className="text-sm text-gray-500 mb-5">
          Topics where you need more practice - Let's work on these together
        </p>
        {loading ? (
          <div className="text-center py-8">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "#323232" }}
            ></div>
          </div>
        ) : areasForImprovement.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[32rem] overflow-y-auto pr-2">
            {areasForImprovement.map((area, index) => (
              <div
                key={index}
                className="p-5 rounded-xl border transition-shadow hover:shadow-md"
                style={{ backgroundColor: "#F5EDE5", borderColor: "#C9BDB3" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {area.chapter}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{area.subject}</p>
                  </div>
                  <div className="flex flex-col items-end ml-3">
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color:
                          area.accuracy < 30
                            ? "#dc2626"
                            : area.accuracy < 50
                            ? "#f59e0b"
                            : "#6b7280",
                      }}
                    >
                      {area.accuracy}%
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {area.severity === "critical" ? "Critical" : "Needs work"}
                    </span>
                  </div>
                </div>
                <a
                  href={`/resources?tab=roadmap&subject=${encodeURIComponent(
                    area.subject
                  )}`}
                  className="inline-flex items-center text-sm font-medium transition-colors"
                  style={{ color: "#323232" }}
                >
                  View Learning Plan
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              {user?.math_level || user?.science_level || user?.english_level
                ? "Great job! No major areas of concern."
                : "Take an assessment to see your areas for improvement"}
            </p>
            {!user?.math_level &&
              !user?.science_level &&
              !user?.english_level && (
                <a
                  href="/assessment"
                  className="text-sm font-medium"
                  style={{ color: "#323232" }}
                >
                  Take your first assessment →
                </a>
              )}
          </div>
        )}
      </Card>

      {/* Filter Options */}
      <div
        className="flex items-center justify-between p-4 rounded-xl border"
        style={{ backgroundColor: "#F5EDE5", borderColor: "#C9BDB3" }}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="nearMeFilter"
            checked={meetingType === "physical"}
            onChange={(e) =>
              setMeetingType(e.target.checked ? "physical" : "online")
            }
            className="w-4 h-4 rounded border-2 cursor-pointer"
            style={{ accentColor: "#323232" }}
          />
          <label
            htmlFor="nearMeFilter"
            className="text-sm font-medium cursor-pointer"
            style={{ color: "#323232" }}
          >
            📍 Show only peers near me
            {meetingType === "physical" && user?.location && (
              <span className="ml-2 text-xs" style={{ color: "#5A5A5A" }}>
                ({user.location})
              </span>
            )}
          </label>
        </div>
        {meetingType === "physical" && !user?.location && (
          <span className="text-xs font-medium" style={{ color: "#c2410c" }}>
            ⚠️ Set your location to filter by proximity
          </span>
        )}
      </div>

      {/* Peer Tutors Who Can Help Me */}
      <Card title="Your Peer Tutors">
        <p className="text-sm text-gray-500 mb-5">
          Connect with students who excel in areas where you need help. Reach
          out via email to schedule a session.
        </p>
        {peerTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            {peerTutors.map((peer, index) => (
              <PeerTutorCard
                key={index}
                peer={peer}
                onRequestHelp={handleRequestHelp}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-xl"
            style={{ backgroundColor: "#F5EDE5", border: "1px solid #C9BDB3" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "#E8DDD3" }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="#5A5A5A"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="font-medium mb-1" style={{ color: "#323232" }}>
              No peer tutors matched yet
            </p>
            <p className="text-sm" style={{ color: "#5A5A5A" }}>
              Complete your assessment to get matched with peers who can help!
            </p>
          </div>
        )}
      </Card>

      {/* Your Strong Areas */}
      {strongAreas.length > 0 && (
        <Card title="Your Strong Areas">
          <p className="text-sm text-gray-500 mb-5">
            Topics where you scored above 75% - You can help others here!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strongAreas.map((area, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border transition-shadow hover:shadow-sm"
                style={{ backgroundColor: "#F5EDE5", borderColor: "#C9BDB3" }}
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
            Students who need help in topics where you're strong. Send them an
            email to offer your help!
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
        </Card>
      )}

      {/* Teaching Materials - For helping peers effectively */}
      {teachingMaterials.length > 0 && (
        <Card
          title={
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="#5A5A5A"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Teaching Resources</span>
            </div>
          }
        >
          <p className="text-sm text-gray-600 mb-4">
            Materials to help you teach your strong topics effectively to other
            peers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachingMaterials.map((material, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border transition-shadow hover:shadow-md"
                style={{ backgroundColor: "#F5EDE5", borderColor: "#C9BDB3" }}
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
                <div
                  className="mb-3 p-2 rounded border"
                  style={{ backgroundColor: "#E8DDD3", borderColor: "#C9BDB3" }}
                >
                  <p className="text-xs" style={{ color: "#323232" }}>
                    <strong>For teaching:</strong> {material.description}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#5A5A5A" }}
                  >
                    {material.type}
                  </span>
                  <button
                    className="text-sm font-medium transition-colors"
                    style={{ color: "#323232" }}
                  >
                    View Guide →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 p-3 rounded-lg border"
            style={{ backgroundColor: "#E8DDD3", borderColor: "#C9BDB3" }}
          >
            <p className="text-sm" style={{ color: "#323232" }}>
              <strong>💡 Teaching Tips:</strong> These resources help you
              explain concepts clearly, identify common mistakes, and engage
              your peers effectively. Use them to prepare before your help
              sessions!
            </p>
          </div>
        </Card>
      )}

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
