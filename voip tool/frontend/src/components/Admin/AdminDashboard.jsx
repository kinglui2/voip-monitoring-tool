import React, { useState, useEffect } from 'react';
import { FaUsers, FaServer, FaShieldAlt, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        systemHealth: {
            cpu: 0,
            memory: 0,
            disk: 0
        },
        recentActivity: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleError = (error) => {
        console.error('Error fetching dashboard data:', error);
        const isNetworkError = error.message.includes('Failed to fetch') || !navigator.onLine;
        setError({
            type: isNetworkError ? 'network' : 'general',
            message: isNetworkError 
                ? 'Unable to load dashboard information' 
                : error.message || 'Error loading dashboard data'
        });
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setStats(data);
            toast.success('Dashboard data loaded successfully');
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const renderError = () => {
        if (!error) return null;

        return error.type === 'network' ? (
            <ErrorMessage 
                type="full"
                title="Dashboard Error"
                message={error.message}
                suggestion="Please check your connection and try again"
                onRetry={fetchDashboardData}
            />
        ) : (
            <ErrorMessage 
                message={error.message}
                onClose={() => setError(null)}
            />
        );
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="admin-dashboard">
            {renderError()}
            
            <h2>Admin Dashboard</h2>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <FaUsers className="stat-icon" />
                    <div className="stat-content">
                        <h3>Users</h3>
                        <p className="stat-value">{stats.totalUsers}</p>
                        <p className="stat-label">Active: {stats.activeUsers}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <FaServer className="stat-icon" />
                    <div className="stat-content">
                        <h3>System Health</h3>
                        <div className="health-metrics">
                            <div className="metric">
                                <span>CPU</span>
                                <span>{stats.systemHealth.cpu}%</span>
                            </div>
                            <div className="metric">
                                <span>Memory</span>
                                <span>{stats.systemHealth.memory}%</span>
                            </div>
                            <div className="metric">
                                <span>Disk</span>
                                <span>{stats.systemHealth.disk}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <FaShieldAlt className="stat-icon" />
                    <div className="stat-content">
                        <h3>Security Status</h3>
                        <p className="stat-value">Active</p>
                        <p className="stat-label">Last Check: {new Date().toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <FaExclamationTriangle className="stat-icon" />
                    <div className="stat-content">
                        <h3>Alerts</h3>
                        <p className="stat-value">0</p>
                        <p className="stat-label">Active Alerts</p>
                    </div>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {stats.recentActivity.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-icon">
                                {activity.action === 'USER_CREATED' && <FaUsers />}
                                {activity.action === 'USER_UPDATED' && <FaShieldAlt />}
                                {activity.action === 'USER_DELETED' && <FaExclamationTriangle />}
                                {activity.action === 'CONFIG_UPDATED' && <FaServer />}
                            </div>
                            <div className="activity-details">
                                <p className="activity-description">
                                    {activity.userId.username} {activity.action.toLowerCase().replace(/_/g, ' ')}
                                    {activity.targetId && ` ${activity.targetId.username}`}
                                </p>
                                <p className="activity-time">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 