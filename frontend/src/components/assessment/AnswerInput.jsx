import React from "react";
import Input from "../common/Input";
import Textarea from "../common/Textarea";

const AnswerInput = ({ question, value, onChange }) => {
  if (question.type === "multiple-choice") {
    return (
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onChange(option)}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
              value === option
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  value === option ? "border-blue-500" : "border-gray-300"
                }`}
              >
                {value === option && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <span className="font-medium text-gray-700 mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-gray-900">{option}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "true-false") {
    return (
      <div className="flex gap-4">
        <button
          onClick={() => onChange("true")}
          className={`flex-1 p-6 border-2 rounded-lg transition-all ${
            value === "true"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="text-4xl mb-2">✓</div>
          <div className="font-semibold text-gray-900">True</div>
        </button>
        <button
          onClick={() => onChange("false")}
          className={`flex-1 p-6 border-2 rounded-lg transition-all ${
            value === "false"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="text-4xl mb-2">✗</div>
          <div className="font-semibold text-gray-900">False</div>
        </button>
      </div>
    );
  }

  if (question.type === "short-answer") {
    return (
      <Input
        placeholder="Type your answer here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (question.type === "essay") {
    return (
      <Textarea
        placeholder="Write your detailed answer here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
      />
    );
  }

  return null;
};

export default AnswerInput;
