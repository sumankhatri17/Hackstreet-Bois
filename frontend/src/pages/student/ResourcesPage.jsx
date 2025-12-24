import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ResourcesList from "../../components/student/ResourcesList";

const ResourcesPage = () => {
  // Mock data
  const resources = [
    {
      type: "video",
      title: "Introduction to Algebra",
      description: "Learn the basics of algebraic expressions and equations",
      duration: "15 min",
      subject: "Mathematics",
      difficulty: "Intermediate",
      level: 8,
    },
    {
      type: "article",
      title: "Essay Writing Techniques",
      description: "Master the art of writing compelling essays",
      duration: "10 min",
      subject: "English",
      difficulty: "Intermediate",
      level: 7,
    },
    {
      type: "exercise",
      title: "Grammar Practice",
      description: "Interactive exercises to improve your grammar",
      duration: "20 min",
      subject: "English",
      difficulty: "Beginner",
      level: 6,
    },
  ];

  const user = { name: "John Doe", role: "student" };

  return (
    <DashboardLayout user={user}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Learning Resources
        </h1>
        <ResourcesList resources={resources} />
      </div>
    </DashboardLayout>
  );
};

export default ResourcesPage;
