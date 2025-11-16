import React from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Outlet, 
  Navigate 
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard.jsx";
import Complaints from "./pages/Complaints.jsx";
import LostFound from "./pages/LostFound.jsx";
import Settings from "./pages/Settings.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLostFound from "./pages/AdminLostFound";
import AdminComplaints from "./pages/AdminComplaints.jsx";
import Notifications from "./pages/Notification.jsx";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* Protected Routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout>
              <div className="circle-top" aria-hidden="true"></div>
              <div className="circle-bottom" aria-hidden="true"></div>
            </MainLayout>
          </ProtectedRoute>
        }>
          {/* Student Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/all-complaints" element={<AdminComplaints />} />
          <Route path="/admin/lost-found" element={<AdminLostFound />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );x``
};

export default App;

const AuthLayout = ({ children }) => (
  <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
    {children}
  </div>
);

const MainLayout = ({ children }) => (
  <div className="app-container">
    <div className="decorative-circles">
      <div className="circle-top"></div>
      <div className="circle-bottom"></div>
    </div>
    <div className="content-wrapper">
      <div className="translucent-container">
        <div className="flex min-h-full">
          <Sidebar />
          <main className="main-content">
            <div className="fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
);
