import React from "react";

interface DashboardProps {
  onNavigateToInvoice: () => void;
  onNavigateToList: () => void;
  onNavigateToItems: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToInvoice,
  onNavigateToList,
  onNavigateToItems,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏨 Skardu Serenity Inn</h1>
        <p className="dashboard-subtitle">Hotel Management System</p>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to Skardu Serenity Inn</h2>
          <p>Manage your hotel operations efficiently</p>
        </div>

        <div className="dashboard-actions">
          <div className="action-card">
            <h3>📋 Invoice Management</h3>
            <p>Create and manage hotel invoices</p>
            <button
              onClick={onNavigateToInvoice}
              className="dashboard-btn primary"
            >
              Create New Invoice
            </button>
          </div>

          <div className="action-card">
            <h3>📊 Invoice History</h3>
            <p>View all created invoices</p>
            <button
              onClick={onNavigateToList}
              className="dashboard-btn secondary"
            >
              View Invoice List
            </button>
          </div>

          <div className="action-card">
            <h3>🛍️ Items Management</h3>
            <p>Manage hotel items and services</p>
            <button
              onClick={onNavigateToItems}
              className="dashboard-btn primary"
            >
              Manage Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
