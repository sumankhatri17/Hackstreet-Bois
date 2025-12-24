import React, { useState } from "react";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Modal from "../common/Modal";

const ResourcesList = ({ resources = [] }) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredResources =
    filter === "all" ? resources : resources.filter((r) => r.type === filter);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs sm:text-sm"
          >
            All Resources
          </Button>
          <Button
            variant={filter === "video" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("video")}
            className="text-xs sm:text-sm"
          >
            Videos
          </Button>
          <Button
            variant={filter === "article" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("article")}
            className="text-xs sm:text-sm"
          >
            Articles
          </Button>
          <Button
            variant={filter === "exercise" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("exercise")}
            className="text-xs sm:text-sm"
          >
            Exercises
          </Button>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource, index) => (
            <Card
              key={index}
              hoverable
              onClick={() => setSelectedResource(resource)}
            >
              <div className="mb-4">
                <Badge variant="info" size="sm">
                  {resource.type}
                </Badge>
                {resource.difficulty && (
                  <Badge variant="warning" size="sm" className="ml-2">
                    {resource.difficulty}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {resource.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {resource.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>⏱ {resource.duration}</span>
                <span>📚 {resource.subject}</span>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <p className="text-center text-gray-500 py-8">
                No resources found
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Resource Detail Modal */}
      <Modal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        title={selectedResource?.title}
        size="lg"
      >
        {selectedResource && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="info">{selectedResource.type}</Badge>
              <Badge variant="warning">{selectedResource.difficulty}</Badge>
            </div>
            <p className="text-gray-700">{selectedResource.description}</p>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Subject:</strong> {selectedResource.subject}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Duration:</strong> {selectedResource.duration}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Level:</strong> Grade {selectedResource.level}
              </p>
            </div>
            <Button fullWidth>Start Learning</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResourcesList;
