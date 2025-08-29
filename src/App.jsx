import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
  return (
    <Router>
      <Routes>
        {/* Auth Pages */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* Protected Pages with Sidebar */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/complaints" element={<MainLayout><Complaints /></MainLayout>} />
        <Route path="/lost-found" element={<MainLayout><LostFound /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
        <Route path="/admin" element={<MainLayout><AdminDashboard /></MainLayout>} />

        {/* Default */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;

const AuthLayout = ({ children }) => (
  <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
    {children}
  </div>
);

const MainLayout = ({ children }) => (
  <div className="app-container">
    <div className="content-wrapper">
      <div className="translucent-container">
        <div className="flex min-h-full">
          <Sidebar />
          <main className="main-content">
            <div className="fade-in">{children}</div>
          </main>
        </div>
      </div>
    </div>
  </div>
);
