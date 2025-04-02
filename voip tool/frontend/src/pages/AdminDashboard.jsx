import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import UserManagement from '../components/UserManagement/UserManagement';
import SystemConfig from '../components/SystemConfig/SystemConfig';
import Reports from '../components/Reports/Reports';
import Analytics from '../components/Analytics/Analytics';
import Billing from '../components/Billing/Billing';
import './AdminDashboard.css';

// Placeholder components for routes
const Backup = () => <div>Backup & Recovery</div>;
const SystemOps = () => <div>System Operations</div>;

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
            <Sidebar />
            <div className="main-content">
                <header className="content-header">
                    <div className="user-info">
                        Welcome, {user?.username}
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </header>
                <main className="content-area">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/system" element={<SystemConfig />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/backup" element={<Backup />} />
                        <Route path="/system-ops" element={<SystemOps />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

// Dashboard home component
const DashboardHome = () => (
    <div className="dashboard-home">
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
    </div>
);

export default AdminDashboard; 