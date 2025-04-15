import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserMinus, FaEdit, FaChartLine, FaPhone, FaHeadset } from 'react-icons/fa';
import axios from 'axios';
import './TeamManagement.css';

const TeamManagement = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const response = await axios.get('/api/team-members');
                setTeamMembers(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch team members. Please try again later.');
                setLoading(false);
                console.error('Error fetching team members:', err);
            }
        };

        fetchTeamMembers();
    }, []);

    const handleAddMember = async () => {
        // TODO: Implement add member functionality
        console.log('Add member clicked');
    };

    const handleRemoveMember = async (memberId) => {
        // TODO: Implement remove member functionality
        console.log('Remove member clicked:', memberId);
    };

    const handleEditMember = async (memberId) => {
        // TODO: Implement edit member functionality
        console.log('Edit member clicked:', memberId);
    };

    if (loading) {
        return (
            <div className="team-management">
                <div className="loading">Loading team data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="team-management">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="team-management">
            <div className="team-header">
                <h2>Team Management</h2>
                <div className="header-actions">
                    <button className="action-btn add-member" onClick={handleAddMember}>
                        <FaUserPlus /> Add Member
                    </button>
                    <button className="action-btn remove-member" onClick={() => handleRemoveMember()}>
                        <FaUserMinus /> Remove Member
                    </button>
                </div>
            </div>

            <div className="team-stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaHeadset />
                    </div>
                    <div className="stat-info">
                        <h3>Active Agents</h3>
                        <p>{teamMembers.filter(member => member.status === 'Active').length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaPhone />
                    </div>
                    <div className="stat-info">
                        <h3>Total Calls Today</h3>
                        <p>{teamMembers.reduce((acc, member) => acc + (member.callsHandled || 0), 0)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaChartLine />
                    </div>
                    <div className="stat-info">
                        <h3>Average Quality Score</h3>
                        <p>
                            {teamMembers.length > 0
                                ? Math.round(teamMembers.reduce((acc, member) => acc + (member.qualityScore || 0), 0) / teamMembers.length)
                                : 0}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="team-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Calls Handled</th>
                            <th>Avg. Duration</th>
                            <th>Quality Score</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamMembers.length > 0 ? (
                            teamMembers.map((member) => (
                                <tr key={member.id}>
                                    <td>{member.name}</td>
                                    <td>{member.role}</td>
                                    <td>
                                        <span className={`status-badge ${member.status.toLowerCase()}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td>{member.callsHandled || 0}</td>
                                    <td>{member.avgCallDuration || '0:00'}</td>
                                    <td>
                                        <div className="quality-score">
                                            <div className="score-bar">
                                                <div 
                                                    className="score-fill" 
                                                    style={{ width: `${member.qualityScore || 0}%` }}
                                                />
                                            </div>
                                            <span>{member.qualityScore || 0}%</span>
                                        </div>
                                    </td>
                                    <td>{member.lastActive || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="action-btn edit"
                                            onClick={() => handleEditMember(member.id)}
                                        >
                                            <FaEdit />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    No team members found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamManagement; 