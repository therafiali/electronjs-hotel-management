import React from "react";

interface DashboardProps {
  onNavigateToInvoice: () => void;
  onNavigateToList: () => void;
  onNavigateToItems: () => void;
  onNavigateToRooms: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToInvoice,
  onNavigateToList,
  onNavigateToItems,
  onNavigateToRooms,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏨 Skardu Serenity Inn</h1>
        <p className="dashboard-subtitle">Hotel Management System</p>
      </div>

      <div className="dashboard-content">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">🏠</div>
            <div className="stat-content">
              <div className="stat-number">25/30</div>
              <div className="stat-label">Rooms Available</div>
              <div className="stat-trend positive">+2 from yesterday</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-number">8</div>
              <div className="stat-label">Check-ins Today</div>
              <div className="stat-trend positive">+3 from yesterday</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-number">$12.5K</div>
              <div className="stat-label">Monthly Revenue</div>
              <div className="stat-trend positive">+15% this month</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">4.8</div>
              <div className="stat-label">Guest Rating</div>
              <div className="stat-trend positive">+0.2 this week</div>
            </div>
          </div>
        </div>

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

          <div className="action-card">
            <h3>🏠 Room Management</h3>
            <p>Create and manage room types</p>
            <button
              onClick={onNavigateToRooms}
              className="dashboard-btn secondary"
            >
              Create Room Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
