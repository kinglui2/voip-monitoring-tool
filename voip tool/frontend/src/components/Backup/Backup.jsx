import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaHistory, FaRedo } from 'react-icons/fa';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './Backup.css';

const Backup = () => {
    const [activeTab, setActiveTab] = useState('manual');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [backups, setBackups] = useState([]);
    const [backupConfig, setBackupConfig] = useState({
        manual: {
            description: '',
            includeLogs: true,
            includeConfig: true
        },
        scheduled: {
            frequency: 'daily',
            time: '02:00',
            storageLocation: 'local',
            cloudConfig: {
                provider: '',
                bucket: '',
                credentials: ''
            }
        }
    });

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/backups');
            if (!response.ok) throw new Error('Failed to fetch backups');
            const data = await response.json();
            setBackups(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/backups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backupConfig.manual)
            });
            if (!response.ok) throw new Error('Backup failed');
            await fetchBackups();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (backupId) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/backups/${backupId}/restore`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Restore failed');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="backup">
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

            <div className="backup-header">
                <h2>Backup & Recovery</h2>
                <button className="refresh-button" onClick={fetchBackups} disabled={loading}>
                    <FaRedo /> Refresh
                </button>
            </div>

            <div className="backup-tabs">
                <button 
                    className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manual')}
                >
                    <FaCloudUploadAlt /> Manual Backup
                </button>
                <button 
                    className={`tab-button ${activeTab === 'scheduled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scheduled')}
                >
                    <FaHistory /> Scheduled Backups
                </button>
            </div>

            <div className="backup-content">
                {activeTab === 'manual' && (
                    <div className="manual-backup">
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                value={backupConfig.manual.description}
                                onChange={(e) => setBackupConfig(prev => ({
                                    ...prev,
                                    manual: {
                                        ...prev.manual,
                                        description: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={backupConfig.manual.includeLogs}
                                    onChange={(e) => setBackupConfig(prev => ({
                                        ...prev,
                                        manual: {
                                            ...prev.manual,
                                            includeLogs: e.target.checked
                                        }
                                    }))}
                                />
                                Include Logs
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={backupConfig.manual.includeConfig}
                                    onChange={(e) => setBackupConfig(prev => ({
                                        ...prev,
                                        manual: {
                                            ...prev.manual,
                                            includeConfig: e.target.checked
                                        }
                                    }))}
                                />
                                Include Configuration
                            </label>
                        </div>
                        <button 
                            className="backup-button"
                            onClick={handleCreateBackup}
                            disabled={loading}
                        >
                            Create Backup
                        </button>
                    </div>
                )}

                {activeTab === 'scheduled' && (
                    <div className="scheduled-backups">
                        {/* Scheduled backup configuration UI */}
                        <div className="backup-list">
                            <h3>Available Backups</h3>
                            {backups.map(backup => (
                                <div key={backup.id} className="backup-item">
                                    <div className="backup-info">
                                        <span className="backup-date">{backup.createdAt}</span>
                                        <span className="backup-size">{backup.size}</span>
                                    </div>
                                    <button 
                                        className="restore-button"
                                        onClick={() => handleRestore(backup.id)}
                                        disabled={loading}
                                    >
                                        Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Backup;
