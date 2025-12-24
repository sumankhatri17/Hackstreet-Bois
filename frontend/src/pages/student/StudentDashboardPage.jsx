import DashboardLayout from "../../components/layout/DashboardLayout";
import StudentDashboard from "../../components/student/StudentDashboard";

const StudentDashboardPage = () => {
  // Mock data - would come from API/state management
  const studentData = {
    name: "John Doe",
    grade: 8,
    currentLevel: 8,
    math_level: 72,
    reading_level: 68,
    testsCompleted: 12,
    help_sessions_given: 3,
    help_sessions_received: 2,
    peers_helped: 5,
    recentActivities: [
      {
        type: "assessment",
        title: "Math Assessment Completed",
        date: "2 hours ago",
        status: "completed",
      },
      {
        type: "help_session",
        title: "Helped Mike with Geometry",
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
    weaknesses: [
      { topic: "Algebra", subject: "Mathematics", score: 45, gradeLevel: 8 },
      {
        topic: "Sentence Structure",
        subject: "English",
        score: 52,
        gradeLevel: 8,
      },
    ],
    strong_areas: [
      { topic: "Geometry", subject: "Mathematics", score: 88, grade: 8 },
      {
        topic: "Reading Comprehension",
        subject: "English",
        score: 78,
        grade: 8,
      },
    ],
    peer_tutors_for_me: [
      {
        id: 456,
        name: "Sarah Johnson",
        grade: 9,
        can_help_with: ["Algebra", "Linear Equations"],
        their_scores: { Algebra: 92, "Linear Equations": 88 },
        match_reason: "Sarah scored 92% in Algebra (you scored 45%)",
        availability: "Online now",
      },
      {
        id: 457,
        name: "Tom Wilson",
        grade: 8,
        can_help_with: ["Grammar", "Sentence Structure"],
        their_scores: { Grammar: 85, "Sentence Structure": 87 },
        match_reason: "Tom scored 87% in Sentence Structure (you scored 52%)",
        availability: "Last seen 2h ago",
      },
    ],
    peers_i_can_help: [
      {
        id: 789,
        name: "Mike Chen",
        grade: 7,
        needs_help_with: ["Geometry"],
        their_score: 42,
        your_score: 88,
        match_reason: "You scored 88% in Geometry, Mike scored 42%",
        requested_help: true,
      },
      {
        id: 790,
        name: "Emma Davis",
        grade: 8,
        needs_help_with: ["Reading Comprehension"],
        their_score: 55,
        your_score: 78,
        match_reason:
          "You scored 78% in Reading Comprehension, Emma scored 55%",
        requested_help: false,
      },
    ],
    studyMaterials: [
      {
        icon: "🃏",
        title: "Algebra Basics",
        topic: "Linear Equations",
        type: "Flashcards",
        subject: "Math",
      },
      {
        icon: "📄",
        title: "Grammar Guide",
        topic: "Sentence Structure",
        type: "Study Guide",
        subject: "English",
      },
      {
        icon: "🎥",
        title: "Algebra Tutorial",
        topic: "Solving Equations",
        type: "Video",
        subject: "Math",
      },
      {
        icon: "🃏",
        title: "English Grammar",
        topic: "Parts of Speech",
        type: "Flashcards",
        subject: "English",
      },
      {
        icon: "📊",
        title: "Math Practice",
        topic: "Algebra Problems",
        type: "Practice Set",
        subject: "Math",
      },
      {
        icon: "📖",
        title: "Writing Guide",
        topic: "Sentence Formation",
        type: "Notes",
        subject: "English",
      },
    ],
    teachingMaterials: [
      {
        icon: "👨‍🏫",
        title: "Teaching Geometry Basics",
        topic: "Geometry",
        type: "Lesson Plan",
        difficulty: "Intermediate",
        description:
          "Step-by-step guide to explain geometric concepts with visual examples and common mistakes to avoid",
      },
      {
        icon: "📋",
        title: "Reading Comprehension Strategies",
        topic: "Reading Comprehension",
        type: "Teaching Guide",
        difficulty: "Beginner",
        description:
          "Techniques to help peers improve their reading skills, including active reading tips and question strategies",
      },
      {
        icon: "🎯",
        title: "Geometry Problem Examples",
        topic: "Geometry",
        type: "Practice Problems",
        difficulty: "Intermediate",
        description:
          "Curated problems to work through with your peer, with detailed solutions and teaching points",
      },
      {
        icon: "💡",
        title: "Common Reading Mistakes",
        topic: "Reading Comprehension",
        type: "Teaching Tips",
        difficulty: "Beginner",
        description:
          "List of common errors students make and how to guide them toward better understanding",
      },
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
