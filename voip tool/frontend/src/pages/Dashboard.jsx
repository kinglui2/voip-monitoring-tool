import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaPhone, FaChartBar, FaUsers } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
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
          {/* Call Statistics Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaPhone />
            </div>
            <div className="card-content">
              <h3>Call Statistics</h3>
              <p>View your call handling metrics</p>
              <button className="card-btn">View Details</button>
            </div>
          </div>

          {/* Performance Metrics Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaChartBar />
            </div>
            <div className="card-content">
              <h3>Performance Metrics</h3>
              <p>Track your performance indicators</p>
              <button className="card-btn">View Details</button>
            </div>
          </div>

          {/* Team Overview Card */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaUsers />
            </div>
            <div className="card-content">
              <h3>Team Overview</h3>
              <p>See your team's current status</p>
              <button className="card-btn">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 