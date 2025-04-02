import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaChartLine, FaHistory, FaDownload, FaFilter, FaServer, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './Reports.css';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('callLogs');
    const [pbxType, setPbxType] = useState('3cx');
    const [pbxStatus, setPbxStatus] = useState({
        '3cx': { connected: false, lastSync: null, error: null },
        'yeastar': { connected: false, lastSync: null, error: null }
    });
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [callLogs, setCallLogs] = useState([]);
    const [systemLogs, setSystemLogs] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        callVolume: 0,
        averageCallDuration: 0,
        callQuality: 0,
        systemUptime: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRealTime, setIsRealTime] = useState(false);
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

    // Initialize WebSocket connection
    useEffect(() => {
        if (isRealTime && pbxStatus[pbxType].connected) {
            const token = localStorage.getItem('token');
            wsRef.current = new WebSocket(`ws://localhost:5000/ws/reports?token=${token}&pbx=${pbxType}`);

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                updateData(data);
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
    }, [isRealTime, pbxType, pbxStatus]);

    const updateData = (data) => {
        switch (data.type) {
            case 'callLog':
                setCallLogs(prevLogs => {
                    const newLogs = [data.log, ...prevLogs];
                    return newLogs.slice(0, 100); // Keep last 100 logs
                });
                break;
            case 'systemLog':
                setSystemLogs(prevLogs => {
                    const newLogs = [data.log, ...prevLogs];
                    return newLogs.slice(0, 100);
                });
                break;
            case 'metrics':
                setPerformanceMetrics(data.metrics);
                break;
        }
    };

    useEffect(() => {
        if (!isRealTime) {
            fetchData();
        }
    }, [activeTab, pbxType, dateRange, isRealTime]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            switch (activeTab) {
                case 'callLogs':
                    await fetchCallLogs();
                    break;
                case 'systemLogs':
                    await fetchSystemLogs();
                    break;
                case 'performance':
                    await fetchPerformanceMetrics();
                    break;
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCallLogs = async () => {
        const response = await fetch(
            `http://localhost:5000/api/system/${pbxType}/calls?startTime=${dateRange.startDate}&endTime=${dateRange.endDate}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        if (!response.ok) throw new Error('Failed to fetch call logs');
        const data = await response.json();
        setCallLogs(data);
    };

    const fetchSystemLogs = async () => {
        const response = await fetch(
            `http://localhost:5000/api/system/logs?startTime=${dateRange.startDate}&endTime=${dateRange.endDate}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        if (!response.ok) throw new Error('Failed to fetch system logs');
        const data = await response.json();
        setSystemLogs(data);
    };

    const fetchPerformanceMetrics = async () => {
        const response = await fetch(
            `http://localhost:5000/api/system/${pbxType}/metrics?startTime=${dateRange.startDate}&endTime=${dateRange.endDate}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        if (!response.ok) throw new Error('Failed to fetch performance metrics');
        const data = await response.json();
        setPerformanceMetrics(data);
    };

    const handleExport = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/system/${pbxType}/export?startTime=${dateRange.startDate}&endTime=${dateRange.endDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to export data');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pbxType}-report-${dateRange.startDate}-${dateRange.endDate}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err.message);
            console.error('Error exporting data:', err);
        }
    };

    return (
        <div className="reports">
            <div className="reports-header">
                <h2>Reports & Analytics</h2>
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
                    <button 
                        className={`realtime-btn ${isRealTime ? 'active' : ''}`}
                        onClick={() => setIsRealTime(!isRealTime)}
                    >
                        {isRealTime ? 'Live Mode' : 'Historical Mode'}
                    </button>
                </div>
            </div>

            {pbxStatus[pbxType].error && (
                <div className="pbx-error">
                    <FaExclamationTriangle className="error-icon" />
                    <span>Connection Error: {pbxStatus[pbxType].error}</span>
                </div>
            )}

            {pbxStatus[pbxType].lastSync && (
                <div className="last-sync">
                    Last Updated: {new Date(pbxStatus[pbxType].lastSync).toLocaleString()}
                </div>
            )}

            {!isRealTime && (
                <div className="date-range">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        />
                    </div>
                    <button className="filter-btn" onClick={fetchData}>
                        <FaFilter /> Apply Filter
                    </button>
                </div>
            )}

            <div className="reports-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'callLogs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('callLogs')}
                >
                    <FaPhone /> Call Logs
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'systemLogs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('systemLogs')}
                >
                    <FaHistory /> System Logs
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('performance')}
                >
                    <FaChartLine /> Performance
                </button>
            </div>

            <div className="reports-content">
                {loading && <LoadingSpinner message="Loading reports data..." />}
                {error && <ErrorMessage message={error} onRetry={fetchData} />}
                {isRealTime && (
                    <div className="realtime-indicator">
                        <span className="pulse"></span> Live Updates
                    </div>
                )}

                {activeTab === 'callLogs' && (
                    <div className="call-logs">
                        <div className="table-header">
                            <h3>Call Logs</h3>
                            <button className="export-btn" onClick={handleExport}>
                                <FaDownload /> Export
                            </button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date/Time</th>
                                    <th>Extension</th>
                                    <th>Number</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Quality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {callLogs.map((log, index) => (
                                    <tr key={index}>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td>{log.extension}</td>
                                        <td>{log.number}</td>
                                        <td>{log.duration}</td>
                                        <td>{log.status}</td>
                                        <td>{log.quality}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'systemLogs' && (
                    <div className="system-logs">
                        <div className="table-header">
                            <h3>System Activity Logs</h3>
                            <button className="export-btn" onClick={handleExport}>
                                <FaDownload /> Export
                            </button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date/Time</th>
                                    <th>Event</th>
                                    <th>Severity</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {systemLogs.map((log, index) => (
                                    <tr key={index}>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td>{log.event}</td>
                                        <td className={`severity ${log.severity}`}>{log.severity}</td>
                                        <td>{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="performance-metrics">
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <h4>Call Volume</h4>
                                <div className="metric-value">{performanceMetrics.callVolume}</div>
                                <div className="metric-label">calls</div>
                            </div>
                            <div className="metric-card">
                                <h4>Average Call Duration</h4>
                                <div className="metric-value">{performanceMetrics.averageCallDuration}</div>
                                <div className="metric-label">minutes</div>
                            </div>
                            <div className="metric-card">
                                <h4>Call Quality</h4>
                                <div className="metric-value">{performanceMetrics.callQuality}</div>
                                <div className="metric-label">MOS</div>
                            </div>
                            <div className="metric-card">
                                <h4>System Uptime</h4>
                                <div className="metric-value">{performanceMetrics.systemUptime}</div>
                                <div className="metric-label">%</div>
                            </div>
                        </div>
                        <div className="chart-container">
                            {/* Add charts here using a charting library */}
                            <div className="chart-placeholder">Performance Charts</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports; 