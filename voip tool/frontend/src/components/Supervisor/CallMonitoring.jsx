import React, { useState, useEffect } from 'react';
import { FaPhone, FaClock, FaUser, FaInfoCircle, FaPause, FaPlay, FaExclamationTriangle } from 'react-icons/fa';
import supervisorService from '../../services/supervisorService';
import './CallMonitoring.css';

const CallMonitoring = () => {
    const [activeCalls, setActiveCalls] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        if (autoRefresh) {
            fetchActiveCalls();
            const interval = setInterval(fetchActiveCalls, 10000); // Refresh every 10 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const fetchActiveCalls = async () => {
        try {
            setLoading(true);
            const response = await supervisorService.getActiveCalls();
            if (response.success) {
                setActiveCalls(response.data);
                setError(null);
            } else {
                if (response.error.includes('No active PBX configuration')) {
                    setError({
                        type: 'no_pbx',
                        message: 'No PBX system is currently connected'
                    });
                } else {
                    setError({
                        type: 'general',
                        message: response.error
                    });
                }
            }
        } catch (err) {
            if (err.response?.status === 503) {
                setError({
                    type: 'no_pbx',
                    message: 'No PBX system is currently connected'
                });
            } else {
                setError({
                    type: 'general',
                    message: 'Unable to connect to the monitoring system'
                });
            }
            console.error('Error fetching active calls:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading call information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <FaExclamationTriangle className="error-icon" />
                    <h3>System Error</h3>
                    {error.type === 'no_pbx' ? (
                        <>
                            <p className="error-message">PBX System Not Connected</p>
                            <div className="error-details">
                                <p>The call monitoring system is currently unavailable because no PBX system is connected.</p>
                                <p>This is a system configuration issue that needs to be resolved by the administrator.</p>
                                <p className="error-note">
                                    Please contact your system administrator to resolve this issue.
                                    The call monitoring features will be available once the PBX system is properly configured.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="error-message">System Connection Error</p>
                            <div className="error-details">
                                <p>Unable to connect to the monitoring system. This could be due to:</p>
                                <ul>
                                    <li>Network connectivity issues</li>
                                    <li>System maintenance in progress</li>
                                    <li>Configuration problems</li>
                                </ul>
                                <p className="error-note">
                                    Please try again later or contact your system administrator if the issue persists.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="call-monitoring">
            <div className="monitoring-header">
                <h2>Call Monitoring</h2>
                <button 
                    className={`refresh-toggle ${autoRefresh ? 'active' : ''}`}
                    onClick={toggleAutoRefresh}
                    title={autoRefresh ? "Auto-refresh is enabled" : "Auto-refresh is disabled"}
                >
                    {autoRefresh ? <FaPlay /> : <FaPause />}
                    <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
                </button>
            </div>

            <div className="call-summary">
                <div className="summary-card">
                    <FaPhone className="icon" />
                    <h3>Active Calls</h3>
                    <p>{activeCalls?.totalActive || 0}</p>
                </div>
                <div className="summary-card">
                    <FaClock className="icon" />
                    <h3>Longest Duration</h3>
                    <p>{activeCalls?.longestDuration || '0:00'}</p>
                </div>
                <div className="summary-card">
                    <FaUser className="icon" />
                    <h3>Agents on Call</h3>
                    <p>{activeCalls?.activeAgents || 0}</p>
                </div>
            </div>

            <div className="active-calls">
                <h3>Active Calls</h3>
                <div className="calls-list">
                    {activeCalls?.activeCalls?.map((call) => (
                        <div key={call.id} className="call-card">
                            <div className="call-info">
                                <div className="call-header">
                                    <h4>{call.callerId || 'Unknown Caller'}</h4>
                                    <span className="call-duration">{call.duration}</span>
                                </div>
                                <div className="call-details">
                                    <p><strong>Agent:</strong> {call.agentName || `Extension ${call.extension}`}</p>
                                    <p><strong>Status:</strong> {call.status}</p>
                                    <p><strong>Queue:</strong> {call.queue || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="call-actions">
                                <button className="action-btn" title="Listen">
                                    <FaPhone />
                                </button>
                                <button className="action-btn" title="More Info">
                                    <FaInfoCircle />
                                </button>
                            </div>
                        </div>
                    ))}
                    {(!activeCalls?.activeCalls || activeCalls.activeCalls.length === 0) && (
                        <div className="no-calls">
                            <FaExclamationTriangle className="error-icon" />
                            <p>No active calls at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallMonitoring; 