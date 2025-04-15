import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import supervisorService from '../../services/supervisorService';
import './TeamManagement.css';

const TeamManagement = () => {
    const [teamStatus, setTeamStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeamStatus();
        // Set up polling for real-time updates
        const interval = setInterval(fetchTeamStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTeamStatus = async () => {
        try {
            setLoading(true);
            const response = await supervisorService.getTeamStatus();
            if (response.success) {
                setTeamStatus(response.data);
                setError(null);
            } else {
                // Handle specific error cases
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
            console.error('Error fetching team status:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading team status...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <FaInfoCircle className="error-icon" />
                    <h3>System Status</h3>
                    {error.type === 'no_pbx' ? (
                        <>
                            <p>No PBX system is currently connected to the monitoring tool.</p>
                            <div className="error-details">
                                <p>This is normal and expected when:</p>
                                <ul>
                                    <li>The system is being set up for the first time</li>
                                    <li>The PBX connection is being configured</li>
                                    <li>The system is in maintenance mode</li>
                                </ul>
                                <p className="error-note">
                                    Please contact your system administrator to connect a PBX system.
                                    Once connected, this dashboard will automatically display real-time team data.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <p>We're having trouble connecting to the monitoring system.</p>
                            <div className="error-details">
                                <p>This might be due to:</p>
                                <ul>
                                    <li>Temporary network issues</li>
                                    <li>System maintenance</li>
                                    <li>Configuration updates</li>
                                </ul>
                                <p className="error-note">
                                    Please try refreshing the page in a few moments.
                                    If the issue persists, contact your system administrator.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="team-management">
            <h2>Team Management</h2>
            
            <div className="team-overview">
                <div className="overview-card">
                    <FaUser className="icon" />
                    <h3>Total Team Members</h3>
                    <p>{teamStatus?.extensions?.length || 0}</p>
                </div>
                
                <div className="overview-card">
                    <FaPhone className="icon" />
                    <h3>Active Calls</h3>
                    <p>{teamStatus?.queueStatus?.activeCalls || 0}</p>
                </div>
                
                <div className="overview-card">
                    <FaClock className="icon" />
                    <h3>Average Wait Time</h3>
                    <p>{teamStatus?.queueStatus?.averageWaitTime || '0'}s</p>
                </div>
            </div>

            <div className="team-members">
                <h3>Team Members</h3>
                <div className="members-list">
                    {teamStatus?.extensions?.map((member) => (
                        <div key={member.id} className="member-card">
                            <div className="member-info">
                                <h4>{member.name || `Extension ${member.extension}`}</h4>
                                <p>Extension: {member.extension}</p>
                                <p>Status: {member.status}</p>
                            </div>
                            <div className="member-status">
                                {member.status === 'Available' ? (
                                    <FaCheckCircle className="status-icon available" />
                                ) : (
                                    <FaTimesCircle className="status-icon busy" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="queue-status">
                <h3>Queue Status</h3>
                <div className="queue-metrics">
                    <div className="metric">
                        <span>Waiting Calls:</span>
                        <span>{teamStatus?.queueStatus?.waitingCalls || 0}</span>
                    </div>
                    <div className="metric">
                        <span>Longest Wait:</span>
                        <span>{teamStatus?.queueStatus?.longestWaitTime || '0'}s</span>
                    </div>
                    <div className="metric">
                        <span>Answered Today:</span>
                        <span>{teamStatus?.queueStatus?.answeredToday || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamManagement; 