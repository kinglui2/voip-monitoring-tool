import React, { useState, useEffect } from 'react';
import { 
    FaChartLine, 
    FaUserClock, 
    FaPhoneVolume, 
    FaCalendarAlt,
    FaDownload,
    FaSync
} from 'react-icons/fa';
import supervisorService from '../../services/supervisorService';
import './PerformanceAnalytics.css';

const PerformanceAnalytics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('today'); // today, week, month
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchMetrics();
        if (autoRefresh) {
            const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [timeRange, autoRefresh]);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const endTime = new Date();
            let startTime = new Date();

            switch (timeRange) {
                case 'week':
                    startTime.setDate(startTime.getDate() - 7);
                    break;
                case 'month':
                    startTime.setMonth(startTime.getMonth() - 1);
                    break;
                default: // today
                    startTime.setHours(0, 0, 0, 0);
            }

            const response = await supervisorService.getTeamMetrics(startTime.toISOString(), endTime.toISOString());
            setMetrics(response.data);
            setError(null);
        } catch (err) {
            setError('Unable to fetch performance metrics. Please try again later.');
            console.error('Error fetching metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    const exportMetrics = () => {
        if (!metrics) return;

        const csvContent = [
            ['Metric', 'Value'],
            ['Total Calls', metrics.totalCalls],
            ['Average Duration', metrics.avgCallDuration],
            ['Average Wait Time', metrics.avgWaitTime],
            ['Active Agents', metrics.activeAgents],
            ['Completed Calls', metrics.completedCalls],
            ['Abandoned Calls', metrics.abandonedCalls],
        ].map(row => row.join(',')).join('\\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${timeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading performance metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchMetrics} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="performance-analytics">
            <div className="analytics-header">
                <h2>Performance Analytics</h2>
                <div className="header-controls">
                    <div className="time-range-selector">
                        <FaCalendarAlt className="icon" />
                        <select 
                            value={timeRange} 
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                    </div>
                    <button 
                        className={`refresh-toggle ${autoRefresh ? 'active' : ''}`}
                        onClick={toggleAutoRefresh}
                    >
                        <FaSync className={autoRefresh ? 'spinning' : ''} />
                        <span>Auto-refresh</span>
                    </button>
                    <button 
                        className="export-btn"
                        onClick={exportMetrics}
                        disabled={!metrics}
                    >
                        <FaDownload />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {metrics && (
                <>
                    <div className="metrics-summary">
                        <div className="metric-card">
                            <FaPhoneVolume className="icon" />
                            <div className="metric-content">
                                <h3>Total Calls</h3>
                                <p className="metric-value">{metrics.totalCalls}</p>
                                <p className="metric-change">
                                    {metrics.callsChange > 0 ? '+' : ''}{metrics.callsChange}% vs previous
                                </p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <FaChartLine className="icon" />
                            <div className="metric-content">
                                <h3>Average Duration</h3>
                                <p className="metric-value">{metrics.avgCallDuration}</p>
                                <p className="metric-change">
                                    {metrics.durationChange > 0 ? '+' : ''}{metrics.durationChange}% vs previous
                                </p>
                            </div>
                        </div>
                        <div className="metric-card">
                            <FaUserClock className="icon" />
                            <div className="metric-content">
                                <h3>Average Wait Time</h3>
                                <p className="metric-value">{metrics.avgWaitTime}</p>
                                <p className="metric-change">
                                    {metrics.waitTimeChange > 0 ? '+' : ''}{metrics.waitTimeChange}% vs previous
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="detailed-metrics">
                        <div className="metrics-table">
                            <h3>Agent Performance</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Agent</th>
                                        <th>Calls Handled</th>
                                        <th>Avg Duration</th>
                                        <th>Satisfaction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.agentMetrics?.map((agent) => (
                                        <tr key={agent.id}>
                                            <td>{agent.name}</td>
                                            <td>{agent.callsHandled}</td>
                                            <td>{agent.avgDuration}</td>
                                            <td>{agent.satisfaction}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PerformanceAnalytics; 