import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const DashboardLayout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex flex-1">
        <Sidebar role={user?.role} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
