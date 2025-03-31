import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaPhone, FaChartBar, FaUsers, FaUserPlus, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';
import './SupervisorDashboard.css';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>VOIP Monitoring Tool</h1>
        </div>
        <div className="nav-user">
          <span className="user-info">
            <FaUser className="icon" />
            {user?.username}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="icon" />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* Team Management Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaUsers />
            </div>
            <div className="card-content">
              <h3>Team Management</h3>
              <p>Monitor and manage your team's performance</p>
              <button className="card-btn">Manage Team</button>
            </div>
          </div>

          {/* Call Monitoring Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaPhone />
            </div>
            <div className="card-content">
              <h3>Call Monitoring</h3>
              <p>Monitor live calls and provide feedback</p>
              <button className="card-btn">Monitor Calls</button>
            </div>
          </div>

          {/* Performance Analytics Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaChartBar />
            </div>
            <div className="card-content">
              <h3>Performance Analytics</h3>
              <p>View detailed team performance metrics</p>
              <button className="card-btn">View Analytics</button>
            </div>
          </div>

          {/* Quality Assurance Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaClipboardList />
            </div>
            <div className="card-content">
              <h3>Quality Assurance</h3>
              <p>Review and evaluate call quality</p>
              <button className="card-btn">QA Review</button>
            </div>
          </div>

          {/* Alerts & Notifications Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaExclamationTriangle />
            </div>
            <div className="card-content">
              <h3>Alerts & Notifications</h3>
              <p>Stay updated with important alerts</p>
              <button className="card-btn">View Alerts</button>
            </div>
          </div>

          {/* Agent Onboarding Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaUserPlus />
            </div>
            <div className="card-content">
              <h3>Agent Onboarding</h3>
              <p>Manage new agent training and onboarding</p>
              <button className="card-btn">Onboard Agents</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard; 