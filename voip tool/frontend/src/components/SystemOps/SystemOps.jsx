import React, { useState, useEffect } from 'react';
import { 
    FaServer, 
    FaDatabase, 
    FaNetworkWired, 
    FaMemory, 
    FaMicrochip,
    FaHdd,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaPhone
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getSystemMetrics, getServicesStatus, getSystemLogs, performMaintenance } from '../../services/systemOpsService';
import './SystemOps.css';

const SystemOps = () => {
    const [metrics, setMetrics] = useState(null);
    const [services, setServices] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pbxType, setPbxType] = useState('3cx');
    const [pbxStatus, setPbxStatus] = useState({
        '3cx': { connected: false, lastSync: null, error: null },
        'yeastar': { connected: false, lastSync: null, error: null }
    });

    const checkPBXStatus = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/system/${pbxType}/status`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to fetch PBX status');
            const data = await response.json();
            setPbxStatus(prev => ({
                ...prev,
                [pbxType]: {
                    connected: data.connected,
                    lastSync: data.lastSync,
                    error: data.error
                }
            }));
        } catch (err) {
            setPbxStatus(prev => ({
                ...prev,
                [pbxType]: {
                    connected: false,
                    lastSync: null,
                    error: err.message
                }
            }));
        }
    };

    useEffect(() => {
        checkPBXStatus();
    }, [pbxType]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [metricsData, servicesData, logsData] = await Promise.all([
                    getSystemMetrics(pbxType),
                    getServicesStatus(pbxType),
                    getSystemLogs(pbxType)
                ]);
                setMetrics(metricsData);
                setServices(servicesData);
                setLogs(logsData);
            } catch (error) {
                console.error('Error fetching system data:', error);
                toast.error('Failed to fetch system data');
            } finally {
                setLoading(false);
            }
        };

        if (pbxStatus[pbxType].connected) {
            fetchData();
            // Set up polling for real-time updates
            const interval = setInterval(fetchData, 30000); // Update every 30 seconds
            return () => clearInterval(interval);
        } else {
            setMetrics(null);
            setServices([]);
            setLogs([]);
        }
    }, [pbxType, pbxStatus]);

    const handleMaintenanceAction = async (action) => {
        try {
            const result = await performMaintenance(pbxType, action);
            toast.success(result.message);
            // Refresh data after maintenance action
            const [metricsData, servicesData, logsData] = await Promise.all([
                getSystemMetrics(pbxType),
                getServicesStatus(pbxType),
                getSystemLogs(pbxType)
            ]);
            setMetrics(metricsData);
            setServices(servicesData);
            setLogs(logsData);
        } catch (error) {
            console.error('Error performing maintenance action:', error);
            toast.error('Failed to perform maintenance action');
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'var(--text-secondary)';
        
        switch (status.toLowerCase()) {
            case 'running': return 'var(--success-color)';
            case 'warning': return 'var(--warning-color)';
            case 'error': return 'var(--error-color)';
            case 'normal': return 'var(--success-color)';
            case 'active': return 'var(--success-color)';
            default: return 'var(--text-secondary)';
        }
    };

    if (loading) {
        return <div className="loading">Loading system data...</div>;
    }

    return (
        <div className="system-ops">
            <div className="system-ops-header">
                <h2>System Operations</h2>
                <div className="pbx-selector">
                    <button 
                        className={`pbx-btn ${pbxType === '3cx' ? 'active' : ''}`}
                        onClick={() => setPbxType('3cx')}
                    >
                        <FaServer className="pbx-icon" />
                        <span>3CX</span>
                        <div className="pbx-status">
                            {pbxStatus['3cx'].connected ? (
                                <FaCheckCircle className="status-icon connected" />
                            ) : (
                                <FaExclamationTriangle className="status-icon disconnected" />
                            )}
                        </div>
                    </button>
                    <button 
                        className={`pbx-btn ${pbxType === 'yeastar' ? 'active' : ''}`}
                        onClick={() => setPbxType('yeastar')}
                    >
                        <FaServer className="pbx-icon" />
                        <span>Yeastar</span>
                        <div className="pbx-status">
                            {pbxStatus['yeastar'].connected ? (
                                <FaCheckCircle className="status-icon connected" />
                            ) : (
                                <FaExclamationTriangle className="status-icon disconnected" />
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {!pbxStatus[pbxType].connected ? (
                <div className="not-connected">
                    <FaExclamationTriangle className="warning-icon" />
                    <p>Not connected to {pbxType.toUpperCase()} PBX system.</p>
                    <p>Please check your connection settings in System Configuration.</p>
                </div>
            ) : (
                <>
                    {/* System Health Overview */}
                    <div className="health-overview">
                        <div className="metric-card">
                            <FaMicrochip className="metric-icon" />
                            <div className="metric-info">
                                <h3>CPU Usage</h3>
                                <p>{metrics?.cpu?.usage ?? 0}%</p>
                                <span className="status" style={{ color: getStatusColor(metrics?.cpu?.status) }}>
                                    {metrics?.cpu?.status ?? 'Unknown'}
                                </span>
                            </div>
                        </div>
                        <div className="metric-card">
                            <FaMemory className="metric-icon" />
                            <div className="metric-info">
                                <h3>Memory Usage</h3>
                                <p>{metrics?.memory?.usage ?? 0}%</p>
                                <span className="status" style={{ color: getStatusColor(metrics?.memory?.status) }}>
                                    {metrics?.memory?.status ?? 'Unknown'}
                                </span>
                            </div>
                        </div>
                        <div className="metric-card">
                            <FaHdd className="metric-icon" />
                            <div className="metric-info">
                                <h3>Disk Usage</h3>
                                <p>{metrics?.disk?.usage ?? 0}%</p>
                                <span className="status" style={{ color: getStatusColor(metrics?.disk?.status) }}>
                                    {metrics?.disk?.status ?? 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Services Status */}
                    <div className="services-section">
                        <h3>Services Status</h3>
                        <div className="services-grid">
                            {services.map((service, index) => (
                                <div key={index} className="service-card">
                                    <div className="service-icon">
                                        {service.name.includes('VoIP') ? <FaPhone /> :
                                         service.name.includes('Database') ? <FaDatabase /> :
                                         <FaServer />}
                                    </div>
                                    <div className="service-info">
                                        <h4>{service.name}</h4>
                                        <p className="uptime">Uptime: {service.uptime}</p>
                                        <span className="status" style={{ color: getStatusColor(service.status) }}>
                                            {service.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Logs */}
                    <div className="logs-section">
                        <h3>System Logs</h3>
                        <div className="logs-container">
                            {logs.map(log => (
                                <div key={log.id} className="log-entry">
                                    <span className="timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                                    <span className={`log-level ${(log.level || '').toLowerCase()}`}>
                                        {log.level === 'INFO' ? <FaCheckCircle /> : 
                                         log.level === 'WARNING' ? <FaExclamationTriangle /> : 
                                         <FaTimesCircle />}
                                        {log.level}
                                    </span>
                                    <span className="log-message">{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maintenance Controls */}
                    <div className="maintenance-section">
                        <h3>Maintenance Controls</h3>
                        <div className="maintenance-controls">
                            <button 
                                className="maintenance-btn"
                                onClick={() => handleMaintenanceAction('clearCache')}
                            >
                                Clear System Cache
                            </button>
                            <button 
                                className="maintenance-btn"
                                onClick={() => handleMaintenanceAction('restartServices')}
                            >
                                Restart Services
                            </button>
                            <button 
                                className="maintenance-btn warning"
                                onClick={() => handleMaintenanceAction('emergencyStop')}
                            >
                                Emergency Stop
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SystemOps; 