import React, { useState, useEffect, useRef } from 'react';
import { FaChartLine, FaPhone, FaUsers, FaServer, FaExclamationTriangle, FaCheckCircle, FaDownload, FaFilter, FaSync } from 'react-icons/fa';
import CallVolumeChart from './Charts/CallVolumeChart';
import CallQualityChart from './Charts/CallQualityChart';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './Analytics.css';

const Analytics = () => {
    const [pbxType, setPbxType] = useState('3cx');
    const [pbxStatus, setPbxStatus] = useState({
        '3cx': { connected: false, lastSync: null, error: null },
        'yeastar': { connected: false, lastSync: null, error: null }
    });
    const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        callVolume: [],
        callQuality: [],
        systemHealth: {
            cpu: 0,
            memory: 0,
            disk: 0
        },
        activeExtensions: [],
        trunkStatus: []
    });
    const [filters, setFilters] = useState({
        minCallDuration: 0,
        maxCallDuration: 3600,
        minMOS: 0,
        maxMOS: 5,
        extensionTypes: ['all']
    });
    const wsRef = useRef(null);

    // Check PBX connection status
    useEffect(() => {
        checkPBXStatus();
    }, [pbxType]);

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

    // Initialize WebSocket connection for real-time updates
    useEffect(() => {
        if (pbxStatus[pbxType].connected) {
            const token = localStorage.getItem('token');
            wsRef.current = new WebSocket(`ws://localhost:5000/ws/analytics?token=${token}&pbx=${pbxType}`);

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                updateAnalyticsData(data);
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('Real-time connection error');
            };

            return () => {
                if (wsRef.current) {
                    wsRef.current.close();
                }
            };
        }
    }, [pbxType, pbxStatus]);

    const updateAnalyticsData = (data) => {
        switch (data.type) {
            case 'callVolume':
                setAnalyticsData(prev => ({
                    ...prev,
                    callVolume: [...prev.callVolume, data.value].slice(-24)
                }));
                break;
            case 'callQuality':
                setAnalyticsData(prev => ({
                    ...prev,
                    callQuality: [...prev.callQuality, data.value].slice(-24)
                }));
                break;
            case 'systemHealth':
                setAnalyticsData(prev => ({
                    ...prev,
                    systemHealth: data.value
                }));
                break;
            case 'activeExtensions':
                setAnalyticsData(prev => ({
                    ...prev,
                    activeExtensions: data.value
                }));
                break;
            case 'trunkStatus':
                setAnalyticsData(prev => ({
                    ...prev,
                    trunkStatus: data.value
                }));
                break;
        }
    };

    // Fetch historical data
    useEffect(() => {
        fetchHistoricalData();
    }, [pbxType, timeRange]);

    const fetchHistoricalData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:5000/api/system/${pbxType}/analytics?timeRange=${timeRange}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to fetch analytics data');
            const data = await response.json();
            setAnalyticsData(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = () => {
        const dataStr = JSON.stringify(analyticsData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `analytics-${pbxType}-${timeRange}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleRefresh = () => {
        fetchHistoricalData();
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    return (
        <div className="analytics">
            <div className="analytics-header">
                <h2>System Analytics</h2>
                <div className="header-controls">
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
                    <div className="time-range-selector">
                        <button 
                            className={`time-btn ${timeRange === '24h' ? 'active' : ''}`}
                            onClick={() => setTimeRange('24h')}
                        >
                            24h
                        </button>
                        <button 
                            className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
                            onClick={() => setTimeRange('7d')}
                        >
                            7d
                        </button>
                        <button 
                            className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
                            onClick={() => setTimeRange('30d')}
                        >
                            30d
                        </button>
                    </div>
                    <div className="action-buttons">
                        <button className="action-btn" onClick={handleRefresh}>
                            <FaSync className="action-icon" />
                            Refresh
                        </button>
                        <button className="action-btn" onClick={handleExportData}>
                            <FaDownload className="action-icon" />
                            Export
                        </button>
                        <button className="action-btn">
                            <FaFilter className="action-icon" />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {pbxStatus[pbxType].error && (
                <ErrorMessage 
                    type="full"
                    title={`${pbxType.toUpperCase()} Connection Error`}
                    message={pbxStatus[pbxType].error}
                    suggestion="Please check your connection settings in System Configuration"
                    onRetry={() => checkPBXStatus()}
                />
            )}

            {pbxStatus[pbxType].lastSync && (
                <div className="last-sync">
                    Last Updated: {new Date(pbxStatus[pbxType].lastSync).toLocaleString()}
                </div>
            )}

            {error && !error.includes('connection') && (
                <ErrorMessage 
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            {loading && <LoadingSpinner message="Loading analytics data..." />}

            <div className="analytics-grid">
                <div className="analytics-card">
                    <div className="card-header">
                        <FaPhone className="card-icon" />
                        <h3>Call Volume</h3>
                    </div>
                    <div className="card-content">
                        <div className="chart-container">
                            <CallVolumeChart data={analyticsData.callVolume} timeRange={timeRange} />
                        </div>
                        <div className="metrics-summary">
                            <div className="metric">
                                <span className="label">Total Calls</span>
                                <span className="value">{analyticsData.callVolume.reduce((a, b) => a + b, 0)}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Average Duration</span>
                                <span className="value">5.2m</span>
                            </div>
                            <div className="metric">
                                <span className="label">Peak Hour</span>
                                <span className="value">14:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="card-header">
                        <FaChartLine className="card-icon" />
                        <h3>Call Quality</h3>
                    </div>
                    <div className="card-content">
                        <div className="chart-container">
                            <CallQualityChart data={analyticsData.callQuality} timeRange={timeRange} />
                        </div>
                        <div className="metrics-summary">
                            <div className="metric">
                                <span className="label">Average MOS</span>
                                <span className="value">4.5</span>
                            </div>
                            <div className="metric">
                                <span className="label">Poor Quality Calls</span>
                                <span className="value">2%</span>
                            </div>
                            <div className="metric">
                                <span className="label">Packet Loss</span>
                                <span className="value">0.1%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="card-header">
                        <FaUsers className="card-icon" />
                        <h3>Active Extensions</h3>
                    </div>
                    <div className="card-content">
                        <div className="extensions-list">
                            {analyticsData.activeExtensions.map((ext, index) => (
                                <div key={index} className="extension-item">
                                    <span className="extension-number">{ext.number}</span>
                                    <span className={`extension-status ${ext.status}`}>{ext.status}</span>
                                </div>
                            ))}
                        </div>
                        <div className="metrics-summary">
                            <div className="metric">
                                <span className="label">Total Extensions</span>
                                <span className="value">{analyticsData.activeExtensions.length}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Active Now</span>
                                <span className="value">{analyticsData.activeExtensions.filter(ext => ext.status === 'active').length}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Busy</span>
                                <span className="value">{analyticsData.activeExtensions.filter(ext => ext.status === 'busy').length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="card-header">
                        <FaServer className="card-icon" />
                        <h3>System Health</h3>
                    </div>
                    <div className="card-content">
                        <div className="health-metrics">
                            <div className="health-metric">
                                <span className="label">CPU Usage</span>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: `${analyticsData.systemHealth.cpu}%` }}></div>
                                </div>
                                <span className="value">{analyticsData.systemHealth.cpu}%</span>
                            </div>
                            <div className="health-metric">
                                <span className="label">Memory Usage</span>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: `${analyticsData.systemHealth.memory}%` }}></div>
                                </div>
                                <span className="value">{analyticsData.systemHealth.memory}%</span>
                            </div>
                            <div className="health-metric">
                                <span className="label">Disk Usage</span>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: `${analyticsData.systemHealth.disk}%` }}></div>
                                </div>
                                <span className="value">{analyticsData.systemHealth.disk}%</span>
                            </div>
                        </div>
                        <div className="trunk-status">
                            <h4>Trunk Status</h4>
                            <div className="trunk-list">
                                {analyticsData.trunkStatus.map((trunk, index) => (
                                    <div key={index} className="trunk-item">
                                        <span className="trunk-name">{trunk.name}</span>
                                        <span className={`trunk-status ${trunk.status}`}>{trunk.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics; 