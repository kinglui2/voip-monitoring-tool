import React, { useState, useEffect } from 'react';
import { 
    FaHeadset, 
    FaStar, 
    FaPlay, 
    FaPause, 
    FaVolumeUp, 
    FaVolumeMute,
    FaDownload,
    FaSearch,
    FaFilter
} from 'react-icons/fa';
import supervisorService from '../../services/supervisorService';
import './QualityAssurance.css';

const QualityAssurance = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCall, setSelectedCall] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, evaluated, pending
    const [evaluation, setEvaluation] = useState({
        communication: 0,
        problemSolving: 0,
        professionalism: 0,
        compliance: 0,
        notes: ''
    });

    useEffect(() => {
        fetchCalls();
    }, [filter]);

    const fetchCalls = async () => {
        try {
            setLoading(true);
            const response = await supervisorService.getQualityMetrics();
            setCalls(response.data.calls || []);
            setError(null);
        } catch (err) {
            setError('Unable to fetch call recordings. Please try again later.');
            console.error('Error fetching calls:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCallSelect = (call) => {
        setSelectedCall(call);
        setIsPlaying(false);
        setEvaluation({
            communication: call.evaluation?.communication || 0,
            problemSolving: call.evaluation?.problemSolving || 0,
            professionalism: call.evaluation?.professionalism || 0,
            compliance: call.evaluation?.compliance || 0,
            notes: call.evaluation?.notes || ''
        });
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleMute = () => {
        setIsMuted(!isMuted);
    };

    const handleScoreChange = (category, value) => {
        setEvaluation(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const handleSubmitEvaluation = async () => {
        try {
            await supervisorService.submitEvaluation(selectedCall.id, evaluation);
            // Refresh calls to update the evaluation status
            fetchCalls();
            // Clear selected call
            setSelectedCall(null);
        } catch (err) {
            console.error('Error submitting evaluation:', err);
        }
    };

    const filteredCalls = calls.filter(call => {
        const matchesSearch = call.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            call.customerId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
                            (filter === 'evaluated' && call.evaluation) ||
                            (filter === 'pending' && !call.evaluation);
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading call recordings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchCalls} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quality-assurance">
            <div className="qa-header">
                <h2>Quality Assurance</h2>
                <div className="header-controls">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search calls..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-selector">
                        <FaFilter className="filter-icon" />
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Calls</option>
                            <option value="evaluated">Evaluated</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="qa-content">
                <div className="calls-list">
                    <h3>Call Recordings</h3>
                    <div className="calls-grid">
                        {filteredCalls.map((call) => (
                            <div 
                                key={call.id} 
                                className={`call-card ${selectedCall?.id === call.id ? 'selected' : ''}`}
                                onClick={() => handleCallSelect(call)}
                            >
                                <div className="call-info">
                                    <h4>{call.agentName}</h4>
                                    <p>Customer: {call.customerId}</p>
                                    <p>Duration: {call.duration}</p>
                                    <p>Date: {new Date(call.date).toLocaleDateString()}</p>
                                </div>
                                <div className="call-status">
                                    {call.evaluation ? (
                                        <div className="evaluation-badge">
                                            <FaStar className="star-icon" />
                                            <span>Evaluated</span>
                                        </div>
                                    ) : (
                                        <div className="pending-badge">
                                            <span>Pending</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedCall && (
                    <div className="evaluation-panel">
                        <div className="call-player">
                            <div className="player-controls">
                                <button onClick={handlePlayPause} className="control-btn">
                                    {isPlaying ? <FaPause /> : <FaPlay />}
                                </button>
                                <button onClick={handleMute} className="control-btn">
                                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                                </button>
                                <span className="call-duration">{selectedCall.duration}</span>
                            </div>
                            <div className="call-details">
                                <h3>Call Details</h3>
                                <p><strong>Agent:</strong> {selectedCall.agentName}</p>
                                <p><strong>Customer:</strong> {selectedCall.customerId}</p>
                                <p><strong>Date:</strong> {new Date(selectedCall.date).toLocaleString()}</p>
                                <p><strong>Queue:</strong> {selectedCall.queue}</p>
                            </div>
                        </div>

                        <div className="evaluation-form">
                            <h3>Call Evaluation</h3>
                            <div className="score-categories">
                                <div className="score-category">
                                    <label>Communication</label>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={`star ${evaluation.communication >= star ? 'active' : ''}`}
                                                onClick={() => handleScoreChange('communication', star)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="score-category">
                                    <label>Problem Solving</label>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={`star ${evaluation.problemSolving >= star ? 'active' : ''}`}
                                                onClick={() => handleScoreChange('problemSolving', star)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="score-category">
                                    <label>Professionalism</label>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={`star ${evaluation.professionalism >= star ? 'active' : ''}`}
                                                onClick={() => handleScoreChange('professionalism', star)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="score-category">
                                    <label>Compliance</label>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={`star ${evaluation.compliance >= star ? 'active' : ''}`}
                                                onClick={() => handleScoreChange('compliance', star)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="notes-section">
                                <label>Evaluation Notes</label>
                                <textarea
                                    value={evaluation.notes}
                                    onChange={(e) => handleScoreChange('notes', e.target.value)}
                                    placeholder="Enter your evaluation notes here..."
                                />
                            </div>

                            <div className="evaluation-actions">
                                <button 
                                    className="submit-btn"
                                    onClick={handleSubmitEvaluation}
                                >
                                    Submit Evaluation
                                </button>
                                <button 
                                    className="download-btn"
                                    onClick={() => window.open(selectedCall.recordingUrl, '_blank')}
                                >
                                    <FaDownload />
                                    Download Recording
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QualityAssurance; 