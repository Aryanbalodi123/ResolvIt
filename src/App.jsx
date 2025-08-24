import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import LostFound from './pages/LostFound';
import Settings from './pages/Settings';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'complaints':
        return <Complaints />;
      case 'lost-found':
        return <LostFound />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="translucent-container">
          <div className="flex min-h-full">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="main-content">
              <div className="fade-in">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;