import React from 'react';
import Sidebar from '../components/Sidebar';
import ErrorBoundary from '../components/ErrorBoundary';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
};

export default DashboardLayout;
