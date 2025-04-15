import React, { useState, useEffect } from 'react';
import { 
    FaBell, 
    FaBellSlash, 
    FaCheck, 
    FaExclamationTriangle, 
    FaFilter,
    FaCog,
    FaHistory
} from 'react-icons/fa';
import supervisorService from '../../services/supervisorService';
import './AlertsNotifications.css';

const AlertsNotifications = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, unread, system, performance
    const [showSettings, setShowSettings] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        systemAlerts: true,
        performanceAlerts: true,
        emailNotifications: false,
        soundNotifications: true,
        desktopNotifications: true
    });

    useEffect(() => {
        fetchAlerts();
        
        // Set up WebSocket connection
        const socket = supervisorService.setupWebSocketHandlers(window.socket);
        if (socket) {
            socket.on('supervisor:alert', handleNewAlert);
            
            return () => {
                socket.off('supervisor:alert', handleNewAlert);
            };
        }
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await supervisorService.getAlerts();
            if (response.success) {
                setAlerts(response.data.alerts || []);
                setError(null);
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError('Unable to fetch alerts. Please try again later.');
            console.error('Error fetching alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewAlert = (alert) => {
        setAlerts(prev => [alert, ...prev]);
        
        // Show desktop notification if enabled
        if (notificationSettings.desktopNotifications && Notification.permission === 'granted') {
            new Notification('New Alert', {
                body: alert.message,
                icon: '/notification-icon.png'
            });
        }
        
        // Play sound if enabled
        if (notificationSettings.soundNotifications) {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(err => console.error('Error playing sound:', err));
        }
    };

    const handleAcknowledgeAlert = async (alertId) => {
        try {
            await supervisorService.acknowledgeAlert(alertId);
            setAlerts(prev => prev.map(alert => 
                alert.id === alertId ? { ...alert, acknowledged: true } : alert
            ));
        } catch (err) {
            console.error('Error acknowledging alert:', err);
        }
    };

    const handleSettingsChange = (setting) => {
        setNotificationSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const filteredAlerts = alerts.filter(alert => {
        switch (filter) {
            case 'unread':
                return !alert.acknowledged;
            case 'system':
                return alert.type === 'system';
            case 'performance':
                return alert.type === 'performance';
            default:
                return true;
        }
    });

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading alerts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchAlerts} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="alerts-notifications">
            <div className="alerts-header">
                <h2>Alerts & Notifications</h2>
                <div className="header-controls">
                    <div className="filter-selector">
                        <FaFilter className="filter-icon" />
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Alerts</option>
                            <option value="unread">Unread</option>
                            <option value="system">System Alerts</option>
                            <option value="performance">Performance Alerts</option>
                        </select>
                    </div>
                    <button 
                        className="settings-btn"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <FaCog />
                        <span>Settings</span>
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="settings-panel">
                    <h3>Notification Settings</h3>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.systemAlerts}
                                    onChange={() => handleSettingsChange('systemAlerts')}
                                />
                                System Alerts
                            </label>
                        </div>
                        <div className="setting-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.performanceAlerts}
                                    onChange={() => handleSettingsChange('performanceAlerts')}
                                />
                                Performance Alerts
                            </label>
                        </div>
                        <div className="setting-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.emailNotifications}
                                    onChange={() => handleSettingsChange('emailNotifications')}
                                />
                                Email Notifications
                            </label>
                        </div>
                        <div className="setting-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.soundNotifications}
                                    onChange={() => handleSettingsChange('soundNotifications')}
                                />
                                Sound Notifications
                            </label>
                        </div>
                        <div className="setting-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.desktopNotifications}
                                    onChange={() => handleSettingsChange('desktopNotifications')}
                                />
                                Desktop Notifications
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <div className="alerts-content">
                <div className="alerts-list">
                    {filteredAlerts.map((alert) => (
                        <div 
                            key={alert.id} 
                            className={`alert-card ${alert.acknowledged ? 'acknowledged' : ''} ${alert.type}`}
                        >
                            <div className="alert-icon">
                                {alert.type === 'system' ? <FaExclamationTriangle /> : <FaBell />}
                            </div>
                            <div className="alert-info">
                                <h3>{alert.title}</h3>
                                <p>{alert.message}</p>
                                <div className="alert-meta">
                                    <span className="alert-time">
                                        {new Date(alert.timestamp).toLocaleString()}
                                    </span>
                                    {alert.agentName && (
                                        <span className="alert-agent">
                                            Agent: {alert.agentName}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!alert.acknowledged && (
                                <button 
                                    className="acknowledge-btn"
                                    onClick={() => handleAcknowledgeAlert(alert.id)}
                                >
                                    <FaCheck />
                                    <span>Acknowledge</span>
                                </button>
                            )}
                        </div>
                    ))}
                    {filteredAlerts.length === 0 && (
                        <div className="no-alerts">
                            <FaBellSlash />
                            <p>No alerts to display</p>
                        </div>
                    )}
                </div>

                <div className="alerts-history">
                    <h3>Alert History</h3>
                    <div className="history-stats">
                        <div className="stat-card">
                            <h4>Total Alerts</h4>
                            <p>{alerts.length}</p>
                        </div>
                        <div className="stat-card">
                            <h4>Unread</h4>
                            <p>{alerts.filter(a => !a.acknowledged).length}</p>
                        </div>
                        <div className="stat-card">
                            <h4>System Alerts</h4>
                            <p>{alerts.filter(a => a.type === 'system').length}</p>
                        </div>
                        <div className="stat-card">
                            <h4>Performance Alerts</h4>
                            <p>{alerts.filter(a => a.type === 'performance').length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertsNotifications; 