import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaChartLine, FaHistory, FaDownload, FaFilter, FaServer, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
            if (data.connected) {
                toast.success(`Connected to ${pbxType.toUpperCase()} PBX`);
            }
        } catch (err) {
            setPbxStatus(prev => ({
                ...prev,
                [pbxType]: {
                    connected: false,
                    lastSync: null,
                    error: err.message
                }
            }));
            toast.error(`Failed to connect to ${pbxType.toUpperCase()} PBX`);
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
                toast.info('Real-time data updated');
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                toast.error('Real-time connection error');
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
                    toast.success('Call logs loaded successfully');
                    break;
                case 'systemLogs':
                    await fetchSystemLogs();
                    toast.success('System logs loaded successfully');
                    break;
                case 'performance':
                    await fetchPerformanceMetrics();
                    toast.success('Performance metrics loaded successfully');
                    break;
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            if (err.message.includes('Failed to fetch')) {
                setError(err.message);
            } else {
                toast.error(err.message || 'Error fetching data');
            }
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
            toast.success('Report exported successfully');
        } catch (err) {
            console.error('Error exporting data:', err);
            toast.error('Failed to export report');
        }
    };

    return (
        <div className="reports">
            {loading && <LoadingSpinner />}
            
            {error && error.includes('Failed to fetch') && (
                <ErrorMessage 
                    type="full"
                    title="Data Load Error"
                    message="Unable to load report data"
                    suggestion="Please check your connection and try again"
                    onRetry={fetchData}
                />
            )}
            
            {error && !error.includes('Failed to fetch') && (
                <ErrorMessage 
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

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

            <div className="reports-content">
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

                <div className="reports-filters">
                    <div className="date-range">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                    <button className="export-btn" onClick={handleExport}>
                        <FaDownload /> Export
                    </button>
                </div>

                <div className="reports-data">
                    {activeTab === 'callLogs' && (
                        <div className="call-logs">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {callLogs.map((log, index) => (
                                        <tr key={index}>
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td>{log.from}</td>
                                            <td>{log.to}</td>
                                            <td>{log.duration}s</td>
                                            <td>{log.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'systemLogs' && (
                        <div className="system-logs">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Level</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {systemLogs.map((log, index) => (
                                        <tr key={index}>
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td>{log.level}</td>
                                            <td>{log.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="performance-metrics">
                            <div className="metric-card">
                                <h3>Call Volume</h3>
                                <p>{performanceMetrics.callVolume} calls/hour</p>
                            </div>
                            <div className="metric-card">
                                <h3>Average Call Duration</h3>
                                <p>{performanceMetrics.averageCallDuration} minutes</p>
                            </div>
                            <div className="metric-card">
                                <h3>Call Quality</h3>
                                <p>{performanceMetrics.callQuality}%</p>
                            </div>
                            <div className="metric-card">
                                <h3>System Uptime</h3>
                                <p>{performanceMetrics.systemUptime}%</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;