import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaSun, FaMoon, FaUsers, FaPhone, FaChartBar, FaClipboardList, FaExclamationTriangle, FaHome, FaChartLine, FaBell, FaCog, FaBars } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import TeamManagement from '../components/Supervisor/TeamManagement';
import CallMonitoring from '../components/Supervisor/CallMonitoring';
import PerformanceAnalytics from '../components/Supervisor/PerformanceAnalytics';
import QualityAssurance from '../components/Supervisor/QualityAssurance';
import AlertsNotifications from '../components/Supervisor/AlertsNotifications';
import Settings from '../components/Supervisor/Settings';
import './SupervisorDashboard.css';
import supervisorService from '../services/supervisorService';

const DashboardHome = () => {
    const [teamStatus, setTeamStatus] = useState(null);
    const [activeCalls, setActiveCalls] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);
    const [qualityMetrics, setQualityMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch team status
                const teamResponse = await supervisorService.getTeamStatus();
                if (teamResponse.success) {
                    setTeamStatus(teamResponse.data);
                }

                // Fetch active calls
                const callsResponse = await supervisorService.getActiveCalls();
                if (callsResponse.success) {
                    setActiveCalls(callsResponse.data);
                }

                // Fetch performance metrics
                const metricsResponse = await supervisorService.getTeamMetrics();
                if (metricsResponse.success) {
                    setPerformanceMetrics(metricsResponse.data);
                }

                // Fetch quality metrics
                const qualityResponse = await supervisorService.getQualityMetrics();
                if (qualityResponse.success) {
                    setQualityMetrics(qualityResponse.data);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const renderMetricCard = (title, value, icon, error) => {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <span className="card-icon">{icon}</span>
                    <h3>{title}</h3>
                </div>
                {error ? (
                    <div className="error-message">
                        <FaExclamationTriangle />
                        <span>{error}</span>
                    </div>
                ) : (
                    <div className="card-content">
                        {loading ? (
                            <div className="loading-spinner" />
                        ) : value ? (
                            <div className="metric-value">{value}</div>
                        ) : (
                            <div className="no-data">No data available</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="dashboard-home">
            <h2>Supervisor Dashboard</h2>
            <div className="dashboard-grid">
                {renderMetricCard(
                    'Team Overview',
                    teamStatus ? `${teamStatus.extensions.length} Agents` : null,
                    <FaUsers />,
                    teamStatus?.error
                )}
                {renderMetricCard(
                    'Active Calls',
                    activeCalls ? `${activeCalls.totalActive} Calls` : null,
                    <FaPhone />,
                    activeCalls?.error
                )}
                {renderMetricCard(
                    'Performance Metrics',
                    performanceMetrics ? `${performanceMetrics.averageScore}%` : null,
                    <FaChartLine />,
                    performanceMetrics?.error
                )}
                {renderMetricCard(
                    'Quality Scores',
                    qualityMetrics ? `${qualityMetrics.averageScore}%` : null,
                    <FaClipboardList />,
                    qualityMetrics?.error
                )}
            </div>
        </div>
    );
};

const SupervisorDashboard = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [activeItem, setActiveItem] = useState(location.pathname);

    console.log('SupervisorDashboard rendered', { theme, user });

    const menuItems = [
        { path: '/supervisor/dashboard', icon: <FaHome />, label: 'Dashboard' },
        { path: '/supervisor/team', icon: <FaUsers />, label: 'Team Management' },
        { path: '/supervisor/calls', icon: <FaPhone />, label: 'Call Monitoring' },
        { path: '/supervisor/analytics', icon: <FaChartLine />, label: 'Performance Analytics' },
        { path: '/supervisor/qa', icon: <FaClipboardList />, label: 'Quality Assurance' },
        { path: '/supervisor/alerts', icon: <FaBell />, label: 'Alerts & Notifications' },
        { path: '/supervisor/settings', icon: <FaCog />, label: 'Settings' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleNavigation = (path) => {
        setActiveItem(path);
        navigate(path);
    };

    const renderContent = () => {
        const path = location.pathname;
        console.log('Current path:', path);
        
        if (path === '/supervisor' || path === '/supervisor/') {
            return <DashboardHome />;
        }
        
        switch (path) {
            case '/supervisor/team':
                return <TeamManagement />;
            case '/supervisor/calls':
                return <CallMonitoring />;
            case '/supervisor/analytics':
                return <PerformanceAnalytics />;
            case '/supervisor/qa':
                return <QualityAssurance />;
            case '/supervisor/alerts':
                return <AlertsNotifications />;
            case '/supervisor/settings':
                return <Settings />;
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="supervisor-dashboard">
            <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-link">
                        <h1 className="brand">VOIP Monitor</h1>
                    </div>
                    <button 
                        className="collapse-btn"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <FaBars />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            className={`nav-item ${activeItem === item.path ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </div>
                    ))}
                </nav>
            </div>
            <main className="main-content">
                <header className="content-header">
                    <button 
                        className="theme-toggle" 
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
                    >
                        {theme === 'dark' ? <FaSun /> : <FaMoon />}
                    </button>
                    <div className="user-info">
                        Welcome, {user?.username || 'Supervisor'}
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt /> Logout
                    </button>
                </header>
                <div className="content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default SupervisorDashboard; 