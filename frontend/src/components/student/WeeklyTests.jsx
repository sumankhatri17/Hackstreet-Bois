import React from "react";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";

const WeeklyTests = ({ tests = [] }) => {
  return (
    <div className="space-y-8">
      <Card title="Weekly Tests" className="overflow-visible">
        <p className="text-gray-600 mb-8 text-lg">
          Complete weekly tests to track your progress and reinforce your
          learning.
        </p>

        <div className="space-y-6">
          {tests.length > 0 ? (
            tests.map((test, index) => (
              <div
                key={index}
                className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {test.title}
                    </h4>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                  <Badge
                    variant={
                      test.status === "completed"
                        ? "success"
                        : test.status === "in-progress"
                        ? "warning"
                        : "default"
                    }
                  >
                    {test.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      📅 <span className="font-medium">{test.dueDate}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      ⏱ <span className="font-medium">{test.duration}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      📝{" "}
                      <span className="font-medium">
                        {test.questions} questions
                      </span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {test.status === "not-started" && (
                      <Button size="sm">Start Test</Button>
                    )}
                    {test.status === "in-progress" && (
                      <Button size="sm" variant="secondary">
                        Continue
                      </Button>
                    )}
                    {test.status === "completed" && (
                      <Button size="sm" variant="ghost">
                        View Results
                      </Button>
                    )}
                  </div>
                </div>

                {test.score && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">
                        Your Score:
                      </span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {test.score}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">
                No tests available at the moment
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WeeklyTests;
