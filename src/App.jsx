import React, { Suspense } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Outlet, 
  Navigate 
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
const Dashboard = React.lazy(() => import("./pages/Dashboard.jsx"));
const Complaints = React.lazy(() => import("./pages/Complaints.jsx"));
const LostFound = React.lazy(() => import("./pages/LostFound.jsx"));
const Settings = React.lazy(() => import("./pages/Settings.jsx"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
const AdminLostFound = React.lazy(() => import("./pages/AdminLostFound"));
const AdminComplaints = React.lazy(() => import("./pages/AdminComplaints.jsx"));
const Notifications = React.lazy(() => import("./pages/Notification.jsx"));
import AuthLayout from "./components/AuthLayout";

import "./App.css";

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;

export const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
    <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

    {/* Protected Routes */}
    <Route
      element={
        <ProtectedRoute>
          <MainLayout>
            <div className="circle-top" aria-hidden="true"></div>
            <div className="circle-bottom" aria-hidden="true"></div>
          </MainLayout>
        </ProtectedRoute>
      }
    >
      {/* Student Routes */}
      <Route path="/dashboard" element={<Suspense fallback={null}><Dashboard /></Suspense>} />
      <Route path="/complaints" element={<Suspense fallback={null}><Complaints /></Suspense>} />
      <Route path="/lost-found" element={<Suspense fallback={null}><LostFound /></Suspense>} />
      <Route path="/settings" element={<Suspense fallback={null}><Settings /></Suspense>} />
      <Route path="/notifications" element={<Suspense fallback={null}><Notifications /></Suspense>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
      <Route path="/all-complaints" element={<Suspense fallback={null}><AdminComplaints /></Suspense>} />
      <Route path="/admin/lost-found" element={<Suspense fallback={null}><AdminLostFound /></Suspense>} />
    </Route>

    {/* Default Routes */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const MainLayout = () => (
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
