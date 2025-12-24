import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'


function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <span className="text-6xl">🎓</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              EduAdapt Platform
            </h1>
            <p className="text-gray-600 mb-6">
              Adaptive Learning System - Frontend Ready!
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Get Started
              </button>
              <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;