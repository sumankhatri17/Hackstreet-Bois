import React from "react";

const ProgressBar = ({ current, total, percentage }) => {
  const calculatedPercentage = percentage || (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Progress</span>
        <span>{Math.round(calculatedPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${calculatedPercentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>
          {current} of {total} completed
        </span>
        <span>{total - current} remaining</span>
      </div>
    </div>
  );
};

export default ProgressBar;
