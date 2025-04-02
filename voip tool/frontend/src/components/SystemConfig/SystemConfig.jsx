import React, { useState, useEffect } from 'react';
import { FaServer, FaShieldAlt, FaBell, FaSave, FaFlask } from 'react-icons/fa';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './SystemConfig.css';

const SystemConfig = () => {
    const [activeTab, setActiveTab] = useState('monitoring');
    const [pbxType, setPbxType] = useState('3cx'); // or 'yeastar'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [config, setConfig] = useState({
        monitoring: {
            callThreshold: 100,
            qualityThreshold: 0.8,
            alertEnabled: true,
            alertEmail: '',
            alertInterval: 5 // minutes
        },
        security: {
            twoFactorEnabled: false,
            sessionTimeout: 30, // minutes
            maxLoginAttempts: 5,
            ipWhitelist: []
        },
        integrations: {
            '3cx': {
                enabled: false,
                serverUrl: '',
                apiKey: '',
                extension: '',
                port: 5000,
                verifySSL: true,
                status: 'inactive',
                errorMessage: ''
            },
            'yeastar': {
                enabled: false,
                serverUrl: '',
                apiKey: '',
                extension: '',
                port: 80,
                verifySSL: true,
                status: 'inactive',
                errorMessage: ''
            }
        }
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        let timeoutId;
        if (error) {
            timeoutId = setTimeout(() => {
                setError(null);
            }, 5000); // Auto dismiss after 5 seconds
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [error]);

    const fetchConfig = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/system/config');
            if (!response.ok) {
                throw new Error('Failed to fetch system configuration');
            }
            const data = await response.json();
            setConfig(data);
        } catch (err) {
            setError('Failed to load system configuration. Please try again.');
            console.error('Error fetching config:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/system/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                throw new Error('Failed to update system configuration');
            }

            await fetchConfig(); // Refresh the config after successful update
        } catch (err) {
            setError('Failed to save configuration. Please try again.');
            console.error('Error saving config:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async (pbxType) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/system/test-connection/${pbxType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config.integrations[pbxType])
            });

            if (!response.ok) {
                throw new Error('Failed to test connection');
            }

            const result = await response.json();
            setConfig(prev => ({
                ...prev,
                integrations: {
                    ...prev.integrations,
                    [pbxType]: {
                        ...prev.integrations[pbxType],
                        status: result.status,
                        errorMessage: result.errorMessage || ''
                    }
                }
            }));
        } catch (err) {
            setError('Failed to test connection. Please try again.');
            console.error('Error testing connection:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="system-config">
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
            
            <div className="config-header">
                <h2>System Configuration</h2>
                <button className="save-button" onClick={handleSave} disabled={loading}>
                    <FaSave /> Save Changes
                </button>
            </div>

            <div className="config-tabs">
                <button 
                    className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
                    onClick={() => setActiveTab('monitoring')}
                >
                    <FaBell /> Monitoring
                </button>
                <button 
                    className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <FaShieldAlt /> Security
                </button>
                <button 
                    className={`tab-button ${activeTab === 'integrations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('integrations')}
                >
                    <FaServer /> Integrations
                </button>
            </div>

            <div className="config-content">
                {activeTab === 'monitoring' && (
                    <div className="monitoring-config">
                        <h3>Monitoring Settings</h3>
                        <div className="form-group">
                            <label>Call Threshold (calls/hour)</label>
                            <input
                                type="number"
                                value={config.monitoring.callThreshold}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    monitoring: {
                                        ...prev.monitoring,
                                        callThreshold: parseInt(e.target.value)
                                    }
                                }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Quality Threshold (MOS)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={config.monitoring.qualityThreshold}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    monitoring: {
                                        ...prev.monitoring,
                                        qualityThreshold: parseFloat(e.target.value)
                                    }
                                }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.monitoring.alertEnabled}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        monitoring: {
                                            ...prev.monitoring,
                                            alertEnabled: e.target.checked
                                        }
                                    }))}
                                />
                                Enable Alerts
                            </label>
                        </div>
                        <div className="form-group">
                            <label>Alert Email</label>
                            <input
                                type="email"
                                value={config.monitoring.alertEmail}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    monitoring: {
                                        ...prev.monitoring,
                                        alertEmail: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Alert Interval (minutes)</label>
                            <input
                                type="number"
                                value={config.monitoring.alertInterval}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    monitoring: {
                                        ...prev.monitoring,
                                        alertInterval: parseInt(e.target.value)
                                    }
                                }))}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="security-config">
                        <h3>Security Settings</h3>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.security.twoFactorEnabled}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        security: {
                                            ...prev.security,
                                            twoFactorEnabled: e.target.checked
                                        }
                                    }))}
                                />
                                Enable Two-Factor Authentication
                            </label>
                        </div>
                        <div className="form-group">
                            <label>Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={config.security.sessionTimeout}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    security: {
                                        ...prev.security,
                                        sessionTimeout: parseInt(e.target.value)
                                    }
                                }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Login Attempts</label>
                            <input
                                type="number"
                                value={config.security.maxLoginAttempts}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    security: {
                                        ...prev.security,
                                        maxLoginAttempts: parseInt(e.target.value)
                                    }
                                }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>IP Whitelist (comma-separated)</label>
                            <input
                                type="text"
                                value={config.security.ipWhitelist.join(', ')}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    security: {
                                        ...prev.security,
                                        ipWhitelist: e.target.value.split(',').map(ip => ip.trim())
                                    }
                                }))}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'integrations' && (
                    <div className="integrations-config">
                        <h3>PBX Integrations</h3>
                        <div className="pbx-selector">
                            <button
                                className={`pbx-button ${pbxType === '3cx' ? 'active' : ''}`}
                                onClick={() => setPbxType('3cx')}
                            >
                                3CX
                            </button>
                            <button
                                className={`pbx-button ${pbxType === 'yeastar' ? 'active' : ''}`}
                                onClick={() => setPbxType('yeastar')}
                            >
                                Yeastar
                            </button>
                        </div>

                        <div className="integration-form">
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={config.integrations[pbxType].enabled}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            integrations: {
                                                ...prev.integrations,
                                                [pbxType]: {
                                                    ...prev.integrations[pbxType],
                                                    enabled: e.target.checked
                                                }
                                            }
                                        }))}
                                    />
                                    Enable Integration
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Server URL</label>
                                <input
                                    type="text"
                                    value={config.integrations[pbxType].serverUrl}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        integrations: {
                                            ...prev.integrations,
                                            [pbxType]: {
                                                ...prev.integrations[pbxType],
                                                serverUrl: e.target.value
                                            }
                                        }
                                    }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>API Key</label>
                                <input
                                    type="password"
                                    value={config.integrations[pbxType].apiKey}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        integrations: {
                                            ...prev.integrations,
                                            [pbxType]: {
                                                ...prev.integrations[pbxType],
                                                apiKey: e.target.value
                                            }
                                        }
                                    }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Extension</label>
                                <input
                                    type="text"
                                    value={config.integrations[pbxType].extension}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        integrations: {
                                            ...prev.integrations,
                                            [pbxType]: {
                                                ...prev.integrations[pbxType],
                                                extension: e.target.value
                                            }
                                        }
                                    }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Port</label>
                                <input
                                    type="number"
                                    value={config.integrations[pbxType].port}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        integrations: {
                                            ...prev.integrations,
                                            [pbxType]: {
                                                ...prev.integrations[pbxType],
                                                port: parseInt(e.target.value)
                                            }
                                        }
                                    }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={config.integrations[pbxType].verifySSL}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            integrations: {
                                                ...prev.integrations,
                                                [pbxType]: {
                                                    ...prev.integrations[pbxType],
                                                    verifySSL: e.target.checked
                                                }
                                            }
                                        }))}
                                    />
                                    Verify SSL Certificate
                                </label>
                            </div>
                            <div className="connection-status">
                                <span className={`status-indicator ${config.integrations[pbxType].status}`}>
                                    {config.integrations[pbxType].status}
                                </span>
                                {config.integrations[pbxType].errorMessage && (
                                    <span className="error-message">
                                        {config.integrations[pbxType].errorMessage}
                                    </span>
                                )}
                            </div>
                            <button
                                className="test-connection-button"
                                onClick={() => handleTestConnection(pbxType)}
                                disabled={loading}
                            >
                                <FaFlask /> Test Connection
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemConfig; 