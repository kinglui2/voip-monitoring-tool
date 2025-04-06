import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import UserManagement from '../components/UserManagement/UserManagement';
import SystemConfig from '../components/SystemConfig/SystemConfig';
import Reports from '../components/Reports/Reports';
import Analytics from '../components/Analytics/Analytics';
import Billing from '../components/Billing/Billing';
import Backup from '../components/Backup/Backup';
import SystemOps from '../components/SystemOps/SystemOps';
import './AdminDashboard.css';

const DashboardHome = ({ dashboardData }) => {
    if (!dashboardData) return <div className="loading">Loading dashboard data...</div>;

    const { totalUsers, activeCalls, systemStatus, pbxType, pbxDetails, pbxMetrics } = dashboardData;

    return (
        <div className="dashboard-home">
            <h2>System Overview</h2>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Total Users</h3>
                    <p>{totalUsers}</p>
                </div>
                <div className="dashboard-card">
                    <h3>Active Calls</h3>
                    <p>{activeCalls}</p>
                </div>
                <div className="dashboard-card">
                    <h3>System Status</h3>
                    <p className={`status-${systemStatus.toLowerCase()}`}>{systemStatus}</p>
                </div>
                <div className="dashboard-card">
                    <h3>Active PBX</h3>
                    <p>{pbxType}</p>
                </div>
            </div>

            {pbxDetails && (
                <div className="pbx-details">
                    <h3>PBX Details</h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="label">Server URL:</span>
                            <span className="value">{pbxDetails.serverUrl}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Last Connected:</span>
                            <span className="value">{new Date(pbxDetails.lastConnected).toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Uptime:</span>
                            <span className="value">{pbxDetails.uptime}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Version:</span>
                            <span className="value">{pbxDetails.version}</span>
                        </div>
                    </div>
                </div>
            )}

            {pbxMetrics && (
                <div className="pbx-metrics">
                    <h3>PBX Metrics</h3>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <h4>Extensions</h4>
                            <div className="metric-value">
                                <span className="active">{pbxMetrics.activeExtensions}</span>
                                <span className="total">/ {pbxMetrics.totalExtensions}</span>
                            </div>
                            <p>Active / Total</p>
                        </div>
                        <div className="metric-card">
                            <h4>Queues</h4>
                            <div className="metric-value">
                                <span className="active">{pbxMetrics.activeQueues}</span>
                                <span className="total">/ {pbxMetrics.totalQueues}</span>
                            </div>
                            <p>Active / Total</p>
                        </div>
                        <div className="metric-card">
                            <h4>Performance</h4>
                            <div className="performance-metrics">
                                <div className="performance-item">
                                    <span>CPU:</span>
                                    <span className="value">{pbxMetrics.performance.cpu}</span>
                                </div>
                                <div className="performance-item">
                                    <span>Memory:</span>
                                    <span className="value">{pbxMetrics.performance.memory}</span>
                                </div>
                                <div className="performance-item">
                                    <span>Disk:</span>
                                    <span className="value">{pbxMetrics.performance.disk}</span>
                                </div>
                                <div className="performance-item">
                                    <span>Network:</span>
                                    <span className="value">{pbxMetrics.performance.network}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="alerts-section">
                        <h4>Recent Alerts</h4>
                        <div className="alerts-list">
                            {pbxMetrics.systemAlerts.map((alert, index) => (
                                <div key={index} className={`alert-item ${alert.level}`}>
                                    <span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span>
                                    <span className="alert-message">{alert.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:5000/api/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching dashboard data:', err);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Determine which component to render based on the current path
    const renderContent = () => {
        const path = location.pathname;
        
        if (path === '/admin' || path === '/admin/') {
            return <DashboardHome dashboardData={dashboardData} />;
        }
        
        switch (path) {
            case '/admin/users':
                return <UserManagement />;
            case '/admin/system':
                return <SystemConfig />;
            case '/admin/reports':
                return <Reports />;
            case '/admin/analytics':
                return <Analytics />;
            case '/admin/billing':
                return <Billing />;
            case '/admin/backup':
                return <Backup />;
            case '/admin/system-ops':
                return <SystemOps />;
            default:
                return <DashboardHome dashboardData={dashboardData} />;
        }
    };

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

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
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard; 