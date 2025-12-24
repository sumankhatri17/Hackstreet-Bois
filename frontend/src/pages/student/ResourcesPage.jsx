import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ResourcesList from "../../components/student/ResourcesList";
import resourceService from "../../services/resource.service";
import useAuthStore from "../../store/authStore";

const ResourcesPage = () => {
  const { user } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        // First try to get recommended resources based on student's progress
        try {
          const recommendedResources =
            await resourceService.getRecommendedResources();
          if (recommendedResources && recommendedResources.length > 0) {
            setResources(recommendedResources);
            return;
          }
        } catch (err) {
          console.log("No recommended resources, fetching all resources");
        }

        // If no recommended resources, get all resources
        const allResources = await resourceService.getResources();
        setResources(allResources);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError(err.message || "Failed to load resources");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  return (
    <DashboardLayout user={user}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Learning Resources
        </h1>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && <ResourcesList resources={resources} />}
      </div>
    </DashboardLayout>
  );
};

export default ResourcesPage;
