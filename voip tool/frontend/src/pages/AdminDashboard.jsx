import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUsers, FaPhone, FaChartBar, FaCog } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-dashboard">
            <nav className="admin-nav">
                <div className="nav-brand">
                    <h1>VoIP Monitoring Tool</h1>
                    <span className="user-info">Welcome, {user?.username}</span>
                </div>
                <div className="nav-links">
                    <button className="nav-link">
                        <FaUsers /> Users
                    </button>
                    <button className="nav-link">
                        <FaPhone /> Calls
                    </button>
                    <button className="nav-link">
                        <FaChartBar /> Analytics
                    </button>
                    <button className="nav-link">
                        <FaCog /> Settings
                    </button>
                    <button className="nav-link logout" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </nav>
            <main className="admin-content">
                <h2>Admin Dashboard</h2>
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Total Users</h3>
                        <p>25</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Active Calls</h3>
                        <p>12</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>System Status</h3>
                        <p>Online</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard; 