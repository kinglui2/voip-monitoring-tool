import React, { useState } from 'react';
import { FaSave, FaBell, FaUserCog } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState({
        notifications: true,
        autoRefresh: true,
        refreshInterval: 30,
        theme: 'light'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement settings save functionality
        console.log('Settings saved:', settings);
    };

    return (
        <div className="settings-container">
            <h2>Settings</h2>
            <form onSubmit={handleSubmit}>
                <div className="settings-section">
                    <h3><FaBell /> Notifications</h3>
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                name="notifications"
                                checked={settings.notifications}
                                onChange={handleChange}
                            />
                            Enable Notifications
                        </label>
                    </div>
                </div>

                <div className="settings-section">
                    <h3><FaUserCog /> Display Settings</h3>
                    <div className="setting-item">
                        <label>
                            Auto-refresh Dashboard
                            <input
                                type="checkbox"
                                name="autoRefresh"
                                checked={settings.autoRefresh}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>
                            Refresh Interval (seconds)
                            <input
                                type="number"
                                name="refreshInterval"
                                value={settings.refreshInterval}
                                onChange={handleChange}
                                min="10"
                                max="300"
                            />
                        </label>
                    </div>
                </div>

                <button type="submit" className="save-button">
                    <FaSave /> Save Settings
                </button>
            </form>
        </div>
    );
};

export default Settings; 