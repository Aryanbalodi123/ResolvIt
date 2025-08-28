import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import LostFound from "./pages/LostFound";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "complaints":
        return <Complaints />;
      case "lost-found":
        return <LostFound />;
      case "settings":
        return <Settings />;
      case "adminDashboard":
        return <AdminDashboard />;
      case "Login":
        return <Login />;
      case "Register":
        return <Register />;
      default:
        return <Login />;
    }
  };

  const isAuthPage = activeTab === "Login" || activeTab === "Register";

  return (
    <>
      {isAuthPage ? (
        <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
          {renderContent()}
        </div>
      ) : (
        <div className="app-container">
          <div className="content-wrapper">
            <div className="translucent-container">
              <div className="flex min-h-full">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="main-content">
                  <div className="fade-in">{renderContent()}</div>
                </main>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
